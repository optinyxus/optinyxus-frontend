/**
 * MarketEdge API Service
 * Centralized API handling for MarketEdge module.
 */

import { API_ROUTES } from './apiConfig';

const API_BASE_URL = API_ROUTES.marketEdge;

/**
 * Helper: Parse constraint range string (e.g., "8-10")
 */
const parseConstraintRange = (value) => {
    // 1. Convert to string and clean
    if (value === null || value === undefined) return { min: null, max: null };
    const strVal = String(value).trim();
    if (!strVal) return { min: null, max: null };

    // 2. Check for Range format "X-Y"
    if (strVal.includes('-')) {
        const parts = strVal.split('-').map(p => parseFloat(p.trim()));
        // Ensure both parts are numbers
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return { min: parts[0], max: parts[1] };
        }
    }

    // 3. Handle Single Value -> Treat as Minimum (Lower Bound)
    // This supports the UI where user inputs "5" meaning "ROAS >= 5"
    const numVal = parseFloat(strVal);
    if (!isNaN(numVal)) {
        return { min: numVal, max: null };
    }

    return { min: null, max: null };
};

/**
 * Helper: Convert percentage input (0-25) to decimal (0-0.25)
 */
const convertTestSpreadToDecimal = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const num = parseFloat(value);
    if (!Number.isFinite(num)) return null;
    if (num > 0.25 && num <= 25) return num / 100;
    return Math.max(0, Math.min(0.25, num));
};

/**
 * Helper: Determine backend key (seo/smm/ooh) based on channel name or index
 * CRITICAL FIX: Ensure "Online" maps to SEO, "Stores" maps to OOH/SMM based on order.
 */
const getBackendChannelKey = (channelName, index) => {
    const name = String(channelName || '').toLowerCase().trim();

    // Explicit Name Matching
    if (name.includes('seo') || name.includes('search') || name.includes('online') || name.includes('google')) return 'seo';
    if (name.includes('smm') || name.includes('social') || name.includes('facebook') || name.includes('meta') || name.includes('instagram')) return 'smm';
    if (name.includes('ooh') || name.includes('outdoor') || name.includes('billboard') || name.includes('store') || name.includes('physical')) return 'ooh';

    // Fallback: Use Index (0 -> seo, 1 -> smm, 2 -> ooh)
    // This safeguards against completely unknown names
    const keys = ['seo', 'smm', 'ooh'];
    if (index !== undefined && index >= 0 && index < keys.length) {
        return keys[index];
    }

    // Default fallback (should rarely happen if index is passed)
    return 'seo';
};

/**
 * CLIENT-SIDE SIMULATION: Calculate Test Ranges
 * Backend endpoint missing, so we calculate locally: Range = Funds * (1 ± Spread)
 */
export const calculateTestRanges = (params) => {
    return new Promise((resolve) => {
        console.log('[MarketEdge FRONTEND] Calculating Test Ranges (Client-Side)', params);
        const { testSpreadMin, testSpreadMax, fundsAvailable } = params;

        const spreadMin = convertTestSpreadToDecimal(testSpreadMin);
        const spreadMax = convertTestSpreadToDecimal(testSpreadMax);

        if (spreadMin === null || spreadMax === null) {
            resolve({ success: false, error: "Invalid test spread values" });
            return;
        }

        const result = {};
        Object.entries(fundsAvailable).forEach(([channel, funds]) => {
            if (funds && typeof funds === 'number') {
                result[channel] = {
                    min: Math.floor(funds * (1 - spreadMin)),
                    max: Math.ceil(funds * (1 + spreadMax))
                };
            }
        });

        resolve({ success: true, data: result });
    });
};

/**
 * Build Backend Payload
 */
/**
 * Build Backend Payload
 */
