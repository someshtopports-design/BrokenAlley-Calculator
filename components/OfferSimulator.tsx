import React, { useState, useEffect } from 'react';
import { InputData, EconomicResults } from '../types';
import { calculateEconomics } from '../utils/calculations';

interface Props {
  baseData: InputData;
  baseResults: EconomicResults;
}

export const OfferSimulator: React.FC<Props> = ({ baseData, baseResults }) => {
  const [scenarios, setScenarios] = useState<Array<{ discount: number, results: EconomicResults }>>([]);

  useEffect(() => {
    const discounts = [0, 5, 10, 15, 20, 25, 30, 40, 50];
    const newScenarios = discounts.map(discount => {
      const discountedPrice = baseData.sellingPrice * (1 - discount / 100);
      const newData = { ...baseData, sellingPrice: discountedPrice };
      return {
        discount,
        results: calculateEconomics(newData)
      };
    });
    setScenarios(newScenarios);
  }, [baseData]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Offer Intelligence Engine</h3>
        <p className="text-gray-400 text-sm">
          Calculating profitability across different discount tiers. 
          Use this to decide your "Summer Sale" or "Black Friday" limits.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-950/50">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Discount</th>
              <th className="px-4 py-3">New Price</th>
              <th className="px-4 py-3">Profit/Unit</th>
              <th className="px-4 py-3">Margin %</th>
              <th className="px-4 py-3">To match Profit</th>
              <th className="px-4 py-3 rounded-tr-lg">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {scenarios.map((row) => {
              const isBase = row.discount === 0;
              const profitDiff = row.results.netProfit - baseResults.netProfit;
              // Volume multiplier needed to match base absolute profit total
              // BaseProfit * 1 = NewProfit * X => X = BaseProfit / NewProfit
              let volumeMultiplier = 0;
              if (row.results.netProfit > 0 && baseResults.netProfit > 0) {
                 volumeMultiplier = baseResults.netProfit / row.results.netProfit;
              }

              let statusColor = "text-green-500";
              let statusText = "Profitable";
              
              if (row.results.netProfit <= 0) {
                statusColor = "text-red-500 font-bold";
                statusText = "LOSS MAKING";
              } else if (row.results.netMarginPercent < 10) {
                statusColor = "text-yellow-500";
                statusText = "Risky Low Margin";
              }

              return (
                <tr key={row.discount} className={`hover:bg-gray-800/50 transition-colors ${isBase ? 'bg-brand-900/20' : ''}`}>
                  <td className="px-4 py-4 font-medium text-white">
                    {row.discount}% {isBase && <span className="ml-2 text-[10px] bg-brand-500 text-white px-1.5 py-0.5 rounded">CURRENT</span>}
                  </td>
                  <td className="px-4 py-4 text-gray-300">₹{row.results.revenueExGST.toFixed(0)} <span className="text-xs text-gray-500">(Ex-GST)</span></td>
                  <td className={`px-4 py-4 font-mono ${row.results.netProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{row.results.netProfit.toFixed(0)}
                  </td>
                  <td className="px-4 py-4 text-gray-300">
                    {row.results.netMarginPercent.toFixed(1)}%
                  </td>
                  <td className="px-4 py-4 text-gray-400">
                    {volumeMultiplier > 0 && row.discount > 0 ? (
                       <span>Sell <strong className="text-white">{volumeMultiplier.toFixed(1)}x</strong> more units</span>
                    ) : (
                      <span className="text-gray-600">-</span>
                    )}
                  </td>
                  <td className={`px-4 py-4 text-xs font-semibold ${statusColor}`}>
                    {statusText}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-brand-900/20 border border-brand-500/30 rounded-lg">
        <h4 className="text-sm font-bold text-brand-400 mb-2">Strategy Tip</h4>
        <p className="text-sm text-gray-300">
          Typically, a <strong>20-30% discount</strong> is the sweet spot for clearance, but ensure you don't drop below your break-even point 
          of <strong className="text-white">₹{baseResults.breakEvenPrice.toFixed(0)}</strong>. 
          If you offer 50% off, you likely enter loss territory unless your COGS is extremely low.
        </p>
      </div>
    </div>
  );
};
