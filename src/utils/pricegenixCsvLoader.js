// src/utils/pricegenixCsvLoader.js
// Lightweight CSV loader (no external deps) for PriceGenix upload preview + article-level constraints.

export const loadPriceGenixCsv = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve({ previewRows: [], articleLevelConstraintsMap: {} });
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = String(reader.result ?? '');
        const { previewRows, articleLevelConstraintsMap } = parsePriceGenixCsvText(text);
        resolve({ previewRows, articleLevelConstraintsMap });
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

const parsePriceGenixCsvText = (text) => {
  const rows = parseCsv(text);

  // Find the header row (must have at least Status + Stock columns).
  const headerIndex = rows.findIndex(
    (r) => (r || []).some((c) => normalizeHeader(c) === 'status') && (r || []).some((c) => normalizeHeader(c) === 'stock')
  );

  if (headerIndex === -1) {
    return { previewRows: [], articleLevelConstraintsMap: {} };
  }

  const headerRow = rows[headerIndex] || [];
  const headerMap = {};

  headerRow.forEach((h, i) => {
    const key = normalizeHeader(h);
    if (key) headerMap[key] = i;
  });

  const get = (row, key) => {
    const idx = headerMap[key];
    if (idx === undefined) return '';
    return (row[idx] ?? '').toString().trim();
  };

  const parseNumber = (v) => {
    if (v === null || v === undefined) return null;
    const s = String(v)
      .replace(/\uFEFF/g, '')
      .replace(/₹/g, '')
      .replace(/,/g, '')
      .replace(/\s+/g, '')
      .trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  const parsePercent = (v) => {
    if (v === null || v === undefined) return null;
    const s = String(v)
      .replace(/\uFEFF/g, '')
      .replace(/%/g, '')
      .replace(/\s+/g, '')
      .trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  const previewRows = [];
  const articleLevelConstraintsMap = {};

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const articleNoRaw = get(row, 'articleno');
    const brandRaw = get(row, 'brand');
    const categoryRaw = get(row, 'category');
    const channelRaw = get(row, 'channel');
    const storeNoRaw = get(row, 'storeno');
    const zoneRaw = get(row, 'zone');

    const status = get(row, 'status');
    const stockRaw = get(row, 'stock');
    const mopRaw = get(row, 'mop');
    const nlcRaw = get(row, 'nlc');
    const maxPriceRaw = get(row, 'maxprice');
    const minPriceRaw = get(row, 'minprice');

    const stockMinRaw = get(row, 'stockmin');
    const stockMaxRaw = get(row, 'stockmax');
    const discountMinRaw = get(row, 'discountmin');
    const discountMaxRaw = get(row, 'discountmax');

    const article = articleNoRaw || get(row, 'article') || brandRaw || '';

    const isEmptyRow =
      !article &&
      !brandRaw &&
      !categoryRaw &&
      !channelRaw &&
      !storeNoRaw &&
      !zoneRaw &&
      !status &&
      !stockRaw &&
      !mopRaw &&
      !nlcRaw &&
      !maxPriceRaw &&
      !minPriceRaw &&
      !stockMinRaw &&
      !stockMaxRaw &&
      !discountMinRaw &&
      !discountMaxRaw;

    if (isEmptyRow) continue;

    const stock = parseNumber(stockRaw);
    const mop = parseNumber(mopRaw);
    const nlc = parseNumber(nlcRaw);
    const maxPrice = parseNumber(maxPriceRaw);
    const minPrice = parseNumber(minPriceRaw);

    const stockMinPercent = parsePercent(stockMinRaw);
    const stockMaxPercent = parsePercent(stockMaxRaw);
    const discountMinPercent = parsePercent(discountMinRaw);
    const discountMaxPercent = parsePercent(discountMaxRaw);

    previewRows.push({
      article,
      articleNo: article,
      brand: brandRaw,
      category: categoryRaw,
      channel: channelRaw,
      storeNo: storeNoRaw,
      zone: zoneRaw,
      status,
      stock,
      mop,
      nlc,
      maxPrice,
      minPrice,
      stockMinPercent,
      stockMaxPercent,
      discountMinPercent,
      discountMaxPercent
    });

    if (!article) continue;

    if (!articleLevelConstraintsMap[article]) {
      articleLevelConstraintsMap[article] = {};
    }

    if (stockMinPercent !== null) articleLevelConstraintsMap[article].stockMin = String(stockMinPercent);
    if (stockMaxPercent !== null) articleLevelConstraintsMap[article].stockMax = String(stockMaxPercent);
    if (discountMinPercent !== null) articleLevelConstraintsMap[article].discountMin = String(discountMinPercent);
    if (discountMaxPercent !== null) articleLevelConstraintsMap[article].discountMax = String(discountMaxPercent);
  }

  return { previewRows, articleLevelConstraintsMap };
};

const normalizeHeader = (h) => {
  const s = String(h || '').replace(/\uFEFF/g, '').trim().toLowerCase();
  if (!s) return '';

  const compact = s
    .replace(/\./g, '')
    .replace(/,/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Article columns
  if (compact === 'article') return 'article';
  if (compact === 'article no' || compact === 'article number') return 'articleno';
  if (compact === 'brand') return 'brand';
  if (compact === 'category') return 'category';
  if (compact === 'channel') return 'channel';
  if (compact === 'store no' || compact === 'store number') return 'storeno';
  if (compact === 'zone') return 'zone';

  // Core columns
  if (compact === 'status') return 'status';
  if (compact === 'stock') return 'stock';
  if (compact === 'mop') return 'mop';
  if (compact === 'nlc') return 'nlc';

  // Price bounds
  if (compact === 'max price') return 'maxprice';
  if (compact === 'min price') return 'minprice';

  // Percent constraints
  if (compact === 'stock min %' || compact === 'stock min%') return 'stockmin';
  if (compact === 'stock max %' || compact === 'stock max%') return 'stockmax';
  if (compact === 'discount min %' || compact === 'discount min%') return 'discountmin';
  if (compact === 'discount max %' || compact === 'discount max%') return 'discountmax';

  return compact.replace(/\s+/g, '');
};

// CSV parser supporting:
// - commas
// - double quotes
// - escaped quotes ("")
// - CRLF / LF newlines
const parseCsv = (text) => {
  const input = String(text || '');
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
      // Ignore CR in CRLF
      continue;
    }

    field += char;
  }

  row.push(field);
  rows.push(row);

  // Drop trailing empty row if file ends with a newline
  if (rows.length > 0) {
    const last = rows[rows.length - 1] || [];
    const isAllEmpty = last.every((c) => String(c || '').trim() === '');
    if (isAllEmpty) rows.pop();
  }

  return rows;
};