export const buildOptimizationPayload = (params) => {
    const { testSpreadMin, testSpreadMax, channelLevelConstraints, globalConstraints } = params;

    console.log('[MarketEdge FRONTEND] 🔍 Building Payload - Input Params:', params);

    // Extract Funds Per Channel (using same index logic as backend keys)
    const fundsAvailable = params.fundsAvailable || {};
    const fundsEntries = Object.entries(fundsAvailable);

    // Default funds to null
    let seoFunds = null;
    let smmFunds = null;
    let oohFunds = null;

    console.log('[MarketEdge FRONTEND] 🔍 Mapping Channels to Backend Keys:');

    // Map funds based on channel name matching
    fundsEntries.forEach(([channelName, amount]) => {
        const key = getBackendChannelKey(channelName);
        console.log(`  ➡ CSV Channel: "${channelName}" -> Backend Key: "${key}" | Funds: ${amount}`);

        if (key === 'seo') seoFunds = parseFloat(amount);
        if (key === 'smm') smmFunds = parseFloat(amount);
        if (key === 'ooh') oohFunds = parseFloat(amount);
    });

    // Log parsed funds for verification
    console.log('[MarketEdge FRONTEND] 💰 Parsed Funds for Backend:', {
        seo: seoFunds,
        smm: smmFunds,
        ooh: oohFunds
    });

    const payload = {
        test_spread_min: convertTestSpreadToDecimal(testSpreadMin),
        test_spread_max: convertTestSpreadToDecimal(testSpreadMax),

        // Channel Funds (New)
        seo_funds: isNaN(seoFunds) ? null : seoFunds,
        smm_funds: isNaN(smmFunds) ? null : smmFunds,
        ooh_funds: isNaN(oohFunds) ? null : oohFunds,

        // Global Constraints
        gmv_lower: globalConstraints?.gmv_lower ?? null,
        gmv_upper: globalConstraints?.gmv_upper ?? null,
        spend_lower: globalConstraints?.spend_lower ?? null,
        spend_upper: globalConstraints?.spend_upper ?? null,
        roas_lower: globalConstraints?.roas_lower ?? null,
        roas_upper: globalConstraints?.roas_upper ?? null,
        // ✅ ADDED: Global mROAS Support
        mroas_lower: globalConstraints?.mroas_lower ?? null,
        mroas_upper: globalConstraints?.mroas_upper ?? null,
    };

    console.log('[MarketEdge FRONTEND] 🌍 Global Constraints in Payload:', {
        gmv_lower: payload.gmv_lower,
        gmv_upper: payload.gmv_upper,
        spend_lower: payload.spend_lower,
        spend_upper: payload.spend_upper,
        roas_lower: payload.roas_lower,
        roas_upper: payload.roas_upper,
        mroas_lower: payload.mroas_lower,
        mroas_upper: payload.mroas_upper
    });

    // Channel Constraints Mapping
    const channelKeys = Object.keys(channelLevelConstraints || {});
    channelKeys.forEach((channel, index) => {
        const key = getBackendChannelKey(channel, index);
        const constraints = channelLevelConstraints[channel];

        const roas = parseConstraintRange(constraints.channelRoas);
        const mroas = parseConstraintRange(constraints.channelMroas);

        console.log(`  ➡ Constraint Mapping: "${channel}" -> "${key}"`, { roas, mroas });

        payload[`${key}_roas_min`] = roas.min;
        payload[`${key}_roas_max`] = roas.max;
        payload[`${key}_mroas_min`] = mroas.min;
        payload[`${key}_mroas_max`] = mroas.max;
    });

    console.log('[MarketEdge FRONTEND] 📦 Final Constructed Payload:', payload);
    return payload;
};

/**
 * API Call Wrapper
 */
