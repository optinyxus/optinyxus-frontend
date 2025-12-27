import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import PriceGenixSidebar from '../../components/sidebars/PriceGenixSidebar';
import { TrendingUp, DollarSign, Percent, Package, Award, Target, BarChart3, Download, X, TrendingDown, Maximize2, ChevronRight, ArrowUpRight, Clock, ChevronLeft, Eye, AlertCircle, Zap, TrendingDown as TrendingDownIcon, ArrowDown, History, Play, Sliders } from 'lucide-react';

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

const generateTop50MockData = (metric) => {
  const baseData = [
    { id: '#A1234', name: 'Premium Laptop Pro', sales: 4185125, profit: 1255538, units: 13325, discount: 18500, avgPrice: 313836, maxPrice: 368609, minPrice: 245000 },
    { id: '#A1235', name: 'Wireless Headphones Elite', sales: 3850000, profit: 1155000, units: 15400, discount: 15400, avgPrice: 250000, maxPrice: 298000, minPrice: 198000 },
    { id: '#A1236', name: 'Smart Watch Pro', sales: 3200000, profit: 960000, units: 16000, discount: 12800, avgPrice: 200000, maxPrice: 245000, minPrice: 165000 },
    { id: '#A1237', name: 'Gaming Console X', sales: 2950000, profit: 885000, units: 9833, discount: 11800, avgPrice: 300000, maxPrice: 358000, minPrice: 275000 },
    { id: '#A1238', name: 'Tablet Ultra', sales: 2750000, profit: 825000, units: 11000, discount: 11000, avgPrice: 250000, maxPrice: 289000, minPrice: 220000 },
    { id: '#A1239', name: '4K Monitor Premium', sales: 2580000, profit: 774000, units: 8600, discount: 10320, avgPrice: 300000, maxPrice: 345000, minPrice: 268000 },
    { id: '#A1240', name: 'Mechanical Keyboard RGB', sales: 2350000, profit: 705000, units: 23500, discount: 9400, avgPrice: 100000, maxPrice: 125000, minPrice: 85000 },
    { id: '#A1241', name: 'Wireless Mouse Pro', sales: 2180000, profit: 654000, units: 43600, discount: 8720, avgPrice: 50000, maxPrice: 62000, minPrice: 42000 },
    { id: '#A1242', name: 'USB-C Hub Elite', sales: 1950000, profit: 585000, units: 39000, discount: 7800, avgPrice: 50000, maxPrice: 58000, minPrice: 45000 },
    { id: '#A1243', name: 'External SSD 1TB', sales: 1820000, profit: 546000, units: 9100, discount: 7280, avgPrice: 200000, maxPrice: 235000, minPrice: 178000 },
  ];

  return baseData.sort((a, b) => b[metric] - a[metric]);
};

const generateTop80MockData = (metric) => {
  const baseData = [
    { id: '#B5001', name: 'Premium Laptop Pro Max', sales: 6478502, profit: 1943551, units: 20595, discount: 25914, avgPrice: 314500, maxPrice: 371289, minPrice: 268000 },
    { id: '#B5002', name: 'Professional Camera Kit', sales: 5890000, profit: 1767000, units: 19633, discount: 23560, avgPrice: 300000, maxPrice: 358000, minPrice: 265000 },
    { id: '#B5003', name: 'Studio Microphone Pro', sales: 5450000, profit: 1635000, units: 27250, discount: 21800, avgPrice: 200000, maxPrice: 245000, minPrice: 175000 },
    { id: '#B5004', name: 'Graphics Card RTX', sales: 5120000, profit: 1536000, units: 6400, discount: 20480, avgPrice: 800000, maxPrice: 958000, minPrice: 725000 },
    { id: '#B5005', name: 'Gaming Laptop Elite', sales: 4850000, profit: 1455000, units: 9700, discount: 19400, avgPrice: 500000, maxPrice: 598000, minPrice: 445000 },
    { id: '#B5006', name: 'Drone 4K Professional', sales: 4580000, profit: 1374000, units: 9160, discount: 18320, avgPrice: 500000, maxPrice: 578000, minPrice: 458000 },
    { id: '#B5007', name: 'Smartwatch Ultra Pro', sales: 4320000, profit: 1296000, units: 18000, discount: 17280, avgPrice: 240000, maxPrice: 289000, minPrice: 215000 },
    { id: '#B5008', name: 'Bluetooth Speaker Premium', sales: 4050000, profit: 1215000, units: 27000, discount: 16200, avgPrice: 150000, maxPrice: 178000, minPrice: 135000 },
    { id: '#B5009', name: 'Webcam 4K Pro', sales: 3890000, profit: 1167000, units: 32417, discount: 15560, avgPrice: 120000, maxPrice: 145000, minPrice: 105000 },
    { id: '#B5010', name: 'USB Microphone Studio', sales: 3650000, profit: 1095000, units: 36500, discount: 14600, avgPrice: 100000, maxPrice: 125000, minPrice: 88000 },
    { id: '#B5011', name: 'Ring Light Professional', sales: 3420000, profit: 1026000, units: 42750, discount: 13680, avgPrice: 80000, maxPrice: 98000, minPrice: 72000 },
    { id: '#B5012', name: 'HDMI Cable Premium 2m', sales: 3180000, profit: 954000, units: 106000, discount: 12720, avgPrice: 30000, maxPrice: 38000, minPrice: 26000 },
  ];

  return baseData.sort((a, b) => b[metric] - a[metric]);
};

