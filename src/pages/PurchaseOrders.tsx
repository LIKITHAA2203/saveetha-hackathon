import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle2, 
  Truck, 
  PackageCheck,
  Search,
  Download,
  MoreVertical,
  DollarSign,
  CreditCard
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function PurchaseOrders() {
  const [pos, setPos] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/pos').then(res => res.json()).then(setPos);
    fetch('/api/vendors').then(res => res.json()).then(setVendors);
    fetch('/api/quotes').then(res => res.json()).then(setQuotes);
  }, []);

  const getVendorName = (vendorId: string) => vendors.find(v => v.id === vendorId)?.name || 'Unknown Vendor';
  const getQuoteDetails = (quoteId: string) => quotes.find(q => q.id === quoteId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#141414]">Purchase Orders</h1>
          <p className="text-[#141414]/60 mt-1 font-medium italic serif">Track procurement fulfillment and financial settlements.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-[#141414] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#141414]/90 transition-all">
            <Download className="w-5 h-5" /> Export All POs
          </button>
        </div>
      </div>

      {/* PO List */}
      <div className="bg-white rounded-[40px] border border-[#141414]/10 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-[#141414]/10 flex items-center justify-between">
          <div className="flex items-center gap-4 bg-[#F5F5F5] px-4 py-2 rounded-full w-80">
            <Search className="w-4 h-4 text-[#141414]/40" />
            <input type="text" placeholder="Search POs..." className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F5F5F5] text-[10px] uppercase tracking-widest font-bold text-[#141414]/40">
                <th className="px-8 py-6">PO Details</th>
                <th className="px-8 py-6">Vendor</th>
                <th className="px-8 py-6">Amount</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Finance</th>
                <th className="px-8 py-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/5">
              {pos.map((po) => {
                const quote = getQuoteDetails(po.quoteId);
                return (
                  <tr key={po.id} className="hover:bg-[#F5F5F5]/50 transition-all group">
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#F5F5F5] rounded-2xl flex items-center justify-center">
                          <ShoppingCart className="w-6 h-6 text-[#141414]/40" />
                        </div>
                        <div>
                          <p className="font-bold text-[#141414]">PO-{po.id.substring(0, 8).toUpperCase()}</p>
                          <p className="text-[10px] text-[#141414]/40 font-bold uppercase tracking-widest">Item: {quote?.itemName || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <p className="font-bold text-[#141414]">{getVendorName(po.vendorId)}</p>
                      <p className="text-[10px] text-[#141414]/40 font-bold uppercase tracking-widest">Created: {new Date(po.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-1 text-lg font-bold text-[#141414]">
                        <DollarSign className="w-4 h-4 text-[#141414]/40" />
                        {po.totalAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className={cn(
                        "flex items-center gap-2 font-bold text-sm",
                        po.status === 'pending' ? "text-orange-600" : "text-green-600"
                      )}>
                        {po.status === 'pending' ? <Clock className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                        {po.status.toUpperCase()}
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 w-fit",
                        po.financeStatus === 'paid' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                      )}>
                        <CreditCard className="w-3 h-3" /> {po.financeStatus}
                      </span>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-white rounded-lg transition-all border border-transparent hover:border-[#141414]/10">
                          <Download className="w-4 h-4 text-[#141414]/40" />
                        </button>
                        <button className="p-2 hover:bg-white rounded-lg transition-all border border-transparent hover:border-[#141414]/10">
                          <MoreVertical className="w-4 h-4 text-[#141414]/40" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
