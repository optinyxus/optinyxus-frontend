import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import EngageSyncSidebar from '../../components/sidebars/EngageSyncSidebar';
import { X, Users, Zap, ChevronRight, Tag, Activity, RefreshCcw, Heart, LayoutGrid } from 'lucide-react';

// ─── Segment arrays per schema (for 2x2 Matrix, same data as Multi-Select) ────
const SCHEMA_SEGMENTS = {
  rfm: [
    { id: 'rfm_prime', label: 'Prime', score: 3, count: 3000 },
    { id: 'rfm_active', label: 'Active', score: 2, count: 5000 },
    { id: 'rfm_fading', label: 'Fading', score: 1, count: 2000 },
  ],
  loyalty: [
    { id: 'lo_evan', label: 'Evangelist', score: 5, count: 2000 },
    { id: 'lo_brand', label: 'Brand Loyalist', score: 3, count: 3000 },
    { id: 'lo_trans', label: 'Transactional', score: 2, count: 2000 },
    { id: 'lo_neut', label: 'Neutral Customer', score: 1, count: 3000 },
  ],
  behavior: [
    { id: 'bh_deal', label: 'Deal Hunters', score: 8, count: 2500 },
    { id: 'bh_prem', label: 'Premium Seekers', score: 21, count: 1000 },
    { id: 'bh_var', label: 'Variety Explorers', score: 3, count: 1500 },
    { id: 'bh_quick', label: 'Quick Buyers', score: 13, count: 2500 },
    { id: 'bh_res', label: 'Researchers', score: 1, count: 500 },
    { id: 'bh_conv', label: 'Convenience Seekers', score: 5, count: 1500 },
    { id: 'bh_need', label: 'Need Driven', score: 2, count: 500 },
  ],
  lifecycle: [
    { id: 'lc_prosp', label: 'Prospect', score: 2, count: 1000 },
    { id: 'lc_new', label: 'New Customers', score: 5, count: 500 },
    { id: 'lc_grow', label: 'Growing', score: 8, count: 2500 },
    { id: 'lc_mat', label: 'Mature', score: 13, count: 3000 },
    { id: 'lc_risk', label: 'At-Risk', score: 3, count: 1000 },
    { id: 'lc_dorm', label: 'Dormant', score: 1, count: 2000 },
  ],
};

// Row/column axis colours — match Multi-Select palette
const AXIS_STYLE = {
  rfm: { rowBg: 'bg-indigo-50', rowText: 'text-indigo-800', rowCount: 'text-indigo-500', headerBg: 'bg-indigo-50 text-indigo-800', headerCount: 'text-indigo-600', colSpanBg: 'bg-indigo-50 text-indigo-800' },
  loyalty: { rowBg: 'bg-rose-50', rowText: 'text-rose-800', rowCount: 'text-rose-500', headerBg: 'bg-rose-50 text-rose-800', headerCount: 'text-rose-600', colSpanBg: 'bg-rose-50 text-rose-800' },
  behavior: { rowBg: 'bg-amber-50', rowText: 'text-amber-800', rowCount: 'text-amber-500', headerBg: 'bg-amber-50 text-amber-800', headerCount: 'text-amber-600', colSpanBg: 'bg-amber-50 text-amber-800' },
  lifecycle: { rowBg: 'bg-emerald-50', rowText: 'text-emerald-800', rowCount: 'text-emerald-500', headerBg: 'bg-emerald-50 text-emerald-800', headerCount: 'text-emerald-600', colSpanBg: 'bg-emerald-50 text-emerald-800' },
};

