import React, { useMemo, useState } from 'react';
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
  const channels = ['Online', 'Stores', 'Old Stores', 'New Stores'];

  const [selectedRegionLevels, setSelectedRegionLevels] = useState(regionLevels);
  const [selectedChannels, setSelectedChannels] = useState(channels);

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

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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

  const currentPerf = useMemo(() => {
    const base =
      mockPerformanceByObjective[selectedOptimization] || mockPerformanceByObjective.sales;

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
    const baseRows =
      uploadedPreviewRows && uploadedPreviewRows.length > 0 ? uploadedPreviewRows : [];

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
    setConstraints([]);
    setSelectedOptimization('sales');
    setSelectedRegionLevels(regionLevels);
    setSelectedChannels(channels);

    setUploadedFile(null);
    setUploadedPreviewRows([]);

    setHasResults(false);
    setResultsData([]);

    setViewMode('current');
    setSelectedHistoryItem(null);
    setChannelLevelConstraints({});

    setRoasConstraintsEnabled(true);
    setRoiConstraintsEnabled(true);
    setHideChannelLevelConstraints(false);
  };

  const handleViewHistory = (iteration) => {
    setSidebarOpen(false);
    setIsHistoryDropdownOpen(false);
    setSelectedHistoryItem(iteration);

    setHasResults(true);
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

  const getRowHighlight = (channel) => {
    const c = channelLevelConstraints[channel] || {};
    const roasFilled = roasConstraintsEnabled && !!(c.channelRoas || c.channelMroas);
    const roiFilled = roiConstraintsEnabled && !!(c.channelRoi || c.channelMroi);

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

  const renderChannelConstraintControlBar = () => {
    return (
      <div className="flex items-start justify-start sm:justify-end">
        <div className="flex flex-wrap items-center gap-3">
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
    );
  };

  const renderPopup = () => {
    if (!showPopup) return null;

    if (popupType === 'performance') {
      const rows = [
        { key: 'Control', v: currentPerf.control },
        { key: 'Test', v: currentPerf.test },
        { key: 'Growth', v: currentPerf.growth },
        { key: 'Growth %', v: currentPerf.growthPercent }
      ];

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
                    Control vs Test Comparison
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Sales / Spend / ROI / ROAS / mROI
                  </p>
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
                <table className="w-full text-xs sm:text-sm min-w-[780px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        Scenario
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        Sales
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        Spend
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        ROI
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        ROAS
                      </th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 border-b-2 border-gray-300">
                        mROI
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white">
                    {rows.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-900">
                          {row.key}
                        </td>

                        <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                          {row.key === 'Growth %'
                            ? `${formatValue(row.v.sales)}%`
                            : `₹${formatMoney(row.v.sales)}`}
                        </td>

                        <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                          {row.key === 'Growth %'
                            ? `${formatValue(row.v.spend)}%`
                            : `₹${formatMoney(row.v.spend)}`}
                        </td>

                        <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                          {row.key === 'Growth %'
                            ? `${formatValue(row.v.roi)}%`
                            : formatValue(row.v.roi)}
                        </td>

                        <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                          {row.key === 'Growth %'
                            ? `${formatValue(row.v.roas)}%`
                            : formatValue(row.v.roas)}
                        </td>

                        <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-gray-700">
                          {row.key === 'Growth %'
                            ? `${formatValue(row.v.mroi)}%`
                            : formatValue(row.v.mroi)}
                        </td>
                      </tr>
                    ))}
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

      <Navbar
        toggleSidebar={toggleSidebar}
        showMenuButton={true}
        currentProduct="marketedge"
        onLogoClick={() => navigate('/dashboard')}
      />

      <div
        className={`pt-16 transition-all duration-300 ${
          viewMode === 'history' ? 'ml-0 lg:ml-[320px]' : 'ml-0 lg:ml-[320px]'
        }`}
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

                  <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-[10px] sm:text-xs font-medium text-gray-700">
                      {selectedHistoryItem.constraints}
                    </div>
                    <div className="px-3 py-2 text-[10px] sm:text-xs text-gray-600">
                      History view uses placeholder rows (structure-first).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'current' && (
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <div className="text-xs sm:text-sm font-semibold text-gray-900">
                    MarketEdge AI
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500">
                    Upload + configure in sidebar, then RUN ENGINE.
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
                              <p className="text-xs font-semibold text-gray-900">
                                Historical Runs
                              </p>
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

          {!uploadedFile && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Target className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                Ready to Optimize
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                Configure parameters in the sidebar and click RUN ENGINE.
              </p>
            </div>
          )}

          {/* BEFORE RUN: after Data Upload -> show constraint controls + inner table */}
          {uploadedFile && !hasResults && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">Data Upload</h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                    {uploadedFile?.name}
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

                            <td className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}>
                              {row.testRangeMin ?? '-'}
                            </td>
                            <td className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <div
                  onClick={() => handleCardClick('performance')}
                  className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Performance</h3>
                    <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-900 group-hover:scale-110 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                    <div>
                      <p className="text-gray-500">Control Sales</p>
                      <p className="font-semibold text-gray-900">
                        {(currentPerf.control.sales / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Test Sales</p>
                      <p className="font-semibold text-gray-900">
                        {(currentPerf.test.sales / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Sales</h3>
                    <span className="text-[10px] sm:text-xs text-gray-500">Test</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-gray-900">
                    ₹{formatMoney(currentPerf.test.sales)}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    Growth: {formatValue(currentPerf.growthPercent.sales)}%
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Spend</h3>
                    <span className="text-[10px] sm:text-xs text-gray-500">Test</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-gray-900">
                    ₹{formatMoney(currentPerf.test.spend)}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    Growth: {formatValue(currentPerf.growthPercent.spend)}%
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900">ROI</h3>
                    <span className="text-[10px] sm:text-xs text-gray-500">Test</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-gray-900">
                    {formatValue(currentPerf.test.roi)}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    Growth: {formatValue(currentPerf.growthPercent.roi)}%
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900">ROAS</h3>
                    <span className="text-[10px] sm:text-xs text-gray-500">Test</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-gray-900">
                    {formatValue(currentPerf.test.roas)}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    Growth: {formatValue(currentPerf.growthPercent.roas)}%
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
                      Removed grouped inner headings; channel names stay single-line.
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
                          Channel ROI (Output)
                        </th>
                        <th className="text-right py-2 sm:py-2.5 px-2 sm:px-3 font-semibold text-gray-900 whitespace-nowrap">
                          Channel mROI (Output)
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

                                  <td className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right border-r border-gray-200 ${rowBg}`}>
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

                              <td className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}>
                                {row.testRangeMin ?? '-'}
                              </td>
                              <td className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}>
                                {row.testRangeMax ?? '-'}
                              </td>
                              <td className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}>
                                {row.testSpend ?? '-'}
                              </td>
                              <td className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}>
                                {row.gmv ?? '-'}
                              </td>
                              <td className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}>
                                {row.roas ?? '-'}
                              </td>
                              <td className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}>
                                {row.mroas ?? '-'}
                              </td>
                              <td className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}>
                                {row.outChannelRoi ?? '-'}
                              </td>
                              <td className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}>
                                {row.outChannelMroi ?? '-'}
                              </td>
                              <td className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}>
                                {row.spendRank ?? '-'}
                              </td>
                              <td className={`py-2 sm:py-2.5 px-2 sm:px-3 text-right text-gray-700 whitespace-nowrap ${rowBg}`}>
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
