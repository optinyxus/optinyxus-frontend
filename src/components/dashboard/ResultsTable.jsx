import React from 'react';
import { Download, TrendingUp } from 'lucide-react';

const ResultsTable = ({ data, onDownload }) => {
  return (
    <div className="bg-card-bg rounded-2xl p-4 lg:p-6 shadow-premium-md border border-border-gray">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base lg:text-lg font-bold text-primary-text">Optimized Results</h2>
          <p className="text-xs text-muted-text mt-0.5">View and download optimization results</p>
        </div>
        <button
          onClick={onDownload}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-dark text-white rounded-xl hover:shadow-premium-lg transition-all duration-300 hover:scale-105 shadow-premium-md whitespace-nowrap"
        >
          <Download className="w-4 h-4" strokeWidth={2} />
          <span className="text-sm font-semibold">Download CSV</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border-gray">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gradient-light">
            <tr className="border-b border-border-gray">
              <th className="px-4 py-3 text-left text-xs font-bold text-primary-text whitespace-nowrap">Article</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-primary-text whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-primary-text whitespace-nowrap">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-primary-text whitespace-nowrap">MOP</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-primary-text whitespace-nowrap">NLC</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-primary-text whitespace-nowrap">Max Price</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-primary-text whitespace-nowrap">Min Price</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-primary-text whitespace-nowrap">Reco. Price</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-primary-text whitespace-nowrap">Discount</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-primary-text whitespace-nowrap">Discount %</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-primary-text whitespace-nowrap">Units</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-primary-text whitespace-nowrap">DR</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.length === 0 ? (
              <tr>
                <td colSpan="12" className="px-4 py-12 text-center text-muted-text">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gradient-light rounded-xl flex items-center justify-center border border-border-gray">
                      <TrendingUp className="w-6 h-6 text-muted-text" />
                    </div>
                    <p className="font-medium">No data available</p>
                    <p className="text-xs">Run optimization to see results</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={index} className="border-b border-border-gray hover:bg-hover-gray transition-colors">
                  <td className="px-4 py-3 text-sm text-primary-text font-semibold whitespace-nowrap">{row.article}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      row.status === 'Completed' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-primary-text font-medium">{row.stock}</td>
                  <td className="px-4 py-3 text-sm text-primary-text font-medium">{row.mop}</td>
                  <td className="px-4 py-3 text-sm text-primary-text font-medium">{row.nlc}</td>
                  <td className="px-4 py-3 text-sm text-primary-text font-medium">{row.maxPrice}</td>
                  <td className="px-4 py-3 text-sm text-primary-text font-medium">{row.minPrice}</td>
                  <td className="px-4 py-3 text-sm font-bold text-chart-green">{row.recoPrice}</td>
                  <td className="px-4 py-3 text-sm text-primary-text font-medium">{row.discount}</td>
                  <td className="px-4 py-3 text-sm text-primary-text font-medium">{row.discountPercent}%</td>
                  <td className="px-4 py-3 text-sm text-primary-text font-medium">{row.units}</td>
                  <td className="px-4 py-3 text-sm text-primary-text font-medium">{row.dr}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
