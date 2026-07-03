import { Platform } from 'react-native';

let db;

const seedData = {
  project: { id: 1, name: '50 Logements Babar', location: 'Babar', deadline: '2026-12-31', total_budget_ht: 33114535, total_budget_ttc: 38069021 },
  budget_categories: [
    { code: 'I', name: 'Aménagement extérieur', montant_ht: 6995250, category_type: 'vrd' },
    { code: 'II', name: 'Assainissement', montant_ht: 1132200, category_type: 'vrd' },
    { code: 'III', name: 'Alimentation Eau Potable', montant_ht: 387275, category_type: 'vrd' },
    { code: 'IV', name: 'Éclairage Extérieur', montant_ht: 1713240, category_type: 'vrd' },
    { code: 'V', name: 'Soutènement des Terres', montant_ht: 2080900, category_type: 'vrd' },
    { code: 'VI', name: 'Fibre Optique', montant_ht: 150560, category_type: 'vrd' },
    { code: '1', name: 'Terrassements', montant_ht: 2627860, category_type: 'logements' },
    { code: '2', name: 'Infrastructures', montant_ht: 17910320, category_type: 'logements' },
    { code: '3', name: 'Béton superstructure', montant_ht: 38412082, category_type: 'logements' },
    { code: '4', name: 'Maçonnerie', montant_ht: 11512018, category_type: 'logements' },
    { code: '5', name: 'Enduit', montant_ht: 8013401, category_type: 'logements' },
    { code: '6', name: 'Revêtements', montant_ht: 15440839, category_type: 'logements' },
    { code: '7', name: 'Menuiserie bois/PVC/Alu', montant_ht: 18524186, category_type: 'logements' },
    { code: '8', name: 'Menuiserie Métallique', montant_ht: 1812909, category_type: 'logements' },
    { code: '9', name: 'Peinture', montant_ht: 4334135, category_type: 'logements' },
    { code: '10', name: 'Plomberie Sanitaire', montant_ht: 3375870, category_type: 'logements' },
  ],
  tasks: [
    { title: 'Décapage terre végétale', category: 'Aménagement extérieur' },
    { title: 'Déblais en grande masse', category: 'Aménagement extérieur' },
    { title: 'Remblais des terres', category: 'Aménagement extérieur' },
    { title: 'Apport bon remblai en tuff', category: 'Aménagement extérieur' },
    { title: 'Revêtement chaussée et parking', category: 'Aménagement extérieur' },
    { title: 'Bordures de trottoirs', category: 'Aménagement extérieur' },
    { title: 'Fouilles en tranchée assainissement', category: 'Assainissement' },
    { title: 'Canalisation PVC assainissement', category: 'Assainissement' },
    { title: 'Regards de visite', category: 'Assainissement' },
    { title: 'Fouilles tranchée AEP', category: 'Eau Potable' },
    { title: 'Canalisation PEHD eau potable', category: 'Eau Potable' },
    { title: 'Poteau incendie', category: 'Eau Potable' },
    { title: 'Fouilles éclairage extérieur', category: 'Éclairage Extérieur' },
    { title: 'Candelabres H=6m', category: 'Éclairage Extérieur' },
    { title: 'Local technique SONELGAZ', category: 'Éclairage Extérieur' },
    { title: 'Fouilles soutènement', category: 'Soutènement' },
    { title: 'Béton armé mur soutènement', category: 'Soutènement' },
    { title: 'Gardes corps métallique', category: 'Soutènement' },
    { title: 'Fourreaux fibre optique', category: 'Fibre Optique' },
    { title: 'Terrassement logements', category: 'Terrassements' },
    { title: 'Béton de propreté', category: 'Infrastructures' },
    { title: 'Béton armé semelles', category: 'Infrastructures' },
    { title: 'Béton armé superstructure', category: 'Béton superstructure' },
    { title: 'Plancher corps creux', category: 'Béton superstructure' },
    { title: 'Maçonnerie extérieure', category: 'Maçonnerie' },
    { title: 'Maçonnerie intérieure', category: 'Maçonnerie' },
    { title: 'Enduit ciment extérieur', category: 'Enduit' },
    { title: 'Enduit plâtre intérieur', category: 'Enduit' },
    { title: 'Revêtement sol carrelage', category: 'Revêtements' },
    { title: 'Faïence cuisine et SDB', category: 'Revêtements' },
    { title: 'Portes entrée logements', category: 'Menuiserie' },
    { title: 'Fenêtres PVC', category: 'Menuiserie' },
    { title: 'Portes intérieures MDF', category: 'Menuiserie' },
    { title: 'Portes métallique immeuble', category: 'Menuiserie Métallique' },
    { title: 'Garde-corps', category: 'Menuiserie Métallique' },
    { title: 'Peinture intérieure', category: 'Peinture' },
    { title: 'Peinture extérieure', category: 'Peinture' },
    { title: 'Plomberie sanitaire', category: 'Plomberie' },
    { title: 'Installation WC et lavabos', category: 'Plomberie' },
    { title: 'Alimentation gaz', category: 'Gaz' },
  ],
};

function extractTableName(query) {
  const match = query.match(/FROM\s+(\w+)/i);
  return match ? match[1].toLowerCase() : null;
}

class InMemoryStore {
  constructor() {
    this.project = { ...seedData.project };
    this.budget_categories = seedData.budget_categories.map((c, i) => ({ id: i + 1, ...c }));
    this.tasks = seedData.tasks.map((t, i) => ({ id: i + 1, ...t, status: 'en_attente', progress: 0 }));
    this.expenses = [];
    this.revenues = [{ id: 1, date: '2026-01-15', invoice_number: 'FAC-2026-001', client: "Maître d'ouvrage - Projet Babar", amount: 5000000, payment_status: 'payé' }];
    this.withdrawals = [];
    this.counters = { expenses: 1, revenues: 2, withdrawals: 1 };
  }

