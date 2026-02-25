/**
 * MarketEdge API Service
 * Handles communication with FastAPI backend for optimization
 */

import { API_ROUTES } from '../api/apiConfig';

const API_BASE_URL = API_ROUTES.marketEdge;

/**
 * Parse constraint range string (e.g., "8-10" or "8.5-9.2")
 * Returns { min, max } or { min: null, max: null }
 */

/**
 * Map dynamic CSV channel names to backend field prefix
 * CSV might have "Channel 1", "Channel 2", "Channel 3" OR "SEO", "SMM", "OOH"
 * Backend expects seo_, smm_, ooh_ prefixes
 * 
 * Mapping strategy: Map channels by position (first=SEO, second=SMM, third=OOH)
 * OR by name if they match SEO/SMM/OOH
 */
const getBackendChannelKey = (channelName, channelIndex) => {
    const backendKeys = ['seo', 'smm', 'ooh'];

    // Check if channel name already matches expected names (case-insensitive)
    const normalized = String(channelName || '').toLowerCase().trim();
    if (normalized.includes('seo')) return 'seo';
    if (normalized.includes('smm') || normalized.includes('social')) return 'smm';
    if (normalized.includes('ooh') || normalized.includes('out-of-home')) return 'ooh';

    // Otherwise use position-based mapping (0=seo, 1=smm, 2=ooh)
    if (typeof channelIndex === 'number' && channelIndex >= 0 && channelIndex < 3) {
        return backendKeys[channelIndex];
    }

    // Default fallback
    return backendKeys[0];
};
const parseConstraintRange = (value) => {
    if (!value || typeof value !== 'string') {
        return { min: null, max: null };
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return { min: null, max: null };
    }

    // ONLY accept range format with dash (e.g., "8-10")
    // Single values from CSV (e.g., "12") should NOT be treated as constraints
    if (trimmed.includes('-')) {
        const parts = trimmed.split('-').map(p => p.trim());
        if (parts.length === 2) {
            const min = parseFloat(parts[0]);
            const max = parseFloat(parts[1]);

            if (Number.isFinite(min) && Number.isFinite(max)) {
                return { min, max };
            }
        }
    }

    // Single values are reference data, not constraints - return null
    // This prevents CSV values like "12" from becoming constraints like min=12, max=12
    return { min: null, max: null };
};

/**
 * Convert test spread percentage to decimal (0-25% → 0-0.25)
 * Backend expects values from 0 to 0.25 (representing 0% to 25%)
 */
const convertTestSpreadToDecimal = (value) => {
    if (value === '' || value === null || value === undefined) {
        return null;
    }

    const num = parseFloat(value);
    if (!Number.isFinite(num)) {
        return null;
    }

    // If the value is already between 0-0.25, assume it's in decimal format
    // If it's > 1, assume it's in percentage format and convert
    if (num > 0.25 && num <= 25) {
        return num / 100; // Convert percentage to decimal
    }

    // Clamp to valid range
    return Math.max(0, Math.min(0.25, num));
};

/**
 * Map frontend channel-level constraints to backend format
 * Frontend: { "Channel 1": { channelRoas: "8-10", channelMroas: "7-9" }, ... }
 * Backend: { seo_roas_min: 8, seo_roas_max: 10, seo_mroas_min: 7, ... }
 */
const mapChannelConstraints = (channelLevelConstraints) => {
    const result = {
        seo_roas_min: null,
        seo_roas_max: null,
        seo_mroas_min: null,
        seo_mroas_max: null,
        smm_roas_min: null,
        smm_roas_max: null,
        smm_mroas_min: null,
        smm_mroas_max: null,
        ooh_roas_min: null,
        ooh_roas_max: null,
        ooh_mroas_min: null,
        ooh_mroas_max: null,
    };

    if (!channelLevelConstraints) {
        return result;
    }

    // Get all channel names from constraints and map them
    const channelNames = Object.keys(channelLevelConstraints);

    channelNames.forEach((channelName, index) => {
        const channelData = channelLevelConstraints[channelName];
        const backendKey = getBackendChannelKey(channelName, index);

        const roasRange = parseConstraintRange(channelData.channelRoas);
        const mroasRange = parseConstraintRange(channelData.channelMroas);

        // Map to backend fields based on the determined backend key
        result[`${backendKey}_roas_min`] = roasRange.min;
        result[`${backendKey}_roas_max`] = roasRange.max;
        result[`${backendKey}_mroas_min`] = mroasRange.min;
        result[`${backendKey}_mroas_max`] = mroasRange.max;
    });

    return result;
};

/**
 * Build complete request payload for backend
 */
export const buildOptimizationRequest = (params) => {
    const {
        testSpreadMin,
        testSpreadMax,
        channelLevelConstraints,
        globalConstraints = {}
    } = params;

    // Map channel-level constraints
    const channelConstraints = mapChannelConstraints(channelLevelConstraints);

    // Build request payload
    const payload = {
        // Test spread configuration (convert to decimal 0-0.25)
        test_spread_min: convertTestSpreadToDecimal(testSpreadMin),
        test_spread_max: convertTestSpreadToDecimal(testSpreadMax),

        // Global/portfolio constraints
        gmv_lower: globalConstraints.gmv_lower || null,
        gmv_upper: globalConstraints.gmv_upper || null,
        spend_lower: globalConstraints.spend_lower || null,
        spend_upper: globalConstraints.spend_upper || null,
        roas_lower: globalConstraints.roas_lower || null,
        roas_upper: globalConstraints.roas_upper || null,

        // Channel-level constraints
        ...channelConstraints
    };

    return payload;
};

