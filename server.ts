import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Types ---
interface User {
  id: string;
  email: string;
  role: 'admin' | 'procurement' | 'manager';
  name: string;
}

interface Vendor {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  rating: number;
  trustScore: number;
  pastPerformance: number; // 0-100
  deliverySuccessRate: number; // 0-100
  qualityScore: number; // 0-100
  responseSpeed: number; // 0-100
}

interface RFQ {
  id: string;
  itemName: string;
  quantity: number;
  requiredDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'closed' | 'awarded';
  assignedVendors: string[]; // Vendor IDs
  createdAt: string;
}

interface Quote {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  itemName: string;
  quantity: number;
  price: number;
  deliveryDays: number;
  tax: number;
  warranty: string;
  paymentTerms: string;
  extractedAt: string;
  riskScore: number;
  recommendationScore: number;
}

interface PurchaseOrder {
  id: string;
  quoteId: string;
  vendorId: string;
  totalAmount: number;
  status: 'pending' | 'approved' | 'shipped' | 'delivered';
  createdAt: string;
  financeStatus: 'unpaid' | 'partially_paid' | 'paid';
}

interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  reorderLevel: number;
  dailyUsage: number;
  leadTime: number; // in days
}

// --- Mock Database ---
const dbFile = path.join(process.cwd(), 'db.json');
let dbData = {
  users: [
    { id: '1', email: 'admin@procuremind.com', role: 'admin', name: 'Admin User' },
    { id: '2', email: 'proc@procuremind.com', role: 'procurement', name: 'Procurement Officer' },
    { id: '3', email: 'manager@procuremind.com', role: 'manager', name: 'Manager' }
  ] as User[],
  vendors: [
    { id: 'v1', name: 'TechSupply Co', category: 'Electronics', contactPerson: 'John Doe', email: 'john@techsupply.com', phone: '123-456-7890', rating: 4.5, trustScore: 85, pastPerformance: 90, deliverySuccessRate: 95, qualityScore: 88, responseSpeed: 80 },
    { id: 'v2', name: 'Global Parts Corp', category: 'Hardware', contactPerson: 'Jane Smith', email: 'jane@globalparts.com', phone: '098-765-4321', rating: 4.2, trustScore: 78, pastPerformance: 82, deliverySuccessRate: 85, qualityScore: 80, responseSpeed: 75 },
    { id: 'v3', name: 'Office Depot Pro', category: 'Office Supplies', contactPerson: 'Bob Wilson', email: 'bob@officedepot.com', phone: '555-123-4567', rating: 4.8, trustScore: 92, pastPerformance: 95, deliverySuccessRate: 98, qualityScore: 90, responseSpeed: 95 }
  ] as Vendor[],
  rfqs: [] as RFQ[],
  quotes: [] as Quote[],
  purchaseOrders: [] as PurchaseOrder[],
  inventory: [
    { id: 'i1', name: 'Laptop Pro 15', currentStock: 15, reorderLevel: 10, dailyUsage: 0.5, leadTime: 7 },
    { id: 'i2', name: 'Wireless Mouse', currentStock: 5, reorderLevel: 20, dailyUsage: 2, leadTime: 3 },
    { id: 'i3', name: 'Monitor 27 inch', currentStock: 8, reorderLevel: 5, dailyUsage: 0.2, leadTime: 10 }
  ] as InventoryItem[],
  finance: [] as any[]
};

// Load DB if exists
if (fs.existsSync(dbFile)) {
  try {
    const savedData = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    dbData = { ...dbData, ...savedData };
  } catch (e) {
    console.error("Error loading DB", e);
  }
}

const saveDB = () => {
  fs.writeFileSync(dbFile, JSON.stringify(dbData, null, 2));
};

