const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/pricegenix`;

const BRAND_KEYS = ['bosch', 'haier', 'ifb', 'lg', 'samsung', 'whirlpool'];

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';
const STRICT_CONSTRAINTS_MESSAGE = 'No solution found. Constraints are too strict.';

const round = (value, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const parseNumeric = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const cleaned = String(value)
    .replace(/\uFEFF/g, '')
    .replace(/₹/g, '')
    .replace(/%/g, '')
    .replace(/,/g, '')
    .trim();

  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const toSafeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getBrandKey = (value) => {
  if (!value) return null;
  const normalized = String(value).toLowerCase().trim();
  return BRAND_KEYS.find((brandKey) => normalized.includes(brandKey)) || null;
};

const resolveBrandFromRowKey = (rowKey, tableRows = []) => {
  const direct = getBrandKey(rowKey);
  if (direct) return direct;

  const target = String(rowKey || '').toLowerCase().trim();
  if (!target) return null;

  const rowMatch = (tableRows || []).find((row) => {
    const article = String(row?.article ?? row?.articleNo ?? '').toLowerCase().trim();
    const articleNo = String(row?.articleNo ?? '').toLowerCase().trim();
    return article === target || articleNo === target;
  });

  if (!rowMatch) return null;
  return getBrandKey(rowMatch.brand) || getBrandKey(rowMatch.article) || getBrandKey(rowMatch.articleNo);
};

const normalizeFormatType = (format) => {
  const normalized = String(format || '').toLowerCase().trim();
  if (normalized === 'absolute' || normalized === 'number' || normalized === 'numbers' || normalized === 'qty') {
    return 'absolute';
  }
  return 'percent';
};

const toFlexibleConstraint = (value, format) => {
  const numeric = parseNumeric(value);
  if (numeric === null) return null;

  const type = normalizeFormatType(format);
  if (type === 'percent') {
    return {
      type: 'percent',
      value: clamp(numeric / 100, 0, 1)
    };
  }

  return {
    type: 'absolute',
    value: numeric
  };
};

const extractValidationMessage = (errorPayload) => {
  const detail = errorPayload?.detail;
  if (Array.isArray(detail)) {
    const lines = detail
      .map((item) => {
        const loc = Array.isArray(item?.loc) ? item.loc.filter((segment) => segment !== 'body').join('.') : '';
        const msg = item?.msg || 'Invalid value';
        return loc ? `${loc}: ${msg}` : msg;
      })
      .filter(Boolean);

    if (lines.length > 0) return lines.join(' | ');
  }

  if (typeof detail === 'string' && detail.trim()) return detail.trim();
  if (typeof errorPayload?.message === 'string' && errorPayload.message.trim()) return errorPayload.message.trim();
  return DEFAULT_ERROR_MESSAGE;
};

const extractBackendMessage = (errorPayload) => {
  const detail = errorPayload?.detail;
  if (typeof detail === 'string' && detail.trim()) return detail.trim();
  if (detail && typeof detail === 'object') {
    if (typeof detail.message === 'string' && detail.message.trim()) return detail.message.trim();
    if (typeof detail.details === 'string' && detail.details.trim()) return detail.details.trim();
  }
  if (typeof errorPayload?.message === 'string' && errorPayload.message.trim()) return errorPayload.message.trim();
  return '';
};

const getNormalizedErrorMessage = (status, errorPayload) => {
  if (status === 400) return STRICT_CONSTRAINTS_MESSAGE;
  if (status === 422) return extractValidationMessage(errorPayload);
  return DEFAULT_ERROR_MESSAGE;
};

const applyGlobalConstraintToPayload = (payload, constraint) => {
  const type = String(constraint?.type || '').toLowerCase().trim();
  const minVal = parseNumeric(constraint?.minimum);
  const maxVal = parseNumeric(constraint?.maximum);

  if (type === 'sales') {
    if (minVal !== null) payload.gmv_lower = minVal;
    if (maxVal !== null) payload.gmv_upper = maxVal;
    return;
  }

  if (type === 'profit') {
    if (minVal !== null) payload.profit_lower = minVal;
    if (maxVal !== null) payload.profit_upper = maxVal;
    return;
  }

  if (type === 'profit percentage' || type === 'profitability' || type === 'profit%') {
    if (minVal !== null) payload.margin_percent_lower = clamp(minVal / 100, 0, 1);
    if (maxVal !== null) payload.margin_percent_upper = clamp(maxVal / 100, 0, 1);
    return;
  }

  if (type === 'units') {
    const minimum = toFlexibleConstraint(constraint?.minimum, constraint?.format);
    const maximum = toFlexibleConstraint(constraint?.maximum, constraint?.format);
    if (minimum) payload.units_min = minimum;
    if (maximum) payload.units_max = maximum;
    return;
  }

  if (type === 'discount') {
    const minimum = toFlexibleConstraint(constraint?.minimum, constraint?.format);
    const maximum = toFlexibleConstraint(constraint?.maximum, constraint?.format);
    if (minimum) payload.discount_min = minimum;
    if (maximum) payload.discount_max = maximum;
  }
};

const mergeChannelConstraints = ({ articleConstraints = {}, tableRows = [] }) => {
  const byBrand = {};
  BRAND_KEYS.forEach((brandKey) => {
    byBrand[brandKey] = {
      stockMinPercent: null,
      stockMaxPercent: null,
      discountMinPercent: null,
      discountMaxPercent: null,
      mop: null
    };
  });

  (tableRows || []).forEach((row) => {
    const brandKey = getBrandKey(row?.brand) || getBrandKey(row?.article) || getBrandKey(row?.articleNo);
    if (!brandKey) return;

    const stockMin = parseNumeric(row?.stockMinPercent ?? row?.stockMin ?? row?.StockMinPercent ?? row?.StockMin);
    const stockMax = parseNumeric(row?.stockMaxPercent ?? row?.stockMax ?? row?.StockMaxPercent ?? row?.StockMax);
    const discountMin = parseNumeric(row?.discountMinPercent ?? row?.discountMin ?? row?.DiscountMinPercent ?? row?.DiscountMin);
    const discountMax = parseNumeric(row?.discountMaxPercent ?? row?.discountMax ?? row?.DiscountMaxPercent ?? row?.DiscountMax);
    const mop = parseNumeric(row?.mop ?? row?.MOP);

    if (stockMin !== null) byBrand[brandKey].stockMinPercent = stockMin;
    if (stockMax !== null) byBrand[brandKey].stockMaxPercent = stockMax;
    if (discountMin !== null) byBrand[brandKey].discountMinPercent = discountMin;
    if (discountMax !== null) byBrand[brandKey].discountMaxPercent = discountMax;
    if (mop !== null) byBrand[brandKey].mop = mop;
  });

  Object.entries(articleConstraints || {}).forEach(([rowKey, constraint]) => {
    const brandKey = resolveBrandFromRowKey(rowKey, tableRows);
    if (!brandKey) return;

    const stockMin = parseNumeric(constraint?.stockMin);
    const stockMax = parseNumeric(constraint?.stockMax);
    const discountMin = parseNumeric(constraint?.discountMin);
    const discountMax = parseNumeric(constraint?.discountMax);

    if (stockMin !== null) byBrand[brandKey].stockMinPercent = stockMin;
    if (stockMax !== null) byBrand[brandKey].stockMaxPercent = stockMax;
    if (discountMin !== null) byBrand[brandKey].discountMinPercent = discountMin;
    if (discountMax !== null) byBrand[brandKey].discountMaxPercent = discountMax;
  });

  return byBrand;
};

export const buildPriceGenixPayload = (params = {}) => {
  const { globalConstraints = [], articleConstraints = {}, tableRows = [] } = params;

  const payload = {
    bosch_n_min: { type: 'percent', value: 0.0 },
    bosch_n_max: { type: 'percent', value: 1.0 },
    haier_n_min: { type: 'percent', value: 0.0 },
    haier_n_max: { type: 'percent', value: 1.0 },
    ifb_n_min: { type: 'percent', value: 0.0 },
    ifb_n_max: { type: 'percent', value: 1.0 },
    lg_n_min: { type: 'percent', value: 0.0 },
    lg_n_max: { type: 'percent', value: 1.0 },
    samsung_n_min: { type: 'percent', value: 0.0 },
    samsung_n_max: { type: 'percent', value: 1.0 },
    whirlpool_n_min: { type: 'percent', value: 0.0 },
    whirlpool_n_max: { type: 'percent', value: 1.0 },

    gmv_lower: null,
    gmv_upper: null,
    profit_lower: null,
    profit_upper: null,
    margin_percent_lower: null,
    margin_percent_upper: null,
    units_min: null,
    units_max: null,
    discount_min: null,
    discount_max: null,

    bosch_discount_pct_min: null,
    bosch_discount_pct_max: null,
    haier_discount_pct_min: null,
    haier_discount_pct_max: null,
    ifb_discount_pct_min: null,
    ifb_discount_pct_max: null,
    lg_discount_pct_min: null,
    lg_discount_pct_max: null,
    samsung_discount_pct_min: null,
    samsung_discount_pct_max: null,
    whirlpool_discount_pct_min: null,
    whirlpool_discount_pct_max: null
  };

  (globalConstraints || []).forEach((constraint) => {
    if (!constraint?.type) return;
    applyGlobalConstraintToPayload(payload, constraint);
  });

  const channelConstraints = mergeChannelConstraints({ articleConstraints, tableRows });
  Object.entries(channelConstraints).forEach(([brandKey, values]) => {
    const stockMin = parseNumeric(values.stockMinPercent);
    const stockMax = parseNumeric(values.stockMaxPercent);
    const discountMin = parseNumeric(values.discountMinPercent);
    const discountMax = parseNumeric(values.discountMaxPercent);

    if (stockMin !== null) payload[`${brandKey}_n_min`] = { type: 'percent', value: clamp(stockMin / 100, 0, 1) };
    if (stockMax !== null) payload[`${brandKey}_n_max`] = { type: 'percent', value: clamp(stockMax / 100, 0, 1) };
    if (discountMin !== null) payload[`${brandKey}_discount_pct_min`] = clamp(discountMin / 100, 0, 1);
    if (discountMax !== null) payload[`${brandKey}_discount_pct_max`] = clamp(discountMax / 100, 0, 1);
  });

  payload.channel_constraints = channelConstraints;
  payload.table_data = (tableRows || []).map((row) => ({
    article: row?.article ?? row?.articleNo ?? '',
    brand: row?.brand ?? '',
    category: row?.category ?? '',
    channel: row?.channel ?? '',
    store_no: row?.storeNo ?? '',
    zone: row?.zone ?? '',
    status: row?.status ?? '',
    stock: parseNumeric(row?.stock ?? row?.Stock ?? row?.STOCK),
    stock_min_percent: parseNumeric(row?.stockMinPercent ?? row?.stockMin),
    stock_max_percent: parseNumeric(row?.stockMaxPercent ?? row?.stockMax),
    discount_min_percent: parseNumeric(row?.discountMinPercent ?? row?.discountMin),
    discount_max_percent: parseNumeric(row?.discountMaxPercent ?? row?.discountMax),
    mop: parseNumeric(row?.mop),
    nlc: parseNumeric(row?.nlc),
    max_price: parseNumeric(row?.maxPrice),
    min_price: parseNumeric(row?.minPrice)
  }));

  return payload;
};

const callApi = async (endpoint, payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const responseBody = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: getNormalizedErrorMessage(response.status, responseBody),
        backendMessage: extractBackendMessage(responseBody),
        validationMessage: extractValidationMessage(responseBody),
        details: responseBody
      };
    }

    return { success: true, data: responseBody };
  } catch {
    return {
      success: false,
      status: 0,
      error: DEFAULT_ERROR_MESSAGE
    };
  }
};

const getEndpoint = (objectiveId) => {
  switch (objectiveId) {
    case 'profit':
      return '/maximize-profit';
    case 'profitability':
      return '/maximize-profit-percent';
    case 'sales':
    default:
      return '/maximize-gmv';
  }
};

export const runPriceGenixOptimization = (objectiveId, params) => {
  const endpoint = getEndpoint(objectiveId);
  const payload = buildPriceGenixPayload(params);
  return callApi(endpoint, payload);
};

export const transformPriceGenixResponse = (backendData, originalRows) => {
  if (!backendData || !Array.isArray(originalRows)) return originalRows;

  return originalRows.map((row) => {
    const brandKey = getBrandKey(row?.brand) || getBrandKey(row?.article) || getBrandKey(row?.articleNo);
    if (!brandKey) return row;

    const brandData = backendData?.[brandKey];
    if (!brandData) return row;

    const units = Math.max(0, Math.round(toSafeNumber(brandData.units, 0)));
    const sales = Math.max(0, Math.round(toSafeNumber(brandData.gmv, 0)));
    const profit = Math.round(toSafeNumber(brandData.profit, 0));
    const profitability = round(toSafeNumber(brandData.margin_percent, 0), 2);
    const discountPercent = round(toSafeNumber(brandData.discount_percent, 0), 2);

    const mop = Math.max(0, toSafeNumber(row?.mop, 0));
    const discountUnit = Math.max(0, (mop * discountPercent) / 100);
    const discount = Math.round(discountUnit * units);
    const profitUnit = units > 0 ? Math.round(profit / units) : 0;

    return {
      ...row,
      testPrice: Math.max(0, Math.round(toSafeNumber(brandData.price, row?.testPrice ?? row?.mop ?? 0))),
      units,
      sales,
      profit,
      profitability,
      profitUnit,
      discount,
      discountPercent,
      discountUnit: Math.round(discountUnit),
      pedBasis: round(toSafeNumber(brandData.ped_basis, 0), 4),
      saleabilityScale: round(toSafeNumber(brandData.saleability_scale, 0), 4),
      saleabilityRank: Math.max(0, Math.round(toSafeNumber(brandData.saleability_rank, 0)))
    };
  });
};
