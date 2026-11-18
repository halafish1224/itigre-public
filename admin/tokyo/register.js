/* Register once with the Sveltia CMS 0.265.x React-compatible field API.
 * The editor is an isolated draft control; this file makes no Sheet/site writes.
 */
(() => {
  const cms = window.CMS;
  if (typeof cms?.registerFieldType !== 'function'
    || typeof window.createClass !== 'function'
    || typeof window.h !== 'function') {
    console.error('[tokyo-timeline] Sveltia CMS custom field API unavailable.');
    return;
  }

  const dates = Array.from({length: 14}, (_, i) => `2026-12-${String(i + 13).padStart(2, '0')}`);
  const plain = (value) => value?.toJS?.() ?? value;
  const signature = (value) => JSON.stringify(plain(value));
  const validDays = (value) => {
    const days = plain(value);
    if (!Array.isArray(days) || days.length !== 14) return false;
    const ids = new Set();
    for (let i = 0; i < days.length; i++) {
      if (days[i]?.date !== dates[i] || !Array.isArray(days[i].events)) return false;
      for (const event of days[i].events) {
        if (typeof event?.id !== 'string' || !event.id || ids.has(event.id)
            || typeof event.title !== 'string') return false;
        const timeFormat = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
        if (event.time && (typeof event.time !== 'string' || !timeFormat.test(event.time))) return false;
        if (event.endTime && (typeof event.endTime !== 'string' || !timeFormat.test(event.endTime)
            || !event.time || event.endTime <= event.time)) return false;
        ids.add(event.id);
      }
    }
    return true;
  };

  const Control = window.createClass({
    componentDidMount: function () {
      this._active = true;
      this._generation = 0;
      this.mountTimeline();
    },
    componentDidUpdate: function (previous) {
      // Keep this imperative DOM control in sync with a CMS undo, file reload,
      // or switching entries. An onChange echo must NOT remount and clear undo.
      if (previous.forID !== this.props.forID
          || signature(this.props.value) !== this._displayedSignature) {
        this._editor?.destroy();
        this._editor = undefined;
        this.mountTimeline();
      }
    },
    componentWillUnmount: function () {
      this._active = false;
      this._generation++;
      this._editor?.destroy();
      this._editor = undefined;
    },
    isValid: function (value) {
      return validDays(value) ? true : {
        error: {message: '東京行程須保留完整 14 天資料、每筆有效 ID 與唯一行程識別；請勿刪除日期。'}
      };
    },
    mountTimeline: function () {
      const value = plain(this.props.value);
      const generation = ++this._generation;
      if (!validDays(value) || !this._host) {
        if (this._host) this._host.textContent = '尚未載入完整 14 天行程資料；此欄不可留空。';
        return;
      }
      this._displayedSignature = signature(value);
      import('/admin/tokyo/editor.mjs').then(({mountTokyoTimeline}) => {
        if (!this._active || generation !== this._generation
            || !this._host || this._editor) return;
        this._editor = mountTokyoTimeline(this._host, value, (days) => {
          // Only notify the owning CMS draft; no hidden API call or publishing.
          this._displayedSignature = signature(days);
          this.props.onChange(days);
        });
      }).catch((err) => {
        if (!this._active || generation !== this._generation) return;
        console.error('[tokyo-timeline] Could not mount editor', err);
        if (this._host) this._host.textContent = '時間軸無法載入，尚未修改行程。';
      });
    },
    render: function () {
      return window.h('div', {
        id: this.props.forID,
        className: this.props.classNameWrapper,
        ref: (node) => { this._host = node; },
        'aria-label': '東京行程時間軸編輯'
      });
    }
  });

  cms.registerFieldType('tokyo_timeline', Control);
})();
