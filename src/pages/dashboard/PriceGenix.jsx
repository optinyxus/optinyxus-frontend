import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import PriceGenixSidebar from '../../components/sidebars/PriceGenixSidebar';
import { loadPriceGenixCsv } from '../../utils/pricegenixCsvLoader';
import { runPriceGenixOptimization, transformPriceGenixResponse } from '../../api/pricegenixApi';
import { TrendingUp, DollarSign, Percent, Package, Award, Target, BarChart3, Download, X, TrendingDown, Maximize2, ChevronRight, ArrowUpRight, Clock, ChevronLeft, Eye, AlertCircle, CheckCircle2, Zap, TrendingDown as TrendingDownIcon, ArrowDown, History, Play, Sliders } from 'lucide-react';

// Mock Data
const mockOptimizationResults = [
  { article: 'Bosch', status: 'Active', stock: 1000, mop: 36981, nlc: 30441, maxPrice: 36981, minPrice: 30441, testPrice: 32200, units: 378, sales: 12171600, profit: 664902, profitability: 5.46, profitUnit: 1759, discount: 1807169, discountPercent: 12.9, discountUnit: 4781 },
  { article: 'Haier', status: 'Active', stock: 1000, mop: 19074, nlc: 16654, maxPrice: 19074, minPrice: 16654, testPrice: 18692, units: 63, sales: 1177610, profit: 128457, profitability: 10.91, profitUnit: 2039, discount: 24033, discountPercent: 2.0, discountUnit: 381 },
  { article: 'IFB', status: 'Active', stock: 1000, mop: 34036, nlc: 29976, maxPrice: 34036, minPrice: 29976, testPrice: 30800, units: 337, sales: 10379600, profit: 277688, profitability: 2.68, profitUnit: 824, discount: 1090536, discountPercent: 9.5, discountUnit: 3236 },
  { article: 'LG', status: 'Active', stock: 1000, mop: 32424, nlc: 27064, maxPrice: 32424, minPrice: 27064, testPrice: 28830, units: 885, sales: 25514550, profit: 1562910, profitability: 6.13, profitUnit: 1766, discount: 3180831, discountPercent: 11.1, discountUnit: 3594 },
  { article: 'Samsung', status: 'Active', stock: 1000, mop: 25250, nlc: 22131, maxPrice: 25250, minPrice: 22131, testPrice: 24493, units: 667, sales: 16336708, profit: 1575454, profitability: 9.64, profitUnit: 2362, discount: 505259, discountPercent: 3.0, discountUnit: 758 },
  { article: 'Whirlpool', status: 'Active', stock: 1000, mop: 19967, nlc: 16375, maxPrice: 19967, minPrice: 16375, testPrice: 19568, units: 550, sales: 10762167, profit: 1756150, profitability: 16.32, profitUnit: 3193, discount: 219636, discountPercent: 2.0, discountUnit: 399 },
  { article: 'Portfolio', status: '', stock: 6000, mop: 28878, nlc: 24436, maxPrice: 0, minPrice: 0, testPrice: 26508, units: 2880, sales: 76342235, profit: 5965561, profitability: 7.81, profitUnit: 2071, discount: 6827464, discountPercent: 8.2, discountUnit: 2371 },
];

const mockPerformanceData = {
  base: {
    sales: 71923147,
    profit: 5619493,
    discount: 6035879,
    units: 2823,
    profitability: 7.81,
    avgSalePrice: 25478,
    discountUnit: 2138
  },
  test: {
    sales: 76342235,
    profit: 5965561,
    discount: 6827464,
    units: 2880,
    profitability: 7.81,
    avgSalePrice: 26508,
    discountUnit: 2371
  },
  growth: {
    sales: 4419088,
    profit: 346068,
    discount: 791584,
    units: 57,
    profitability: 0.00,
    avgSalePrice: 1030,
    discountUnit: 233
  },
  growthPercent: {
    sales: 6.14,
    profit: 6.16,
    discount: 13.11,
    units: 2.02
  }
};

const mockPromotionData = {
  contribution: {
    top50: {
      gmv: 41851258,
      avgPrice: 3138364,
      maxPrice: 3686090,
      gmvPerRs: 11.35,
      gpPerRs: 0.85,
      count: 1552
    },
    top80: {
      gmv: 64785025,
      avgPrice: 5559416,
      maxPrice: 5712895,
      gmvPerRs: 11.34,
      gpPerRs: 0.97,
      count: 2480
    }
  },
  avgListPrice: 27955,
  avgSalePrice: 26508,
  incrementalROI: {
    gmvPerRs: 5.58,
    gpPerRs: 0.44,
    unitsPerRs: 0.00
  },
  percentUnderPromotion: {
    sales: 5.79,
    profit: 5.80,
    units: 1.98
  },
  effectiveness: {
    base: { gmvPerRs: 11.92, gpPerRs: 0.93 },
    test: { gmvPerRs: 11.18, gpPerRs: 0.87 },
    incremental: { gmvPerRs: 5.58, gpPerRs: 0.44 }
  }
};

const mockPastIterations = [
  {
    id: 1,
    weekNumber: 49,
    iterationNumber: 1,
    name: 'Q4 2025 Optimization',
    date: '2025-12-01 14:30',
    objective: 'Sales Maximization',
    constraints: 'Discount: 0%-15%, Profit: 20%-40%',
    sales: 1425000
  },
  {
    id: 2,
    weekNumber: 48,
    iterationNumber: 2,
    name: 'Holiday Season Test',
    date: '2025-11-28 10:15',
    objective: 'Profit Maximization',
    constraints: 'Discount: 5%-20%, Units: 5000-15000',
    sales: 1380000
  },
];

const REQUIRED_PORTFOLIO_FIELD_CONFIG = [
  { key: 'total_gmv', label: 'Total GMV', type: 'currency' },
  { key: 'total_profit', label: 'Total Profit', type: 'currency' },
  { key: 'portfolio_margin_percent', label: 'Portfolio Margin %', type: 'percent' },
  { key: 'total_units', label: 'Total Units', type: 'integer' },
  { key: 'portfolio_discount_percent', label: 'Portfolio Discount %', type: 'percent' }
];