const mockTopArticlesSummary = {
  top50: {
    sales: 41851258,
    avgPrice: 3138364,
    maxPrice: 3686090,
    minPrice: 245000,
    discount: 18500,
    count: 1552
  },
  top80: {
    sales: 64785025,
    avgPrice: 5559416,
    maxPrice: 5712895,
    minPrice: 268000,
    discount: 25914,
    count: 2480
  }
};

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

const PriceGenix = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState('pricing_data_sample.csv');
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

  const [currentPerformanceData, setCurrentPerformanceData] = useState(mockPerformanceData);
  const [currentPromotionData, setCurrentPromotionData] = useState(mockPromotionData);
  const [currentTopArticlesSummary, setCurrentTopArticlesSummary] = useState(mockTopArticlesSummary);

  const scoringOptions = ['Article', 'Brand', 'Category', 'Store', 'Geography'];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleRunOptimization = () => {
    setResultsData(mockOptimizationResults);
    setHasResults(true);
    setViewMode('current');
    setSelectedHistoryItem(null);
  };

  const handleReset = () => {
    setConstraints([]);
    setSelectedOptimization('sales');
    setScoringLevels(['Article']);
    setHasResults(false);
    setResultsData([]);
    setViewMode('current');
    setSelectedHistoryItem(null);
  };

  const handleViewHistory = (iteration) => {
    setSidebarOpen(false);
    setIsHistoryDropdownOpen(false);
    setSelectedHistoryItem(iteration);
    setResultsData(mockOptimizationResults);
    setHasResults(true);
    setViewMode('history');
  };

  const handleBackToCurrent = () => {
    setViewMode('current');
    setSelectedHistoryItem(null);
    setResultsData(mockOptimizationResults);
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

  const getFormattedValue = (value, metric) => {
    if (metric === 'sales' || metric === 'profit' || metric === 'discount') {
      return `₹${(value / 100000).toFixed(2)}L`;
    }
    return value.toLocaleString();
  };

  const getMetricLabel = (metric) => {
    const labels = {
      sales: 'Sales',
      profit: 'Profit',
      units: 'Units',
      discount: 'Discount'
    };
    return labels[metric] || 'Sales';
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
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹{currentPerformanceData.base.sales.toLocaleString()}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹{currentPerformanceData.base.profit.toLocaleString()}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹{currentPerformanceData.base.discount.toLocaleString()}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{currentPerformanceData.base.units.toLocaleString()}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{currentPerformanceData.base.profitability}%</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹{currentPerformanceData.base.avgSalePrice.toLocaleString()}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹{currentPerformanceData.base.discountUnit.toLocaleString()}</td>
                    </tr>
                    <tr className="border-b-2 border-gray-300 hover:bg-gray-50 transition-colors">
                      <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">Test</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹{currentPerformanceData.test.sales.toLocaleString()}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹{currentPerformanceData.test.profit.toLocaleString()}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹{currentPerformanceData.test.discount.toLocaleString()}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{currentPerformanceData.test.units.toLocaleString()}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{currentPerformanceData.test.profitability}%</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹{currentPerformanceData.test.avgSalePrice.toLocaleString()}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹{currentPerformanceData.test.discountUnit.toLocaleString()}</td>
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">Growth </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹{currentPerformanceData.growth.sales.toLocaleString()}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹{currentPerformanceData.growth.profit.toLocaleString()}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹{currentPerformanceData.growth.discount.toLocaleString()}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{currentPerformanceData.growth.units.toLocaleString()}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{currentPerformanceData.growth.profitability.toFixed(2)}%</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹{currentPerformanceData.growth.avgSalePrice.toLocaleString()}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹{currentPerformanceData.growth.discountUnit.toLocaleString()}</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">Growth %</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{currentPerformanceData.growthPercent.sales}%</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{currentPerformanceData.growthPercent.profit}%</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{currentPerformanceData.growthPercent.discount}%</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{currentPerformanceData.growthPercent.units}%</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-400"> </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-400"> </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-400"> </td>
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
      const currentTop50Data = generateTop50MockData(topArticlesMetric);
      const currentTop80Data = generateTop80MockData(topArticlesMetric);
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
                  <label className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full cursor-pointer transition-all text-[10px] sm:text-xs font-medium ${
                    topArticlesMetric === 'sales'
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

                  <label className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full cursor-pointer transition-all text-[10px] sm:text-xs font-medium ${
                    topArticlesMetric === 'profit'
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

                  <label className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full cursor-pointer transition-all text-[10px] sm:text-xs font-medium ${
                    topArticlesMetric === 'units'
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

                  <label className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full cursor-pointer transition-all text-[10px] sm:text-xs font-medium ${
                    topArticlesMetric === 'discount'
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
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                    topArticlesTab === 'overview'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setTopArticlesTab('top50')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                    topArticlesTab === 'top50'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Top 50%
                </button>
                <button
                  onClick={() => setTopArticlesTab('top80')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                    topArticlesTab === 'top80'
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
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹4,18,51,258</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹31,38,364</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹1,552</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹36,86,090</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">7.50%</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹26,966</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹2,375</td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">Top 80%</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹6,47,85,025</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹55,59,416</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹2,480</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹57,12,895</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">8.58%</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹26,123</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹2,304</td>
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
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">{article.id}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-gray-900">{article.name}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{getFormattedValue(article.sales, 'sales')}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{getFormattedValue(article.profit, 'profit')}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{article.units.toLocaleString()}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{getFormattedValue(article.discount, 'discount')}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{((article.profit / article.sales) * 100).toFixed(2)}%</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹{(article.avgPrice / 1000).toFixed(0)}K</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹{Math.round(article.discount / article.units).toLocaleString()}</td>
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
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">{article.id}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-gray-900">{article.name}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{getFormattedValue(article.sales, 'sales')}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{getFormattedValue(article.profit, 'profit')}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{article.units.toLocaleString()}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{getFormattedValue(article.discount, 'discount')}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">{((article.profit / article.sales) * 100).toFixed(2)}%</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹{(article.avgPrice / 1000).toFixed(0)}K</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹{Math.round(article.discount / article.units).toLocaleString()}</td>
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
      {viewMode !== 'history' && (
        <PriceGenixSidebar
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          uploadedFile={uploadedFile}
          onFileUpload={setUploadedFile}
          selectedOptimization={selectedOptimization}
          onOptimizationChange={setSelectedOptimization}
          constraints={constraints}
          onConstraintsChange={setConstraints}
          onRunOptimization={handleRunOptimization}
          onReset={handleReset}
        />
      )}

      <Navbar
        toggleSidebar={toggleSidebar}
        showMenuButton={viewMode !== 'history'}
        currentProduct="pricegenix"
        onLogoClick={() => navigate('/dashboard')}
      />

      <div className={`pt-16 transition-all duration-300 ${viewMode === 'history' ? 'ml-0' : 'lg:ml-[320px]'}`}>
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

                      return (
                        <div className="mt-2">
                          {/* Mobile: single table */}
                          <div className="sm:hidden border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full table-fixed text-[10px]">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="w-[120px] text-left py-1 px-2 font-semibold text-gray-900 border-b border-gray-200">Metric</th>
                                  <th className="text-right py-1 px-2 font-semibold text-gray-900 border-b border-gray-200">Value</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white">
                                <tr className="border-b border-gray-100">
                                  <td className="py-1 px-2 font-medium text-gray-700">Sales</td>
                                  <td className="py-1 px-2 text-right text-gray-900">{val(constraintMap.sales)}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                  <td className="py-1 px-2 font-medium text-gray-700">Profit</td>
                                  <td className="py-1 px-2 text-right font-semibold text-gray-900">{val(constraintMap.profit)}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                  <td className="py-1 px-2 font-medium text-gray-700">Profit %</td>
                                  <td className="py-1 px-2 text-right text-gray-900">{val(constraintMap.profitPercentage)}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                  <td className="py-1 px-2 font-medium text-gray-700">Units</td>
                                  <td className="py-1 px-2 text-right text-gray-900">{val(constraintMap.units)}</td>
                                </tr>
                                <tr>
                                  <td className="py-1 px-2 font-medium text-gray-700">Discount</td>
                                  <td className="py-1 px-2 text-right font-semibold text-gray-900">{val(constraintMap.discount)}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* Tablet/Desktop: two smaller tables */}
                          <div className="hidden sm:grid grid-cols-2 gap-2 max-w-[560px]">
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                              <table className="w-full table-fixed text-[10px] sm:text-xs">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="w-[120px] text-left py-1 px-2 font-semibold text-gray-900 border-b border-gray-200">Metric</th>
                                    <th className="text-right py-1 px-2 font-semibold text-gray-900 border-b border-gray-200">Value</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white">
                                  <tr className="border-b border-gray-100">
                                    <td className="py-1 px-2 font-medium text-gray-700">Sales</td>
                                    <td className="py-1 px-2 text-right text-gray-900">{val(constraintMap.sales)}</td>
                                  </tr>
                                  <tr className="border-b border-gray-100">
                                    <td className="py-1 px-2 font-medium text-gray-700">Profit</td>
                                    <td className="py-1 px-2 text-right font-semibold text-gray-900">{val(constraintMap.profit)}</td>
                                  </tr>
                                  <tr>
                                    <td className="py-1 px-2 font-medium text-gray-700">Profit %</td>
                                    <td className="py-1 px-2 text-right text-gray-900">{val(constraintMap.profitPercentage)}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                              <table className="w-full table-fixed text-[10px] sm:text-xs">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="w-[120px] text-left py-1 px-2 font-semibold text-gray-900 border-b border-gray-200">Metric</th>
                                    <th className="text-right py-1 px-2 font-semibold text-gray-900 border-b border-gray-200">Value</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white">
                                  <tr className="border-b border-gray-100">
                                    <td className="py-1 px-2 font-medium text-gray-700">Units</td>
                                    <td className="py-1 px-2 text-right text-gray-900">{val(constraintMap.units)}</td>
                                  </tr>
                                  <tr>
                                    <td className="py-1 px-2 font-medium text-gray-700">Discount</td>
                                    <td className="py-1 px-2 text-right font-semibold text-gray-900">{val(constraintMap.discount)}</td>
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
                        className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all ${
                          scoringLevels.includes(option)
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
                      <p className="text-gray-500">Base Sales</p>
                      <p className="font-semibold text-gray-900">₹{(mockPerformanceData.base.sales / 1000000).toFixed(1)}M</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Test Sales</p>
                      <p className="font-semibold text-gray-900">₹{(mockPerformanceData.test.sales / 1000000).toFixed(1)}M</p>
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
                      <span className="font-medium text-gray-900">{currentTopArticlesSummary.top50.count.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Top 80%</span>
                      <span className="font-medium text-gray-900">{currentTopArticlesSummary.top80.count.toLocaleString()}</span>
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
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gray-900 text-white rounded-lg text-[10px] sm:text-xs font-medium hover:bg-gray-800 transition-colors shadow-sm w-full sm:w-auto justify-center"
                  >
                    <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] sm:text-xs min-w-[1400px]">
                    <thead className="bg-gray-50 border-b-2 border-gray-300">
                      <tr>
                        <th className="sticky left-0 z-10 bg-gray-50 text-left py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 border-r-2 border-gray-300">Article</th>
                        <th className="text-center py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">Status</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">Stock</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">MOP</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">NLC</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">Max Price</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">Min Price</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 bg-emerald-50">Test Price</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">Units</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">Sales</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">Profit</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">Profitability</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">Profit/Unit</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">Discount</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">Discount %</th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900">Discount/Unit</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {resultsData.map((row, index) => (
                        <tr
                          key={index}
                          onClick={() => handleRowClick(row)}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group"
                        >
                          <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 py-2 sm:py-2.5 px-2 sm:px-3 font-medium text-gray-900 border-r-2 border-gray-200">{row.article}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-center">
                            {row.status && <span className={`inline-flex px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-green-100 text-green-700`}>
                              {row.status}
                            </span>}
                          </td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">{row.stock.toLocaleString()}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">₹{row.mop.toLocaleString()}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">₹{row.nlc.toLocaleString()}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">{row.maxPrice > 0 ? `₹${row.maxPrice.toLocaleString()}` : '-'}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">{row.minPrice > 0 ? `₹${row.minPrice.toLocaleString()}` : '-'}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right font-bold text-gray-900 bg-emerald-50">
                            ₹{row.testPrice.toLocaleString()}
                          </td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">{row.units.toLocaleString()}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">₹{row.sales.toLocaleString()}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">₹{row.profit.toLocaleString()}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">{row.profitability}%</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">₹{row.profitUnit.toLocaleString()}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">₹{row.discount.toLocaleString()}</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">{row.discountPercent}%</td>
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-600">₹{row.discountUnit.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-8 sm:p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Target className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Ready to Optimize</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Configure parameters in the sidebar and click "Run Engine" to start optimization
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {renderPopup()}
    </div>
  );
};

export default PriceGenix;
