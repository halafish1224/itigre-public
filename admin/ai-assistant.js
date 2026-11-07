(() => {
  const AI_ENDPOINT = 'https://itigre-ai-assistant.halafish.workers.dev';
  const TURNSTILE_SITE_KEY = 'REPLACE_WITH_TURNSTILE_SITE_KEY';
  const FIELDS = ['summary', 'category', 'tags', 'topics', 'people', 'places', 'events', 'seo_title', 'seo_description'];
  let turnstileLoader;

  function isEmpty(value) {
    return value == null || value === '' || (Array.isArray(value) && value.length === 0);
  }

  function normalizeClaim(value) {
    return String(value ?? '').replace(/\\s+/gu, ' ').trim().toLocaleLowerCase();
  }

  async function digestContent(title, body) {
    if (!window.crypto?.subtle) throw new Error('Secure content fingerprinting is unavailable');
    const bytes = new TextEncoder().encode(String(title) + '\\n' + String(body));
    const digest = await window.crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
  }

  async function loadTurnstile() {
    if (window.turnstile) return;
    if (!turnstileLoader) {
      turnstileLoader = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    await turnstileLoader;
  }

  async function getTurnstileToken() {
    if (!TURNSTILE_SITE_KEY || TURNSTILE_SITE_KEY.startsWith('REPLACE_')) {
      throw new Error('Turnstile site key has not been configured');
    }
    await loadTurnstile();
    const container = document.createElement('div');
    container.setAttribute('aria-hidden', 'true');
    container.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;background:#fff;padding:8px;border-radius:8px;box-shadow:0 2px 16px rgba(0,0,0,.2);';
    document.body.appendChild(container);

    return new Promise((resolve, reject) => {
      let widgetId;
      try {
        widgetId = window.turnstile.render(container, {
          sitekey: TURNSTILE_SITE_KEY,
          action: 'cms_ai_metadata',
          execution: 'execute',
          appearance: 'interaction-only',
          callback: token => {
            window.turnstile.remove(widgetId);
            container.remove();
            resolve(token);
          },
          'error-callback': () => {
            container.remove();
            reject(new Error('Turnstile verification failed'));
          },
          'expired-callback': () => {
            container.remove();
            reject(new Error('Turnstile token expired'));
          },
        });
        window.turnstile.execute(widgetId);
      } catch (error) {
        container.remove();
        reject(error);
      }
    });
  }

  CMS.registerEventListener({
    name: 'preSave',
    handler: async ({ entry }) => {
      // AI enrichment is intended only for new editorial articles. Knowledge Notes
      // and Review Inbox records must remain under the editor's direct control.
      if (entry.get('collection') !== 'posts') return entry;

      try {
        const data = entry.get('data').toJS();
        const body = typeof data.body === 'string' ? data.body : JSON.stringify(data.body ?? '');
        const analysisBody = body.slice(0, 24000);
        if (analysisBody.trim().length < 40) return entry;

        // Re-analyze only when the article's title/body changes. This avoids repeat AI calls
        // when an editor only adjusts metadata or review decisions.
        const signature = await digestContent(data.title ?? '', body);
        const contentChanged = signature !== String(data.ai_review_signature ?? '');
        if (!contentChanged) return entry;

        const token = await getTurnstileToken();
        const response = await fetch(AI_ENDPOINT + '/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: data.title ?? '', body: analysisBody, turnstileToken: token }),
        });
        if (!response.ok) throw new Error('AI service returned ' + response.status);
        const suggestions = await response.json();

        let updated = entry;
        for (const field of FIELDS) {
          if (isEmpty(data[field]) && !isEmpty(suggestions[field])) {
            updated = updated.setIn(['data', field], suggestions[field]);
          }
        }

        // Keep existing review decisions intact. New findings are appended by their quoted claim;
        // the Worker cannot mark anything verified or attach an unverified source.
        const existingItems = Array.isArray(data.ai_review_items) ? data.ai_review_items : [];
        const mergedItems = [...existingItems];
        const knownClaims = new Set(existingItems.map(item => normalizeClaim(item?.claim)).filter(Boolean));
        for (const item of Array.isArray(suggestions.review_items) ? suggestions.review_items : []) {
          const key = normalizeClaim(item?.claim);
          if (!key || knownClaims.has(key)) continue;
          knownClaims.add(key);
          mergedItems.push({
            ...item,
            status: 'pending_source',
            evidence_level: 'none',
            source_label: '',
            source_url: '',
            reviewer_note: '',
          });
        }

        updated = updated
          .setIn(['data', 'ai_review_items'], mergedItems)
          .setIn(['data', 'ai_review_summary'], String(suggestions.review_summary ?? ''))
          .setIn(['data', 'ai_review_checked_at'], String(suggestions.review_checked_at ?? ''))
          .setIn(['data', 'ai_review_signature'], signature);
        return updated;
      } catch (error) {
        console.warn('[ITIGRE AI] Metadata/review suggestions were skipped; the draft can still be saved.', error);
        return entry;
      }
    },
  });
})();
