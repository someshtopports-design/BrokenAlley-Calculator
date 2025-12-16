import { InputData, EconomicResults } from '../types';

export const calculateEconomics = (data: InputData): EconomicResults => {
  // 1. Revenue (Per 1 Net Sale)
  const revenueExGST = data.sellingPrice / (1 + data.gstRate / 100);
  const gstAmount = data.sellingPrice - revenueExGST;

  // 2. Returns Multiplier
  // If 20% return rate, to get 1 Net Sale, you need to ship 1 / (1 - 0.2) = 1.25 units
  const returnRateDecimal = data.returnRatePercent / 100;
  // Prevent division by zero if return rate is 100% (unlikely but safe)
  const grossUnitsForOneSale = returnRateDecimal < 1 ? 1 / (1 - returnRateDecimal) : 100; 
  
  // 3. Variable Costs Scaling
  // Product Cost: You sell 1, you lose 1 item from stock. (Assuming returned items are resellable).
  // If returned items are damaged, we'd add logic here. For now, assume 100% restockable.
  const productCost = data.productCost * 1; 
  
  // Packaging: You use packaging for every attempt.
  const packagingCost = data.packagingCost * grossUnitsForOneSale;

  // Marketing: You pay for every acquisition attempt.
  const totalMarketing = data.marketingCostPerUnit * grossUnitsForOneSale;

  // Shipping (Forward): Paid on every attempt.
  const forwardShipping = data.shippingCost * grossUnitsForOneSale;
  
  // Shipping (Reverse): Paid on the returned portion.
  // Returns = GrossUnits - 1 (The one kept)
  const returnCount = grossUnitsForOneSale - 1;
  const returnShipping = data.returnShippingCost * returnCount;

  // 4. Platform & Gateway
  // Commission is usually on the final successful sale value (or GMV).
  // Let's assume Commission is on Selling Price of the Net Sale.
  const platformFee = (data.sellingPrice * data.platformCommissionPercent) / 100;
  
  // Payment Gateway: Usually on transaction value. Some refund fees, some don't.
  // Conservative view: You pay PG on the gross volume, and maybe get some back. 
  // Let's keep simple: Pay on SellingPrice * GrossUnits? No, usually PG fees are net. 
  // Let's stick to PG on the Final Sale Price for simplicity, as it's small.
  const paymentGatewayCost = (data.sellingPrice * data.paymentGatewayPercent) / 100;

  // 5. Fixed Costs (Amortized)
  // These don't scale with returns per se, they are fixed per batch.
  // But we assign them to the Net Sale unit.
  const amortizedPhotoshoot = data.photoshootCostTotal / (data.estimatedBatchSize || 1);
  const amortizedSampling = data.samplingCostTotal / (data.estimatedBatchSize || 1);

  // 6. Aggregation
  const totalCOGS = productCost + packagingCost + amortizedSampling;
  
  const totalOpsCost = forwardShipping + returnShipping + platformFee + paymentGatewayCost + amortizedPhotoshoot;

  const totalCostPerNetUnit = totalCOGS + totalOpsCost + totalMarketing;

  // Specific Return Overhead for visualization
  // (Extra Packaging + Extra Shipping + Return Shipping + Extra Marketing)
  // This helps show "How much is the return rate costing me?"
  // Base Cost (if 0 returns) = 1*Pkg + 1*Ship + 1*Mkt
  // Actual Cost = Gross*Pkg + Gross*Ship + ReturnShip + Gross*Mkt
  const baseMarketing = data.marketingCostPerUnit;
  const basePkg = data.packagingCost;
  const baseShip = data.shippingCost;
  
  const returnOverheadCost = 
    (packagingCost - basePkg) + 
    (forwardShipping - baseShip) + 
    returnShipping + 
    (totalMarketing - baseMarketing);

  // 7. Profit
  const netProfitPreTax = revenueExGST - totalCostPerNetUnit;

  const incomeTaxEstimate = netProfitPreTax > 0 
    ? netProfitPreTax * (data.incomeTaxRate / 100) 
    : 0;

  const netProfit = netProfitPreTax - incomeTaxEstimate;

  const netMarginPercent = (netProfit / data.sellingPrice) * 100;
  const roi = totalCostPerNetUnit > 0 ? (netProfit / totalCostPerNetUnit) * 100 : 0;

  // Break Even
  // Roughly: Cost * (1 + GST%).
  // It's dynamic because Commission/Returns scale.
  const breakEvenPrice = totalCostPerNetUnit * (1 + data.gstRate / 100);

  // Gross Profit (Revenue - COGS)
  const grossProfit = revenueExGST - totalCOGS;
  const grossMarginPercent = (grossProfit / revenueExGST) * 100;

  // Inventory Capital Calculation
  const capitalRequired = (data.productCost + data.packagingCost) * data.estimatedBatchSize + data.photoshootCostTotal + data.samplingCostTotal;

  return {
    revenueExGST,
    gstAmount,
    grossUnitsForOneSale,
    amortizedPhotoshoot,
    amortizedSampling,
    paymentGatewayCost,
    platformFee,
    totalCOGS,
    totalOpsCost,
    totalMarketing,
    returnOverheadCost,
    totalCostPerNetUnit,
    grossProfit,
    grossMarginPercent,
    netProfitPreTax,
    incomeTaxEstimate,
    netProfit,
    netMarginPercent,
    roi,
    breakEvenPrice,
    capitalRequired
  };
};