import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, ReferenceLine } from 'recharts';
import { EconomicResults, InputData } from '../types';

interface Props {
  results: EconomicResults;
  data: InputData;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

export const ProfitVisualizer: React.FC<Props> = ({ results, data }) => {
  
  const costBreakdownData = [
    { name: 'Product & Pkg', value: results.totalCOGS },
    { name: 'Marketing (Net)', value: results.totalMarketing },
    { name: 'Logistics', value: results.totalOpsCost - results.platformFee - results.returnOverheadCost }, // Pure logistics
    { name: 'Return Waste', value: results.returnOverheadCost },
    { name: 'Platform Fees', value: results.platformFee },
    { name: 'GST & Tax', value: results.gstAmount + results.incomeTaxEstimate },
    { name: 'Net Profit', value: results.netProfit },
  ].filter(x => x.value > 0); // Hide 0 value items

  // Simplified waterfall for clarity
  const waterfallData = [
    { name: 'MRP', uv: data.sellingPrice, fill: '#3b82f6' },
    { name: 'GST', uv: -results.gstAmount, fill: '#64748b' },
    { name: 'Returns', uv: -results.returnOverheadCost, fill: '#ef4444' },
    { name: 'Platform', uv: -results.platformFee, fill: '#ef4444' },
    { name: 'Mkt & Ops', uv: -(results.totalMarketing + results.totalOpsCost - results.platformFee - results.returnOverheadCost), fill: '#f59e0b' },
    { name: 'COGS', uv: -results.totalCOGS, fill: '#f59e0b' },
    { name: 'Net Profit', uv: results.netProfit, fill: '#10b981' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Chart 1: The Money Pie */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Cost Structure (Per Net Sale)</h3>
        <div className="h-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={costBreakdownData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {costBreakdownData.map((entry, index) => (
                   // Make Net Profit Green if positive, Red if negative (though Pie can't show negative, value should be abs in pre-calc if we wanted, but here we filter > 0)
                  <Cell key={`cell-${index}`} fill={entry.name === 'Net Profit' ? '#10b981' : (entry.name === 'Return Waste' ? '#ef4444' : COLORS[index % COLORS.length])} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`₹${value.toFixed(0)}`, 'Amount']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <span className="text-xs text-gray-400">Net Profit</span>
             <span className={`text-xl font-bold ${results.netProfit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {((results.netProfit / data.sellingPrice) * 100).toFixed(1)}%
             </span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {costBreakdownData.map((item, idx) => (
            <div key={item.name} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.name === 'Net Profit' ? '#10b981' : (item.name === 'Return Waste' ? '#ef4444' : COLORS[idx % COLORS.length]) }}></div>
                <span className="text-gray-300">{item.name}</span>
              </div>
              <span className="font-mono text-gray-100">₹{item.value.toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 2: Waterfall / Flow */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Margin Erosion Waterfall</h3>
        <div className="h-64 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={waterfallData}>
               <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
               <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
               <Tooltip 
                 cursor={{fill: 'transparent'}}
                 contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                 formatter={(value: number) => [`₹${value.toFixed(0)}`, 'Value']}
               />
               <ReferenceLine y={0} stroke="#475569" />
               <Bar dataKey="uv">
                  {waterfallData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
        </div>
        <div className="mt-4 text-xs text-gray-400">
           <p>Look at the red bars. "Returns" and "Platform" fees are often the silent killers of D2C brands. This chart highlights how much they eat into your MRP.</p>
        </div>
      </div>

    </div>
  );
};