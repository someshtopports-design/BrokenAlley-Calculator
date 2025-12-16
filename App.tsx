import React, { useState, useMemo, useEffect } from 'react';
import { LayoutDashboard, Calculator, Zap, TrendingUp, AlertTriangle, Share2, Check, Link as LinkIcon, Edit2 } from 'lucide-react';
import { FinancialInputs } from './components/FinancialInputs';
import { ProfitVisualizer } from './components/ProfitVisualizer';
import { OfferSimulator } from './components/OfferSimulator';
import { AIAdvisor } from './components/AIAdvisor';
import { calculateEconomics } from './utils/calculations';
import { InputData, EconomicResults } from './types';

const INITIAL_DATA: InputData = {
  scenarioName: "Base Case v1",
  sellingPrice: 2499,
  productCost: 650,
  packagingCost: 40,
  marketingCostPerUnit: 500,
  shippingCost: 120,
  paymentGatewayPercent: 2,
  returnRatePercent: 15,
  returnShippingCost: 100,
  platformCommissionPercent: 0,
  photoshootCostTotal: 15000,
  samplingCostTotal: 5000,
  estimatedBatchSize: 100,
  gstRate: 12,
  incomeTaxRate: 30,
};

export default function App() {
  // 1. Initialize State (Priority: URL -> LocalStorage -> Default)
  const [data, setData] = useState<InputData>(() => {
    // Check URL Params first (Deep Link)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const encodedData = params.get('s');
      if (encodedData) {
        try {
          const decoded = JSON.parse(decodeURIComponent(atob(encodedData)));
          return { ...INITIAL_DATA, ...decoded }; // Merge to ensure new fields exist
        } catch (e) {
          console.error("Failed to parse URL data", e);
        }
      }
      
      // Check LocalStorage
      const saved = localStorage.getItem('ba_financial_os_v1');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved data", e);
        }
      }
    }
    return INITIAL_DATA;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'simulator' | 'ai'>('dashboard');
  const [justCopied, setJustCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const results: EconomicResults = useMemo(() => calculateEconomics(data), [data]);

  // 2. Auto-Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('ba_financial_os_v1', JSON.stringify(data));
  }, [data]);

  // 3. Share Functionality
  const handleShare = () => {
    const jsonString = JSON.stringify(data);
    const encoded = btoa(encodeURIComponent(jsonString));
    const url = `${window.location.origin}${window.location.pathname}?s=${encoded}`;
    
    navigator.clipboard.writeText(url).then(() => {
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000);
      
      // Also update URL without reload so the user sees the shareable state
      window.history.pushState({}, '', `?s=${encoded}`);
    });
  };

  return (
    <div className="min-h-screen bg-brand-950 text-gray-100 font-sans selection:bg-brand-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-brand-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center h-auto md:h-16 py-4 md:py-0 gap-4">
            
            {/* Logo & Scenario Name */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center transform -rotate-6 shadow-lg shadow-brand-500/20">
                <span className="font-mono font-bold text-white">B</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 group">
                   {isEditingName ? (
                     <input 
                       autoFocus
                       type="text" 
                       value={data.scenarioName}
                       onChange={(e) => setData({ ...data, scenarioName: e.target.value })}
                       onBlur={() => setIsEditingName(false)}
                       onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                       className="bg-gray-900 border border-gray-700 rounded px-2 py-0.5 text-sm font-bold text-white focus:ring-2 focus:ring-brand-500 outline-none"
                     />
                   ) : (
                     <h1 
                       onClick={() => setIsEditingName(true)}
                       className="text-sm font-bold tracking-tight text-white cursor-pointer hover:text-brand-400 flex items-center gap-2 transition-colors"
                     >
                       {data.scenarioName}
                       <Edit2 className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                     </h1>
                   )}
                </div>
                <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">Broken Alley Financial OS</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex bg-gray-900/50 p-1 rounded-lg border border-gray-800">
                {[
                  { id: 'dashboard', label: 'Economics', icon: LayoutDashboard },
                  { id: 'simulator', label: 'Offers', icon: Calculator },
                  { id: 'ai', label: 'AI CFO', icon: Zap },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-gray-800 text-brand-500 border border-gray-700 shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <tab.icon className="w-3 h-3" />
                    {tab.label}
                  </button>
                ))}
              </nav>

              <button
                onClick={handleShare}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all transform active:scale-95 ${
                  justCopied 
                    ? 'bg-green-500/10 text-green-500 border border-green-500/50' 
                    : 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                }`}
              >
                {justCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {justCopied ? 'Link Copied!' : 'Share'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <KpiCard 
            label="Net Profit (Sold Unit)" 
            value={`₹${results.netProfit.toFixed(0)}`} 
            subValue={`${results.netMarginPercent.toFixed(1)}% Net Margin`}
            positive={results.netProfit > 0}
            highlight
          />
          <KpiCard 
            label="Real Cost / Sale" 
            value={`₹${results.totalCostPerNetUnit.toFixed(0)}`} 
            subValue={`Inc. ${data.returnRatePercent}% Return Impact`}
            neutral
          />
          <KpiCard 
            label="Break-Even Price" 
            value={`₹${results.breakEvenPrice.toFixed(0)}`} 
            subValue="Min SP to survive"
            neutral
          />
          <KpiCard 
            label="Capital Needed" 
            value={`₹${(results.capitalRequired / 1000).toFixed(1)}k`} 
            subValue={`For ${data.estimatedBatchSize} units stock`}
            neutral
          />
           <KpiCard 
            label="ROI" 
            value={`${results.roi.toFixed(1)}%`} 
            subValue="Return on Investment"
            positive={results.roi > 20}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Inputs (Sticky on desktop) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar shadow-xl shadow-black/20">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6 flex items-center gap-2 border-b border-gray-800 pb-2">
                <TrendingUp className="w-4 h-4 text-brand-500" />
                Variables
              </h2>
              <FinancialInputs data={data} onChange={setData} />
            </div>
          </div>

          {/* Right Column: Visualization & Advanced Tools */}
          <div className="lg:col-span-8 space-y-6">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <ProfitVisualizer results={results} data={data} />
                
                {/* Warnings */}
                {results.returnOverheadCost > 100 && (
                   <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 flex items-start gap-3">
                      <div className="bg-red-900/30 p-2 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-red-200">High Return Rate Warning</h4>
                        <p className="text-xs text-red-300 mt-1 leading-relaxed">
                          At {data.returnRatePercent}% returns, you are burning <strong className="text-white">₹{results.returnOverheadCost.toFixed(0)}</strong> per successful sale just on wasted shipping & marketing. 
                          You effectively ship <strong className="text-white">{(results.grossUnitsForOneSale).toFixed(2)}</strong> units to sell 1.
                        </p>
                      </div>
                   </div>
                )}

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                   <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-gray-400" />
                    Collaboration Note
                   </h3>
                   <div className="text-sm text-gray-400 space-y-3 leading-relaxed">
                     <p>
                       Use the <strong className="text-brand-400">Share</strong> button top right to send this specific scenario to your team. 
                       The link contains all the data required to reproduce these numbers on their device.
                     </p>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'simulator' && (
              <OfferSimulator baseData={data} baseResults={results} />
            )}

            {activeTab === 'ai' && (
              <AIAdvisor data={data} results={results} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const KpiCard = ({ label, value, subValue, positive, neutral, highlight }: { label: string, value: string, subValue: string, positive?: boolean, neutral?: boolean, highlight?: boolean }) => {
  let colorClass = "text-gray-100";
  if (!neutral) {
    colorClass = positive ? "text-accent-green" : "text-accent-red";
  }

  return (
    <div className={`bg-gray-900 border ${highlight ? 'border-brand-500/50 bg-brand-900/10' : 'border-gray-800'} rounded-xl p-5 shadow-sm hover:border-gray-700 transition-colors`}>
      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">{label}</p>
      <p className={`text-2xl font-mono font-bold ${colorClass}`}>{value}</p>
      <p className="text-[10px] text-gray-400 mt-1">{subValue}</p>
    </div>
  );
};