  getAllAsync(query) {
    const table = extractTableName(query);
    if (!table || !this[table]) return Promise.resolve([]);
    let data = [...this[table]];
    if (table === 'budget_categories') {
      data.sort((a, b) => a.category_type.localeCompare(b.category_type) || a.code.localeCompare(b.code));
    } else if (table === 'tasks') {
      data.sort((a, b) => a.category.localeCompare(b.category) || a.id - b.id);
    } else if (['expenses', 'revenues', 'withdrawals'].includes(table)) {
      data.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
    } else {
      data.sort((a, b) => a.id - b.id);
    }
    return Promise.resolve(data);
  }

  getFirstAsync(query, params) {
    if (query === 'SELECT * FROM project WHERE id = 1') return Promise.resolve(this.project);
    return Promise.resolve(null);
  }

  runAsync(query, ...params) {
    const flat = Array.isArray(params[0]) ? params[0] : params;
    if (query.startsWith('UPDATE tasks')) {
      const t = this.tasks.find(x => x.id === flat[2]);
      if (t) { t.status = flat[0]; t.progress = flat[1]; }
    }
    if (query.startsWith('UPDATE revenues')) {
      const r = this.revenues.find(x => x.id === flat[1]);
      if (r) r.payment_status = flat[0];
    }
    if (query.startsWith('INSERT INTO expenses')) {
      this.expenses.push({ id: this.counters.expenses++, date: flat[0], category: flat[1], title: flat[2], amount: flat[3], notes: flat[4] || '' });
    }
    if (query.startsWith('INSERT INTO revenues')) {
      this.revenues.push({ id: this.counters.revenues++, date: flat[0], invoice_number: flat[1], client: flat[2], amount: flat[3], payment_status: flat[4] });
    }
    if (query.startsWith('INSERT INTO withdrawals')) {
      this.withdrawals.push({ id: this.counters.withdrawals++, date: flat[0], amount: flat[1], beneficiary: flat[2] });
    }
    return Promise.resolve({ lastInsertRowId: 0, changes: 1 });
  }
}

async function initNative() {
  const SQLite = require('expo-sqlite');
  const d = await SQLite.openDatabaseAsync('chantier.db');
  await d.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS project (id INTEGER PRIMARY KEY DEFAULT 1, name TEXT, location TEXT, deadline TEXT, total_budget_ht REAL DEFAULT 0, total_budget_ttc REAL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS budget_categories (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT, name TEXT, montant_ht REAL DEFAULT 0, category_type TEXT DEFAULT 'vrd');
    CREATE TABLE IF NOT EXISTS budget_items (id INTEGER PRIMARY KEY AUTOINCREMENT, category_id INTEGER, item_code TEXT, description TEXT, unit TEXT, quantity REAL, unit_price REAL, total REAL);
    CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, category TEXT, status TEXT DEFAULT 'en_attente', progress INTEGER DEFAULT 0);
    CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, category TEXT, title TEXT, amount REAL, notes TEXT);
    CREATE TABLE IF NOT EXISTS revenues (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, invoice_number TEXT, client TEXT, amount REAL, payment_status TEXT DEFAULT 'en_attente');
    CREATE TABLE IF NOT EXISTS withdrawals (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, amount REAL, beneficiary TEXT);
  `);
  const proj = await d.getFirstAsync('SELECT * FROM project WHERE id = 1');
  if (!proj) {
    await d.runAsync('INSERT INTO project (id, name, location, deadline, total_budget_ht, total_budget_ttc) VALUES (1,?,?,?,?,?)', ['50 Logements Babar', 'Babar', '2026-12-31', 33114535, 38069021]);
    for (const c of seedData.budget_categories) await d.runAsync('INSERT INTO budget_categories (code, name, montant_ht, category_type) VALUES (?,?,?,?)', [c.code, c.name, c.montant_ht, c.category_type]);
    for (const t of seedData.tasks) await d.runAsync('INSERT INTO tasks (title, category, status, progress) VALUES (?,?,?,?)', [t.title, t.category, 'en_attente', 0]);
    await d.runAsync('INSERT INTO revenues (date, invoice_number, client, amount, payment_status) VALUES (?,?,?,?,?)', ['2026-01-15', 'FAC-2026-001', "Maître d'ouvrage - Projet Babar", 5000000, 'payé']);
  }
  return d;
}

export async function initDatabase() {
  if (Platform.OS === 'web') {
    db = new InMemoryStore();
  } else {
    db = await initNative();
  }
  return db;
}

export function getDatabase() {
  return db;
}

export async function getTotalRevenues() {
  if (Platform.OS === 'web') return db.revenues.filter(r => r.payment_status === 'payé').reduce((s, r) => s + r.amount, 0);
  const row = await db.getFirstAsync('SELECT COALESCE(SUM(amount), 0) as total FROM revenues WHERE payment_status = ?', ['payé']);
  return row.total;
}

export async function getTotalExpenses() {
  if (Platform.OS === 'web') return db.expenses.reduce((s, e) => s + e.amount, 0);
  const row = await db.getFirstAsync('SELECT COALESCE(SUM(amount), 0) as total FROM expenses');
  return row.total;
}

export async function getTotalWithdrawals() {
  if (Platform.OS === 'web') return db.withdrawals.reduce((s, w) => s + w.amount, 0);
  const row = await db.getFirstAsync('SELECT COALESCE(SUM(amount), 0) as total FROM withdrawals');
  return row.total;
}