// --- AI Logic ---
const calculateVendorScores = (quote: Quote, vendor: Vendor, rfq: RFQ) => {
  // Weights based on context
  let weights = {
    cost: 0.3,
    delivery: 0.2,
    quality: 0.2,
    trust: 0.2,
    risk: 0.1
  };

  if (rfq.priority === 'high') {
    weights.delivery = 0.4;
    weights.cost = 0.1;
  }

  // Normalize scores (0-100)
  // Cost score: lower is better. Assume max price is 2x min price for normalization.
  // This is a simplification for MVP.
  const costScore = 100 - Math.min(100, (quote.price / 1000) * 10); // Dummy normalization
  const deliveryScore = 100 - (quote.deliveryDays * 5);
  const qualityScore = vendor.qualityScore;
  const trustScore = vendor.trustScore;
  
  // Risk score calculation
  let riskScore = 0;
  if (quote.deliveryDays > 14) riskScore += 30;
  if (vendor.trustScore < 70) riskScore += 40;
  if (quote.price < 100) riskScore += 20; // Abnormal low price

  const finalScore = (
    (weights.cost * costScore) +
    (weights.delivery * deliveryScore) +
    (weights.quality * qualityScore) +
    (weights.trust * trustScore) -
    (weights.risk * riskScore)
  );

  return { finalScore: Math.max(0, finalScore), riskScore };
};

// --- Server Setup ---
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  // Auth
  app.post('/api/login', (req, res) => {
    const { email } = req.body;
    const user = dbData.users.find(u => u.email === email);
    if (user) res.json(user);
    else res.status(401).json({ error: 'Invalid credentials' });
  });

  // Vendors
  app.get('/api/vendors', (req, res) => res.json(dbData.vendors));
  app.post('/api/vendors', (req, res) => {
    const vendor = { ...req.body, id: uuidv4(), trustScore: 70, pastPerformance: 70, deliverySuccessRate: 70, qualityScore: 70, responseSpeed: 70 };
    dbData.vendors.push(vendor);
    saveDB();
    res.json(vendor);
  });

  // RFQs
  app.get('/api/rfqs', (req, res) => res.json(dbData.rfqs));
  app.post('/api/rfqs', (req, res) => {
    const rfq = { ...req.body, id: uuidv4(), status: 'open', createdAt: new Date().toISOString() };
    dbData.rfqs.push(rfq);
    saveDB();
    res.json(rfq);
  });

  // Quotes
  app.get('/api/quotes', (req, res) => res.json(dbData.quotes));
  app.post('/api/quotes', (req, res) => {
    const { rfqId, vendorId, price, deliveryDays } = req.body;
    const vendor = dbData.vendors.find(v => v.id === vendorId);
    const rfq = dbData.rfqs.find(r => r.id === rfqId);
    
    if (!vendor || !rfq) return res.status(400).json({ error: 'Invalid RFQ or Vendor' });

    const quote: Quote = {
      ...req.body,
      id: uuidv4(),
      vendorName: vendor.name,
      extractedAt: new Date().toISOString(),
      riskScore: 0,
      recommendationScore: 0
    };

    const scores = calculateVendorScores(quote, vendor, rfq);
    quote.riskScore = scores.riskScore;
    quote.recommendationScore = scores.finalScore;

    dbData.quotes.push(quote);
    saveDB();
    res.json(quote);
  });

  // POs
  app.get('/api/pos', (req, res) => res.json(dbData.purchaseOrders));
  app.post('/api/pos', (req, res) => {
    const po = { ...req.body, id: uuidv4(), status: 'pending', createdAt: new Date().toISOString(), financeStatus: 'unpaid' };
    dbData.purchaseOrders.push(po);
    saveDB();
    res.json(po);
  });

  // Inventory
  app.get('/api/inventory', (req, res) => {
    const items = dbData.inventory.map(item => {
      const daysLeft = item.currentStock / (item.dailyUsage || 0.1);
      const isLow = daysLeft <= item.leadTime;
      return { ...item, daysLeft, isLow };
    });
    res.json(items);
  });

  // Dashboard Stats
  app.get('/api/stats', (req, res) => {
    const totalSpend = dbData.purchaseOrders.reduce((acc, po) => acc + po.totalAmount, 0);
    const lowStockCount = dbData.inventory.filter(item => (item.currentStock / (item.dailyUsage || 0.1)) <= item.leadTime).length;
    
    res.json({
      totalVendors: dbData.vendors.length,
      activeRFQs: dbData.rfqs.filter(r => r.status === 'open').length,
      quotesReceived: dbData.quotes.length,
      purchaseOrders: dbData.purchaseOrders.length,
      totalSpend,
      lowStockCount,
      avgTrustScore: dbData.vendors.reduce((acc, v) => acc + v.trustScore, 0) / dbData.vendors.length
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
