(() => {
  const input = document.getElementById('roster-search');
  const status = document.getElementById('search-status');
  const rows = [...document.querySelectorAll('#name-index > li')];
  if (!input || !status) return;
  const normalize = value => value.normalize('NFKC').replace(/\s+/g, '').toLowerCase();
  const labels = rows.map(row => normalize(row.dataset.name));
  input.addEventListener('input', () => {
    const terms = input.value.normalize('NFKC').trim().split(/\s+/).filter(Boolean).map(normalize);
    const query = terms.length > 0;
    let visible = 0;
    rows.forEach((row, i) => { row.hidden = !terms.every(term => labels[i].includes(term)); if (!row.hidden) visible++; });
    status.textContent = query ? `找到 ${visible} 個姓名項目。` : `共 ${rows.length} 個登錄姓名項目；同名、異名與正式出賽人數需分別判讀。`;
  });
})();
