export interface InputData {
  scenarioName: string; // For team collaboration context
  sellingPrice: number; // MRP (Inc GST)
  productCost: number; // Fabric + Making
  packagingCost: number;
  marketingCostPerUnit: number; // CAC (Cost per Acquired Order)
  shippingCost: number;
  paymentGatewayPercent: number;
  
  // Risk & Channel Mix
  returnRatePercent: number; // % of orders returned (RTO + Returns)
  returnShippingCost: number; // Cost to bring item back
  platformCommissionPercent: number; // Marketplace fee (Myntra/Amazon)
  
  // Fixed costs to be amortized
  photoshootCostTotal: number;
  samplingCostTotal: number;
  estimatedBatchSize: number; // To divide fixed costs
  
  gstRate: number; // 5, 12, 18, 28
  incomeTaxRate: number; // Estimated %
}

export interface EconomicResults {
  revenueExGST: number;
  gstAmount: number;
  
  // Unit Economics (Per Net Sold Unit)
  grossUnitsForOneSale: number; // How many units shipped to get 1 kept sale
  
  amortizedPhotoshoot: number;
  amortizedSampling: number;
  paymentGatewayCost: number;
  platformFee: number;
  
  // Cost Components
  totalCOGS: number; // Product + Packaging (inc. wasted packaging on returns)
  totalOpsCost: number; // Forward Ship + Return Ship + Gateway + Commission + Amortized
  totalMarketing: number; // CAC * GrossUnits
  returnOverheadCost: number; // Specific cost attributable to returns (Shipping + Pkg waste)
  
  totalCostPerNetUnit: number;
  
  grossProfit: number;
  grossMarginPercent: number;
  
  netProfitPreTax: number;
  incomeTaxEstimate: number;
  netProfit: number;
  netMarginPercent: number;
  
  roi: number;
  breakEvenPrice: number;
  capitalRequired: number; // Upfront cash for stock
}