// ─── MatrixPanel ─────────────────────────────────────────────────────────────
// Uses exact same getCellValue formula and segment data as Multi-Select.
// Defined as a function expression so it can reference getCellValue defined later.
const MatrixPanel = ({ ySchemaId, xSchemaId }) => {
  // ySchemaId = first selected (rows / Y-axis)
  // xSchemaId = second selected (columns / X-axis)
  const yLabel = ySchemaId === 'lifecycle' ? 'Life Cycle' : ySchemaId.charAt(0).toUpperCase() + ySchemaId.slice(1);
  const xLabel = xSchemaId === 'lifecycle' ? 'Life Cycle' : xSchemaId.charAt(0).toUpperCase() + xSchemaId.slice(1);
  const ySegs = SCHEMA_SEGMENTS[ySchemaId];
  const xSegs = SCHEMA_SEGMENTS[xSchemaId];
  const yStyle = AXIS_STYLE[ySchemaId];
  const xStyle = AXIS_STYLE[xSchemaId];

  // Reuse exact getCellValue(rfm, loyalty, behaviour, lifecycle) — we call with
  // the row segment score on its own axis and 1 for axes not in this matrix.
  const cell = (y, x) => {
    const scores = { rfm: 1, loyalty: 1, behavior: 1, lifecycle: 1 };
    scores[ySchemaId] = y.score;
    scores[xSchemaId] = x.score;
    // getCellValue defined later in file — safe because MatrixPanel is called at render time
    return getCellValue(scores.rfm, scores.loyalty, scores.behavior, scores.lifecycle);
  };

  return (
    <div className="bg-card-bg rounded-lg shadow-premium-md border border-border-gray w-full">
      {/* Card header - same style as Multi-Select's outer card */}
      <div className="p-4 sm:p-5 space-y-4">

        {/* Axis indicator pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${yStyle.rowBg} border-current ${yStyle.rowText}`}>
            Y-axis: {yLabel} Segments
          </span>
          <span className="text-xs text-muted-text">×</span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${xStyle.rowBg} border-current ${xStyle.rowText}`}>
            X-axis: {xLabel} Segments
          </span>
        </div>

        {/* Matrix Table — full width, same structure as Multi-Select */}
        <div className="overflow-x-auto rounded-lg border border-gray-300">
          <table className="w-full text-xs border-collapse" style={{ minWidth: 500 }}>
            <thead>
              {/* X-axis (columns) group header */}
              <tr>
                <td className="border border-gray-300 bg-gray-50 p-2" rowSpan={2} />
                <td className="border border-gray-300 bg-gray-50 p-2" rowSpan={2} />
                <td
                  colSpan={xSegs.length + 1}
                  className={`border border-gray-300 font-bold text-center py-2 px-3 tracking-wide ${xStyle.headerBg}`}
                >
                  {xLabel} Segments <span className="font-normal text-[10px] opacity-60">(X-axis / Columns)</span>
                </td>
              </tr>
              <tr>
                {xSegs.map(x => (
                  <th
                    key={x.id}
                    className={`border border-gray-300 font-semibold py-2 px-2 text-center whitespace-nowrap ${xStyle.headerBg}`}
                  >
                    {x.label}<br />
                    <span className={`text-[9px] font-normal ${xStyle.headerCount}`}>({x.count.toLocaleString()})</span>
                  </th>
                ))}
                <th className="border border-gray-300 bg-gray-100 text-gray-700 font-bold py-2 px-3 text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {ySegs.map((y, yIdx) => {
                const rowTotal = xSegs.reduce((sum, x) => sum + cell(y, x), 0);
                return (
                  <tr key={y.id}>
                    {/* Y-axis (rows) group header — spans all data rows */}
                    {yIdx === 0 && (
                      <td
                        rowSpan={ySegs.length + 1}
                        className={`border border-gray-300 font-bold text-center ${yStyle.colSpanBg}`}
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', minWidth: 28, padding: '8px 4px' }}
                      >
                        {yLabel} Segments <span className="font-normal text-[9px] opacity-60">(Y)</span>
                      </td>
                    )}
                    {/* Row label */}
                    <td className={`border border-gray-300 font-semibold py-2 px-3 whitespace-nowrap ${yStyle.rowBg} ${yStyle.rowText}`}>
                      {y.label}<br />
                      <span className={`text-[9px] font-normal ${yStyle.rowCount}`}>({y.count.toLocaleString()})</span>
                    </td>
                    {/* Data cells */}
                    {xSegs.map(x => {
                      const val = cell(y, x);
                      return (
                        <td
                          key={x.id}
                          className="border border-gray-300 text-center py-2 px-2 font-medium transition-colors"
                          style={{
                            backgroundColor: val > 0
                              ? `rgba(99,102,241,${0.05 + (val / 1000) * 0.35})`
                              : '#f9fafb',
                            color: val > 600 ? '#3730a3' : '#374151',
                          }}
                        >
                          {val.toLocaleString()}
                        </td>
                      );
                    })}
                    {/* Row total */}
                    <td className="border border-gray-300 bg-gray-50 text-center font-bold text-gray-800 py-2 px-3">
                      {rowTotal.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {/* Column totals row */}
              <tr>
                <td className="border border-gray-300 bg-gray-100 text-gray-700 font-bold text-center py-2 px-3">Total</td>
                {xSegs.map(x => {
                  const colTotal = ySegs.reduce((sum, y) => sum + cell(y, x), 0);
                  return (
                    <td key={x.id} className="border border-gray-300 bg-gray-100 text-center font-bold text-gray-800 py-2 px-2">
                      {colTotal.toLocaleString()}
                    </td>
                  );
                })}
                <td className="border border-gray-300 bg-gray-200 text-center font-bold text-gray-900 py-2 px-3">
                  {ySegs.reduce((sum, y) => sum + xSegs.reduce((s2, x) => s2 + cell(y, x), 0), 0).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};


// ─── Multi-Select Matrix Data ───────────────────────────────────────────────
const RFM_SEGMENTS = [
  { id: 'rfm_prime', label: 'Prime', score: 3, count: 3000 },
  { id: 'rfm_active', label: 'Active', score: 2, count: 5000 },
  { id: 'rfm_fading', label: 'Fading', score: 1, count: 2000 },
];

const LOYALTY_SEGMENTS = [
  { id: 'lo_evan', label: 'Evangelist', score: 5, count: 2000 },
  { id: 'lo_brand', label: 'Brand Loyalist', score: 3, count: 3000 },
  { id: 'lo_trans', label: 'Transactional', score: 2, count: 2000 },
  { id: 'lo_neut', label: 'Neutral Customer', score: 1, count: 3000 },
];

const BEHAVIOUR_SEGMENTS = [
  { id: 'bh_deal', label: 'Deal Hunters', score: 8, count: 2500 },
  { id: 'bh_prem', label: 'Premium Seekers', score: 21, count: 1000 },
  { id: 'bh_var', label: 'Variety Explorers', score: 3, count: 1500 },
  { id: 'bh_quick', label: 'Quick Buyers', score: 13, count: 2500 },
  { id: 'bh_res', label: 'Researchers', score: 1, count: 500 },
  { id: 'bh_conv', label: 'Convenience Seekers', score: 5, count: 1500 },
  { id: 'bh_need', label: 'Need Driven', score: 2, count: 500 },
];

const LIFECYCLE_SEGMENTS = [
  { id: 'lc_prosp', label: 'Prospect', score: 2, count: 1000 },
  { id: 'lc_new', label: 'New Customers', score: 5, count: 500 },
  { id: 'lc_grow', label: 'Growing', score: 8, count: 2500 },
  { id: 'lc_mat', label: 'Mature', score: 13, count: 3000 },
  { id: 'lc_risk', label: 'At-Risk', score: 3, count: 1000 },
  { id: 'lc_dorm', label: 'Dormant', score: 1, count: 2000 },
];

const getCellValue = (rfmScore, loyaltyScore, behaviourScore, lifecycleScore) =>
  (rfmScore * loyaltyScore * behaviourScore * lifecycleScore) % 1000;

// ─── Schema Data ──────────────────────────────────────────────────────────────
const SCHEMA_DATA = {
  rfm: {
    label: 'RFM',
    icon: Activity,
    color: 'indigo',
    description: 'Recency, Frequency, Monetary segmentation',
    segments: [
      { id: 'R1', label: 'R1', description: 'Champions' },
      { id: 'R2', label: 'R2', description: 'Loyal Customers' },
      { id: 'R3', label: 'R3', description: 'At Risk' },
    ],
    treatments: [
      { id: 'TR1', label: 'TR1', description: 'Reward & Delight' },
      { id: 'TR2', label: 'TR2', description: 'Re-engagement' },
      { id: 'TR3', label: 'TR3', description: 'Win Back Campaign' },
    ],
  },
  loyalty: {
    label: 'Loyalty',
    icon: Heart,
    color: 'rose',
    description: 'Loyalty tier based segmentation',
    segments: [
      { id: 'L1', label: 'L1', description: 'Platinum Members' },
      { id: 'L2', label: 'L2', description: 'Gold Members' },
      { id: 'L3', label: 'L3', description: 'Silver Members' },
      { id: 'L4', label: 'L4', description: 'New Members' },
    ],
    treatments: [
      { id: 'TL1', label: 'TL1', description: 'VIP Exclusive Offer' },
      { id: 'TL2', label: 'TL2', description: 'Premium Upgrade' },
      { id: 'TL3', label: 'TL3', description: 'Milestone Reward' },
      { id: 'TL4', label: 'TL4', description: 'Welcome Journey' },
    ],
  },
  behavior: {
    label: 'Behavior',
    icon: Zap,
    color: 'amber',
    description: 'Purchase behavior based segmentation',
    segments: [
      { id: 'B1', label: 'B1', description: 'High Frequency Buyers' },
      { id: 'B2', label: 'B2', description: 'Seasonal Shoppers' },
      { id: 'B3', label: 'B3', description: 'Browse & Abandon' },
      { id: 'B4', label: 'B4', description: 'One-time Buyers' },
    ],
    treatments: [
      { id: 'TB1', label: 'TB1', description: 'Subscription Offer' },
      { id: 'TB2', label: 'TB2', description: 'Seasonal Nudge' },
      { id: 'TB3', label: 'TB3', description: 'Cart Recovery' },
      { id: 'TB4', label: 'TB4', description: 'Cross-sell Push' },
    ],
  },
  lifecycle: {
    label: 'Life Cycle',
    icon: RefreshCcw,
    color: 'emerald',
    description: 'Customer life cycle stage segmentation',
    segments: [
      { id: 'C1', label: 'C1', description: 'Acquisition' },
      { id: 'C2', label: 'C2', description: 'Growth' },
      { id: 'C3', label: 'C3', description: 'Retention' },
    ],
    treatments: [
      { id: 'TC1', label: 'TC1', description: 'Onboarding Flow' },
      { id: 'TC2', label: 'TC2', description: 'Upsell Program' },
      { id: 'TC3', label: 'TC3', description: 'Retention Campaign' },
    ],
  },
};

// Colour tokens per schema
const COLOR_MAP = {
  indigo: {
    active: 'bg-indigo-600 border-indigo-600 text-white',
    inactive: 'border-border-gray bg-white text-secondary-text hover:border-indigo-400 hover:text-indigo-600',
    segBg: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
    segText: 'text-indigo-700',
    segBadge: 'bg-indigo-100 text-indigo-700',
    treatBg: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    treatText: 'text-purple-700',
    treatBadge: 'bg-purple-100 text-purple-700',
    btn: 'bg-indigo-600 hover:bg-indigo-700',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
  },
  rose: {
    active: 'bg-rose-600 border-rose-600 text-white',
    inactive: 'border-border-gray bg-white text-secondary-text hover:border-rose-400 hover:text-rose-600',
    segBg: 'bg-rose-50 border-rose-200 hover:border-rose-400',
    segText: 'text-rose-700',
    segBadge: 'bg-rose-100 text-rose-700',
    treatBg: 'bg-pink-50 border-pink-200 hover:border-pink-400',
    treatText: 'text-pink-700',
    treatBadge: 'bg-pink-100 text-pink-700',
    btn: 'bg-rose-600 hover:bg-rose-700',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
  amber: {
    active: 'bg-amber-500 border-amber-500 text-white',
    inactive: 'border-border-gray bg-white text-secondary-text hover:border-amber-400 hover:text-amber-600',
    segBg: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    segText: 'text-amber-700',
    segBadge: 'bg-amber-100 text-amber-700',
    treatBg: 'bg-orange-50 border-orange-200 hover:border-orange-400',
    treatText: 'text-orange-700',
    treatBadge: 'bg-orange-100 text-orange-700',
    btn: 'bg-amber-500 hover:bg-amber-600',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  emerald: {
    active: 'bg-emerald-600 border-emerald-600 text-white',
    inactive: 'border-border-gray bg-white text-secondary-text hover:border-emerald-400 hover:text-emerald-600',
    segBg: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
    segText: 'text-emerald-700',
    segBadge: 'bg-emerald-100 text-emerald-700',
    treatBg: 'bg-teal-50 border-teal-200 hover:border-teal-400',
    treatText: 'text-teal-700',
    treatBadge: 'bg-teal-100 text-teal-700',
    btn: 'bg-emerald-600 hover:bg-emerald-700',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
};

// Dummy customer rows for segment popup
const DUMMY_CUSTOMERS = [
  { id: 'CUST-001', p1: '—', p2: '—', p3: '—', p4: '—' },
  { id: 'CUST-002', p1: '—', p2: '—', p3: '—', p4: '—' },
  { id: 'CUST-003', p1: '—', p2: '—', p3: '—', p4: '—' },
  { id: 'CUST-004', p1: '—', p2: '—', p3: '—', p4: '—' },
  { id: 'CUST-005', p1: '—', p2: '—', p3: '—', p4: '—' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const EngageSync = () => {
  const navigate = useNavigate();

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Filters (sidebar reflects these too)
  const [cltvValue, setCltvValue] = useState('All');
  const [elasticityValue, setElasticityValue] = useState('All');

  // Schema selection (existing single-select — untouched)
  const [activeSchema, setActiveSchema] = useState(null);

  // Popup state
  const [popup, setPopup] = useState(null); // { type: 'segment'|'treatment', schema, item }

  // ── Multi-Select Mode state ────────────────────────────────────────────────
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedRfm, setSelectedRfm] = useState(RFM_SEGMENTS[0]);
  const [selectedLifecycle, setSelectedLifecycle] = useState(LIFECYCLE_SEGMENTS[0]);

  // ── 2x2 Matrix Mode state ──────────────────────────────────────────────────
  const [matrixMode, setMatrixMode] = useState(false);
  const [matrixSchemaOrder, setMatrixSchemaOrder] = useState([]); // ordered array of schema ids

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Mutual-exclusion: turning on multi-select turns off matrix mode, and vice-versa
  const handleMultiSelectChange = (val) => {
    setMultiSelectMode(val);
    if (val) { setMatrixMode(false); setMatrixSchemaOrder([]); }
  };

  const handleMatrixModeChange = (val) => {
    setMatrixMode(val);
    if (val) { setMultiSelectMode(false); }
    if (!val) { setMatrixSchemaOrder([]); }
  };

  const handleMatrixSchemaToggle = (id) => {
    if (id === '__reset__') { setMatrixSchemaOrder([]); return; }
    setMatrixSchemaOrder(prev => {
      if (prev.includes(id)) return prev.filter(s => s !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const handleRunAnalysis = () => {
    if (!uploadedFile || isRunning) return;
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 2000);
  };

  const openSegmentPopup = (schema, segment) => {
    setPopup({ type: 'segment', schema, item: segment });
  };

  const openTreatmentPopup = (schema, treatment) => {
    setPopup({ type: 'treatment', schema, item: treatment });
  };

  const closePopup = () => setPopup(null);

  // ── POPUP renderers ────────────────────────────────────────────────────────
  const renderPopup = () => {
    if (!popup) return null;

    const schema = SCHEMA_DATA[popup.schema];
    const colors = COLOR_MAP[schema.color];

    if (popup.type === 'segment') {
      return (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={closePopup}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50 rounded-t-xl flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.iconBg}`}>
                  <Users className={`w-5 h-5 ${colors.iconColor}`} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Segment {popup.item.label}
                    <span className="ml-2 text-sm font-normal text-gray-500">— {popup.item.description}</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{schema.label} Schema</p>
                </div>
              </div>
              <button
                onClick={closePopup}
                className="w-9 h-9 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Definition */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-2">Definition</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[80px]">
                  <p className="text-xs text-gray-400 italic">Definition will be populated here…</p>
                </div>
              </div>

              {/* Customer List */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-2">Customer List</h4>
                <div className="border border-gray-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-xs min-w-[480px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 w-32">Customer ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-500">Property 1</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-500">Property 2</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-500">Property 3</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-500">Property 4</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {DUMMY_CUSTOMERS.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 px-4 font-medium text-gray-900">{c.id}</td>
                          <td className="py-2.5 px-4 text-gray-400">{c.p1}</td>
                          <td className="py-2.5 px-4 text-gray-400">{c.p2}</td>
                          <td className="py-2.5 px-4 text-gray-400">{c.p3}</td>
                          <td className="py-2.5 px-4 text-gray-400">{c.p4}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end rounded-b-xl flex-shrink-0">
              <button
                onClick={closePopup}
                className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (popup.type === 'treatment') {
      const actions = ['Action 1', 'Action 2', 'Action 3'];
      return (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={closePopup}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50 rounded-t-xl flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.iconBg}`}>
                  <Tag className={`w-5 h-5 ${colors.iconColor}`} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Treatment {popup.item.label}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{popup.item.description}</p>
                </div>
              </div>
              <button
                onClick={closePopup}
                className="w-9 h-9 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Actions list */}
            <div className="p-5 space-y-3">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Actions</h4>
              {actions.map((action, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 ${colors.treatBg} transition-all cursor-default`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${colors.treatBadge}`}>
                    {idx + 1}
                  </div>
                  <span className={`text-sm font-semibold ${colors.treatText}`}>{action}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end rounded-b-xl">
              <button
                onClick={closePopup}
                className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
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

  // ── MAIN RENDER ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-main-bg">
      {/* Sidebar */}
      <EngageSyncSidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        uploadedFile={uploadedFile}
        onFileUpload={setUploadedFile}
        onRunAnalysis={handleRunAnalysis}
        isRunning={isRunning}
        cltvValue={cltvValue}
        onCltvChange={setCltvValue}
        elasticityValue={elasticityValue}
        onElasticityChange={setElasticityValue}
        activeSchema={activeSchema}
        onSchemaChange={setActiveSchema}
        multiSelectMode={multiSelectMode}
        onMultiSelectChange={handleMultiSelectChange}
        matrixMode={matrixMode}
        onMatrixModeChange={handleMatrixModeChange}
        matrixSchemaOrder={matrixSchemaOrder}
        onMatrixSchemaToggle={handleMatrixSchemaToggle}
      />

      {/* Navbar */}
      <Navbar toggleSidebar={toggleSidebar} showMenuButton={true} currentProduct="engagesync" />

      {/* Main content */}
      <div className="lg:ml-[320px] pt-16">
        <div className="p-4 sm:p-6 space-y-5">

          {/* ── Page Header ─────────────────────────────────────── */}
          <div className="bg-card-bg rounded-lg p-3 sm:p-4 shadow-premium-md border border-border-gray">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h1 className="text-lg sm:text-xl font-bold text-primary-text">Segmentation Schema</h1>
                <p className="text-xs sm:text-sm text-muted-text">
                  {multiSelectMode
                    ? 'Multi-Select mode active — showing full segmentation matrix.'
                    : 'Select a segmentation model to view and manage customer segments and their treatments.'}
                </p>
              </div>
              {/* Active filter badges */}
              <div className="flex flex-wrap items-center gap-2">
                {cltvValue !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                    CLTV: {cltvValue}
                    <button onClick={() => setCltvValue('All')} className="hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {elasticityValue !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold">
                    Elasticity: {elasticityValue}
                    <button onClick={() => setElasticityValue('All')} className="hover:text-violet-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {multiSelectMode && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                    Multi-Select ON
                  </span>
                )}
                {matrixMode && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold">
                    2×2 Matrix ON
                    {matrixSchemaOrder.length > 0 && (
                      <span className="ml-1 font-normal opacity-80">({matrixSchemaOrder.length}/4 selected)</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Segment + Treatment Boxes (only in single-select mode) ── */}
          {!multiSelectMode && activeSchema && (() => {
            const schema = SCHEMA_DATA[activeSchema];
            const colors = COLOR_MAP[schema.color];
            const Icon = schema.icon;
            return (
              <div className="bg-card-bg rounded-lg p-4 sm:p-6 shadow-premium-md border border-border-gray w-full lg:w-1/2">
                {/* Section header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors.iconBg}`}>
                    <Icon className={`w-4.5 h-4.5 ${colors.iconColor}`} strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-primary-text">{schema.label} Schema</h2>
                    <p className="text-xs text-muted-text">{schema.description}</p>
                  </div>
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${colors.segBadge.split(' ')[0]}`}></span>
                    <span className="text-xs font-bold text-muted-text uppercase tracking-wider">Segments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${colors.treatBadge.split(' ')[0]}`}></span>
                    <span className="text-xs font-bold text-muted-text uppercase tracking-wider">Treatments</span>
                  </div>
                </div>

                {/* Paired rows */}
                <div className="space-y-3">
                  {schema.segments.map((seg, idx) => {
                    const treat = schema.treatments[idx];
                    return (
                      <div key={seg.id} className="grid grid-cols-2 gap-3 sm:gap-4">
                        {/* Segment box */}
                        <button
                          onClick={() => openSegmentPopup(activeSchema, seg)}
                          className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md active:scale-95 group ${colors.segBg}`}
                          type="button"
                        >
                          <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs ${colors.segBadge}`}>
                            {seg.label}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[11px] sm:text-xs font-bold ${colors.segText} truncate`}>{seg.label}</p>
                            <p className="text-[10px] text-muted-text truncate">{seg.description}</p>
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${colors.segText} opacity-0 group-hover:opacity-100 transition-opacity`} />
                        </button>

                        {/* Treatment box */}
                        {treat ? (
                          <button
                            onClick={() => openTreatmentPopup(activeSchema, treat)}
                            className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md active:scale-95 group ${colors.treatBg}`}
                            type="button"
                          >
                            <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs ${colors.treatBadge}`}>
                              {treat.label}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-[11px] sm:text-xs font-bold ${colors.treatText} truncate`}>{treat.label}</p>
                              <p className="text-[10px] text-muted-text truncate">{treat.description}</p>
                            </div>
                            <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${colors.treatText} opacity-0 group-hover:opacity-100 transition-opacity`} />
                          </button>
                        ) : (
                          <div className="rounded-lg border-2 border-dashed border-border-gray p-2.5 sm:p-3 flex items-center justify-center">
                            <span className="text-[10px] text-muted-text italic">No treatment</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ── Empty state (no schema selected, single-select mode only) ─── */}
          {!activeSchema && !multiSelectMode && !matrixMode && (
            <div className="bg-card-bg rounded-lg p-10 sm:p-16 shadow-premium-md border border-border-gray text-center w-full lg:w-1/2">
              <div className="w-16 h-16 bg-gradient-light rounded-xl flex items-center justify-center mx-auto mb-5 border border-border-gray">
                <Users className="w-8 h-8 text-secondary-text" strokeWidth={2} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-primary-text mb-2">
                Choose a Segmentation Schema
              </h2>
              <p className="text-sm text-muted-text max-w-sm mx-auto">
                Select a schema from the left sidebar to view the segments and their assigned treatments.
              </p>
            </div>
          )}

          {/* ── Multi-Select Matrix ──────────────────────────────── */}
          {multiSelectMode && (
            <div className="bg-card-bg rounded-lg shadow-premium-md border border-border-gray w-full">

              <div className="p-4 sm:p-5 space-y-5">
                {/* ── Top Filter Row: RFM (left) + Lifecycle (right) ── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
                  {/* RFM Dropdown */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-muted-text uppercase tracking-wider">RFM Segment</label>
                    <select
                      value={selectedRfm.id}
                      onChange={e => setSelectedRfm(RFM_SEGMENTS.find(r => r.id === e.target.value))}
                      className="px-3 py-2 border-2 border-indigo-200 bg-indigo-50 text-indigo-800 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors min-w-[160px]"
                    >
                      {RFM_SEGMENTS.map(r => (
                        <option key={r.id} value={r.id}>{r.label} (Score {r.score}, {r.count.toLocaleString()} customers)</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1" />

                  {/* Lifecycle Dropdown */}
                  <div className="flex flex-col gap-1 sm:items-end">
                    <label className="text-[10px] font-bold text-muted-text uppercase tracking-wider">Lifecycle Segment</label>
                    <select
                      value={selectedLifecycle.id}
                      onChange={e => setSelectedLifecycle(LIFECYCLE_SEGMENTS.find(l => l.id === e.target.value))}
                      className="px-3 py-2 border-2 border-emerald-200 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer transition-colors min-w-[190px]"
                    >
                      {LIFECYCLE_SEGMENTS.map(l => (
                        <option key={l.id} value={l.id}>{l.label} (Score {l.score}, {l.count.toLocaleString()} customers)</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selected filter pills */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                    RFM: {selectedRfm.label}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                    Lifecycle: {selectedLifecycle.label}
                  </span>
                </div>

                {/* ── Matrix Table ── */}
                <div className="overflow-x-auto rounded-lg border border-gray-300">
                  <table className="w-full text-xs border-collapse" style={{ minWidth: 700 }}>
                    <thead>
                      {/* Behaviour header */}
                      <tr>
                        <td className="border border-gray-300 bg-gray-50 p-2" rowSpan={2} />
                        <td className="border border-gray-300 bg-gray-50 p-2" rowSpan={2} />
                        <td
                          colSpan={BEHAVIOUR_SEGMENTS.length + 1}
                          className="border border-gray-300 bg-amber-50 text-amber-800 font-bold text-center py-2 px-3 tracking-wide"
                        >
                          Behaviour Segments
                        </td>
                      </tr>
                      <tr>
                        {BEHAVIOUR_SEGMENTS.map(b => (
                          <th
                            key={b.id}
                            className="border border-gray-300 bg-amber-50 text-amber-900 font-semibold py-2 px-2 text-center whitespace-nowrap"
                          >
                            {b.label}
                            <br />
                            <span className="text-[9px] font-normal text-amber-600">({b.count.toLocaleString()})</span>
                          </th>
                        ))}
                        <th className="border border-gray-300 bg-gray-100 text-gray-700 font-bold py-2 px-3 text-center">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {LOYALTY_SEGMENTS.map((lo, loIdx) => {
                        const rowTotal = BEHAVIOUR_SEGMENTS.reduce(
                          (sum, bh) => sum + getCellValue(selectedRfm.score, lo.score, bh.score, selectedLifecycle.score),
                          0
                        );
                        return (
                          <tr key={lo.id}>
                            {/* Row span label for "Loyalty Segments" */}
                            {loIdx === 0 && (
                              <td
                                rowSpan={LOYALTY_SEGMENTS.length + 1}
                                className="border border-gray-300 bg-rose-50 text-rose-800 font-bold text-center"
                                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', minWidth: 28, padding: '8px 4px' }}
                              >
                                Loyalty Segments
                              </td>
                            )}
                            <td className="border border-gray-300 bg-rose-50 text-rose-900 font-semibold py-2 px-3 whitespace-nowrap">
                              {lo.label}
                              <br />
                              <span className="text-[9px] font-normal text-rose-500">({lo.count.toLocaleString()})</span>
                            </td>
                            {BEHAVIOUR_SEGMENTS.map(bh => {
                              const val = getCellValue(selectedRfm.score, lo.score, bh.score, selectedLifecycle.score);
                              const intensity = Math.min(255, Math.round((val / 1000) * 255));
                              return (
                                <td
                                  key={bh.id}
                                  className="border border-gray-300 text-center py-2 px-2 font-medium transition-colors"
                                  style={{
                                    backgroundColor: val > 0
                                      ? `rgba(99,102,241,${0.05 + (val / 1000) * 0.35})`
                                      : '#f9fafb',
                                    color: val > 600 ? '#3730a3' : '#374151',
                                  }}
                                >
                                  {val.toLocaleString()}
                                </td>
                              );
                            })}
                            <td className="border border-gray-300 bg-gray-50 text-center font-bold text-gray-800 py-2 px-3">
                              {rowTotal.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                      {/* Column totals row */}
                      <tr>
                        <td className="border border-gray-300 bg-gray-100 text-gray-700 font-bold text-center py-2 px-3" colSpan={1}>Total</td>
                        {BEHAVIOUR_SEGMENTS.map(bh => {
                          const colTotal = LOYALTY_SEGMENTS.reduce(
                            (sum, lo) => sum + getCellValue(selectedRfm.score, lo.score, bh.score, selectedLifecycle.score),
                            0
                          );
                          return (
                            <td key={bh.id} className="border border-gray-300 bg-gray-100 text-center font-bold text-gray-800 py-2 px-2">
                              {colTotal.toLocaleString()}
                            </td>
                          );
                        })}
                        <td className="border border-gray-300 bg-gray-200 text-center font-bold text-gray-900 py-2 px-3">
                          {LOYALTY_SEGMENTS.reduce((sum, lo) =>
                            sum + BEHAVIOUR_SEGMENTS.reduce((s2, bh) =>
                              s2 + getCellValue(selectedRfm.score, lo.score, bh.score, selectedLifecycle.score), 0), 0
                          ).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>


              </div>
            </div>
          )}

          {/* ── 2x2 Matrix Mode ─────────────────────────────────── */}
          {matrixMode && (() => {
            const count = matrixSchemaOrder.length;
            const schemaLabel = (id) => id === 'lifecycle' ? 'Life Cycle' : id ? id.charAt(0).toUpperCase() + id.slice(1) : '';
            return (
              <div className="space-y-6">

                {/* 0 selected — welcome prompt */}
                {count === 0 && (
                  <div className="bg-card-bg rounded-lg p-12 shadow-premium-md border border-border-gray text-center">
                    <div className="w-16 h-16 bg-violet-50 border border-violet-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <LayoutGrid className="w-8 h-8 text-violet-400" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-lg font-bold text-primary-text mb-1">2×2 Matrix Mode Active</h2>
                    <p className="text-sm text-muted-text">Select <span className="font-semibold text-violet-600">2 schemas</span> from the sidebar to build your first matrix.</p>
                    <p className="text-xs text-muted-text mt-1">Select all 4 for a double-matrix dashboard.</p>
                  </div>
                )}

                {/* 1 selected — waiting for second */}
                {count === 1 && (
                  <div className="bg-card-bg rounded-lg p-10 shadow-premium-md border border-violet-200 text-center">
                    <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">①</span>
                    </div>
                    <p className="text-sm font-semibold text-violet-700 mb-1">
                      {schemaLabel(matrixSchemaOrder[0])} selected as Y-axis (rows)
                    </p>
                    <p className="text-xs text-muted-text">Select <span className="font-semibold text-violet-600">1 more schema</span> from the sidebar to set the X-axis (columns).</p>
                  </div>
                )}

                {/* 2 or more — show first matrix */}
                {count >= 2 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-indigo-500 rounded-full" />
                      <p className="text-xs font-bold text-muted-text uppercase tracking-wider">
                        Matrix 1 — {schemaLabel(matrixSchemaOrder[0])} vs {schemaLabel(matrixSchemaOrder[1])}
                      </p>
                    </div>
                    <MatrixPanel ySchemaId={matrixSchemaOrder[0]} xSchemaId={matrixSchemaOrder[1]} />
                  </div>
                )}

                {/* 3 selected — waiting for fourth */}
                {count === 3 && (
                  <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 text-center">
                    <p className="text-xs font-semibold text-violet-700">
                      {schemaLabel(matrixSchemaOrder[2])} selected — select <span className="font-semibold">1 more</span> schema to build a second matrix.
                    </p>
                  </div>
                )}

                {/* 4 selected — show second matrix */}
                {count === 4 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-violet-500 rounded-full" />
                      <p className="text-xs font-bold text-muted-text uppercase tracking-wider">
                        Matrix 2 — {schemaLabel(matrixSchemaOrder[2])} vs {schemaLabel(matrixSchemaOrder[3])}
                      </p>
                    </div>
                    <MatrixPanel ySchemaId={matrixSchemaOrder[2]} xSchemaId={matrixSchemaOrder[3]} />
                  </div>
                )}

              </div>
            );
          })()}

          {/* ── Decision Segment Action Agenda ───────────────────── */}
          {(multiSelectMode || matrixMode) && (
            <div className="w-full">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <h2 className="text-base sm:text-lg font-bold text-primary-text">Decision Segment Action Agenda</h2>
                <button
                  type="button"
                  onClick={() => alert('PriceGenix Customer Portfolio — coming soon!')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-1.5 rounded-lg text-xs font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 2px 8px rgba(99,102,241,0.35)' }}
                >
                  PriceGenix (Customer Portfolio)
                </button>
              </div>

              {/* Table card — overflow-x-auto keeps it scrollable on mobile */}
              <div className="bg-card-bg rounded-lg shadow-premium-md border border-border-gray w-full overflow-x-auto">
                <table className="w-full text-xs border-collapse" style={{ minWidth: 520 }}>
                  <thead>
                    {/* "Strategic Action" spanning L1/L2/L3 */}
                    <tr>
                      <th className="border border-gray-300 bg-gray-50 py-2 px-3" rowSpan={2} style={{ textAlign: 'left' }}>
                        Decision Segment
                      </th>
                      <th className="border border-gray-300 bg-gray-50 py-2 px-3" rowSpan={2} style={{ textAlign: 'left' }}>
                        Action
                      </th>
                      <th
                        colSpan={3}
                        className="border border-gray-300 bg-indigo-50 font-bold text-center py-2 px-3 text-indigo-800 tracking-wide"
                      >
                        Strategic Action
                      </th>
                    </tr>
                    <tr>
                      <th className="border border-gray-300 bg-indigo-50 font-semibold py-2 px-3 text-center text-indigo-700">L1</th>
                      <th className="border border-gray-300 bg-indigo-50 font-semibold py-2 px-3 text-center text-indigo-700">L2</th>
                      <th className="border border-gray-300 bg-indigo-50 font-semibold py-2 px-3 text-center text-indigo-700">L3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { ds: 'Decision Segment 1', action: 'Retain, Cross-sell, Up-sell', l1: 'Community, Early access', l2: 'Loyalty programs', l3: '' },
                      { ds: 'Decision Segment 2', action: 'Retain, Cross-sell, Up-sell', l1: 'Community, Early access', l2: 'Loyalty programs', l3: '' },
                      { ds: 'Decision Segment 3', action: 'Basket Growth & Cross-Sell', l1: 'Brand reinforcement', l2: 'Purchase Convenience', l3: '' },
                      { ds: 'Decision Segment 4', action: 'Basket Growth & Cross-Sell', l1: 'Brand reinforcement', l2: 'Selective Discount Coupon', l3: 'Nudge & convert' },
                      { ds: 'Decision Segment 5', action: 'Basket Growth & Cross-Sell', l1: 'Brand reinforcement', l2: 'Purchase Convenience', l3: 'Selective Discount Coupon' },
                      { ds: 'Decision Segment 6', action: 'Nudge & Convert', l1: 'Brand reinforcement', l2: 'Selective Wallet Cashback', l3: '' },
                      { ds: 'Decision Segment 7', action: 'Nudge & Convert', l1: 'Nudge & convert', l2: 'Selective Wallet Cashback', l3: '' },
                      { ds: 'Decision Segment 8', action: 'Nudge & Convert', l1: 'Product Content', l2: '', l3: 'Selective Wallet Cashback' },
                      { ds: 'Decision Segment 9', action: 'Low-Cost Engagement', l1: 'Content', l2: '', l3: 'Selective Wallet Cashback' },
                      { ds: 'Decision Segment 10', action: 'Low-Cost Engagement', l1: 'Content', l2: '', l3: '' },
                    ].map((row, idx) => {
                      const theme = row.action.startsWith('Retain')
                        ? { rowBg: '#f5f7ff', dsAccent: '#6366f1', dsBg: '#eef0fd', dsText: '#3730a3', actionBg: '#e0e7ff', actionText: '#4338ca', pill: '#f0f4ff', pillBorder: '#c7d2fe', pillText: '#4338ca' }
                        : row.action.startsWith('Basket')
                          ? { rowBg: '#fffbf0', dsAccent: '#f59e0b', dsBg: '#fef9ee', dsText: '#92400e', actionBg: '#fef3c7', actionText: '#b45309', pill: '#fffbeb', pillBorder: '#fde68a', pillText: '#92400e' }
                          : row.action.startsWith('Nudge')
                            ? { rowBg: '#faf5ff', dsAccent: '#8b5cf6', dsBg: '#f5f0ff', dsText: '#5b21b6', actionBg: '#ede9fe', actionText: '#6d28d9', pill: '#f5f3ff', pillBorder: '#ddd6fe', pillText: '#5b21b6' }
                            : { rowBg: '#f0fdf9', dsAccent: '#10b981', dsBg: '#ecfdf5', dsText: '#065f46', actionBg: '#d1fae5', actionText: '#047857', pill: '#f0fdf4', pillBorder: '#a7f3d0', pillText: '#065f46' };

                      const Pill = ({ val }) => val
                        ? <span style={{ display: 'inline-block', background: theme.pill, border: `1px solid ${theme.pillBorder}`, color: theme.pillText, borderRadius: 4, padding: '1px 7px', fontWeight: 500 }}>{val}</span>
                        : <span style={{ color: '#d1d5db' }}>—</span>;

                      return (
                        <tr key={idx} style={{ background: theme.rowBg }}>
                          <td className="border border-gray-300 py-2 px-3 font-semibold whitespace-nowrap" style={{ background: theme.dsBg, borderLeft: `4px solid ${theme.dsAccent}`, color: theme.dsText }}>{row.ds}</td>
                          <td className="border border-gray-300 py-2 px-3">
                            <span style={{ display: 'inline-block', background: theme.actionBg, color: theme.actionText, borderRadius: 20, padding: '2px 10px', fontWeight: 600, fontSize: 11 }}>{row.action}</span>
                          </td>
                          <td className="border border-gray-300 py-2 px-3 text-center"><Pill val={row.l1} /></td>
                          <td className="border border-gray-300 py-2 px-3 text-center"><Pill val={row.l2} /></td>
                          <td className="border border-gray-300 py-2 px-3 text-center"><Pill val={row.l3} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Popups */}
      {renderPopup()}
    </div>
  );
};

export default EngageSync;
