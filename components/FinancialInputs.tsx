import React from 'react';
import { InputData } from '../types';
import { Info } from 'lucide-react';

interface Props {
  data: InputData;
  onChange: (data: InputData) => void;
}

interface InputGroupProps {
  title: string;
  children: React.ReactNode;
}

const InputGroup: React.FC<InputGroupProps> = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider border-b border-gray-800 pb-1">{title}</h3>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  step?: number;
}

const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  value, 
  onChange, 
  prefix, 
  suffix, 
  tooltip,
  step = 1 
}) => (
  <div>
    <div className="flex justify-between mb-1">
      <label className="block text-xs font-medium text-gray-300">{label}</label>
      {tooltip && (
        <div className="group relative">
           <Info className="w-3 h-3 text-gray-600 cursor-help" />
           <div className="absolute right-0 bottom-full mb-2 w-48 bg-gray-800 text-xs text-gray-200 p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
             {tooltip}
           </div>
        </div>
      )}
    </div>
    <div className="relative">
      {prefix && <span className="absolute left-3 top-2 text-gray-500 text-sm">{prefix}</span>}
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full bg-gray-950 border border-gray-700 rounded-md py-2 text-sm text-white focus:ring-1 focus:ring-brand-500 outline-none transition-colors ${prefix ? 'pl-8' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'}`}
      />
      {suffix && <span className="absolute right-3 top-2 text-gray-500 text-sm">{suffix}</span>}
    </div>
  </div>
);

export const FinancialInputs: React.FC<Props> = ({ data, onChange }) => {
  const handleChange = (key: keyof InputData, value: number) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-8">
      
      <InputGroup title="Sales Strategy">
        <InputField 
          label="Selling Price (MRP)" 
          value={data.sellingPrice} 
          onChange={(v) => handleChange('sellingPrice', v)} 
          prefix="₹"
        />
        <InputField 
          label="Est. Batch Size" 
          value={data.estimatedBatchSize} 
          onChange={(v) => handleChange('estimatedBatchSize', v)} 
          suffix="Units"
          tooltip="Used to spread fixed costs like photoshoot over each item."
        />
      </InputGroup>

      <InputGroup title="Channel & Risk (Crucial)">
        <div className="bg-red-950/20 p-3 rounded-lg border border-red-900/30 space-y-3">
          <InputField 
            label="Return Rate (RTO %)" 
            value={data.returnRatePercent} 
            onChange={(v) => handleChange('returnRatePercent', v)} 
            suffix="%"
            tooltip="Percentage of orders that come back (Customer Returns + RTO). Average fashion is 15-30%."
            step={1}
          />
          <InputField 
            label="Return Shipping Cost" 
            value={data.returnShippingCost} 
            onChange={(v) => handleChange('returnShippingCost', v)} 
            prefix="₹"
            tooltip="Cost to ship the item BACK to warehouse."
          />
          <InputField 
            label="Platform Commission" 
            value={data.platformCommissionPercent} 
            onChange={(v) => handleChange('platformCommissionPercent', v)} 
            suffix="%"
            tooltip="Fee paid to Amazon/Myntra (0% for own website)."
          />
        </div>
      </InputGroup>

      <InputGroup title="Direct Costs (COGS)">
        <InputField 
          label="Product Manufacturing" 
          value={data.productCost} 
          onChange={(v) => handleChange('productCost', v)} 
          prefix="₹"
        />
        <InputField 
          label="Packaging" 
          value={data.packagingCost} 
          onChange={(v) => handleChange('packagingCost', v)} 
          prefix="₹"
        />
      </InputGroup>

      <InputGroup title="Marketing & Ops">
        <InputField 
          label="Marketing (CPA)" 
          value={data.marketingCostPerUnit} 
          onChange={(v) => handleChange('marketingCostPerUnit', v)} 
          prefix="₹"
          tooltip="Cost per Acquired Order (Ads spend / Total Orders)."
        />
        <InputField 
          label="Shipping (Forward)" 
          value={data.shippingCost} 
          onChange={(v) => handleChange('shippingCost', v)} 
          prefix="₹"
        />
        <InputField 
          label="Payment Gateway" 
          value={data.paymentGatewayPercent} 
          onChange={(v) => handleChange('paymentGatewayPercent', v)} 
          suffix="%"
          step={0.1}
        />
      </InputGroup>

      <InputGroup title="Fixed Costs (Total)">
        <InputField 
          label="Photoshoot Total" 
          value={data.photoshootCostTotal} 
          onChange={(v) => handleChange('photoshootCostTotal', v)} 
          prefix="₹"
        />
        <InputField 
          label="Sampling Total" 
          value={data.samplingCostTotal} 
          onChange={(v) => handleChange('samplingCostTotal', v)} 
          prefix="₹"
        />
      </InputGroup>

      <InputGroup title="Taxes">
        <div className="grid grid-cols-2 gap-4">
          <div>
             <label className="block text-xs font-medium text-gray-400 mb-1">GST Rate</label>
             <select 
               value={data.gstRate}
               onChange={(e) => handleChange('gstRate', Number(e.target.value))}
               className="w-full bg-gray-950 border border-gray-700 rounded-md py-2 px-3 text-sm text-white focus:ring-1 focus:ring-brand-500 outline-none"
             >
               <option value={0}>0%</option>
               <option value={5}>5%</option>
               <option value={12}>12%</option>
               <option value={18}>18%</option>
               <option value={28}>28%</option>
             </select>
          </div>
          <InputField 
            label="Income Tax Est." 
            value={data.incomeTaxRate} 
            onChange={(v) => handleChange('incomeTaxRate', v)} 
            suffix="%"
          />
        </div>
      </InputGroup>

    </div>
  );
};