const PriceGenix = () => {
  const navigate = useNavigate();
  const { pricegenix: pgCtx, setPricegenixState } = useAppState();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedPreviewRows, setUploadedPreviewRows] = useState([]);
  const [selectedOptimization, setSelectedOptimization] = useState('sales');
  const [constraints, setConstraints] = useState([]);
  const [scoringLevels, setScoringLevels] = useState(['Article']);
  const [hasResults, setHasResults] = useState(false);
  const [resultsData, setResultsData] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [topArticlesTab, setTopArticlesTab] = useState('overview');
  const [topArticlesMetric, setTopArticlesMetric] = useState('sales');
  const [viewMode, setViewMode] = useState('current');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [isHistoryDropdownOpen, setIsHistoryDropdownOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationError, setOptimizationError] = useState(null);
  const [optimizationValidationMessage, setOptimizationValidationMessage] = useState('');
  const [optimizationSummary, setOptimizationSummary] = useState(null);
  const [portfolioTotals, setPortfolioTotals] = useState([]);

  const [currentPerformanceData, setCurrentPerformanceData] = useState(mockPerformanceData);
  const [currentPromotionData, setCurrentPromotionData] = useState(mockPromotionData);

  const [hideArticleLevelConstraints, setHideArticleLevelConstraints] = useState(false);
  const [stockConstraintsEnabled, setStockConstraintsEnabled] = useState(true);
  const [discountConstraintsEnabled, setDiscountConstraintsEnabled] = useState(true);
  const [articleLevelConstraints, setArticleLevelConstraints] = useState({});

  const scoringOptions = ['Article', 'Brand', 'Category', 'Store', 'Geography', 'Channel'];
  const STORAGE_KEY = 'pricegenix_dashboard_state';

  const buildDefaultArticleConstraintsFromRows = (rows = []) => {
    const defaults = {};
    (rows || []).forEach((r) => {
      const article = r?.article ?? r?.articleNo ?? r?.Article ?? r?.ARTICLE;
      if (!article) return;


      const stockMin = r?.stockMinPercent ?? r?.StockMinPercent ?? r?.stockMin ?? r?.StockMin;
      const stockMax = r?.stockMaxPercent ?? r?.StockMaxPercent ?? r?.stockMax ?? r?.StockMax;
      const discountMin = r?.discountMinPercent ?? r?.DiscountMinPercent ?? r?.discountMin ?? r?.DiscountMin;
      const discountMax = r?.discountMaxPercent ?? r?.DiscountMaxPercent ?? r?.discountMax ?? r?.DiscountMax;

      defaults[article] = {
        stockMin: stockMin !== null && stockMin !== undefined && stockMin !== '' ? String(stockMin) : '',
        stockMax: stockMax !== null && stockMax !== undefined && stockMax !== '' ? String(stockMax) : '',
        discountMin: discountMin !== null && discountMin !== undefined && discountMin !== '' ? String(discountMin) : '',
        discountMax: discountMax !== null && discountMax !== undefined && discountMax !== '' ? String(discountMax) : ''
      };
    });
    return defaults;
  };

  useEffect(() => {
    // --- 1. Restore runtime state from in-memory context (survives navigation) ---
    if (pgCtx.isOptimizing || pgCtx.hasResults) {
      if (pgCtx.isOptimizing) setIsOptimizing(true);
      if (pgCtx.hasResults) {
        setHasResults(true);
        setResultsData(pgCtx.resultsData || []);
        setOptimizationSummary(pgCtx.optimizationSummary || null);
        setPortfolioTotals(pgCtx.portfolioTotals || []);
      }
      if (pgCtx.optimizationError) setOptimizationError(pgCtx.optimizationError);
    }

    // --- 2. Restore file / constraints from localStorage (existing logic unchanged) ---
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const savedObjective = ['sales', 'profit', 'profitability'].includes(saved?.selectedOptimization)
          ? saved.selectedOptimization
          : 'sales';
        if (saved?.uploadedFileName) setUploadedFile({ name: saved.uploadedFileName });
        setUploadedPreviewRows(saved?.uploadedPreviewRows || []);
        setArticleLevelConstraints(saved?.articleLevelConstraints || {});
        setConstraints(saved?.constraints || []);
        setSelectedOptimization(savedObjective);
        // Only use localStorage results if context did NOT already provide them
        if (!pgCtx.hasResults) {
          setResultsData(saved?.resultsData || []);
          setHasResults(Boolean(saved?.hasResults && saved?.uploadedFileName));
        }
        return;
      }

      // Backward compatibility with previous localStorage schema.
      const savedFileName = localStorage.getItem('pricegenix_uploadedFileName');
      const savedPreviewRows = localStorage.getItem('pricegenix_uploadedPreviewRows');
      const savedArticleConstraints = localStorage.getItem('pricegenix_articleLevelConstraints');

      if (savedFileName && savedPreviewRows && savedArticleConstraints) {
        setUploadedFile({ name: savedFileName });
        setUploadedPreviewRows(JSON.parse(savedPreviewRows));
        setArticleLevelConstraints(JSON.parse(savedArticleConstraints));
      }
    } catch (e) {
      // ignore
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try {
      const uploadedFileName = uploadedFile?.name || '';
      if (!uploadedFileName) return;

      const stateToSave = {
        uploadedFileName,
        uploadedPreviewRows: uploadedPreviewRows || [],
        articleLevelConstraints: articleLevelConstraints || {},
        constraints: constraints || [],
        selectedOptimization,
        hasResults,
        resultsData: resultsData || []
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      // ignore
    }
  }, [
    uploadedFile,
    uploadedPreviewRows,
    articleLevelConstraints,
    constraints,
    selectedOptimization,
    hasResults,
    resultsData
  ]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleFileUpload = async (file) => {
    if (!file) {
      setUploadedFile(null);
      setUploadedPreviewRows([]);
      setArticleLevelConstraints({});

      // If user removes the file, return to the initial stage (no results view).
      setHasResults(false);
      setResultsData([]);
      setViewMode('current');
      setSelectedHistoryItem(null);
      setOptimizationError(null);
      setOptimizationValidationMessage('');
      setOptimizationSummary(null);
      setPortfolioTotals([]);
      setIsOptimizing(false);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('pricegenix_uploadedFileName');
      localStorage.removeItem('pricegenix_uploadedPreviewRows');
      localStorage.removeItem('pricegenix_articleLevelConstraints');
      // Clear context so navigating back shows blank state
      setPricegenixState({ isOptimizing: false, hasResults: false, resultsData: [], optimizationError: null, optimizationSummary: null, portfolioTotals: [] });
      return;
    }

    setUploadedFile(file);

    try {
      const { previewRows, articleLevelConstraintsMap } = await loadPriceGenixCsv(file);
      setUploadedPreviewRows(previewRows || []);

      const fallbackFromRows = buildDefaultArticleConstraintsFromRows(previewRows || []);

      const nextArticleLevelConstraints = {
        ...(fallbackFromRows || {}),
        ...(articleLevelConstraintsMap || {})
      };
      setArticleLevelConstraints(nextArticleLevelConstraints);
      setHasResults(false);
      setResultsData([]);
      setViewMode('current');
      setSelectedHistoryItem(null);
      setOptimizationError(null);
      setPortfolioTotals([]);
    } catch (err) {
      setUploadedPreviewRows([]);
      setArticleLevelConstraints({});
      setHasResults(false);
      setResultsData([]);
      setOptimizationError('Failed to parse uploaded file.');
      setOptimizationValidationMessage('');
      setOptimizationSummary(null);
      setPortfolioTotals([]);

      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('pricegenix_uploadedFileName');
      localStorage.removeItem('pricegenix_uploadedPreviewRows');
      localStorage.removeItem('pricegenix_articleLevelConstraints');
    }
  };

  const handleRunOptimization = async () => {
    if (!uploadedFile || !uploadedPreviewRows || uploadedPreviewRows.length === 0) return;
    if (isOptimizing) return;

    setOptimizationError(null);
    setOptimizationValidationMessage('');
    setOptimizationSummary(null);
    setPortfolioTotals([]);
    setIsOptimizing(true);
    // Sync running state to context so navigation away doesn't lose the spinner
    setPricegenixState({ isOptimizing: true, hasResults: false, optimizationError: null, optimizationSummary: null, portfolioTotals: [] });

    try {
      const initialRows = uploadedPreviewRows.map((r) => ({
        article: r.article ?? r.articleNo ?? '',
        articleNo: r.articleNo ?? r.article ?? '',
        brand: r.brand ?? '',
        category: r.category ?? '',
        channel: r.channel ?? '',
        storeNo: r.storeNo ?? '',
        zone: r.zone ?? '',
        status: r.status,
        stock: r.stock ?? 0,
        mop: r.mop ?? 0,
        nlc: r.nlc ?? 0,
        maxPrice: r.maxPrice ?? 0,
        minPrice: r.minPrice ?? 0,
        testPrice: r.mop ?? 0,
        units: 0,
        sales: 0,
        profit: 0,
        profitability: 0,
        profitUnit: 0,
        discount: 0,
        discountPercent: 0,
        discountUnit: 0,
        pedBasis: 0,
        saleabilityScale: 0,
        saleabilityRank: 0
      }));

      const result = await runPriceGenixOptimization(selectedOptimization, {
        globalConstraints: constraints,
        articleConstraints: articleLevelConstraints,
        tableRows: uploadedPreviewRows
      });

      if (!result.success || !result.data) {
        const apiError = new Error(result.error || 'Optimization failed. Please try again.');
        apiError.statusCode = result?.status;
        apiError.validationMessage = result?.validationMessage || '';
        apiError.backendMessage = result?.backendMessage || '';
        throw apiError;
      }

      if (String(result.data?.status || '').toLowerCase() !== 'success') {
        const responseError = new Error(result.data?.message || 'No solution found. Constraints are too strict.');
        responseError.statusCode = 400;
        responseError.validationMessage = result.data?.details || '';
        responseError.backendMessage = result.data?.message || '';
        throw responseError;
      }

      const updatedRows = transformPriceGenixResponse(result.data, initialRows);
      const summary = {
        status: result.data.status || 'success',
        optimization_time: result.data.optimization_time ?? null,
        total_iterations: result.data.total_iterations ?? null,
        valid_solutions: result.data.valid_solutions ?? null,
        pass_rate: result.data.pass_rate ?? null
      };
      const totals = extractPortfolioTotalsFromResponse(result.data);
      setResultsData(updatedRows);
      setHasResults(true);
      setViewMode('current');
      setSelectedHistoryItem(null);
      setOptimizationSummary(summary);
      setPortfolioTotals(totals);
      // Persist results to context so they survive navigation
      setPricegenixState({
        isOptimizing: false,
        hasResults: true,
        resultsData: updatedRows,
        optimizationSummary: summary,
        portfolioTotals: totals,
        optimizationError: null,
      });
    } catch (err) {
      const strictErrorMessage = 'No solution found. Constraints are too strict.';
      const backendValidation = err?.validationMessage || err?.backendMessage || err?.message || '';

      setOptimizationError(strictErrorMessage);
      setOptimizationValidationMessage(
        backendValidation && backendValidation !== strictErrorMessage ? backendValidation : ''
      );
      setOptimizationSummary(null);
      setPortfolioTotals([]);
      setPricegenixState({ isOptimizing: false, hasResults: false, optimizationError: strictErrorMessage });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleReset = () => {
    setConstraints([]);
    setSelectedOptimization('sales');
    setScoringLevels(['Article']);
    setHasResults(false);
    setResultsData([]);
    setViewMode('current');
    setSelectedHistoryItem(null);
    setIsHistoryDropdownOpen(false);
    setOptimizationError(null);
    setOptimizationValidationMessage('');
    setOptimizationSummary(null);
    setPortfolioTotals([]);
    setIsOptimizing(false);
    setArticleLevelConstraints(buildDefaultArticleConstraintsFromRows(uploadedPreviewRows));
    setHideArticleLevelConstraints(false);
    setStockConstraintsEnabled(true);
    setDiscountConstraintsEnabled(true);
    // Clear context so navigating back shows blank state
    setPricegenixState({ isOptimizing: false, hasResults: false, resultsData: [], optimizationError: null, optimizationSummary: null, portfolioTotals: [] });
  };

  const handleViewHistory = (iteration) => {
    setSidebarOpen(false);
    setIsHistoryDropdownOpen(false);
    setSelectedHistoryItem(iteration);
    setViewMode('history');
    setResultsData((prev) => (prev && prev.length > 0 ? prev : mockOptimizationResults));
    setHasResults(true);
  };

  const handleBackToCurrent = () => {
    setViewMode('current');
    setSelectedHistoryItem(null);
  };

  const handleDownload = () => {
    const headers = ['Article', 'Status', 'Stock', 'MOP', 'NLC', 'Max Price', 'Min Price', 'Test Price', 'Units', 'Sales', 'Profit', 'Profitability', 'Profit/Unit', 'Discount', 'Discount %', 'Discount/Unit'];
    const csvContent = [
      headers.join(','),
      ...resultsData.map(row =>
        `${row.article},${row.status},${row.stock},${row.mop},${row.nlc},${row.maxPrice},${row.minPrice},${row.testPrice},${row.units},${row.sales},${row.profit},${row.profitability},${row.profitUnit},${row.discount},${row.discountPercent},${row.discountUnit}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pricegenix-${viewMode === 'history' ? 'history' : 'current'}-results.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleArticleLevelConstraintChange = (article, field, value) => {
    setArticleLevelConstraints((prev) => {
      const current = prev[article] || {};
      const nextArticle = { ...current, [field]: value };

      const toNum = (v) => {
        if (v === '' || v === null || v === undefined) return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      };

      const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
      const round2 = (n) => Math.round(n * 100) / 100;

      // Clamp only; do NOT enforce Max > Min.
      if (field === 'stockMin' || field === 'stockMax' || field === 'discountMin' || field === 'discountMax') {
        const v = toNum(nextArticle[field]);
        if (v !== null) nextArticle[field] = String(round2(clamp(v, 0, 100)));
      }

      return {
        ...prev,
        [article]: nextArticle,
      };
    });
  };

  const toggleScoringLevel = (level) => {
    if (scoringLevels.includes(level)) {
      setScoringLevels(scoringLevels.filter(l => l !== level));
    } else {
      setScoringLevels([...scoringLevels, level]);
    }
  };

  const handleRowClick = (article) => {
    setSelectedArticle(article);
    setPopupType('article');
    setShowPopup(true);
  };

  const handleCardClick = (type) => {
    setPopupType(type);
    setShowPopup(true);
    if (type === 'topArticles') {
      setTopArticlesTab('overview');
      setTopArticlesMetric('sales');
    }
  };

  const generateTimeSeriesData = (article) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, idx) => ({
      month,
      price: article.mop + (Math.random() * 10 - 5),
      sales: article.units + (Math.random() * 20 - 10)
    }));
  };

  const parseConstraintsToMap = (constraintsString) => {
    const map = {
      sales: '',
      profit: '',
      profitPercentage: '',
      units: '',
      discount: ''
    };

    if (!constraintsString) return map;

    const parts = constraintsString.split(',').map((p) => p.trim()).filter(Boolean);

    parts.forEach((part) => {
      const [rawKey, ...rest] = part.split(':');
      if (!rawKey || rest.length === 0) return;

      const key = rawKey.trim().toLowerCase();
      const value = rest.join(':').trim();

      if (key === 'sales') map.sales = value;
      if (key === 'profit') map.profit = value;
      if (key === 'profit %' || key === 'profit%' || key === 'profit percentage' || key === 'profitability') map.profitPercentage = value;
      if (key === 'units') map.units = value;
      if (key === 'discount') map.discount = value;
    });

    return map;
  };

  const getArticleLevelConstraintColor = (article) => {
    const c = articleLevelConstraints[article] || {};
    const stockFilled = (c.stockMin ?? '') !== '' || (c.stockMax ?? '') !== '';
    const discountFilled = (c.discountMin ?? '') !== '' || (c.discountMax ?? '') !== '';
    if (stockFilled && discountFilled) return 'bg-yellow-50';
    if (stockFilled) return 'bg-blue-50';
    if (discountFilled) return 'bg-rose-50';
    return '';
  };

  const inferPortfolioMetricType = (key) => {
    const normalizedKey = String(key || '').toLowerCase();
    if (normalizedKey.includes('percent') || normalizedKey.endsWith('_pct') || normalizedKey.endsWith('_percentage')) {
      return 'percent';
    }
    if (normalizedKey.includes('units') || normalizedKey.includes('count')) {
      return 'integer';
    }
    if (
      normalizedKey.includes('gmv') ||
      normalizedKey.includes('profit') ||
      normalizedKey.includes('sales') ||
      normalizedKey.includes('revenue') ||
      normalizedKey.includes('spend') ||
      normalizedKey.includes('discount') ||
      normalizedKey.includes('price') ||
      normalizedKey.includes('value')
    ) {
      return 'currency';
    }
    return 'number';
  };

  const toPortfolioLabel = (key) => String(key || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\bPct\b/i, '%')
    .replace(/\bPercent\b/i, '%');

  const extractPortfolioTotalsFromResponse = (backendData) => {
    if (!backendData || typeof backendData !== 'object') return [];

    const allKeys = Object.keys(backendData).filter((key) => key.startsWith('total_') || key.startsWith('portfolio_'));
    if (allKeys.length === 0) return [];

    const requiredItems = REQUIRED_PORTFOLIO_FIELD_CONFIG
      .filter(({ key }) => Object.prototype.hasOwnProperty.call(backendData, key))
      .map(({ key, label, type }) => ({
        key,
        label,
        type,
        value: backendData[key]
      }));

    const requiredKeySet = new Set(REQUIRED_PORTFOLIO_FIELD_CONFIG.map(({ key }) => key));
    const additionalItems = allKeys
      .filter((key) => !requiredKeySet.has(key))
      .map((key) => ({
        key,
        label: toPortfolioLabel(key),
        type: inferPortfolioMetricType(key),
        value: backendData[key]
      }));

    return [...requiredItems, ...additionalItems];
  };

  const formatPortfolioValue = (value, type) => {
    if (value === null || value === undefined || value === '') return '-';
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return String(value);
    }

    if (type === 'currency') {
      return `₹${Math.round(parsed).toLocaleString('en-IN')}`;
    }
    if (type === 'percent') {
      return `${parsed.toLocaleString('en-IN', { maximumFractionDigits: 2 })}%`;
    }
    if (type === 'integer') {
      return Math.round(parsed).toLocaleString('en-IN');
    }
    if (type === 'scale') {
      return parsed.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return parsed.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  const getPortfolioValue = (key) => portfolioTotals.find((metric) => metric.key === key)?.value;

  const toNumericValue = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'string') {
      const cleaned = value.replace(/\uFEFF/g, '').replace(/₹/g, '').replace(/%/g, '').replace(/,/g, '').trim();
      const parsed = Number(cleaned);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const resultsPortfolioSums = useMemo(() => {
    const rows = Array.isArray(resultsData) ? resultsData : [];
    return rows.reduce((acc, row) => ({
      stock: acc.stock + toNumericValue(row?.stock),
      units: acc.units + toNumericValue(row?.units),
      sales: acc.sales + toNumericValue(row?.sales),
      profit: acc.profit + toNumericValue(row?.profit)
    }), {
      stock: 0,
      units: 0,
      sales: 0,
      profit: 0
    });
  }, [resultsData]);

  const uploadedPortfolioSums = useMemo(() => {
    const rows = Array.isArray(uploadedPreviewRows) ? uploadedPreviewRows : [];
    return rows.reduce((acc, row) => ({
      stock: acc.stock + toNumericValue(row?.stock ?? row?.Stock ?? row?.STOCK)
    }), { stock: 0 });
  }, [uploadedPreviewRows]);

  const backendOrFallback = (key, fallbackValue) => {
    const backendValue = getPortfolioValue(key);
    return backendValue !== null && backendValue !== undefined && backendValue !== '' ? backendValue : fallbackValue;
  };

  const formatCurrency = (value) => formatPortfolioValue(value, 'currency');
  const formatInteger = (value) => formatPortfolioValue(value, 'integer');
  const formatPercent = (value) => formatPortfolioValue(value, 'percent');

  const controlMetrics = {
    sales: toNumericValue(currentPerformanceData?.base?.sales),
    profit: toNumericValue(currentPerformanceData?.base?.profit),
    discount: toNumericValue(currentPerformanceData?.base?.discount),
    units: toNumericValue(currentPerformanceData?.base?.units),
    profitability: toNumericValue(currentPerformanceData?.base?.profitability),
    avgSalePrice: toNumericValue(currentPerformanceData?.base?.avgSalePrice),
    discountUnit: toNumericValue(currentPerformanceData?.base?.discountUnit),
  };

  const testMetrics = {
    sales: toNumericValue(hasResults ? (getPortfolioValue('total_gmv') ?? currentPerformanceData?.test?.sales) : currentPerformanceData?.test?.sales),
    profit: toNumericValue(hasResults ? (getPortfolioValue('total_profit') ?? currentPerformanceData?.test?.profit) : currentPerformanceData?.test?.profit),
    discount: toNumericValue(
      hasResults
        ? (getPortfolioValue('total_discount') ?? getPortfolioValue('portfolio_discount_total') ?? currentPerformanceData?.test?.discount)
        : currentPerformanceData?.test?.discount
    ),
    units: toNumericValue(hasResults ? (getPortfolioValue('total_units') ?? currentPerformanceData?.test?.units) : currentPerformanceData?.test?.units),
    profitability: toNumericValue(
      hasResults
        ? (getPortfolioValue('margin_percent') ?? getPortfolioValue('portfolio_margin_percent') ?? currentPerformanceData?.test?.profitability)
        : currentPerformanceData?.test?.profitability
    ),
    avgSalePrice: toNumericValue(
      hasResults
        ? (getPortfolioValue('test_price') ?? getPortfolioValue('portfolio_test_price') ?? currentPerformanceData?.test?.avgSalePrice)
        : currentPerformanceData?.test?.avgSalePrice
    ),
    discountUnit: toNumericValue(
      hasResults
        ? (getPortfolioValue('discount_per_unit') ?? getPortfolioValue('portfolio_discount_per_unit') ?? currentPerformanceData?.test?.discountUnit)
        : currentPerformanceData?.test?.discountUnit
    ),
  };

  const growthMetrics = {
    sales: testMetrics.sales - controlMetrics.sales,
    profit: testMetrics.profit - controlMetrics.profit,
    discount: testMetrics.discount - controlMetrics.discount,
    units: testMetrics.units - controlMetrics.units,
    profitability: testMetrics.profitability - controlMetrics.profitability,
    avgSalePrice: testMetrics.avgSalePrice - controlMetrics.avgSalePrice,
    discountUnit: testMetrics.discountUnit - controlMetrics.discountUnit,
  };

  const toGrowthPercent = (growthValue, controlValue) => {
    if (!Number.isFinite(controlValue) || controlValue === 0) return 0;
    return (growthValue / controlValue) * 100;
  };

  const growthPercentMetrics = {
    sales: toGrowthPercent(growthMetrics.sales, controlMetrics.sales),
    profit: toGrowthPercent(growthMetrics.profit, controlMetrics.profit),
    discount: toGrowthPercent(growthMetrics.discount, controlMetrics.discount),
    units: toGrowthPercent(growthMetrics.units, controlMetrics.units),
  };

  const computeTopRowsByThreshold = (sortedRows, metric, thresholdFraction) => {
    const rows = Array.isArray(sortedRows) ? sortedRows : [];
    if (rows.length === 0) return [];

    const totalMetric = rows.reduce((sum, row) => sum + toNumericValue(row?.[metric]), 0);
    if (totalMetric <= 0) return [];

    const threshold = totalMetric * thresholdFraction;
    const selectedRows = [];
    let cumulative = 0;

    for (const row of rows) {
      selectedRows.push(row);
      cumulative += toNumericValue(row?.[metric]);
      if (cumulative > threshold) break;
    }

    return selectedRows;
  };

  const topArticlesRankedRows = useMemo(() => {
    const sourceRows = Array.isArray(resultsData) ? resultsData : [];
    return [...sourceRows]
      .filter((row) => String(row?.article ?? row?.articleNo ?? '').trim() !== '')
      .sort((a, b) => toNumericValue(b?.[topArticlesMetric]) - toNumericValue(a?.[topArticlesMetric]));
  }, [resultsData, topArticlesMetric]);

  const top50Rows = useMemo(
    () => computeTopRowsByThreshold(topArticlesRankedRows, topArticlesMetric, 0.5),
    [topArticlesRankedRows, topArticlesMetric]
  );

  const top80Rows = useMemo(
    () => computeTopRowsByThreshold(topArticlesRankedRows, topArticlesMetric, 0.8),
    [topArticlesRankedRows, topArticlesMetric]
  );

  const summarizeTopRows = (rows) => {
    const totals = (rows || []).reduce((acc, row) => ({
      sales: acc.sales + toNumericValue(row?.sales),
      profit: acc.profit + toNumericValue(row?.profit),
      units: acc.units + toNumericValue(row?.units),
      discount: acc.discount + toNumericValue(row?.discount),
    }), {
      sales: 0,
      profit: 0,
      units: 0,
      discount: 0,
    });

    return {
      ...totals,
      count: rows?.length ?? 0,
      profitability: totals.sales > 0 ? (totals.profit / totals.sales) * 100 : 0,
      avgSalePrice: totals.units > 0 ? totals.sales / totals.units : 0,
      discountUnit: totals.units > 0 ? totals.discount / totals.units : 0,
    };
  };

  const topArticlesSummary = useMemo(() => ({
    top50: summarizeTopRows(top50Rows),
    top80: summarizeTopRows(top80Rows),
  }), [top50Rows, top80Rows]);

  const renderPopup = () => {
    if (!showPopup) return null;

    if (popupType === 'article' && selectedArticle) {
      return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowPopup(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Article {selectedArticle.article}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Price vs Sales Trend Analysis</p>
              </div>
              <button onClick={() => setShowPopup(false)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0">
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Current Price</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">₹{selectedArticle.mop}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Test Price</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">₹{selectedArticle.testPrice}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Current Units</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">{selectedArticle.units}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Discount</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">{selectedArticle.discountPercent}%</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Historical Trend (Last 6 Months)</h4>
                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm min-w-[500px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-xs font-medium text-gray-500">Month</th>
                        <th className="text-right py-2 sm:py-3 px-3 sm:px-4 text-xs font-medium text-gray-500">Price (₹)</th>
                        <th className="text-right py-2 sm:py-3 px-3 sm:px-4 text-xs font-medium text-gray-500">Sales (Units)</th>
                        <th className="text-right py-2 sm:py-3 px-3 sm:px-4 text-xs font-medium text-gray-500">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateTimeSeriesData(selectedArticle).map((data, idx) => (
                        <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900">{data.month}</td>
                          <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-600">₹{data.price.toFixed(2)}</td>
                          <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-600">{Math.round(data.sales)}</td>
                          <td className="py-2 sm:py-3 px-3 sm:px-4 text-right">
                            {idx > 0 && (
                              data.sales > generateTimeSeriesData(selectedArticle)[idx - 1].sales ? (
                                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 inline" />
                              ) : (
                                <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 inline" />
                              )
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setShowPopup(false)} className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (popupType === 'comparison') {
      return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowPopup(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Performance Analysis</h3>
                </div>
                <button onClick={() => setShowPopup(false)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0">
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 bg-white flex-1 overflow-auto">
              <div className="border border-gray-200 rounded-lg overflow-x-auto">
                <table className="w-full text-xs sm:text-sm min-w-[600px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300"></th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">Sales</th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">Profit</th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">Discount</th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">Units</th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">Profitability</th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">Avg. Sale Price</th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">Discount / Unit</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">Control</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(controlMetrics.sales)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(controlMetrics.profit)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(controlMetrics.discount)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatInteger(controlMetrics.units)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatPercent(controlMetrics.profitability)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(controlMetrics.avgSalePrice)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(controlMetrics.discountUnit)}</td>
                    </tr>
                    <tr className="border-b-2 border-gray-300 hover:bg-gray-50 transition-colors">
                      <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">Test</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(testMetrics.sales)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(testMetrics.profit)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(testMetrics.discount)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatInteger(testMetrics.units)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatPercent(testMetrics.profitability)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(testMetrics.avgSalePrice)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(testMetrics.discountUnit)}</td>
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">Growth </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(growthMetrics.sales)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(growthMetrics.profit)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(growthMetrics.discount)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatInteger(growthMetrics.units)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatPercent(growthMetrics.profitability)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(growthMetrics.avgSalePrice)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(growthMetrics.discountUnit)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">Growth %</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatPercent(growthPercentMetrics.sales)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatPercent(growthPercentMetrics.profit)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatPercent(growthPercentMetrics.discount)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatPercent(growthPercentMetrics.units)}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-400"></td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-400"></td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-400"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex justify-end flex-shrink-0">
              <button onClick={() => setShowPopup(false)} className="px-4 sm:px-5 py-1.5 sm:py-2 bg-gray-900 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (popupType === 'topArticles') {
      const currentTop50Data = top50Rows;
      const currentTop80Data = top80Rows;
      return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowPopup(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* 🔥 HEADER - RADIO BUTTONS ON RIGHT SIDE */}
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">Top Selling Articles Analysis</h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Complete breakdown by contribution</p>
                  </div>
                  <button onClick={() => setShowPopup(false)} className="lg:hidden w-8 h-8 sm:w-10 sm:h-10 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0 ml-2">
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>
                </div>

                {/* 🔥 RADIO BUTTONS - GRAY COLOR SCHEME */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 lg:flex-nowrap">
                  <label className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full cursor-pointer transition-all text-[10px] sm:text-xs font-medium ${topArticlesMetric === 'sales'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    <input
                      type="radio"
                      name="topArticlesMetric"
                      value="sales"
                      checked={topArticlesMetric === 'sales'}
                      onChange={(e) => setTopArticlesMetric(e.target.value)}
                      className="sr-only"
                    />
                    Sales
                  </label>

                  <label className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full cursor-pointer transition-all text-[10px] sm:text-xs font-medium ${topArticlesMetric === 'profit'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    <input
                      type="radio"
                      name="topArticlesMetric"
                      value="profit"
                      checked={topArticlesMetric === 'profit'}
                      onChange={(e) => setTopArticlesMetric(e.target.value)}
                      className="sr-only"
                    />
                    Profit
                  </label>

                  <label className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full cursor-pointer transition-all text-[10px] sm:text-xs font-medium ${topArticlesMetric === 'units'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    <input
                      type="radio"
                      name="topArticlesMetric"
                      value="units"
                      checked={topArticlesMetric === 'units'}
                      onChange={(e) => setTopArticlesMetric(e.target.value)}
                      className="sr-only"
                    />
                    Units
                  </label>

                  <label className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full cursor-pointer transition-all text-[10px] sm:text-xs font-medium ${topArticlesMetric === 'discount'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    <input
                      type="radio"
                      name="topArticlesMetric"
                      value="discount"
                      checked={topArticlesMetric === 'discount'}
                      onChange={(e) => setTopArticlesMetric(e.target.value)}
                      className="sr-only"
                    />
                    Discount
                  </label>

                  <button onClick={() => setShowPopup(false)} className="hidden lg:flex w-8 h-8 sm:w-10 sm:h-10 rounded-lg hover:bg-gray-200 items-center justify-center transition-colors flex-shrink-0 ml-2">
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* TABS */}
            <div className="px-4 sm:px-6 pt-3 sm:pt-4 border-b border-gray-200 bg-white flex-shrink-0">
              <div className="flex gap-1 sm:gap-2 overflow-x-auto">
                <button
                  onClick={() => setTopArticlesTab('overview')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all border-b-2 whitespace-nowrap ${topArticlesTab === 'overview'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setTopArticlesTab('top50')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all border-b-2 whitespace-nowrap ${topArticlesTab === 'top50'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                >
                  Top 50%
                </button>
                <button
                  onClick={() => setTopArticlesTab('top80')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all border-b-2 whitespace-nowrap ${topArticlesTab === 'top80'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                >
                  Top 80%
                </button>
              </div>
            </div>

            {/* CONTENT - SCROLLABLE TABLES */}
            <div className="flex-1 overflow-hidden bg-white">
              {topArticlesTab === 'overview' && (
                <div className="h-full overflow-auto p-4 sm:p-6">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300"></th>
                          <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Sales</th>
                          <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Profit</th>
                          <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Units</th>
                          <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Discount</th>
                          <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Profitability</th>
                          <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Avg. Sale Price</th>
                          <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Discount / Unit</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">Top 50%</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(topArticlesSummary.top50.sales)}</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(topArticlesSummary.top50.profit)}</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatInteger(topArticlesSummary.top50.units)}</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(topArticlesSummary.top50.discount)}</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatPercent(topArticlesSummary.top50.profitability)}</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(topArticlesSummary.top50.avgSalePrice)}</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(topArticlesSummary.top50.discountUnit)}</td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">Top 80%</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(topArticlesSummary.top80.sales)}</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(topArticlesSummary.top80.profit)}</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatInteger(topArticlesSummary.top80.units)}</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(topArticlesSummary.top80.discount)}</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatPercent(topArticlesSummary.top80.profitability)}</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(topArticlesSummary.top80.avgSalePrice)}</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(topArticlesSummary.top80.discountUnit)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {topArticlesTab === 'top50' && (
                <div className="h-full overflow-auto p-4 sm:p-6">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="sticky top-0 z-10 bg-gray-50">
                        <tr>
                          <th className="text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Article ID</th>
                          <th className="text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Product Name</th>
                          <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Sales</th>
                          <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Profit</th>
                          <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Units</th>
                          <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Discount</th>
                          <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Profitability</th>
                          <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Avg. Sale Price</th>
                          <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Discount / Unit</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {currentTop50Data.map((article, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">{article.article ?? article.articleNo ?? '-'}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-gray-900">{article.brand ?? article.category ?? '-'}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(article.sales)}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(article.profit)}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatInteger(article.units)}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(article.discount)}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatPercent(toNumericValue(article.sales) > 0 ? (toNumericValue(article.profit) / toNumericValue(article.sales)) * 100 : 0)}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(toNumericValue(article.units) > 0 ? toNumericValue(article.sales) / toNumericValue(article.units) : 0)}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(toNumericValue(article.units) > 0 ? toNumericValue(article.discount) / toNumericValue(article.units) : 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {topArticlesTab === 'top80' && (
                <div className="h-full overflow-auto p-4 sm:p-6">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="sticky top-0 z-10 bg-gray-50">
                        <tr>
                          <th className="text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Article ID</th>
                          <th className="text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Product Name</th>
                          <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Sales</th>
                          <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Profit</th>
                          <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Units</th>
                          <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Discount</th>
                          <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Profitability</th>
                          <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Avg. Sale Price</th>
                          <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">Discount / Unit</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {currentTop80Data.map((article, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">{article.article ?? article.articleNo ?? '-'}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-gray-900">{article.brand ?? article.category ?? '-'}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(article.sales)}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(article.profit)}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatInteger(article.units)}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(article.discount)}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatPercent(toNumericValue(article.sales) > 0 ? (toNumericValue(article.profit) / toNumericValue(article.sales)) * 100 : 0)}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(toNumericValue(article.units) > 0 ? toNumericValue(article.sales) / toNumericValue(article.units) : 0)}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{formatCurrency(toNumericValue(article.units) > 0 ? toNumericValue(article.discount) / toNumericValue(article.units) : 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex justify-end flex-shrink-0">
              <button onClick={() => setShowPopup(false)} className="px-4 sm:px-5 py-1.5 sm:py-2 bg-gray-900 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 🔥 PROMOTION POPUP - WITH AMBER COLOR
    if (popupType === 'contribution') {
      return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowPopup(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-[60rem] w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Promotion Analysis</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Comprehensive promotion effectiveness metrics</p>
                </div>
                <button onClick={() => setShowPopup(false)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0">
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
              <div className="space-y-4 sm:space-y-5">
                {/* Promotion ROI Table */}
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-2">Promotion ROI</h4>
                  <div className="border border-gray-200 rounded-lg overflow-x-auto">
                    <table className="w-full table-fixed text-xs sm:text-sm min-w-[650px]">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-300">
                          <th className="text-left py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-gray-900 w-[140px]"></th>
                          <th className="text-center py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-gray-900 w-[130px]">Sales / Rs. Discount</th>
                          <th className="text-center py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-gray-900 w-[130px]">Profits / Rs. Discount</th>
                          <th className="text-center py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-gray-900">Observations</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-gray-900 whitespace-nowrap">Control</td>
                          <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-center text-gray-900">₹ 11.92</td>
                          <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-center text-gray-900">₹ 0.93</td>
                          <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-left text-gray-900"></td>
                        </tr>
                        <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-gray-900 whitespace-nowrap">Test</td>
                          <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-center text-gray-900">₹ 11.18</td>
                          <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-center text-gray-900">₹ 0.87</td>
                          <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-left text-gray-900"></td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-gray-900 whitespace-nowrap">Increamental</td>
                          <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-center text-gray-900">₹ 5.58</td>
                          <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-center text-gray-900">₹ 0.44</td>
                          <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-left text-gray-900"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ✅ only ONE line between the two sections */}
                <div className="border-b border-gray-300 my-4"></div>

                {/* Promotion Effectiveness Table */}
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-2">Promotion Effectiveness</h4>
                  <div className="border border-gray-200 rounded-lg overflow-x-auto">
                    <table className="w-full table-fixed text-xs sm:text-sm min-w-[650px]">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-300">
                          <th className="text-left py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-gray-900 w-[230px]"></th>
                          <th className="text-center py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 w-[110px]">Values</th>
                          <th className="text-center py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-gray-900">Observations</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-gray-900">Increamental Sales / Unit</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-center text-gray-900 whitespace-nowrap">₹ 77,528</td>
                          <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-left text-gray-900"></td>
                        </tr>
                        <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-gray-900">Increamental Profit / Unit</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-center text-gray-900 whitespace-nowrap">₹ 6,071</td>
                          <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-left text-gray-900"></td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-gray-900">Increamental Discount / Unit</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-center text-gray-900 whitespace-nowrap">₹ 13,887</td>
                          <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-left text-gray-900"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex justify-end flex-shrink-0 rounded-b-xl">
              <button onClick={() => setShowPopup(false)} className="px-4 sm:px-5 py-1.5 sm:py-2 bg-gray-900 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (popupType === 'charts') {
      return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowPopup(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Price-Sales-Competition Analysis</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Comprehensive market analysis charts</p>
                </div>
                <button onClick={() => setShowPopup(false)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0">
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-white">
              <div className="h-64 sm:h-96 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3" />
                  <p className="text-xs sm:text-sm text-gray-500">Charts: Bars, Pies, Scatters (To be implemented)</p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button onClick={() => setShowPopup(false)} className="px-4 sm:px-5 py-1.5 sm:py-2 bg-gray-900 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        /* Remove number input spinners (Chrome, Safari, Edge, Opera) */
        input.no-spinner::-webkit-outer-spin-button,
        input.no-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        /* Remove number input spinners (Firefox) */
        input.no-spinner[type='number'] {
          -moz-appearance: textfield;
          appearance: textfield;
        }
      `}</style>

      {viewMode !== 'history' && (
        <PriceGenixSidebar
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          uploadedFile={uploadedFile}
          onFileUpload={handleFileUpload}
          selectedOptimization={selectedOptimization}
          onOptimizationChange={setSelectedOptimization}
          constraints={constraints}
          onConstraintsChange={setConstraints}
          onRunOptimization={handleRunOptimization}
          onReset={handleReset}
          isOptimizing={isOptimizing}
        />
      )}

      <Navbar
        toggleSidebar={toggleSidebar}
        showMenuButton={viewMode !== 'history'}
        currentProduct="pricegenix"
        onLogoClick={() => navigate('/dashboard')}
      />

      <div className={`pt-16 transition-all duration-300 ${viewMode === 'history' ? 'ml-0' : 'lg:ml-[320px]'}`}>
        {optimizationSummary && hasResults && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mx-4 sm:mx-6 mt-4 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-green-800">Optimization Summary</h3>
                <div className="mt-2 text-sm text-green-700 overflow-x-auto">
                  <p className="whitespace-nowrap">
                    <span className="font-semibold">status:</span> {optimizationSummary.status || '-'}
                    <span className="mx-2">|</span>
                    <span className="font-semibold">optimization_time:</span> {optimizationSummary.optimization_time ?? '-'}{optimizationSummary.optimization_time !== null && optimizationSummary.optimization_time !== undefined ? 's' : ''}
                    <span className="mx-2">|</span>
                    <span className="font-semibold">total_iterations:</span> {optimizationSummary.total_iterations !== null && optimizationSummary.total_iterations !== undefined ? new Intl.NumberFormat('en-IN').format(optimizationSummary.total_iterations) : '-'}
                    <span className="mx-2">|</span>
                    <span className="font-semibold">valid_solutions:</span> {optimizationSummary.valid_solutions !== null && optimizationSummary.valid_solutions !== undefined ? new Intl.NumberFormat('en-IN').format(optimizationSummary.valid_solutions) : '-'}
                    <span className="mx-2">|</span>
                    <span className="font-semibold">pass_rate:</span> {optimizationSummary.pass_rate ?? '-'}{optimizationSummary.pass_rate !== null && optimizationSummary.pass_rate !== undefined ? '%' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {optimizationError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 sm:mx-6 mt-4 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">Optimization Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{optimizationError}</p>
                  {optimizationValidationMessage && (
                    <p className="mt-1">{optimizationValidationMessage}</p>
                  )}
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setOptimizationError(null)}
                    className="text-sm font-medium text-red-800 hover:text-red-600 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6 space-y-4">
          {viewMode === 'history' && selectedHistoryItem && (
            <div className="relative bg-white rounded-lg p-3 sm:p-4 shadow-sm border-2 border-gray-300">
              {/* Back button pinned to top-right (bigger on laptop) */}
              <button
                onClick={handleBackToCurrent}
                className="absolute top-3 right-3 flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-900 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
                Back
              </button>

              {/* Two-column layout: left info, right constraints */}
              <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 pr-16">
                {/* Left: title/date/iteration/objective */}
                <div className="flex items-start gap-3 lg:w-[320px] min-w-0">
                  <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">{selectedHistoryItem.name}</h3>

                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedHistoryItem.date}
                    </p>

                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                      <span className="font-semibold text-gray-700">Iteration:</span>
                      <span className="ml-1 font-semibold text-gray-900">{selectedHistoryItem.iterationNumber}</span>
                    </p>

                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                      <span className="font-semibold text-gray-700">Objective:</span>
                      <span className="ml-1 font-bold text-gray-900">{selectedHistoryItem.objective}</span>
                    </p>
                  </div>
                </div>

                {/* Right: constraints (mobile single table, desktop split tables) */}
                <div className="flex-1">
                  <div className="text-[10px] sm:text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">Constraints:</span>
                    {(() => {
                      const constraintMap = parseConstraintsToMap(selectedHistoryItem.constraints);
                      const val = (v) => (v && String(v).trim().length > 0 ? v : '-');

                      const splitMinMax = (v) => {
                        const raw = val(v);
                        if (raw === '-') return { min: '-', max: '-' };
                        const parts = String(raw)
                          .split('-')
                          .map((p) => p.trim())
                          .filter(Boolean);
                        if (parts.length === 2) return { min: parts[0], max: parts[1] };
                        return { min: raw, max: raw };
                      };

                      return (
                        <div className="mt-2">
                          {/* Mobile: single table */}
                          <div className="sm:hidden border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full table-fixed text-[10px]">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="w-[120px] text-left py-1 px-2 font-semibold text-gray-900 border-b border-gray-200">Metric</th>
                                  <th className="text-right py-1 px-2 font-semibold text-gray-900 border-b border-gray-200">Min</th>
                                  <th className="text-right py-1 px-2 font-semibold text-gray-900 border-b border-gray-200">Max</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white">
                                <tr className="border-b border-gray-100">
                                  <td className="py-1 px-2 font-medium text-gray-700">Sales</td>
                                  <td className="py-1 px-2 text-right text-gray-900">{splitMinMax(constraintMap.sales).min}</td>
                                  <td className="py-1 px-2 text-right text-gray-900">{splitMinMax(constraintMap.sales).max}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                  <td className="py-1 px-2 font-medium text-gray-700">Profit</td>
                                  <td className="py-1 px-2 text-right font-semibold text-gray-900">{splitMinMax(constraintMap.profit).min}</td>
                                  <td className="py-1 px-2 text-right font-semibold text-gray-900">{splitMinMax(constraintMap.profit).max}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                  <td className="py-1 px-2 font-medium text-gray-700">Profit %</td>
                                  <td className="py-1 px-2 text-right text-gray-900">{splitMinMax(constraintMap.profitPercentage).min}</td>
                                  <td className="py-1 px-2 text-right text-gray-900">{splitMinMax(constraintMap.profitPercentage).max}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                  <td className="py-1 px-2 font-medium text-gray-700">Units</td>
                                  <td className="py-1 px-2 text-right text-gray-900">{splitMinMax(constraintMap.units).min}</td>
                                  <td className="py-1 px-2 text-right text-gray-900">{splitMinMax(constraintMap.units).max}</td>
                                </tr>
                                <tr>
                                  <td className="py-1 px-2 font-medium text-gray-700">Discount</td>
                                  <td className="py-1 px-2 text-right font-semibold text-gray-900">{splitMinMax(constraintMap.discount).min}</td>
                                  <td className="py-1 px-2 text-right font-semibold text-gray-900">{splitMinMax(constraintMap.discount).max}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* Tablet/Desktop: two smaller tables */}
                          <div className="hidden sm:grid grid-cols-2 gap-2 max-w-[720px]">
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                              <table className="w-full table-fixed text-[10px] sm:text-xs">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="w-[120px] text-left py-1 px-2 font-semibold text-gray-900 border-b border-gray-200">Metric</th>
                                    <th className="text-right py-1 px-2 font-semibold text-gray-900 border-b border-gray-200">Min</th>
                                    <th className="text-right py-1 px-2 font-semibold text-gray-900 border-b border-gray-200">Max</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white">
                                  <tr className="border-b border-gray-100">
                                    <td className="py-1 px-2 font-medium text-gray-700">Sales</td>
                                    <td className="py-1 px-2 text-right text-gray-900">{splitMinMax(constraintMap.sales).min}</td>
                                    <td className="py-1 px-2 text-right text-gray-900">{splitMinMax(constraintMap.sales).max}</td>
                                  </tr>
                                  <tr className="border-b border-gray-100">
                                    <td className="py-1 px-2 font-medium text-gray-700">Profit</td>
                                    <td className="py-1 px-2 text-right font-semibold text-gray-900">{splitMinMax(constraintMap.profit).min}</td>
                                    <td className="py-1 px-2 text-right font-semibold text-gray-900">{splitMinMax(constraintMap.profit).max}</td>
                                  </tr>
                                  <tr>
                                    <td className="py-1 px-2 font-medium text-gray-700">Profit %</td>
                                    <td className="py-1 px-2 text-right text-gray-900">{splitMinMax(constraintMap.profitPercentage).min}</td>
                                    <td className="py-1 px-2 text-right text-gray-900">{splitMinMax(constraintMap.profitPercentage).max}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                              <table className="w-full table-fixed text-[10px] sm:text-xs">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="w-[120px] text-left py-1 px-2 font-semibold text-gray-900 border-b border-gray-200">Metric</th>
                                    <th className="text-right py-1 px-2 font-semibold text-gray-900 border-b border-gray-200">Min</th>
                                    <th className="text-right py-1 px-2 font-semibold text-gray-900 border-b border-gray-200">Max</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white">
                                  <tr className="border-b border-gray-100">
                                    <td className="py-1 px-2 font-medium text-gray-700">Units</td>
                                    <td className="py-1 px-2 text-right text-gray-900">{splitMinMax(constraintMap.units).min}</td>
                                    <td className="py-1 px-2 text-right text-gray-900">{splitMinMax(constraintMap.units).max}</td>
                                  </tr>
                                  <tr>
                                    <td className="py-1 px-2 font-medium text-gray-700">Discount</td>
                                    <td className="py-1 px-2 text-right font-semibold text-gray-900">{splitMinMax(constraintMap.discount).min}</td>
                                    <td className="py-1 px-2 text-right font-semibold text-gray-900">{splitMinMax(constraintMap.discount).max}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'current' && (
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-xs sm:text-sm font-semibold text-gray-900">Scoring Levels</label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {scoringOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => toggleScoringLevel(option)}
                        className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all ${scoringLevels.includes(option)
                          ? 'bg-gray-900 text-white'
                          : 'bg-white border border-gray-300 text-gray-600 hover:border-gray-900'
                          }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hidden lg:block w-px h-16 bg-gray-300 self-stretch"></div>
                <div className="flex flex-col gap-2 lg:w-auto lg:min-w-[280px]">
                  <label className="text-xs sm:text-sm font-semibold text-gray-900">Past Iterations</label>
                  <div className="relative">
                    <button
                      onClick={() => setIsHistoryDropdownOpen(!isHistoryDropdownOpen)}
                      className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-white rounded-lg text-[10px] sm:text-xs font-medium hover:bg-gray-800 transition-colors"
                    >
                      <History className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                      <span>View History ({mockPastIterations.length})</span>
                      <ChevronRight className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 transform transition-transform ${isHistoryDropdownOpen ? 'rotate-90' : ''}`} />
                    </button>

                    {isHistoryDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsHistoryDropdownOpen(false)}
                        />

                        <div className="absolute right-0 mt-2 w-full sm:w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                          <div className="p-2 max-h-80 overflow-y-auto">
                            <div className="px-3 py-2 border-b border-gray-200">
                              <p className="text-xs font-semibold text-gray-900">Historical Runs</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">Click to view past results</p>
                            </div>
                            {mockPastIterations.map((iteration) => (
                              <button
                                key={iteration.id}
                                onClick={() => handleViewHistory(iteration)}
                                className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors group/item"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-xs sm:text-sm font-medium text-gray-900 group-hover/item:text-gray-900">{iteration.name}</p>
                                  <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                </div>
                                <p className="text-[10px] text-gray-500">{iteration.date}</p>
                                <p className="text-[10px] text-gray-600 font-medium mt-0.5">
                                  Iteration {iteration.iterationNumber}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-gray-900">
                                    Objective: {iteration.objective}
                                  </span>
                                  <span className="text-[10px] text-gray-500">•</span>
                                  <span className="text-[10px] text-gray-600 font-medium">
                                    ₹{(iteration.sales / 1000).toFixed(0)}K
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasResults ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div
                  onClick={() => handleCardClick('comparison')}
                  className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Performance</h3>
                    <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-900 group-hover:scale-110 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                    <div>
                      <p className="text-gray-500">Test Sales</p>
                      <p className="font-semibold text-gray-900">{formatPortfolioValue(backendOrFallback('total_gmv', resultsPortfolioSums.sales), 'currency')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Test Price</p>
                      <p className="font-semibold text-gray-900">{formatPortfolioValue(getPortfolioValue('portfolio_test_price'), 'currency')}</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleCardClick('topArticles')}
                  className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Top Articles</h3>
                    <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-900 group-hover:scale-110 transition-all" />
                  </div>
                  <div className="space-y-1 text-[10px] sm:text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Top 50%</span>
                      <span className="font-medium text-gray-900">{formatInteger(topArticlesSummary.top50.count)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Top 80%</span>
                      <span className="font-medium text-gray-900">{formatInteger(topArticlesSummary.top80.count)}</span>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleCardClick('contribution')}
                  className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Promotions</h3>
                    <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-900 group-hover:scale-110 transition-all" />
                  </div>
                  <div className="space-y-1 text-[10px] sm:text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ROI / Rs.</span>
                      <span className="font-medium text-gray-900">₹{mockPromotionData.incrementalROI.gmvPerRs.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">% Sale</span>
                      <span className="font-medium text-gray-900">{mockPromotionData.percentUnderPromotion.sales}%</span>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleCardClick('charts')}
                  className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Analysis</h3>
                    <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-900 group-hover:scale-110 transition-all" />
                  </div>
                  <div className="flex items-center justify-center h-12">
                    <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400 group-hover:text-gray-900 transition-colors" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">Optimized Results</h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Click row for detailed analysis</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      <div className="flex flex-wrap items-center gap-4 border border-gray-200 rounded-lg px-3 py-2 bg-white">
                        <span className="text-[10px] sm:text-xs font-bold text-gray-900 whitespace-nowrap">Article Level Constrains</span>

                        <label className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-700 font-medium whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={stockConstraintsEnabled}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setStockConstraintsEnabled(checked);
                              if (!checked) setHideArticleLevelConstraints(false);
                            }}
                            className="w-4 h-4"
                          />
                          Stocks
                        </label>

                        <label className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-700 font-medium whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={discountConstraintsEnabled}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setDiscountConstraintsEnabled(checked);
                              if (!checked) setHideArticleLevelConstraints(false);
                            }}
                            className="w-4 h-4"
                          />
                          Discounts
                        </label>
                      </div>

                      {(() => {
                        const canToggleHide = stockConstraintsEnabled || discountConstraintsEnabled;
                        return (
                          <div className="flex items-center gap-3">
                            <label
                              className={
                                `flex items-center gap-2 text-[10px] sm:text-xs font-semibold whitespace-nowrap ${canToggleHide ? 'text-gray-900 cursor-pointer' : 'text-gray-400 cursor-not-allowed'
                                }`
                              }
                            >
                              <input
                                type="checkbox"
                                disabled={!canToggleHide}
                                checked={hideArticleLevelConstraints}
                                onChange={(e) => setHideArticleLevelConstraints(e.target.checked)}
                                className="w-4 h-4"
                              />
                              Hide
                            </label>

                            <button
                              type="button"
                              onClick={() => {
                                setArticleLevelConstraints((prev) => {
                                  const next = {};
                                  Object.keys(prev).forEach((k) => {
                                    next[k] = { ...prev[k], stockMin: '', stockMax: '', discountMin: '', discountMax: '' };
                                  });
                                  return next;
                                });
                              }}
                              className="px-2 py-2 border border-gray-200 rounded-lg text-[10px] sm:text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                              title="Reset article constraints"
                            >
                              Reset
                            </button>
                          </div>
                        );
                      })()}
                    </div>

                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg text-[10px] sm:text-xs font-medium hover:bg-gray-800 transition-colors shadow-sm w-full sm:w-auto justify-center whitespace-nowrap"
                    >
                      <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] sm:text-xs min-w-[2550px] table-auto">
                    <thead className="bg-gray-50 border-b-2 border-gray-300">
                      <tr>
                        <th className="sticky left-0 z-10 bg-gray-50 text-left py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 border-r-2 border-gray-300 whitespace-nowrap">Brand</th>
                        <th className="text-left py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">Article No.</th>
                        <th className="text-left py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">Category</th>
                        <th className="text-left py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">Channel</th>
                        <th className="text-left py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">Store No.</th>
                        <th className="text-left py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">Zone</th>
                        <th className="text-center py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">Status</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">Stock</th>
                        {!hideArticleLevelConstraints && stockConstraintsEnabled && (
                          <>
                            <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">Stock Min. %</th>
                            <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">Stock Max. %</th>
                          </>
                        )}
                        {!hideArticleLevelConstraints && discountConstraintsEnabled && (
                          <>
                            <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">Discount Min. %</th>
                            <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">Discount Max. %</th>
                          </>
                        )}
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">MOP</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">NLC</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">Max. Price</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">Min. Price</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 bg-emerald-50 whitespace-nowrap">Test Price</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">Units</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">Sales</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">Profit</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">Profitability</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">Profit/Unit</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">Discount</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">Discount %</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">Discount/Unit</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">Saleability Rank</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">Saleability Scale</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {resultsData.map((row, index) => (
                        <tr
                          key={index}
                          onClick={() => handleRowClick(row)}
                          className={`border-b border-gray-100 transition-colors cursor-pointer group ${getArticleLevelConstraintColor(row.article) || "hover:bg-gray-50"}`}
                        >
                          <td className={`sticky left-0 z-10 py-2 sm:py-2.5 px-2 sm:px-3 font-medium text-gray-900 border-r-2 border-gray-200 ${getArticleLevelConstraintColor(row.article) || "bg-white group-hover:bg-gray-50"}`}>{row.brand || '-'}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-gray-700">{row.article}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-gray-700 whitespace-nowrap">{row.category || '-'}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-gray-700">{row.channel || '-'}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-gray-700">{row.storeNo || '-'}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-gray-700">{row.zone || '-'}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-center">
                            {row.status && <span className={`inline-flex px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-green-100 text-green-700`}>
                              {row.status}
                            </span>}
                          </td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">{row.stock != null ? Math.round(row.stock).toLocaleString('en-IN') : '-'}</td>
                          {!hideArticleLevelConstraints && stockConstraintsEnabled && (
                            <>
                              <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={articleLevelConstraints[row.article]?.stockMin ?? ''}
                                  placeholder="MIN%"
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => handleArticleLevelConstraintChange(row.article, 'stockMin', e.target.value)}
                                  className="no-spinner w-20 px-2 py-1 border border-gray-300 rounded-md text-center placeholder:text-center text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                                  style={{ textAlign: 'center' }}
                                />
                              </td>
                              <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={articleLevelConstraints[row.article]?.stockMax ?? ''}
                                  placeholder="MAX%"
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => handleArticleLevelConstraintChange(row.article, 'stockMax', e.target.value)}
                                  className="no-spinner w-20 px-2 py-1 border border-gray-300 rounded-md text-center placeholder:text-center text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                                  style={{ textAlign: 'center' }}
                                />
                              </td>
                            </>
                          )}
                          {!hideArticleLevelConstraints && discountConstraintsEnabled && (
                            <>
                              <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={articleLevelConstraints[row.article]?.discountMin ?? ''}
                                  placeholder="MIN%"
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => handleArticleLevelConstraintChange(row.article, 'discountMin', e.target.value)}
                                  className="no-spinner w-24 px-2 py-1 border border-gray-300 rounded-md text-center placeholder:text-center text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                                  style={{ textAlign: 'center' }}
                                />
                              </td>
                              <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={articleLevelConstraints[row.article]?.discountMax ?? ''}
                                  placeholder="MAX%"
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => handleArticleLevelConstraintChange(row.article, 'discountMax', e.target.value)}
                                  className="no-spinner w-24 px-2 py-1 border border-gray-300 rounded-md text-center placeholder:text-center text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                                  style={{ textAlign: 'center' }}
                                />
                              </td>
                            </>
                          )}
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">₹{Math.round(row.mop).toLocaleString('en-IN')}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">₹{Math.round(row.nlc).toLocaleString('en-IN')}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">{row.maxPrice > 0 ? `₹${Math.round(row.maxPrice).toLocaleString('en-IN')}` : '-'}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">{row.minPrice > 0 ? `₹${Math.round(row.minPrice).toLocaleString('en-IN')}` : '-'}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right font-bold text-gray-900 bg-emerald-50">₹{Math.round(row.testPrice).toLocaleString('en-IN')}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">{Math.round(row.units).toLocaleString('en-IN')}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">₹{Math.round(row.sales).toLocaleString('en-IN')}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">₹{Math.round(row.profit).toLocaleString('en-IN')}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">{row.profitability}%</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">₹{Math.round(row.profitUnit).toLocaleString('en-IN')}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">₹{Math.round(row.discount).toLocaleString('en-IN')}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">{row.discountPercent}%</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">₹{Math.round(row.discountUnit).toLocaleString('en-IN')}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">{formatPortfolioValue(row.saleabilityRank, 'integer')}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">{formatPortfolioValue(row.saleabilityScale, 'scale')}</td>
                        </tr>
                      ))}
                      <tr className="border-b border-gray-100 bg-gray-100 font-bold">
                        <td className="sticky left-0 z-10 py-2 sm:py-2.5 px-2 sm:px-3 font-medium text-gray-900 border-r-2 border-gray-200 bg-gray-100 whitespace-nowrap">
                          Portfolio (Total)
                        </td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-500">-</td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-500">-</td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-500">-</td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-500">-</td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-500">-</td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-500">-</td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700">
                          {formatPortfolioValue(resultsPortfolioSums.stock, 'integer')}
                        </td>
                        {!hideArticleLevelConstraints && stockConstraintsEnabled && (
                          <>
                            <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-500">-</td>
                            <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-500">-</td>
                          </>
                        )}
                        {!hideArticleLevelConstraints && discountConstraintsEnabled && (
                          <>
                            <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-500">-</td>
                            <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-500">-</td>
                          </>
                        )}
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700">
                          {formatPortfolioValue(getPortfolioValue('portfolio_mop'), 'currency')}
                        </td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700">
                          {formatPortfolioValue(getPortfolioValue('portfolio_nlc'), 'currency')}
                        </td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-500">-</td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-500">-</td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700">
                          {formatPortfolioValue(getPortfolioValue('portfolio_test_price'), 'currency')}
                        </td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700">
                          {formatPortfolioValue(backendOrFallback('total_units', resultsPortfolioSums.units), 'integer')}
                        </td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700">
                          {formatPortfolioValue(backendOrFallback('total_gmv', resultsPortfolioSums.sales), 'currency')}
                        </td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700">
                          {formatPortfolioValue(backendOrFallback('total_profit', resultsPortfolioSums.profit), 'currency')}
                        </td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700">
                          {formatPortfolioValue(
                            backendOrFallback(
                              'portfolio_margin_percent',
                              resultsPortfolioSums.sales > 0 ? (resultsPortfolioSums.profit / resultsPortfolioSums.sales) * 100 : 0
                            ),
                            'percent'
                          )}
                        </td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700">
                          {formatPortfolioValue(getPortfolioValue('portfolio_profit_per_unit'), 'currency')}
                        </td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700">
                          {formatPortfolioValue(getPortfolioValue('portfolio_discount_total'), 'currency')}
                        </td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700">
                          {formatPortfolioValue(getPortfolioValue('portfolio_discount_percent'), 'percent')}
                        </td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700">
                          {formatPortfolioValue(getPortfolioValue('portfolio_discount_per_unit'), 'currency')}
                        </td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-500">-</td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-500">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className={uploadedPreviewRows.length > 0 ? "bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-3" : "bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-8 sm:p-12 text-center"}>
              {uploadedPreviewRows.length > 0 ? (
                <div className="text-left">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">Uploaded Data</h3>
                      <p className="text-xs sm:text-sm text-gray-500">{uploadedFile?.name}</p>
                    </div>

                    <div className="flex items-start justify-start sm:justify-end">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex flex-wrap items-center gap-4 border border-gray-200 rounded-lg px-3 py-2 bg-white">
                          <span className="text-[10px] sm:text-xs font-bold text-gray-900 whitespace-nowrap">Article Level Constrains</span>

                          <label className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-700 font-medium whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={stockConstraintsEnabled}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setStockConstraintsEnabled(checked);
                                if (!checked) setHideArticleLevelConstraints(false);
                              }}
                              className="w-4 h-4"
                            />
                            Stocks
                          </label>

                          <label className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-700 font-medium whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={discountConstraintsEnabled}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setDiscountConstraintsEnabled(checked);
                                if (!checked) setHideArticleLevelConstraints(false);
                              }}
                              className="w-4 h-4"
                            />
                            Discounts
                          </label>
                        </div>

                        {(() => {
                          const canToggleHide = stockConstraintsEnabled || discountConstraintsEnabled;
                          return (
                            <div className="flex items-center gap-3">
                              <label
                                className={`flex items-center gap-2 text-[10px] sm:text-xs font-semibold whitespace-nowrap ${canToggleHide ? 'text-gray-900 cursor-pointer' : 'text-gray-400 cursor-not-allowed'
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={hideArticleLevelConstraints}
                                  onChange={(e) => setHideArticleLevelConstraints(e.target.checked)}
                                  disabled={!canToggleHide}
                                  className="w-4 h-4"
                                />
                                Hide
                              </label>

                              <button
                                type="button"
                                onClick={() => {
                                  setArticleLevelConstraints((prev) => {
                                    const next = { ...prev };
                                    Object.keys(next).forEach((k) => {
                                      next[k] = {
                                        ...(next[k] || {}),
                                        stockMin: '',
                                        stockMax: '',
                                        discountMin: '',
                                        discountMax: ''
                                      };
                                    });
                                    return next;
                                  });
                                }}
                                className="px-2.5 py-1 border border-gray-300 rounded-lg text-[10px] sm:text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                Reset
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-x-auto bg-white">
                    <table className="w-full text-[10px] sm:text-xs min-w-[1600px] table-auto">
                      <thead className="bg-gray-50 border-b-2 border-gray-300">
                        <tr>
                          <th className="sticky left-0 z-10 bg-gray-50 text-left py-1.5 sm:py-2 px-1 sm:px-1.5 font-semibold text-gray-900 border-r border-gray-300 whitespace-nowrap">Brand</th>
                          <th className="text-left py-1.5 sm:py-2 px-1 sm:px-1.5 font-semibold text-gray-900 whitespace-nowrap">Article No.</th>
                          <th className="text-left py-1.5 sm:py-2 px-1 sm:px-1.5 font-semibold text-gray-900 whitespace-nowrap">Category</th>
                          <th className="text-left py-1.5 sm:py-2 px-1 sm:px-1.5 font-semibold text-gray-900 whitespace-nowrap">Channel</th>
                          <th className="text-left py-1.5 sm:py-2 px-1 sm:px-1.5 font-semibold text-gray-900 whitespace-nowrap">Store No.</th>
                          <th className="text-left py-1.5 sm:py-2 px-1 sm:px-1.5 font-semibold text-gray-900 whitespace-nowrap">Zone</th>
                          <th className="text-center py-1.5 sm:py-2 px-1 sm:px-1.5 font-semibold text-gray-900">Status</th>
                          <th className="text-right py-1.5 sm:py-2 px-1 sm:px-1.5 font-semibold text-gray-900">Stock</th>

                          {!hideArticleLevelConstraints && stockConstraintsEnabled && (
                            <>
                              <th className="text-right py-1.5 sm:py-2 px-1 sm:px-1.5 font-semibold text-gray-900 whitespace-nowrap">Stock Min. %</th>
                              <th className="text-right py-1.5 sm:py-2 px-1 sm:px-1.5 font-semibold text-gray-900 whitespace-nowrap">Stock Max. %</th>
                            </>
                          )}

                          {!hideArticleLevelConstraints && discountConstraintsEnabled && (
                            <>
                              <th className="text-right py-1.5 sm:py-2 px-1 sm:px-1.5 font-semibold text-gray-900 whitespace-nowrap">Discount Min. %</th>
                              <th className="text-right py-1.5 sm:py-2 px-1 sm:px-1.5 font-semibold text-gray-900 whitespace-nowrap">Discount Max. %</th>
                            </>
                          )}

                          <th className="text-right py-1.5 sm:py-2 px-1 sm:px-1.5 font-semibold text-gray-900">MOP</th>
                          <th className="text-right py-1.5 sm:py-2 px-1 sm:px-1.5 font-semibold text-gray-900">NLC</th>
                          <th className="text-right py-1.5 sm:py-2 px-1 sm:px-1.5 font-semibold text-gray-900 whitespace-nowrap">Max. Price</th>
                          <th className="text-right py-1.5 sm:py-2 px-1 sm:px-1.5 font-semibold text-gray-900 whitespace-nowrap">Min. Price</th>
                        </tr>
                      </thead>

                      <tbody className="bg-white">
                        {uploadedPreviewRows.map((row, idx) => {
                          const article = row?.article ?? row?.Article ?? row?.ARTICLE;
                          const brand = row?.brand ?? row?.Brand ?? row?.BRAND;
                          const category = row?.category ?? row?.Category ?? row?.CATEGORY;
                          const channel = row?.channel ?? row?.Channel ?? row?.CHANNEL;
                          const storeNo = row?.storeNo ?? row?.StoreNo ?? row?.['Store No.'] ?? row?.['Store No'];
                          const zone = row?.zone ?? row?.Zone ?? row?.ZONE;
                          const status = row?.status ?? row?.Status ?? row?.STATUS;
                          const stock = row?.stock ?? row?.Stock ?? row?.STOCK;
                          const mop = row?.mop ?? row?.MOP;
                          const nlc = row?.nlc ?? row?.NLC;
                          const maxPrice = row?.maxPrice ?? row?.MaxPrice ?? row?.['Max Price'];
                          const minPrice = row?.minPrice ?? row?.MinPrice ?? row?.['Min Price'];

                          return (
                            <tr
                              key={idx}
                              className={`border-b border-gray-100 transition-colors group ${getArticleLevelConstraintColor(article) || 'hover:bg-gray-50'}`}
                            >
                              <td className={`sticky left-0 z-10 py-1.5 sm:py-2 px-1 sm:px-1.5 font-medium text-gray-900 border-r border-gray-200 ${getArticleLevelConstraintColor(article) || 'bg-white group-hover:bg-gray-50'}`}>{brand || '-'}</td>
                              <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-gray-700">{article}</td>
                              <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-gray-700">{category || '-'}</td>
                              <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-gray-700">{channel || '-'}</td>
                              <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-gray-700">{storeNo || '-'}</td>
                              <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-gray-700">{zone || '-'}</td>

                              <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-center">
                                {status ? (
                                  <span className="inline-flex px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-green-100 text-green-700">{status}</span>
                                ) : (
                                  '-'
                                )}
                              </td>

                              <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right text-gray-600">
                                {stock !== null && stock !== undefined && stock !== '' ? Math.round(Number(stock)).toLocaleString('en-IN') : '-'}
                              </td>

                              {!hideArticleLevelConstraints && stockConstraintsEnabled && (
                                <>
                                  <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right">
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      step={0.01}
                                      value={articleLevelConstraints?.[article]?.stockMin ?? ''}
                                      placeholder="MIN"
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => handleArticleLevelConstraintChange(article, 'stockMin', e.target.value)}
                                      className="no-spinner w-14 sm:w-16 px-1.5 py-1 border border-gray-300 rounded-md text-center placeholder:text-center text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                                      style={{ textAlign: 'center' }}
                                    />
                                  </td>
                                  <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right">
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      step={0.01}
                                      value={articleLevelConstraints?.[article]?.stockMax ?? ''}
                                      placeholder="MAX"
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => handleArticleLevelConstraintChange(article, 'stockMax', e.target.value)}
                                      className="no-spinner w-14 sm:w-16 px-1.5 py-1 border border-gray-300 rounded-md text-center placeholder:text-center text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                                      style={{ textAlign: 'center' }}
                                    />
                                  </td>
                                </>
                              )}

                              {!hideArticleLevelConstraints && discountConstraintsEnabled && (
                                <>
                                  <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right">
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      step={0.01}
                                      value={articleLevelConstraints?.[article]?.discountMin ?? ''}
                                      placeholder="MIN"
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => handleArticleLevelConstraintChange(article, 'discountMin', e.target.value)}
                                      className="no-spinner w-14 sm:w-16 px-1.5 py-1 border border-gray-300 rounded-md text-center placeholder:text-center text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                                      style={{ textAlign: 'center' }}
                                    />
                                  </td>
                                  <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right">
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      step={0.01}
                                      value={articleLevelConstraints?.[article]?.discountMax ?? ''}
                                      placeholder="MAX"
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => handleArticleLevelConstraintChange(article, 'discountMax', e.target.value)}
                                      className="no-spinner w-14 sm:w-16 px-1.5 py-1 border border-gray-300 rounded-md text-center placeholder:text-center text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                                      style={{ textAlign: 'center' }}
                                    />
                                  </td>
                                </>
                              )}

                              <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right text-gray-600">
                                {mop !== null && mop !== undefined && mop !== '' ? `₹${Math.round(Number(mop)).toLocaleString('en-IN')}` : '-'}
                              </td>
                              <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right text-gray-600">
                                {nlc !== null && nlc !== undefined && nlc !== '' ? `₹${Math.round(Number(nlc)).toLocaleString('en-IN')}` : '-'}
                              </td>
                              <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right text-gray-600">
                                {maxPrice !== null && maxPrice !== undefined && maxPrice !== '' ? `₹${Math.round(Number(maxPrice)).toLocaleString('en-IN')}` : '-'}
                              </td>
                              <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right text-gray-600">
                                {minPrice !== null && minPrice !== undefined && minPrice !== '' ? `₹${Math.round(Number(minPrice)).toLocaleString('en-IN')}` : '-'}
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="border-b border-gray-100 bg-gray-100 font-bold">
                          <td className="sticky left-0 z-10 py-1.5 sm:py-2 px-1 sm:px-1.5 font-medium text-gray-900 border-r border-gray-200 bg-gray-100 whitespace-nowrap">
                            Portfolio (Total)
                          </td>
                          <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right text-gray-500">-</td>
                          <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right text-gray-500">-</td>
                          <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right text-gray-500">-</td>
                          <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right text-gray-500">-</td>
                          <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right text-gray-500">-</td>
                          <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right text-gray-500">-</td>
                          <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right text-gray-700">
                            {formatPortfolioValue(uploadedPortfolioSums.stock, 'integer')}
                          </td>
                          {!hideArticleLevelConstraints && stockConstraintsEnabled && (
                            <>
                              <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right text-gray-500">-</td>
                              <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right text-gray-500">-</td>
                            </>
                          )}
                          {!hideArticleLevelConstraints && discountConstraintsEnabled && (
                            <>
                              <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right text-gray-500">-</td>
                              <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right text-gray-500">-</td>
                            </>
                          )}
                          <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right text-gray-500">-</td>
                          <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right text-gray-500">-</td>
                          <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right text-gray-500">-</td>
                          <td className="py-1.5 sm:py-2 px-1 sm:px-1.5 text-right text-gray-500">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Target className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Ready to Optimize</h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Configure parameters in the sidebar and click "Run Genie"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {renderPopup()}
    </div>
  );
};

export default PriceGenix;
