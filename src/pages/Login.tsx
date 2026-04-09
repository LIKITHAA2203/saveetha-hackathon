import React, { useState } from 'react';
import { ShoppingCart, ArrowRight, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('admin@procuremind.com');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        const user = await response.json();
        onLogin(user);
      } else {
        alert('Invalid email. Try admin@procuremind.com');
      }
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-10 shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-[#141414] rounded-2xl flex items-center justify-center mb-6">
              <ShoppingCart className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-[#141414] tracking-tight">ProcureMind</h1>
            <p className="text-[#141414]/60 mt-2 text-center">AI-Powered Procurement Intelligence</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-[#F5F5F5] border border-transparent focus:border-[#141414] rounded-xl outline-none transition-all font-medium"
                placeholder="name@company.com"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#141414] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#141414]/90 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Sign In <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-[#141414]/5">
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-4 text-center">Demo Accounts</p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { email: 'admin@procuremind.com', role: 'Admin' },
                { email: 'proc@procuremind.com', role: 'Procurement' },
                { email: 'manager@procuremind.com', role: 'Manager' }
              ].map(acc => (
                <button 
                  key={acc.email}
                  onClick={() => setEmail(acc.email)}
                  className="px-4 py-3 bg-[#F5F5F5] rounded-lg text-xs font-bold text-[#141414]/60 hover:text-[#141414] hover:bg-[#141414]/5 transition-all flex justify-between items-center"
                >
                  <span>{acc.email}</span>
                  <span className="text-[10px] bg-white px-2 py-1 rounded border border-[#141414]/10">{acc.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
