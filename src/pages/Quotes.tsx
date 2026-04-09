import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  BrainCircuit,
  Search,
  Filter,
  Download,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Quotes() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(0); // 0: select, 1: extracting, 2: success
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newQuote, setNewQuote] = useState({
    rfqId: '',
    vendorId: '',
    price: 0,
    deliveryDays: 0,
    warranty: '1 Year',
    paymentTerms: 'Net 30'
  });

  useEffect(() => {
    fetch('/api/quotes').then(res => res.json()).then(setQuotes);
    fetch('/api/rfqs').then(res => res.json()).then(setRfqs);
    fetch('/api/vendors').then(res => res.json()).then(setVendors);
  }, []);

  const handleUpload = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newQuote.rfqId || !newQuote.vendorId) {
      alert('Please select an RFQ and Vendor first.');
      return;
    }

    setIsUploading(true);
    setUploadStep(1);

    // Simulate AI Extraction Delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQuote)
    });

    if (res.ok) {
      const added = await res.json();
      setQuotes([added, ...quotes]);
      setUploadStep(2);
      setTimeout(() => {
        setIsUploading(false);
        setUploadStep(0);
        setNewQuote({ rfqId: '', vendorId: '', price: 0, deliveryDays: 0, warranty: '1 Year', paymentTerms: 'Net 30' });
      }, 1500);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // In a real app, we would upload the file here.
      // For this demo, we just trigger the simulated AI extraction.
      handleUpload();
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#141414]">Quotation Hub</h1>
          <p className="text-[#141414]/60 mt-1 font-medium italic serif">AI-powered extraction and analysis of vendor quotations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[40px] border border-[#141414]/10 sticky top-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#141414] text-white rounded-xl flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[#141414]">Upload Quote</h3>
            </div>

            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Select RFQ</label>
                <select 
                  required
                  value={newQuote.rfqId}
                  onChange={e => setNewQuote({...newQuote, rfqId: e.target.value})}
                  className="w-full px-5 py-3 bg-[#F5F5F5] border border-transparent focus:border-[#141414] rounded-xl outline-none transition-all font-bold text-sm"
                >
                  <option value="">Choose RFQ...</option>
                  {rfqs.filter(r => r.status === 'open').map(r => (
                    <option key={r.id} value={r.id}>{r.itemName} ({r.quantity} units)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Select Vendor</label>
                <select 
                  required
                  value={newQuote.vendorId}
                  onChange={e => setNewQuote({...newQuote, vendorId: e.target.value})}
                  className="w-full px-5 py-3 bg-[#F5F5F5] border border-transparent focus:border-[#141414] rounded-xl outline-none transition-all font-bold text-sm"
                >
                  <option value="">Choose Vendor...</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div 
                onClick={triggerFileSelect}
                className="p-8 border-2 border-dashed border-[#141414]/10 rounded-3xl flex flex-col items-center justify-center text-center group hover:border-[#141414]/30 transition-all cursor-pointer"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={onFileSelect} 
                  className="hidden" 
                  accept=".pdf"
                />
                <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                  <FileText className="w-6 h-6 text-[#141414]/40" />
                </div>
                <p className="text-sm font-bold text-[#141414]">Drop quotation PDF here</p>
                <p className="text-[10px] text-[#141414]/40 mt-1 uppercase tracking-widest font-bold">or click to browse</p>
              </div>

              {/* Manual Fields (Simulating what AI would extract) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Unit Price ($)</label>
                  <input 
                    type="number" 
                    required
                    value={newQuote.price}
                    onChange={e => setNewQuote({...newQuote, price: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 bg-[#F5F5F5] rounded-lg outline-none font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Delivery (Days)</label>
                  <input 
                    type="number" 
                    required
                    value={newQuote.deliveryDays}
                    onChange={e => setNewQuote({...newQuote, deliveryDays: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-[#F5F5F5] rounded-lg outline-none font-bold text-sm"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isUploading || !newQuote.rfqId || !newQuote.vendorId}
                className="w-full bg-[#141414] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#141414]/90 transition-all disabled:opacity-50"
              >
                {uploadStep === 1 ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> AI Extracting...
                  </>
                ) : uploadStep === 2 ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> Success!
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-5 h-5" /> AI Process Quote
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Quotes List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#141414]/10 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Search className="w-4 h-4 text-[#141414]/40" />
              <input type="text" placeholder="Search quotes..." className="bg-transparent border-none outline-none text-sm w-full" />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-all">
                <Filter className="w-4 h-4 text-[#141414]/40" />
              </button>
              <button className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-all">
                <Download className="w-4 h-4 text-[#141414]/40" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {quotes.map((quote) => (
              <div key={quote.id} className="bg-white p-6 rounded-3xl border border-[#141414]/10 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#F5F5F5] rounded-2xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[#141414]/40" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#141414]">{quote.vendorName}</h4>
                      <p className="text-xs text-[#141414]/40 font-medium">Quote for: <span className="text-[#141414] font-bold">{rfqs.find(r => r.id === quote.rfqId)?.itemName || 'Unknown Item'}</span></p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-1">Total Price</p>
                      <p className="text-lg font-bold text-[#141414]">${(quote.price * (rfqs.find(r => r.id === quote.rfqId)?.quantity || 1)).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-1">AI Score</p>
                      <div className="flex items-center gap-1 text-purple-600 font-bold">
                        <BrainCircuit className="w-4 h-4" /> {Math.round(quote.recommendationScore)}
                      </div>
                    </div>
                    <button className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all text-[#141414]/20">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