const callApi = async (endpoint, payload) => {
    try {
        console.log(`[MarketEdge FRONTEND] Sending Request to ${endpoint}`, payload);
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown Error' }));
            console.error(`[MarketEdge FRONTEND] API Error from ${endpoint}`, error);
            throw new Error(error.detail?.message || error.detail || error.message || 'API request failed');
        }

        const data = await response.json();
        console.log(`[MarketEdge FRONTEND] Received Response from ${endpoint}`, data);
        console.log("[MarketEdge FRONTEND] Backend Stats:", data);
        return { success: true, data: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const maximizeROAS = (params) => callApi('/maximize-roas', buildOptimizationPayload(params));
export const maximizeGMV = (params) => callApi('/maximize-gmv', buildOptimizationPayload(params));
export const minimizeSpend = (params) => callApi('/minimize-spend', buildOptimizationPayload(params));

/**
 * Transform Backend Response to Table Rows
 */
export const transformBackendResponse = (backendData, originalRows) => {
    if (!backendData || !originalRows) return null;

    const channels = ['seo', 'smm', 'ooh'];
    const rows = originalRows.map((row, index) => {
        const backendKey = getBackendChannelKey(row.channel, index);
        const data = backendData[backendKey];

        if (!data) return { ...row, testSpend: '-', gmv: '-', roas: '-', mroas: '-' };

        return {
            ...row,
            testSpend: data.spend,
            gmv: data.gmv,
            roas: data.roas,
            mroas: data.mroas,
            spendRank: data.rank,
            spendScale: data.spend_scale,
            // Map Backend Test Ranges
            testRangeMin: data.test_range_min,
            testRangeMax: data.test_range_max
        };
    });

    // Calculate Portfolio Totals
    let totalFunds = 0;
    let totalTestMin = 0;
    let totalTestMax = 0;
    let totalMarginalGmv = 0;
    let hasValidFunds = false;
    let hasValidTestRanges = false;

    rows.forEach(r => {
        // Funds Available Total
        // STEP 6: Edge Case Handling - Convert string -> number, handle null/zero
        const rawFunds = r.fundsAvailable;
        let funds = 0;

        if (rawFunds !== null && rawFunds !== undefined && rawFunds !== '') {
            funds = typeof rawFunds === 'number'
                ? rawFunds
                : parseFloat(String(rawFunds).replace(/,/g, ''));
        }

        if (!isNaN(funds)) {
            totalFunds += funds;
            hasValidFunds = true;
        }

        // Test Range Totals
        const tMin = parseFloat(String(r.testRangeMin || '0').replace(/,/g, ''));
        const tMax = parseFloat(String(r.testRangeMax || '0').replace(/,/g, ''));
        if (!isNaN(tMin) || !isNaN(tMax)) {
            totalTestMin += isNaN(tMin) ? 0 : tMin;
            totalTestMax += isNaN(tMax) ? 0 : tMax;
            hasValidTestRanges = true;
        }

        // Weighted mROAS: sum(mroas_i * spend_i)
        const mroas = parseFloat(r.mroas);
        const spend = parseFloat(r.testSpend);
        if (!isNaN(mroas) && !isNaN(spend)) {
            totalMarginalGmv += mroas * spend;
        }
    });

    const portfolioTotalSpend = parseFloat(backendData.total_spend);
    const portfolioMroas = (portfolioTotalSpend > 0) ? (totalMarginalGmv / portfolioTotalSpend) : 0;
    const portfolioRoas = backendData.portfolio_roas ?? (portfolioTotalSpend > 0 ? (parseFloat(backendData.total_gmv) / portfolioTotalSpend) : 0);

    // Portfolio Row
    rows.push({
        channel: 'Portfolio (Total)',
        isTotalRow: true,
        fundsAvailable: hasValidFunds ? totalFunds : '',
        testRangeMin: hasValidTestRanges ? totalTestMin : '',
        testRangeMax: hasValidTestRanges ? totalTestMax : '',
        testSpend: backendData.total_spend,
        gmv: backendData.total_gmv,
        roas: portfolioRoas,
        mroas: portfolioMroas,
        spendRank: '',
        spendScale: ''
    });

    return {
        rows,
        metadata: {
            objective: backendData.objective,
            optimizationTime: backendData.optimization_time,
            totalIterations: backendData.total_iterations,
            validSolutions: backendData.valid_solutions,
            passRate: backendData.pass_rate
        }
    };
};
