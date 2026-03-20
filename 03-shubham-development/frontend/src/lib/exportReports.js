export function downloadCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const header = Object.keys(rows[0]);
  const csv = [header.join(",")].concat(rows.map(r => header.map(h => {
    const v = r[h];
    if (v == null) return "";
    return String(v).replace(/"/g, '""');
  }).map(c => `"${c}"`).join(",")) ).join("\n");

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadExcelAsCsv(filename, rows) {
  // Excel opens CSV files; provide .csv extension for compatibility
  downloadCSV(filename.endsWith('.csv') ? filename : `${filename}.csv`, rows);
}

export function openPrintableReport(title, rows) {
  const win = window.open('', '_blank');
  if (!win) return;
  const style = `
    <style>
      body{font-family: Arial, Helvetica, sans-serif; padding:20px}
      table{border-collapse:collapse;width:100%}
      th,td{border:1px solid #ccc;padding:8px;text-align:left}
    </style>
  `;
  const header = rows && rows.length ? Object.keys(rows[0]) : [];
  const rowsHtml = rows.map(r => `<tr>${header.map(h => `<td>${String(r[h] ?? '')}</td>`).join('')}</tr>`).join('');
  const html = `<!doctype html><html><head><title>${title}</title>${style}</head><body><h2>${title}</h2><table><thead><tr>${header.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
  win.document.write(html);
  win.document.close();
  // give it a moment to render then call print
  setTimeout(() => { win.print(); }, 500);
}
