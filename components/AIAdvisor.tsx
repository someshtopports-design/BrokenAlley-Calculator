import React, { useState } from 'react';
import { InputData, EconomicResults } from '../types';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Loader2, Lock } from 'lucide-react';

interface Props {
  data: InputData;
  results: EconomicResults;
}

export const AIAdvisor: React.FC<Props> = ({ data, results }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    if (!import.meta.env.VITE_API_KEY) {
      setError("API Key not configured in environment. Make sure VITE_API_KEY is set.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
      
      const prompt = `
        Act as a ruthless, highly intelligent Silicon Valley CFO advising a streetwear clothing brand named "Broken Alley".
        
        Analyze the following Unit Economics (calculated per NET sold unit, accounting for returns):

        **Sales Logic:**
        Selling Price (MRP): ₹${data.sellingPrice}
        Return Rate (RTO): ${data.returnRatePercent}%
        Units Shipped per Sale: ${results.grossUnitsForOneSale.toFixed(2)}
        
        **Costs:**
        Product Cost (COGS): ₹${data.productCost}
        Marketing Cost (CAC): ₹${results.totalMarketing.toFixed(0)} (scaled for returns)
        Platform Commission: ₹${results.platformFee.toFixed(0)} (${data.platformCommissionPercent}%)
        Return Waste (Logistics Loss): ₹${results.returnOverheadCost.toFixed(0)}
        
        **Results:**
        Net Profit: ₹${results.netProfit.toFixed(0)}
        Net Margin: ${results.netMarginPercent.toFixed(2)}%
        Break Even Price: ₹${results.breakEvenPrice.toFixed(0)}
        Capital Required (Inventory): ₹${(results.capitalRequired/1000).toFixed(1)}k

        Provide a strategic critique.
        1. Is the business model sustainable with this return rate and commission structure?
        2. Specifically critique the "Return Waste" - is it too high?
        3. Suggest 3 specific, brutal actions to improve cash flow or margin.
        4. Give a "Survival Rating" out of 10.
        
        Keep the tone professional, direct, slightly edgy (Silicon Valley style), and concise. Format with Markdown.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setAnalysis(response.text);
    } catch (err) {
      console.error(err);
      setError("Failed to contact the AI CFO. Please check your connection or API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            CFO Intelligence
          </h3>
          <p className="text-gray-400 text-sm">
            Powered by Google Gemini 2.5
          </p>
        </div>
        {!analysis && !loading && (
          <button 
            onClick={generateReport}
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Analyze Financials
          </button>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
          <p className="text-gray-400 animate-pulse">Crunching numbers...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg text-red-200 flex items-center gap-3">
          <Lock className="w-5 h-5" />
          {error}
        </div>
      )}

      {analysis && !loading && (
        <div className="prose prose-invert prose-sm max-w-none">
          <div className="bg-gray-950 p-6 rounded-lg border border-gray-800">
             <div className="whitespace-pre-wrap leading-relaxed font-mono text-gray-300">
               {analysis}
             </div>
          </div>
          <button 
            onClick={generateReport}
            className="mt-6 text-brand-500 hover:text-brand-400 text-sm font-medium"
          >
            Run New Analysis
          </button>
        </div>
      )}
      
      {!analysis && !loading && !error && (
        <div className="text-center py-20 text-gray-600">
          <p>Click "Analyze Financials" to get a deep-dive AI report on your current unit economics.</p>
        </div>
      )}
    </div>
  );
};