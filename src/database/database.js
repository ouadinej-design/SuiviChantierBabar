import * as SQLite from 'expo-sqlite';

let db;

export async function initDatabase() {
  db = await SQLite.openDatabaseAsync('chantier.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS project (
      id INTEGER PRIMARY KEY DEFAULT 1,
      name TEXT NOT NULL,
      location TEXT,
      deadline TEXT,
      total_budget_ht REAL DEFAULT 0,
      total_budget_ttc REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS budget_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      montant_ht REAL DEFAULT 0,
      category_type TEXT DEFAULT 'vrd'
    );

    CREATE TABLE IF NOT EXISTS budget_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      item_code TEXT,
      description TEXT,
      unit TEXT,
      quantity REAL,
      unit_price REAL,
      total REAL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT,
      status TEXT DEFAULT 'en_attente',
      progress INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS revenues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      invoice_number TEXT,
      client TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_status TEXT DEFAULT 'en_attente',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS withdrawals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      beneficiary TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const project = await db.getFirstAsync('SELECT * FROM project WHERE id = 1');
  if (!project) {
    await seedData();
  }

  return db;
}

export function getDatabase() {
  return db;
}

async function seedData() {
  await db.runAsync(`
    INSERT INTO project (id, name, location, deadline, total_budget_ht, total_budget_ttc)
    VALUES (1, '50 Logements Babar', 'Babar', '2026-12-31', 33114535, 38069021)
  `);

  const categories = [
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
  ];

  for (const cat of categories) {
    await db.runAsync(
      'INSERT INTO budget_categories (code, name, montant_ht, category_type) VALUES (?, ?, ?, ?)',
      [cat.code, cat.name, cat.montant_ht, cat.category_type]
    );
  }

  const tasks = [
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
  ];

  for (const task of tasks) {
    await db.runAsync(
      'INSERT INTO tasks (title, category, status, progress) VALUES (?, ?, ?, ?)',
      [task.title, task.category, 'en_attente', 0]
    );
  }

  await db.runAsync(
    'INSERT INTO revenues (date, invoice_number, client, amount, payment_status) VALUES (?, ?, ?, ?, ?)',
    ['2026-01-15', 'FAC-2026-001', 'Maître d\'ouvrage - Projet Babar', 5000000, 'payé']
  );
}

export async function getTotalRevenues() {
  const row = await db.getFirstAsync('SELECT COALESCE(SUM(amount), 0) as total FROM revenues WHERE payment_status = ?', ['payé']);
  return row.total;
}

export async function getTotalExpenses() {
  const row = await db.getFirstAsync('SELECT COALESCE(SUM(amount), 0) as total FROM expenses');
  return row.total;
}

export async function getTotalWithdrawals() {
  const row = await db.getFirstAsync('SELECT COALESCE(SUM(amount), 0) as total FROM withdrawals');
  return row.total;
}
