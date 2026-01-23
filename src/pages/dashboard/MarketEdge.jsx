import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import MarketEdgeSidebar from '../../components/sidebars/MarketEdgeSidebar';
import loadMarketEdgeCsv from '../../utils/marketedgeCsvLoader';
import {
  Target,
  Download,
  X,
  Maximize2,
  ChevronRight,
  Clock,
  ChevronLeft,
  Eye,
  History,
  RotateCcw
} from 'lucide-react';


const mockPerformanceByObjective = {
  sales: {
    control: { sales: 70772209, spend: 8059555, roi: 9.01, roas: 8.78, mroi: 10.76 },
    test: { sales: 73277196, spend: 8059555, roi: 9.12, roas: 9.09, mroi: 10.76 }
  },
  roas: {
    control: { sales: 70200000, spend: 8200000, roi: 8.95, roas: 8.55, mroi: 10.5 },
    test: { sales: 72000000, spend: 8100000, roi: 9.05, roas: 9.25, mroi: 10.9 }
  },
  spend: {
    control: { sales: 71000000, spend: 8500000, roi: 9.0, roas: 8.6, mroi: 10.6 },
    test: { sales: 70500000, spend: 7800000, roi: 9.1, roas: 9.0, mroi: 10.8 }
  },
  roi: {
    control: { sales: 70000000, spend: 8100000, roi: 8.8, roas: 8.7, mroi: 10.2 },
    test: { sales: 72500000, spend: 8200000, roi: 9.4, roas: 9.0, mroi: 11.1 }
  }
};


const mockPastIterations = [
  {
    id: 1,
    weekNumber: 49,
    iterationNumber: 1,
    name: 'MarketEdge - Run 1',
    date: '2025-12-01 14:30',
    objective: 'Sales Maximization',
    constraints: 'Sales 70000000-80000000, Spend 7000000-9000000'
  },
  {
    id: 2,
    weekNumber: 48,
    iterationNumber: 2,
    name: 'MarketEdge - Run 2',
    date: '2025-11-28 10:15',
    objective: 'ROAS Maximization',
    constraints: 'ROI 8-12, mROI 9-13'
  }
];