/**
 * Call backend optimization endpoint
 */
const callOptimizationAPI = async (endpoint, payload) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            console.error('❌ Backend error response:', errorData);
            console.error('❌ Full error object:', JSON.stringify(errorData, null, 2));

            // Extract error message from various possible formats
            let errorMessage = 'Unknown error';
            if (errorData.detail) {
                // FastAPI returns detail which might be a string or object
                if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else if (errorData.detail.message) {
                    errorMessage = errorData.detail.message;
                } else {
                    errorMessage = JSON.stringify(errorData.detail);
                }
            } else if (errorData.message) {
                errorMessage = errorData.message;
            } else {
                errorMessage = JSON.stringify(errorData);
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error.message || String(error) || 'Failed to connect to backend'
        };
    }
};

/**
 * Maximize Portfolio ROAS optimization
 */
export const maximizeROAS = async (params) => {
    const payload = buildOptimizationRequest(params);
    console.log('Maximize ROAS Request:', payload);
    return callOptimizationAPI('/maximize-roas', payload);
};

/**
 * Maximize Total GMV optimization
 */
export const maximizeGMV = async (params) => {
    const payload = buildOptimizationRequest(params);
    console.log('Maximize GMV Request:', payload);
    return callOptimizationAPI('/maximize-gmv', payload);
};

/**
 * Minimize Total Spend optimization
 */
export const minimizeSpend = async (params) => {
    const payload = buildOptimizationRequest(params);
    console.log('Minimize Spend Request:', payload);
    return callOptimizationAPI('/minimize-spend', payload);
};

/**
 * Calculate Test Ranges (when Set button is clicked)
 * This is called BEFORE optimization to preview test ranges
 */
export const calculateTestRanges = async (params) => {
    const { testSpreadMin, testSpreadMax, fundsAvailable } = params;

    // fundsAvailable is now dynamic: { "Channel 1": 10000000, "Channel 2": 4000000, ... }
    // We need to map these to seo_funds_available, smm_funds_available, ooh_funds_available

    // Filter out null/undefined values (old SEO/SMM/OOH keys from localStorage)
    const validChannels = Object.entries(fundsAvailable || {})
        .filter(([name, value]) => value !== null && value !== undefined && value > 0)
        .sort(([nameA], [nameB]) => nameA.localeCompare(nameB)); // Sort for consistent ordering

    const channelFunds = validChannels.map(([name, value]) => value);

    const payload = {
        test_spread_min: convertTestSpreadToDecimal(testSpreadMin),
        test_spread_max: convertTestSpreadToDecimal(testSpreadMax),
        seo_funds_available: channelFunds[0] || 0,
        smm_funds_available: channelFunds[1] || 0,
        ooh_funds_available: channelFunds[2] || 0
    };

    console.log('Calculate Test Ranges Request:', payload);
    console.log('  Input fundsAvailable:', fundsAvailable);
    console.log('  Valid channels:', validChannels);
    console.log('  Mapped to:', { seo: channelFunds[0], smm: channelFunds[1], ooh: channelFunds[2] });
    return callOptimizationAPI('/calculate-test-ranges', payload);
};

/**
 * Transform backend response to frontend table format
 * Maps backend channel names (SEO/SMM/OOH) to original CSV channel names
 */
export const transformBackendResponse = (backendData, originalChannelNames = []) => {
    if (!backendData || backendData.status !== 'success') {
        return null;
    }

    const channels = ['seo', 'smm', 'ooh'];

    // Use original channel names from CSV if provided, otherwise default to SEO/SMM/OOH
    const channelNames = originalChannelNames.length === 3
        ? originalChannelNames
        : ['SEO', 'SMM', 'OOH'];

    // Map individual channels
    const rows = channels.map((channelKey, index) => {
        const channel = backendData[channelKey];
        return {
            channel: channelNames[index], // Use original CSV name
            fundsAvailable: '', // Not provided by backend
            channelRoas: '', // Input constraint
            channelMroas: '', // Input constraint
            channelRoi: '', // Input constraint
            channelMroi: '', // Input constraint
            testRangeMin: '', // Not provided by backend
            testRangeMax: '', // Not provided by backend

            // Backend results
            testSpend: channel.spend ?? '',
            gmv: channel.gmv ?? '',
            roas: channel.roas ?? '',
            mroas: channel.mroas ?? '',
            outChannelRoi: '', // Backend doesn't return ROI
            outChannelMroi: '', // Backend doesn't return mROI
            spendRank: channel.rank,
            spendScale: channel.spend_scale ?? '',

            // Additional backend data
            ped: channel.ped,
            roasSpreadUpper: channel.roas_spread_upper,
            roasSpreadLower: channel.roas_spread_lower,
            gmvSpreadUpper: channel.gmv_spread_upper,
            gmvSpreadLower: channel.gmv_spread_lower,
            deltaRoas: channel.delta_roas,
            deltaGmv: channel.delta_gmv
        };
    });

    // Add portfolio total row
    rows.push({
        channel: 'Portfolio (Total)',
        fundsAvailable: '',
        channelRoas: '',
        channelMroas: '',
        channelRoi: '',
        channelMroi: '',
        testRangeMin: '',
        testRangeMax: '',
        testSpend: backendData.total_spend,
        gmv: backendData.total_gmv,
        roas: backendData.portfolio_roas,
        mroas: '', // Not provided for portfolio
        outChannelRoi: '',
        outChannelMroi: '',
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
