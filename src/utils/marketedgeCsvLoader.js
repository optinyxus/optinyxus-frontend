// src/utils/marketedgeCsvLoader.js
// Lightweight CSV loader (no external deps) for MarketEdge upload preview (Channel Level Constraints table)

export const loadMarketEdgeCsv = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve([]);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = String(reader.result ?? '');
        resolve(parseMarketEdgeCsvText(text));
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(reader.error || new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

const parseMarketEdgeCsvText = (text) => {
  const rows = parseCsv(text);

  // Find header row that contains "Channel" + "Funds Available"
  const headerIndex = rows.findIndex((r) => {
    const row = r || [];
    const norm = row.map((c) => normalizeHeader(c));
    return norm.includes('channel') && norm.includes('fundsavailable');
  });

  if (headerIndex === -1) return [];

  const headerRow = rows[headerIndex] || [];
  const headerMap = {};
  headerRow.forEach((h, i) => {
    const key = normalizeHeader(h);
    if (key) headerMap[key] = i;
  });

  const getRaw = (row, key) => {
    const idx = headerMap[key];
    if (idx === undefined) return '';
    return (row[idx] ?? '').toString().replace(/\uFEFF/g, '').trim();
  };

  const toMaybeNumericString = (v) => {
    const s = String(v ?? '')
      .replace(/\uFEFF/g, '')
      .replace(/₹/g, '')
      .replace(/%/g, '')
      .replace(/,/g, '')
      .trim();

    if (!s) return '';
    // keep as string but validate number-like
    const n = Number(s);
    if (!Number.isFinite(n)) return '';
    return s;
  };

  const cleanMoneyString = (v) => {
    const s = String(v ?? '').replace(/\uFEFF/g, '').trim();
    if (!s) return '';
    // Keep commas/₹ if present, just normalize multiple spaces.
    return s.replace(/\s+/g, ' ').trim();
  };

  const out = [];

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const channel = getRaw(row, 'channel');
    const fundsAvailable = cleanMoneyString(getRaw(row, 'fundsavailable'));

    const testRangeMin = cleanMoneyString(getRaw(row, 'testrangemin'));
    const testRangeMax = cleanMoneyString(getRaw(row, 'testrangemax'));

    // Stop if the row is basically empty (your sample has many empty rows)
    const isEmptyRow =
      !channel &&
      !fundsAvailable &&
      !testRangeMin &&
      !testRangeMax &&
      !getRaw(row, 'channelroas') &&
      !getRaw(row, 'channelmroas') &&
      !getRaw(row, 'channelroi') &&
      !getRaw(row, 'channelmroi');

    if (isEmptyRow) continue;

    out.push({
      channel,
      fundsAvailable,
      channelRoas: toMaybeNumericString(getRaw(row, 'channelroas')),
      channelMroas: toMaybeNumericString(getRaw(row, 'channelmroas')),
      channelRoi: toMaybeNumericString(getRaw(row, 'channelroi')),
      channelMroi: toMaybeNumericString(getRaw(row, 'channelmroi')),
      testRangeMin,
      testRangeMax,
    });
  }

  return out;
};

const normalizeHeader = (h) => {
  const s = String(h ?? '')
    .replace(/\uFEFF/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  if (!s) return '';

  if (s === 'channel') return 'channel';
  if (s === 'funds available' || s === 'fundsavailable') return 'fundsavailable';

  if (s === 'channel roas' || s === 'channelroas') return 'channelroas';
  if (s === 'channel mroas' || s === 'channelmroas') return 'channelmroas';
  if (s === 'channel roi' || s === 'channelroi') return 'channelroi';
  if (s === 'channel mroi' || s === 'channelmroi') return 'channelmroi';

  if (s === 'test range min.' || s === 'test range min' || s === 'testrangemin' || s === 'test range min. ') return 'testrangemin';
  if (s === 'test range max.' || s === 'test range max' || s === 'testrangemax') return 'testrangemax';

  return s.replace(/[^a-z0-9]/g, '');
};

// CSV parser supporting:
// - commas
// - double quotes
// - escaped quotes ("")
// - CRLF / LF newlines
const parseCsv = (text) => {
  const input = String(text ?? '');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const next = input[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ',') {
      row.push(field);
      field = '';
      continue;
    }

    if (!inQuotes && char === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
      continue;
    }

    if (!inQuotes && char === '\r') {
      continue;
    }

    field += char;
  }

  row.push(field);
  rows.push(row);

  // Drop trailing empty row if file ends with newline
  if (rows.length > 0) {
    const last = rows[rows.length - 1] || [];
    const isAllEmpty = last.every((c) => String(c ?? '').trim() === '');
    if (isAllEmpty) rows.pop();
  }

  return rows;
};

export default loadMarketEdgeCsv;
