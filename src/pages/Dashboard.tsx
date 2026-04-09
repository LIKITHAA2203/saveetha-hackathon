import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Users, 
  FileText,
  BrainCircuit,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Jan', spend: 4000, savings: 2400 },
  { name: 'Feb', spend: 3000, savings: 1398 },
  { name: 'Mar', spend: 2000, savings: 9800 },
  { name: 'Apr', spend: 2780, savings: 3908 },
  { name: 'May', spend: 1890, savings: 4800 },
  { name: 'Jun', spend: 2390, savings: 3800 },
];

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/stats').then(res => res.json()).then(setStats);
    fetch('/api/inventory').then(res => res.json()).then(setInventory);
  }, []);

  if (!stats) return <div className="flex items-center justify-center h-full">Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#141414]">Procurement Overview</h1>
          <p className="text-[#141414]/60 mt-1 font-medium italic serif">Real-time intelligence and AI-driven insights for your supply chain.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-[#141414]/10 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#141414]/40" />
            <span className="text-xs font-bold text-[#141414]/60 uppercase tracking-widest">Last Sync: Just Now</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Spend', value: `$${stats.totalSpend.toLocaleString()}`, icon: DollarSign, color: 'bg-blue-50 text-blue-600', trend: '+12.5%', up: true },
          { label: 'Active RFQs', value: stats.activeRFQs, icon: FileText, color: 'bg-orange-50 text-orange-600', trend: '-2', up: false },
          { label: 'Low Stock Alerts', value: stats.lowStockCount, icon: AlertTriangle, color: 'bg-red-50 text-red-600', trend: '+3', up: true },
          { label: 'Avg Trust Score', value: `${stats.avgTrustScore.toFixed(1)}%`, icon: CheckCircle2, color: 'bg-green-50 text-green-600', trend: '+2.1%', up: true },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-[#141414]/10 hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-xl transition-all group-hover:scale-110", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={cn("flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full", stat.up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-[#141414]">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-[#141414]/10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-[#141414]">Spend Analysis</h3>
              <p className="text-sm text-[#141414]/40 font-medium italic serif">Monthly procurement expenditure vs savings</p>
            </div>
            <select className="bg-[#F5F5F5] border-none outline-none text-xs font-bold px-4 py-2 rounded-lg">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#141414" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#141414" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#14141410" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#14141460'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#14141460'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="spend" stroke="#141414" fillOpacity={1} fill="url(#colorSpend)" strokeWidth={3} />
                <Area type="monotone" dataKey="savings" stroke="#10b981" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-[#141414] text-white p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <BrainCircuit className="w-32 h-32" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold tracking-tight">AI Co-Pilot Insights</h3>
            </div>

            <div className="space-y-6">
              {inventory.filter(i => i.isLow).map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-orange-400 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Low Stock Prediction</span>
                  </div>
                  <p className="text-sm font-medium mb-1">"{item.name}" will run out in {item.daysLeft.toFixed(1)} days.</p>
                  <p className="text-xs text-white/40 mb-4">Lead time is {item.leadTime} days. Action required immediately.</p>
                  <button className="w-full bg-white text-[#141414] py-2 rounded-lg text-xs font-bold hover:bg-white/90 transition-all">
                    Auto-Generate RFQ
                  </button>
                </div>
              ))}

              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Savings Opportunity</span>
                </div>
                <p className="text-sm font-medium mb-1">Bulk order "Wireless Mouse" could save 15%.</p>
                <p className="text-xs text-white/40">Consolidating next 3 months of demand is recommended.</p>
              </div>
            </div>

            <button className="mt-8 w-full border border-white/20 py-4 rounded-xl text-sm font-bold hover:bg-white/5 transition-all">
              View All Recommendations
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-3xl border border-[#141414]/10 overflow-hidden">
        <div className="p-8 border-b border-[#141414]/10 flex justify-between items-center">
          <h3 className="text-xl font-bold text-[#141414]">Inventory Status</h3>
          <button className="text-xs font-bold text-[#141414]/40 hover:text-[#141414] transition-all uppercase tracking-widest">View All Inventory</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F5F5F5] text-[10px] uppercase tracking-widest font-bold text-[#141414]/40">
                <th className="px-8 py-4">Item Name</th>
                <th className="px-8 py-4">Current Stock</th>
                <th className="px-8 py-4">Reorder Level</th>
                <th className="px-8 py-4">Usage/Day</th>
                <th className="px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/5">
              {inventory.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#F5F5F5]/50 transition-all cursor-pointer group">
                  <td className="px-8 py-6 font-bold text-[#141414]">{item.name}</td>
                  <td className="px-8 py-6 font-mono text-sm">{item.currentStock} units</td>
                  <td className="px-8 py-6 font-mono text-sm">{item.reorderLevel} units</td>
                  <td className="px-8 py-6 font-mono text-sm">{item.dailyUsage}</td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      item.isLow ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                    )}>
                      {item.isLow ? 'Low Stock' : 'Healthy'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