const MarketEdge = () => {
  const navigate = useNavigate();


  const [sidebarOpen, setSidebarOpen] = useState(false);


  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedPreviewRows, setUploadedPreviewRows] = useState([]);


  const regionLevels = ['Store Catchment', 'State', 'Zone', 'National'];
  const channels = ['Portfolio', 'Online', 'Stores', 'Old Stores', 'New Stores'];


  const [selectedRegionLevels, setSelectedRegionLevels] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);


  const [selectedOptimization, setSelectedOptimization] = useState('sales');


  // Global constraints: Sales, ROI, Spend, mROI
  const [constraints, setConstraints] = useState([]);


  // Before/After run
  const [hasResults, setHasResults] = useState(false);
  const [resultsData, setResultsData] = useState([]);


  // History
  const [viewMode, setViewMode] = useState('current'); // current | history
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [isHistoryDropdownOpen, setIsHistoryDropdownOpen] = useState(false);


  // Popups
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(null);


  // Editable per-channel constraints (PriceGenix-like)
  const [channelLevelConstraints, setChannelLevelConstraints] = useState({});


  // Channel constraints control bar (like PriceGenix "Article Level Constraints")
  const [roasConstraintsEnabled, setRoasConstraintsEnabled] = useState(true);
  const [roiConstraintsEnabled, setRoiConstraintsEnabled] = useState(true);
  const [hideChannelLevelConstraints, setHideChannelLevelConstraints] = useState(false);


  const [testSpreadMin, setTestSpreadMin] = useState('');
  const [testSpreadMax, setTestSpreadMax] = useState('');


  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);


  const STORAGE_KEY = 'marketedge_uploaded_data';


  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved) return;


      if (saved.uploadedFileName) {
        setUploadedFile({ name: saved.uploadedFileName });
      }


      setUploadedPreviewRows(saved.uploadedPreviewRows || []);
      setChannelLevelConstraints(saved.channelLevelConstraints || {});


      // Safety: never restore results if there is no uploaded file name
      setHasResults(!!saved.hasResults && !!saved.uploadedFileName);
      setResultsData(saved.resultsData || []);
    } catch (e) {}
  }, []);


  useEffect(() => {
    try {
      const uploadedFileName = uploadedFile?.name || '';
      if (!uploadedFileName) return;


      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          uploadedFileName,
          uploadedPreviewRows: uploadedPreviewRows || [],
          channelLevelConstraints: channelLevelConstraints || {},
          hasResults: !!hasResults,
          resultsData: resultsData || []
        })
      );
    } catch (e) {}
  }, [uploadedFile, uploadedPreviewRows, channelLevelConstraints, hasResults, resultsData]);


  const formatMoney = (n) => {
    if (n === '' || n === null || n === undefined) return '-';
    const num = Number(n);
    if (!Number.isFinite(num)) return String(n);
    return num.toLocaleString();
  };


  const formatValue = (n) => {
    if (n === '' || n === null || n === undefined) return '-';
    const num = Number(n);
    if (!Number.isFinite(num)) return String(n);
    return num.toLocaleString();
  };

  const parseConstraintsToMap = (constraintsString) => {
    const map = { sales: '', spend: '', roas: '', mroas: '', roi: '', mroi: '' };
    if (!constraintsString) return map;

    const parts = String(constraintsString)
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    parts.forEach((part) => {
      const [rawKey, ...rest] = part.split(' ');
      if (!rawKey || rest.length === 0) return;

      const key = rawKey.trim().toLowerCase();
      const value = rest.join(' ').trim();

      if (key === 'sales') map.sales = value;
      if (key === 'spend') map.spend = value;
      if (key === 'roas') map.roas = value;
      if (key === 'mroas') map.mroas = value;
      if (key === 'roi') map.roi = value;
      if (key === 'mroi') map.mroi = value;
    });

    return map;
  };

  const historyConstraintMap = useMemo(() => {
    return parseConstraintsToMap(selectedHistoryItem?.constraints);
  }, [selectedHistoryItem]);


  const currentPerf = useMemo(() => {
    const base = mockPerformanceByObjective[selectedOptimization] || mockPerformanceByObjective.sales;


    const control = base.control;
    const test = base.test;


    const growth = {
      sales: test.sales - control.sales,
      spend: test.spend - control.spend,
      roi: test.roi - control.roi,
      roas: test.roas - control.roas,
      mroi: test.mroi - control.mroi
    };


    const pct = (a, b) => {
      if (!b) return 0;
      return (a / b) * 100;
    };


    const growthPercent = {
      sales: pct(growth.sales, control.sales),
      spend: pct(growth.spend, control.spend),
      roi: pct(growth.roi, control.roi),
      roas: pct(growth.roas, control.roas),
      mroi: pct(growth.mroi, control.mroi)
    };


    return { control, test, growth, growthPercent };
  }, [selectedOptimization]);


  const handleFileUpload = async (file) => {
    if (!file) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}


      setUploadedFile(null);
      setUploadedPreviewRows([]);
      setHasResults(false);
      setResultsData([]);
      setViewMode('current');
      setSelectedHistoryItem(null);
      setChannelLevelConstraints({});
      return;
    }


    setUploadedFile(file);


    try {
      const previewRows = await loadMarketEdgeCsv(file);
      setUploadedPreviewRows(previewRows || []);


      // Reset view state
      setHasResults(false);
      setResultsData([]);
      setViewMode('current');
      setSelectedHistoryItem(null);


      // Prefill editable constraints from CSV
      const next = {};
      (previewRows || []).forEach((row) => {
        const key = row.channel;
        if (!key) return;
        next[key] = {
          channelRoas: row.channelRoas ?? '',
          channelMroas: row.channelMroas ?? '',
          channelRoi: row.channelRoi ?? '',
          channelMroi: row.channelMroi ?? ''
        };
      });
      setChannelLevelConstraints(next);
    } catch (err) {
      setUploadedPreviewRows([]);
      setHasResults(false);
      setResultsData([]);
      setViewMode('current');
      setSelectedHistoryItem(null);
      setChannelLevelConstraints({});
    }
  };


  const handleRunOptimization = () => {
    // Prevent running without uploaded data
    if (!uploadedFile) return;
    if (!uploadedPreviewRows || uploadedPreviewRows.length === 0) return;


    const baseRows = uploadedPreviewRows;


    const merged = (baseRows || []).map((r, idx) => {
      const key = r.channel;
      const c = channelLevelConstraints[key] || {};
      return {
        channel: r.channel ?? `Channel ${idx + 1}`,
        fundsAvailable: r.fundsAvailable ?? '',
        channelRoas: c.channelRoas ?? r.channelRoas ?? '',
        channelMroas: c.channelMroas ?? r.channelMroas ?? '',
        channelRoi: c.channelRoi ?? r.channelRoi ?? '',
        channelMroi: c.channelMroi ?? r.channelMroi ?? '',
        testRangeMin: r.testRangeMin ?? '',
        testRangeMax: r.testRangeMax ?? '',


        // AFTER RUN (dummy for now)
        testSpend: '',
        gmv: '',
        roas: '',
        mroas: '',
        outChannelRoi: '',
        outChannelMroi: '',
        spendRank: '',
        spendScale: ''
      };
    });


    // Add Portfolio row (dummy)
    const withPortfolio = [
      ...merged,
      {
        channel: 'Portfolio (Total)',
        fundsAvailable: '',
        channelRoas: '',
        channelMroas: '',
        channelRoi: '',
        channelMroi: '',
        testRangeMin: '',
        testRangeMax: '',
        testSpend: '',
        gmv: '',
        roas: '',
        mroas: '',
        outChannelRoi: '',
        outChannelMroi: '',
        spendRank: '',
        spendScale: ''
      }
    ];


    setResultsData(withPortfolio);
    setHasResults(true);
    setViewMode('current');
    setSelectedHistoryItem(null);
  };


  const handleReset = () => {
    // Reset only UI selections / constraints / results.
    // Keep uploadedFile + uploadedPreviewRows + localStorage uploaded data.

    setConstraints([]);
    setSelectedOptimization('sales');
    setSelectedRegionLevels([]);
    setSelectedChannels([]);

    setHasResults(false);
    setResultsData([]);

    setViewMode('current');
    setSelectedHistoryItem(null);
    setIsHistoryDropdownOpen(false);

    // Reset editable channel constraints back to defaults from uploaded CSV
    const next = {};
    (uploadedPreviewRows || []).forEach((row) => {
      const key = row?.channel;
      if (!key) return;

      next[key] = {
        channelRoas: row.channelRoas ?? '',
        channelMroas: row.channelMroas ?? '',
        channelRoi: row.channelRoi ?? '',
        channelMroi: row.channelMroi ?? ''
      };
    });
    setChannelLevelConstraints(next);

    setRoasConstraintsEnabled(true);
    setRoiConstraintsEnabled(true);
    setHideChannelLevelConstraints(false);
  };


  const handleViewHistory = (iteration) => {
    setSidebarOpen(false);
    setIsHistoryDropdownOpen(false);
    setSelectedHistoryItem(iteration);


    setViewMode('history');


    // Keep structure-first; history view uses whatever current rows exist (or empty)
    setResultsData((prev) => (prev && prev.length > 0 ? prev : []));
  };


  const handleBackToCurrent = () => {
    setViewMode('current');
    setSelectedHistoryItem(null);
  };


  const handleDownload = () => {
    const headers = [
      'Channel',
      'Funds Available',
      'Channel ROAS',
      'Channel mROAS',
      'Channel ROI',
      'Channel mROI',
      'Test Range Min.',
      'Test Range Max.',
      'Test Spend',
      'GMV',
      'ROAS',
      'mROAS',
      'Channel ROI (Output)',
      'Channel mROI (Output)',
      'Spend Rank',
      'Spend Scale'
    ];


    const csvContent = [
      headers.join(','),
      ...(resultsData || []).map((r) =>
        [
          r.channel ?? '',
          r.fundsAvailable ?? '',
          r.channelRoas ?? '',
          r.channelMroas ?? '',
          r.channelRoi ?? '',
          r.channelMroi ?? '',
          r.testRangeMin ?? '',
          r.testRangeMax ?? '',
          r.testSpend ?? '',
          r.gmv ?? '',
          r.roas ?? '',
          r.mroas ?? '',
          r.outChannelRoi ?? '',
          r.outChannelMroi ?? '',
          r.spendRank ?? '',
          r.spendScale ?? ''
        ]
          .map((v) => String(v).replace(/,/g, ''))
          .join(',')
      )
    ].join('\n');


    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketedge-${viewMode === 'history' ? 'history' : 'current'}-results.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };


  const handleCardClick = (type) => {
    setPopupType(type);
    setShowPopup(true);
  };


  const updateChannelConstraint = (channel, field, value) => {
    setChannelLevelConstraints((prev) => ({
      ...prev,
      [channel]: { ...(prev[channel] || {}), [field]: value }
    }));
  };


  const resetChannelConstraints = () => {
    setChannelLevelConstraints((prev) => {
      const next = { ...(prev || {}) };


      const keys = new Set([
        ...Object.keys(prev || {}),
        ...(uploadedPreviewRows || []).map((r) => r?.channel).filter(Boolean),
        ...(resultsData || []).map((r) => r?.channel).filter(Boolean)
      ]);


      keys.forEach((k) => {
        next[k] = {
          ...(next[k] || {}),
          channelRoas: '',
          channelMroas: '',
          channelRoi: '',
          channelMroi: ''
        };
      });


      return next;
    });
  };


  const canToggleHide = roasConstraintsEnabled || roiConstraintsEnabled;


  // ✅ FIX: row highlight must depend ONLY on whether values are filled (not on checkbox toggles) [file:14]
  const getRowHighlight = (channel) => {
    const c = channelLevelConstraints[channel] || {};
    const roasFilled = !!(c.channelRoas || c.channelMroas);
    const roiFilled = !!(c.channelRoi || c.channelMroi);


    if (roasFilled && roiFilled) return 'bg-yellow-50';
    if (roasFilled) return 'bg-blue-50';
    if (roiFilled) return 'bg-rose-50';
    return '';
  };


  const beforeRunRows = useMemo(() => {
    return uploadedPreviewRows || [];
  }, [uploadedPreviewRows]);


  const filteredResults = useMemo(() => {
    return resultsData || [];
  }, [resultsData]);


  const showRoasCols = roasConstraintsEnabled && !hideChannelLevelConstraints;
  const showRoiCols = roiConstraintsEnabled && !hideChannelLevelConstraints;


  const beforeRunColSpan = 2 + (showRoasCols ? 2 : 0) + (showRoiCols ? 2 : 0) + 2; // + TestRangeMin/Max
  const afterRunColSpan = 2 + (showRoasCols ? 2 : 0) + (showRoiCols ? 2 : 0) + 10; // + outputs
  const sanitizeTestSpreadInput = (value) => {
    const s = String(value ?? '');
    if (s === '') return '';

    // Allow only digits + optional single decimal point with up to 2 decimal places
    if (!/^\d*\.?\d*$/.test(s)) return null;
    const parts = s.split('.');
    if (parts.length > 2) return null;
    if (parts[1] && parts[1].length > 2) return null;

    // Enforce max value (<= 25)
    const n = Number(s);
    if (Number.isFinite(n) && n > 25) return null;

    return s;
  };
  const formatTestSpreadValue = (value) => {
    if (value === '' || value === null || value === undefined) return '';
    const num = Number(value);
    if (!Number.isFinite(num)) return '';

    const clamped = Math.min(num, 25);
    const rounded = Math.round(clamped * 100) / 100;
    return rounded.toFixed(2);
  };


    const renderChannelConstraintControlBar = () => {
    return (
      <div className="w-full overflow-x-auto">
        <div className="flex flex-nowrap items-center justify-between gap-3 min-w-max">
          <div className="flex flex-nowrap items-center gap-3">
            <div className="flex flex-col gap-1 border border-gray-200 rounded-lg px-3 py-2 bg-white">
                        <span className="text-[10px] sm:text-xs font-bold text-gray-900 whitespace-nowrap">
                          Test Spread
                        </span>

                        <div className="flex items-center gap-2 flex-nowrap">
                          <label className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-700 font-medium whitespace-nowrap">
                            Min
                            <input
                              type="text"
                              inputMode="decimal"
                              value={testSpreadMin}
                              onChange={(e) => {
                                const next = sanitizeTestSpreadInput(e.target.value);
                                if (next === null) return;
                                setTestSpreadMin(next);
                              }}
                              onBlur={() => setTestSpreadMin(formatTestSpreadValue(testSpreadMin))}
                              placeholder="0.00"
                              className="no-spinner w-20 sm:w-24 text-right px-2 py-1 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 whitespace-nowrap"
                            />
                          </label>

                          <label className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-700 font-medium whitespace-nowrap">
                            Max
                            <input
                              type="text"
                              inputMode="decimal"
                              value={testSpreadMax}
                              onChange={(e) => {
                                const next = sanitizeTestSpreadInput(e.target.value);
                                if (next === null) return;
                                setTestSpreadMax(next);
                              }}
                              onBlur={() => setTestSpreadMax(formatTestSpreadValue(testSpreadMax))}
                              placeholder="0.00"
                              className="no-spinner w-20 sm:w-24 text-right px-2 py-1 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 whitespace-nowrap"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              setTestSpreadMin(formatTestSpreadValue(testSpreadMin));
                              setTestSpreadMax(formatTestSpreadValue(testSpreadMax));
                            }}
                            className="flex items-center gap-2 px-2 py-2 border border-gray-200 rounded-lg text-[10px] sm:text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            Set
                          </button>
                        </div>
                      </div>
          </div>

          <div className="flex flex-nowrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-4 border border-gray-200 rounded-lg px-3 py-2 bg-white">
                        <span className="text-[10px] sm:text-xs font-bold text-gray-900 whitespace-nowrap">
                          Channel Level Constraints
                        </span>


                        <label className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-700 font-medium whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={roasConstraintsEnabled}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setRoasConstraintsEnabled(checked);
                              if (!checked) setHideChannelLevelConstraints(false);
                            }}
                            className="w-4 h-4"
                          />
                          ROAS
                        </label>


                        <label className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-700 font-medium whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={roiConstraintsEnabled}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setRoiConstraintsEnabled(checked);
                              if (!checked) setHideChannelLevelConstraints(false);
                            }}
                            className="w-4 h-4"
                          />
                          ROI
                        </label>
                      </div>
            <div className="flex items-center gap-3">
                        <label
                          className={`flex items-center gap-2 text-[10px] sm:text-xs font-semibold whitespace-nowrap ${
                            canToggleHide ? 'text-gray-900 cursor-pointer' : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={!canToggleHide}
                            checked={hideChannelLevelConstraints}
                            onChange={(e) => setHideChannelLevelConstraints(e.target.checked)}
                            className="w-4 h-4"
                          />
                          Hide
                        </label>


                        <button
                          type="button"
                          onClick={resetChannelConstraints}
                          className="flex items-center gap-2 px-2 py-2 border border-gray-200 rounded-lg text-[10px] sm:text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                          title="Reset channel constraints"
                        >
                          <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                          Reset
                        </button>
                      </div>
          </div>
        </div>
      </div>
    );
  };


  const renderPopup = () => {
    if (!showPopup) return null;


    if (popupType === 'performance') {
      return (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Performance</h3>
                </div>


                <button
                  onClick={() => setShowPopup(false)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
                  type="button"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
            </div>


            <div className="p-4 sm:p-6 bg-white flex-1 overflow-auto">
              <div className="border border-gray-200 rounded-lg overflow-x-auto">
                <table className="w-full text-xs sm:text-sm min-w-[900px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        {' '}
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        Sales
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        Spend
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        ROAS
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        mROAS
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        ROI
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        mROI
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        Avg. Sale Price
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        Discount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr className="border-b border-gray-200">
                      <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">
                        Control
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹ 7,07,72,209
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹ 80,59,555
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        8.78
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        9.085
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        9.01
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        10.76
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹ 26,132
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹ 2,138
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">
                        Test
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹ 7,32,77,196
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹ 80,59,555
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        9.09
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        9.085
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        9.12
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        10.76
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹ 27,017
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹ 2,370
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">
                        Growth
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹ 25,04,987
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        -
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        0.31
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        -
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        0.11
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        -
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        885
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        232.00
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">
                        Growth %
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        3.54%
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        0.00%
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        3.54%
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        0.00%
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        1.22%
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        0.00%
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        3.39%
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        10.85%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>


            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex justify-end flex-shrink-0">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 sm:px-5 py-1.5 sm:py-2 bg-gray-900 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }


    if (popupType === 'topChannels') {
      return (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Top Channels Analysis
                  </h3>
                </div>


                <button
                  onClick={() => setShowPopup(false)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
                  type="button"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
            </div>


            <div className="p-4 sm:p-6 bg-white flex-1 overflow-auto">
              <div className="border border-gray-200 rounded-lg overflow-x-auto">
                <table className="w-full text-xs sm:text-sm min-w-[900px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        Top Channel
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        Sales
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        Spend
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        ROAS
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        mROAS
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        ROI
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        mROI
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        Avg. Sale Price
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        Discount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr className="border-b border-gray-200">
                      <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">
                        Top Channel
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹ 2,47,70,273
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹ 25,79,058
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        9.60
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        9.085
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        9.20
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        10.76
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹ 27,130
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹ 2,408
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">
                        Top 3 Channels
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹ 5,86,21,757
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹ 59,64,071
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        9.83
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        9.085
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        9.12
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        10.68
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹ 27,068
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹ 2,463
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>


            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex justify-end flex-shrink-0">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 sm:px-5 py-1.5 sm:py-2 bg-gray-900 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }


    if (popupType === 'marketingRoi') {
      return (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Marketing ROI
                  </h3>
                </div>


                <button
                  onClick={() => setShowPopup(false)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
                  type="button"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
            </div>


            <div className="p-4 sm:p-6 bg-white flex-1 overflow-auto">
              <div className="border border-gray-200 rounded-lg overflow-x-auto">
                <table className="w-full text-xs sm:text-sm min-w-[720px] table-fixed">
                  <colgroup>
                    <col className="w-1/6" />
                    <col className="w-1/6" />
                    <col className="w-1/6" />
                    <col className="w-1/2" />
                  </colgroup>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        {' '}
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        Sales / Spend
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        Profits / Spend
                      </th>
                      <th className="text-center py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        Observations
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr className="border-b border-gray-200">
                      <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">
                        Control
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹11.92
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹0.93
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-left text-gray-700">
                        {' '}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">
                        Test
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹8.77
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹0.52
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-left text-gray-700">
                        {' '}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">
                        Increamental
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        ₹3.47
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                        -₹0.17
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-left text-gray-700">
                        {' '}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>


              <div className="mt-6 text-sm font-semibold text-gray-900">Promotion Effectiveness</div>
              <div className="mt-3 border border-gray-200 rounded-lg overflow-x-auto">
                <table className="w-full text-xs sm:text-sm min-w-[720px] table-fixed">
                  <colgroup>
                    <col className="w-[220px]" />
                    <col className="w-[180px]" />
                    <col className="w-auto" />
                  </colgroup>

                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        colSpan={2}
                        className="text-center py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300 border-r border-gray-300"
                      >
                        Enhancement
                      </th>
                      <th className="text-center py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900 border-b-2 border-gray-300">
                        Observations
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white">
                    <tr className="border-b border-gray-200">
                      <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">Sales / Unit</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹10,218.33</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-left text-gray-700">{' '}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">Profit / Unit</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">-₹511.28</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-left text-gray-700">{' '}</td>
                    </tr>
                    <tr>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">Discount / Unit</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">₹2,940.82</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-left text-gray-700">{' '}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>


            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex justify-end flex-shrink-0">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 sm:px-5 py-1.5 sm:py-2 bg-gray-900 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }


    if (popupType === 'analysis') {
      return (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Analysis</h3>
                </div>


                <button
                  onClick={() => setShowPopup(false)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
                  type="button"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
            </div>


            <div className="p-4 sm:p-6 bg-white flex-1 overflow-auto">
              <div className="text-sm font-semibold text-gray-900">Charts</div>
              <div className="mt-2 text-xs text-gray-600">
                Bars, Pies, Scatters (To be implemented).
              </div>
            </div>


            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex justify-end flex-shrink-0">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 sm:px-5 py-1.5 sm:py-2 bg-gray-900 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors"
                type="button"
              >
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
        input.no-spinner::-webkit-outer-spin-button,
        input.no-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input.no-spinner[type=number] {
          -moz-appearance: textfield;
          appearance: textfield;
        }
      `}</style>


      {viewMode !== 'history' && (


            <MarketEdgeSidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        uploadedFile={uploadedFile}
        onFileUpload={handleFileUpload}
        regionLevels={regionLevels}
        selectedRegionLevels={selectedRegionLevels}
        onSelectedRegionLevelsChange={setSelectedRegionLevels}
        channels={channels}
        selectedChannels={selectedChannels}
        onSelectedChannelsChange={setSelectedChannels}
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
        currentProduct="marketedge"
        onLogoClick={() => navigate('/dashboard')}
      />


      <div
        className={`pt-16 transition-all duration-300 ${viewMode === 'history' ? 'ml-0' : 'ml-0 lg:ml-[320px]'}`}
      >
        <div className="p-4 sm:p-6 space-y-4">
          {viewMode === 'history' && selectedHistoryItem && (
            <div className="relative bg-white rounded-lg p-3 sm:p-4 shadow-sm border-2 border-gray-300">
              <button
                onClick={handleBackToCurrent}
                className="absolute top-3 right-3 flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-900 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm"
                type="button"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
                Back
              </button>


              <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 pr-16">
                <div className="flex items-start gap-3 lg:w-[320px] min-w-0">
                  <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>


                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                      {selectedHistoryItem.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedHistoryItem.date}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                      <span className="font-semibold text-gray-700">Iteration</span>
                      <span className="ml-1 font-semibold text-gray-900">
                        {selectedHistoryItem.iterationNumber}
                      </span>
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                      <span className="font-semibold text-gray-700">Objective</span>
                      <span className="ml-1 font-bold text-gray-900">
                        {selectedHistoryItem.objective}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-[10px] sm:text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">Constraints</span>
                  </div>

                  <div className="mt-2 max-w-[860px]">
                    <div className="sm:hidden border border-gray-200 rounded-lg overflow-x-auto bg-white">
                      <table className="w-full table-fixed text-[10px] sm:text-xs min-w-[560px]">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="w-[140px] text-left py-2 px-3 font-semibold text-gray-900 border-b border-gray-200">
                              Metric
                            </th>
                            <th className="text-right py-2 px-3 font-semibold text-gray-900 border-b border-gray-200">
                              Min
                            </th>
                            <th className="text-right py-2 px-3 font-semibold text-gray-900 border-b border-gray-200">
                              Max
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          <tr className="border-b border-gray-100">
                            <td className="py-2 px-3 font-medium text-gray-700">Sales</td>
                            <td className="py-2 px-3 text-right text-gray-900 whitespace-nowrap">
                              {historyConstraintMap.sales && historyConstraintMap.sales.split('-').length === 2
                                ? `₹ ${formatValue(historyConstraintMap.sales.split('-')[0])}`
                                : '-'}
                            </td>
                            <td className="py-2 px-3 text-right text-gray-900 whitespace-nowrap">
                              {historyConstraintMap.sales && historyConstraintMap.sales.split('-').length === 2
                                ? `₹ ${formatValue(historyConstraintMap.sales.split('-')[1])}`
                                : '-'}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-2 px-3 font-medium text-gray-700">Spend</td>
                            <td className="py-2 px-3 text-right text-gray-900 whitespace-nowrap">
                              {historyConstraintMap.spend && historyConstraintMap.spend.split('-').length === 2
                                ? formatValue(historyConstraintMap.spend.split('-')[0])
                                : '-'}
                            </td>
                            <td className="py-2 px-3 text-right text-gray-900 whitespace-nowrap">
                              {historyConstraintMap.spend && historyConstraintMap.spend.split('-').length === 2
                                ? formatValue(historyConstraintMap.spend.split('-')[1])
                                : '-'}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-2 px-3 font-medium text-gray-700">ROAS</td>
                            <td className="py-2 px-3 text-right text-gray-900 whitespace-nowrap">
                              {historyConstraintMap.roas && historyConstraintMap.roas.split('-').length === 2
                                ? formatValue(historyConstraintMap.roas.split('-')[0])
                                : '-'}
                            </td>
                            <td className="py-2 px-3 text-right text-gray-900 whitespace-nowrap">
                              {historyConstraintMap.roas && historyConstraintMap.roas.split('-').length === 2
                                ? formatValue(historyConstraintMap.roas.split('-')[1])
                                : '-'}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-2 px-3 font-medium text-gray-700">mROAS</td>
                            <td className="py-2 px-3 text-right text-gray-900 whitespace-nowrap">
                              {historyConstraintMap.mroas && historyConstraintMap.mroas.split('-').length === 2
                                ? formatValue(historyConstraintMap.mroas.split('-')[0])
                                : '-'}
                            </td>
                            <td className="py-2 px-3 text-right text-gray-900 whitespace-nowrap">
                              {historyConstraintMap.mroas && historyConstraintMap.mroas.split('-').length === 2
                                ? formatValue(historyConstraintMap.mroas.split('-')[1])
                                : '-'}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-2 px-3 font-medium text-gray-700">ROI</td>
                            <td className="py-2 px-3 text-right text-gray-900 whitespace-nowrap">
                              {historyConstraintMap.roi && historyConstraintMap.roi.split('-').length === 2
                                ? formatValue(historyConstraintMap.roi.split('-')[0])
                                : '-'}
                            </td>
                            <td className="py-2 px-3 text-right text-gray-900 whitespace-nowrap">
                              {historyConstraintMap.roi && historyConstraintMap.roi.split('-').length === 2
                                ? formatValue(historyConstraintMap.roi.split('-')[1])
                                : '-'}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-medium text-gray-700">mROI</td>
                            <td className="py-2 px-3 text-right text-gray-900 whitespace-nowrap">
                              {historyConstraintMap.mroi && historyConstraintMap.mroi.split('-').length === 2
                                ? formatValue(historyConstraintMap.mroi.split('-')[0])
                                : '-'}
                            </td>
                            <td className="py-2 px-3 text-right text-gray-900 whitespace-nowrap">
                              {historyConstraintMap.mroi && historyConstraintMap.mroi.split('-').length === 2
                                ? formatValue(historyConstraintMap.mroi.split('-')[1])
                                : '-'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                        <table className="w-full table-fixed text-[10px] sm:text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="w-[140px] text-left py-2 px-3 font-semibold text-gray-900 border-b border-gray-200">
                                Metric
                              </th>
                              <th className="text-right py-2 px-3 font-semibold text-gray-900 border-b border-gray-200">
                                Min
                              </th>
                              <th className="text-right py-2 px-3 font-semibold text-gray-900 border-b border-gray-200">
                                Max
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 font-medium text-gray-700">Sales</td>
                              <td className="py-2 px-3 text-right text-gray-900 whitespace-nowrap">
                                {historyConstraintMap.sales && historyConstraintMap.sales.split('-').length === 2
                                  ? `₹ ${formatValue(historyConstraintMap.sales.split('-')[0])}`
                                  : '-'}
                              </td>
                              <td className="py-2 px-3 text-right text-gray-900 whitespace-nowrap">
                                {historyConstraintMap.sales && historyConstraintMap.sales.split('-').length === 2
                                  ? `₹ ${formatValue(historyConstraintMap.sales.split('-')[1])}`
                                  : '-'}
                              </td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 font-medium text-gray-700">Spend</td>
                              <td className="py-2 px-3 text-right text-gray-900">
                                {historyConstraintMap.spend && historyConstraintMap.spend.split('-').length === 2
                                  ? formatValue(historyConstraintMap.spend.split('-')[0])
                                  : '-'}
                              </td>
                              <td className="py-2 px-3 text-right text-gray-900">
                                {historyConstraintMap.spend && historyConstraintMap.spend.split('-').length === 2
                                  ? formatValue(historyConstraintMap.spend.split('-')[1])
                                  : '-'}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-medium text-gray-700">ROAS</td>
                              <td className="py-2 px-3 text-right text-gray-900">
                                {historyConstraintMap.roas && historyConstraintMap.roas.split('-').length === 2
                                  ? formatValue(historyConstraintMap.roas.split('-')[0])
                                  : '-'}
                              </td>
                              <td className="py-2 px-3 text-right text-gray-900">
                                {historyConstraintMap.roas && historyConstraintMap.roas.split('-').length === 2
                                  ? formatValue(historyConstraintMap.roas.split('-')[1])
                                  : '-'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                        <table className="w-full table-fixed text-[10px] sm:text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="w-[140px] text-left py-2 px-3 font-semibold text-gray-900 border-b border-gray-200">
                                Metric
                              </th>
                              <th className="text-right py-2 px-3 font-semibold text-gray-900 border-b border-gray-200">
                                Min
                              </th>
                              <th className="text-right py-2 px-3 font-semibold text-gray-900 border-b border-gray-200">
                                Max
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 font-medium text-gray-700">mROAS</td>
                              <td className="py-2 px-3 text-right text-gray-900">
                                {historyConstraintMap.mroas && historyConstraintMap.mroas.split('-').length === 2
                                  ? formatValue(historyConstraintMap.mroas.split('-')[0])
                                  : '-'}
                              </td>
                              <td className="py-2 px-3 text-right text-gray-900">
                                {historyConstraintMap.mroas && historyConstraintMap.mroas.split('-').length === 2
                                  ? formatValue(historyConstraintMap.mroas.split('-')[1])
                                  : '-'}
                              </td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 font-medium text-gray-700">ROI</td>
                              <td className="py-2 px-3 text-right text-gray-900">
                                {historyConstraintMap.roi && historyConstraintMap.roi.split('-').length === 2
                                  ? formatValue(historyConstraintMap.roi.split('-')[0])
                                  : '-'}
                              </td>
                              <td className="py-2 px-3 text-right text-gray-900">
                                {historyConstraintMap.roi && historyConstraintMap.roi.split('-').length === 2
                                  ? formatValue(historyConstraintMap.roi.split('-')[1])
                                  : '-'}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-medium text-gray-700">mROI</td>
                              <td className="py-2 px-3 text-right text-gray-900">
                                {historyConstraintMap.mroi && historyConstraintMap.mroi.split('-').length === 2
                                  ? formatValue(historyConstraintMap.mroi.split('-')[0])
                                  : '-'}
                              </td>
                              <td className="py-2 px-3 text-right text-gray-900">
                                {historyConstraintMap.mroi && historyConstraintMap.mroi.split('-').length === 2
                                  ? formatValue(historyConstraintMap.mroi.split('-')[1])
                                  : '-'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


          {viewMode === 'current' && (
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4">
                <div className="flex flex-col lg:flex-row gap-3 flex-1">
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">Geography</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {regionLevels.map((lvl) => {
                        const active = selectedRegionLevels.includes(lvl);
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() =>
                              setSelectedRegionLevels((prev) =>
                                prev.includes(lvl) ? prev.filter((x) => x !== lvl) : [...prev, lvl]
                              )
                            }
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                              active
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>


                  <div className="hidden lg:block w-px h-16 bg-gray-300 self-stretch" />


                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">Sales Channel</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {channels.map((ch) => {
                        const active = selectedChannels.includes(ch);
                        return (
                          <button
                            key={ch}
                            type="button"
                            onClick={() =>
                              setSelectedChannels((prev) =>
                                prev.includes(ch) ? prev.filter((x) => x !== ch) : [...prev, ch]
                              )
                            }
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                              active
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            {ch}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>


                <div className="hidden lg:block w-px h-16 bg-gray-300 self-stretch" />


                <div className="flex flex-col gap-2 lg:w-auto lg:min-w-[280px]">
                  <label className="text-xs sm:text-sm font-semibold text-gray-900">
                    Past Iterations
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setIsHistoryDropdownOpen(!isHistoryDropdownOpen)}
                      className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-white rounded-lg text-[10px] sm:text-xs font-medium hover:bg-gray-800 transition-colors"
                      type="button"
                    >
                      <History className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>View History ({mockPastIterations.length})</span>
                      <ChevronRight
                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transform transition-transform ${
                          isHistoryDropdownOpen ? 'rotate-90' : ''
                        }`}
                      />
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
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                Click to view past results
                              </p>
                            </div>


                            {mockPastIterations.map((iteration) => (
                              <button
                                key={iteration.id}
                                onClick={() => handleViewHistory(iteration)}
                                className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors group/item"
                                type="button"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                    {iteration.name}
                                  </p>
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


          {!uploadedFile && !hasResults && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Target className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Ready to Optimize</h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                Configure parameters in the sidebar and click Run Engine.
              </p>
            </div>
          )}


          {/* BEFORE RUN */}
          {uploadedFile && !hasResults && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">Data Upload</h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{uploadedFile?.name}</p>
                </div>


                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  {renderChannelConstraintControlBar()}


                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg text-[10px] sm:text-xs font-medium hover:bg-gray-800 transition-colors shadow-sm justify-center whitespace-nowrap"
                    type="button"
                  >
                    <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>


              {!hideChannelLevelConstraints && (
                <div className="px-3 sm:px-4 py-2 bg-white border-b border-gray-200 text-[10px] sm:text-xs text-gray-600 flex flex-wrap gap-3">
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded bg-blue-100 border border-blue-200" />
                    ROAS filled
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded bg-rose-100 border border-rose-200" />
                    ROI filled
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded bg-yellow-100 border border-yellow-200" />
                    Both filled
                  </span>
                </div>
              )}


              <div className="border border-gray-200 rounded-lg overflow-x-auto bg-white m-3 sm:m-4">
                <table className="w-full text-[10px] sm:text-xs min-w-[980px] table-auto">
                  <thead className="bg-gray-50 border-b-2 border-gray-300">
                    <tr>
                      <th className="sticky left-0 z-10 bg-gray-50 text-left py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 border-r border-gray-300 whitespace-nowrap">
                        Channel
                      </th>


                      <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 border-r border-gray-300 whitespace-nowrap">
                        Funds Available
                      </th>


                      {showRoasCols && (
                        <>
                          <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">
                            Channel ROAS
                          </th>
                          <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">
                            Channel mROAS
                          </th>
                        </>
                      )}


                      {showRoiCols && (
                        <>
                          <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">
                            Channel ROI
                          </th>
                          <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 border-r border-gray-300 whitespace-nowrap">
                            Channel mROI
                          </th>
                        </>
                      )}


                      <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">
                        Test Range Min.
                      </th>
                      <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">
                        Test Range Max.
                      </th>
                    </tr>
                  </thead>


                  <tbody className="bg-white">
                    {beforeRunRows?.length === 0 ? (
                      <tr>
                        <td
                          colSpan={beforeRunColSpan}
                          className="py-8 text-center text-xs text-gray-500"
                        >
                          No rows found in uploaded file.
                        </td>
                      </tr>
                    ) : (
                      beforeRunRows.map((row, idx) => {
                        const rowBg = getRowHighlight(row.channel);
                        return (
                          <tr
                            key={idx}
                            className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${rowBg}`}
                          >
                            <td
                              className={`sticky left-0 z-10 py-2 sm:py-2.5 px-2 sm:px-3 font-medium text-gray-900 border-r border-gray-200 whitespace-nowrap ${
                                rowBg || 'bg-white'
                              }`}
                            >
                              {row.channel || '-'}
                            </td>


                            <td
                              className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 border-r border-gray-200 whitespace-nowrap ${rowBg}`}
                            >
                              {row.fundsAvailable || '-'}
                            </td>


                            {showRoasCols && (
                              <>
                                <td className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right ${rowBg}`}>
                                  <input
                                    className="no-spinner w-24 sm:w-28 text-right px-2 py-1 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 whitespace-nowrap"
                                    value={channelLevelConstraints[row.channel]?.channelRoas ?? ''}
                                    onChange={(e) =>
                                      updateChannelConstraint(row.channel, 'channelRoas', e.target.value)
                                    }
                                    placeholder="-"
                                  />
                                </td>


                                <td className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right ${rowBg}`}>
                                  <input
                                    className="no-spinner w-24 sm:w-28 text-right px-2 py-1 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 whitespace-nowrap"
                                    value={channelLevelConstraints[row.channel]?.channelMroas ?? ''}
                                    onChange={(e) =>
                                      updateChannelConstraint(row.channel, 'channelMroas', e.target.value)
                                    }
                                    placeholder="-"
                                  />
                                </td>
                              </>
                            )}


                            {showRoiCols && (
                              <>
                                <td className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right ${rowBg}`}>
                                  <input
                                    className="no-spinner w-24 sm:w-28 text-right px-2 py-1 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 whitespace-nowrap"
                                    value={channelLevelConstraints[row.channel]?.channelRoi ?? ''}
                                    onChange={(e) =>
                                      updateChannelConstraint(row.channel, 'channelRoi', e.target.value)
                                    }
                                    placeholder="-"
                                  />
                                </td>


                                <td
                                  className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right border-r border-gray-200 ${rowBg}`}
                                >
                                  <input
                                    className="no-spinner w-24 sm:w-28 text-right px-2 py-1 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 whitespace-nowrap"
                                    value={channelLevelConstraints[row.channel]?.channelMroi ?? ''}
                                    onChange={(e) =>
                                      updateChannelConstraint(row.channel, 'channelMroi', e.target.value)
                                    }
                                    placeholder="-"
                                  />
                                </td>
                              </>
                            )}


                            <td
                              className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}
                            >
                              {row.testRangeMin ?? '-'}
                            </td>
                            <td
                              className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}
                            >
                              {row.testRangeMax ?? '-'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {/* AFTER RUN */}
          {hasResults && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 sm:gap-3">
                <div
                  onClick={() => handleCardClick('performance')}
                  className="bg-white rounded-lg p-2 sm:p-2.5 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] sm:text-xs font-semibold text-gray-900">
                      Performance
                    </h3>
                    <Maximize2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                  </div>
                  <div className="mt-1 text-[10px] sm:text-[11px] text-gray-600">
                    Sales lift:{' '}
                    <span className="font-semibold text-gray-900">
                      {Number(currentPerf?.growthPercent?.sales ?? 0).toFixed(2)}%
                    </span>
                  </div>
                </div>


                <div
                  onClick={() => handleCardClick('topChannels')}
                  className="bg-white rounded-lg p-2 sm:p-2.5 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] sm:text-xs font-semibold text-gray-900">
                      Top Channels Analysis
                    </h3>
                    <Maximize2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                  </div>
                  <div className="mt-1 text-[10px] sm:text-[11px] text-gray-600 flex items-center justify-between gap-2">
                    <span className="whitespace-nowrap">Top channel</span>
                    <span className="font-semibold text-gray-900 whitespace-nowrap">
                      ₹{formatMoney(24770273)}
                    </span>
                  </div>
                </div>


                <div
                  onClick={() => handleCardClick('marketingRoi')}
                  className="bg-white rounded-lg p-2 sm:p-2.5 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] sm:text-xs font-semibold text-gray-900">
                      Marketing ROI
                    </h3>
                    <Maximize2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                  </div>
                  <div className="mt-1 text-[10px] sm:text-[11px] text-gray-600">
                    Sales/Spend:{' '}
                    <span className="font-semibold text-gray-900">₹11.92 → ₹8.77</span>
                  </div>
                </div>


                <div
                  onClick={() => handleCardClick('analysis')}
                  className="bg-white rounded-lg p-2 sm:p-2.5 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] sm:text-xs font-semibold text-gray-900">Analysis</h3>
                    <Maximize2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                  </div>
                  <div className="mt-1 text-[10px] sm:text-[11px] text-gray-600">
                    Charts:{' '}
                    <span className="font-semibold text-gray-900">Bars, Pies, Scatters</span>
                  </div>
                </div>
              </div>


              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">
                      Channel Level Constraints
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                                          </p>
                  </div>


                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    {renderChannelConstraintControlBar()}


                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg text-[10px] sm:text-xs font-medium hover:bg-gray-800 transition-colors shadow-sm justify-center whitespace-nowrap"
                      type="button"
                    >
                      <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>


                {!hideChannelLevelConstraints && (
                  <div className="px-3 sm:px-4 py-2 bg-white border-b border-gray-200 text-[10px] sm:text-xs text-gray-600 flex flex-wrap gap-3">
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded bg-blue-100 border border-blue-200" />
                      ROAS filled
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded bg-rose-100 border border-rose-200" />
                      ROI filled
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded bg-yellow-100 border border-yellow-200" />
                      Both filled
                    </span>
                  </div>
                )}


                <div className="border border-gray-200 rounded-lg overflow-x-auto bg-white m-3 sm:m-4">
                  <table className="w-full text-[10px] sm:text-xs min-w-[1400px] table-auto">
                    <thead className="bg-gray-50 border-b-2 border-gray-300">
                      <tr>
                        <th className="sticky left-0 z-10 bg-gray-50 text-left py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 border-r border-gray-300 whitespace-nowrap">
                          Channel
                        </th>


                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 border-r border-gray-300 whitespace-nowrap">
                          Funds Available
                        </th>


                        {showRoasCols && (
                          <>
                            <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">
                              Channel ROAS
                            </th>
                            <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">
                              Channel mROAS
                            </th>
                          </>
                        )}


                        {showRoiCols && (
                          <>
                            <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">
                              Channel ROI
                            </th>
                            <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 border-r border-gray-300 whitespace-nowrap">
                              Channel mROI
                            </th>
                          </>
                        )}


                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">
                          Test Range Min.
                        </th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">
                          Test Range Max.
                        </th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">
                          Test Spend
                        </th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">
                          GMV
                        </th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">
                          ROAS
                        </th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">
                          mROAS
                        </th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">
                          ROI
                        </th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">
                          mROI
                        </th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">
                          Spend Rank
                        </th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">
                          Spend Scale
                        </th>
                      </tr>
                    </thead>


                    <tbody className="bg-white">
                      {filteredResults?.length === 0 ? (
                        <tr>
                          <td
                            colSpan={afterRunColSpan}
                            className="py-8 text-center text-xs text-gray-500"
                          >
                            No rows to display.
                          </td>
                        </tr>
                      ) : (
                        filteredResults.map((row, idx) => {
                          const rowBg = getRowHighlight(row.channel);


                          return (
                            <tr
                              key={idx}
                              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${rowBg}`}
                            >
                              <td
                                className={`sticky left-0 z-10 py-2 sm:py-2.5 px-2 sm:px-3 font-medium text-gray-900 border-r border-gray-200 whitespace-nowrap ${
                                  rowBg || 'bg-white'
                                }`}
                              >
                                {row.channel || '-'}
                              </td>


                              <td
                                className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 border-r border-gray-200 whitespace-nowrap ${rowBg}`}
                              >
                                {row.fundsAvailable || '-'}
                              </td>


                              {showRoasCols && (
                                <>
                                  <td className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right ${rowBg}`}>
                                    <input
                                      className="no-spinner w-24 sm:w-28 text-right px-2 py-1 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 whitespace-nowrap"
                                      value={channelLevelConstraints[row.channel]?.channelRoas ?? ''}
                                      onChange={(e) =>
                                        updateChannelConstraint(row.channel, 'channelRoas', e.target.value)
                                      }
                                      placeholder="-"
                                    />
                                  </td>
                                  <td className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right ${rowBg}`}>
                                    <input
                                      className="no-spinner w-24 sm:w-28 text-right px-2 py-1 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 whitespace-nowrap"
                                      value={channelLevelConstraints[row.channel]?.channelMroas ?? ''}
                                      onChange={(e) =>
                                        updateChannelConstraint(row.channel, 'channelMroas', e.target.value)
                                      }
                                      placeholder="-"
                                    />
                                  </td>
                                </>
                              )}


                              {showRoiCols && (
                                <>
                                  <td className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right ${rowBg}`}>
                                    <input
                                      className="no-spinner w-24 sm:w-28 text-right px-2 py-1 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 whitespace-nowrap"
                                      value={channelLevelConstraints[row.channel]?.channelRoi ?? ''}
                                      onChange={(e) =>
                                        updateChannelConstraint(row.channel, 'channelRoi', e.target.value)
                                      }
                                      placeholder="-"
                                    />
                                  </td>


                                  <td
                                    className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right border-r border-gray-200 ${rowBg}`}
                                  >
                                    <input
                                      className="no-spinner w-24 sm:w-28 text-right px-2 py-1 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 whitespace-nowrap"
                                      value={channelLevelConstraints[row.channel]?.channelMroi ?? ''}
                                      onChange={(e) =>
                                        updateChannelConstraint(row.channel, 'channelMroi', e.target.value)
                                      }
                                      placeholder="-"
                                    />
                                  </td>
                                </>
                              )}


                              <td
                                className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}
                              >
                                {row.testRangeMin ?? '-'}
                              </td>
                              <td
                                className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}
                              >
                                {row.testRangeMax ?? '-'}
                              </td>
                              <td
                                className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}
                              >
                                {row.testSpend ?? '-'}
                              </td>
                              <td
                                className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}
                              >
                                {row.gmv ?? '-'}
                              </td>
                              <td
                                className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}
                              >
                                {row.roas ?? '-'}
                              </td>
                              <td
                                className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}
                              >
                                {row.mroas ?? '-'}
                              </td>
                              <td
                                className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}
                              >
                                {row.outChannelRoi ?? '-'}
                              </td>
                              <td
                                className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}
                              >
                                {row.outChannelMroi ?? '-'}
                              </td>
                              <td
                                className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}
                              >
                                {row.spendRank ?? '-'}
                              </td>
                              <td
                                className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}
                              >
                                {row.spendScale ?? '-'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}


          {renderPopup()}
        </div>
      </div>
    </div>
  );
};


export default MarketEdge;
