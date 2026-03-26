import React, { createContext, useContext, useState } from 'react';

/**
 * AppStateContext — lightweight in-memory store for background state.
 *
 * Survives React-Router navigation (context never unmounts while BrowserRouter lives).
 * Resets automatically on tab close / full-page refresh (no sessionStorage / localStorage).
 *
 * Holds runtime-only state for PriceGenix and MarketEdge:
 *   isOptimizing, hasResults, resultsData, optimizationError, and tool-specific extras.
 *
 * Existing localStorage logic in each page is LEFT UNTOUCHED — this is purely additive.
 */

const AppStateContext = createContext(null);

const initialToolState = {
  isOptimizing: false,
  hasResults: false,
  resultsData: [],
  optimizationError: null,
};

export const AppStateProvider = ({ children }) => {
  const [pricegenix, setPricegenixRaw] = useState({
    ...initialToolState,
    optimizationSummary: null,
    portfolioTotals: [],
  });

  const [marketedge, setMarketedgeRaw] = useState({
    ...initialToolState,
    optimizationMetadata: null,
  });

  /** Merge-patch helper — only update the keys you pass */
  const setPricegenixState = (patch) =>
    setPricegenixRaw((prev) => ({ ...prev, ...patch }));

  const setMarketedgeState = (patch) =>
    setMarketedgeRaw((prev) => ({ ...prev, ...patch }));

  return (
    <AppStateContext.Provider
      value={{ pricegenix, setPricegenixState, marketedge, setMarketedgeState }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
};
