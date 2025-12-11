require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool, types } = require('pg');
const path = require('path');

// Fix pour les dates Postgres
types.setTypeParser(1082, (str) => str);

// 1. Initialiser l'application (C'était le problème principal : il faut le faire au début !)
const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Connexion DB
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERREUR CRITIQUE : DATABASE_URL est manquant !');
} else {
  console.log('ℹ️ Tentative de connexion DB...');
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test de connexion
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ ÉCHEC CONNEXION DB (Détail) :', err);
  } else {
    console.log('✅ SUCCÈS : Connecté à la Base de Données !');
    release();
  }
});

// --- VOS ROUTES API (Je les garde telles quelles) ---

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Utilisateur inconnu" });
    
    const user = result.rows[0];
    if (password !== user.password) return res.status(401).json({ error: "Mot de passe incorrect" });

    res.json({ 
        message: "Succès", 
        user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            wedding_id: user.wedding_id,
            role: user.role 
        } 
    });
  } catch (err) { console.error('ERROR /login', err); res.status(500).json({ error: err.message || "Erreur serveur" }); }
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) return res.status(400).json({ error: "Email déjà pris" });

    const newWedding = await pool.query("INSERT INTO weddings (couple_names, event_date) VALUES ($1, NOW()) RETURNING id", [name + "'s Wedding"]);
    const weddingId = newWedding.rows[0].id;

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, wedding_id, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, password, weddingId, 'admin']
    );

    res.json({ message: "Inscrit !", user: newUser.rows[0] });
  } catch (err) { console.error('ERROR /register', err); res.status(500).json({ error: err.message }); }
});

app.get('/tasks/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userRes = await pool.query('SELECT wedding_id, role FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0 || !userRes.rows[0].wedding_id) return res.json([]);
    
    const { wedding_id, role } = userRes.rows[0];
    let query = '';
    let params = [];

    if (role === 'collaborator') {
        query = 'SELECT * FROM tasks WHERE wedding_id = $1 AND assigned_to = $2 ORDER BY id DESC';
        params = [wedding_id, userId];
    } else {
        query = 'SELECT * FROM tasks WHERE wedding_id = $1 ORDER BY id DESC';
        params = [wedding_id];
    }

    const tasks = await pool.query(query, params);
    res.json(tasks.rows);
  } catch (err) { console.error('ERROR /tasks/:userId', err); res.status(500).json({ error: err.message || "Erreur serveur" }); }
});

app.post('/tasks', async (req, res) => {
  try {
    const { user_id, title, description, due_date, assigned_to } = req.body; 
    const userResult = await pool.query('SELECT wedding_id FROM users WHERE id = $1', [user_id]);
    const weddingId = userResult.rows[0].wedding_id;

    const newTask = await pool.query(
      'INSERT INTO tasks (user_id, wedding_id, title, description, due_date, assigned_to) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, weddingId, title, description, due_date, assigned_to || user_id]
    );
    res.json(newTask.rows[0]);
  } catch (err) { console.error('ERROR POST /tasks', err); res.status(500).json({ error: err.message || "Erreur serveur" }); }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body || {};
    if (!user_id) return res.status(400).json({ error: 'user_id requis' });

    const userRes = await pool.query('SELECT role FROM users WHERE id = $1', [user_id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });
    const role = userRes.rows[0].role;

    if (role === 'collaborator') {
      return res.status(403).json({ error: 'Permission refusée' });
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: 'Supprimé' });
  } catch (err) { console.error('ERROR DELETE /tasks/:id', err); res.status(500).json({ error: err.message || 'Erreur serveur' }); }
});

app.put('/tasks/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id requis' });

    const userRes = await pool.query('SELECT role FROM users WHERE id = $1', [user_id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });
    const role = userRes.rows[0].role;

    if (role === 'collaborator') {
      const taskRes = await pool.query('SELECT assigned_to FROM tasks WHERE id = $1', [id]);
      if (taskRes.rows.length === 0) return res.status(404).json({ error: 'Tâche introuvable' });
      if (taskRes.rows[0].assigned_to != user_id) {
        return res.status(403).json({ error: 'Permission refusée' });
      }
    }

    await pool.query('UPDATE tasks SET status = $1 WHERE id = $2', [status, id]);
    res.json({ message: 'Statut mis à jour' });
  } catch (err) { console.error('ERROR PUT /tasks/:id/status', err); res.status(500).json({ error: err.message || 'Erreur serveur' }); }
});

app.post('/invite', async (req, res) => {
  const { email, currentUserId, role } = req.body;
  try {
    const currentUserRes = await pool.query('SELECT wedding_id FROM users WHERE id = $1', [currentUserId]);
    if (currentUserRes.rows.length === 0) return res.status(404).json({ error: "Utilisateur non trouvé" });
    const weddingId = currentUserRes.rows[0].wedding_id;

    const roleToAssign = role || 'admin';

    if (roleToAssign === 'admin') {
        const countRes = await pool.query(
            "SELECT COUNT(*) FROM users WHERE wedding_id = $1 AND role = 'admin'",
            [weddingId]
        );
        const adminCount = parseInt(countRes.rows[0].count);
        if (adminCount >= 2) {
            return res.status(403).json({ 
                error: "Limite atteinte : Il y a déjà 2 partenaires (le couple) pour ce mariage." 
            });
        }
    }

    const partnerRes = await pool.query(
      'UPDATE users SET wedding_id = $1, role = $2 WHERE email = $3 RETURNING *',
      [weddingId, roleToAssign, email]
    );

    if (partnerRes.rows.length === 0) return res.status(404).json({ error: "Utilisateur introuvable" });
    res.json({ message: `Utilisateur invité en tant que ${roleToAssign} !` });

  } catch (err) { console.error('ERROR /invite', err); res.status(500).json({ error: err.message || "Erreur serveur" }); }
});

app.get('/wedding/:weddingId/members', async (req, res) => {
  try {
    const { weddingId } = req.params;
    const members = await pool.query('SELECT id, name, role FROM users WHERE wedding_id = $1', [weddingId]);
    res.json(members.rows);
  } catch (err) { console.error('ERROR GET /wedding/:weddingId/members', err); res.status(500).json({ error: err.message || "Erreur serveur" }); }
});

app.put('/tasks/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;
    await pool.query('UPDATE tasks SET assigned_to = $1 WHERE id = $2', [assigned_to, id]);
    res.json({ message: "Assignation OK" });
  } catch (err) { console.error('ERROR PUT /tasks/:id/assign', err); res.status(500).json({ error: err.message || "Erreur serveur" }); }
});

app.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, title, description, due_date, assigned_to, status } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id requis' });

    const userRes = await pool.query('SELECT role FROM users WHERE id = $1', [user_id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });
    const role = userRes.rows[0].role;

    if (role === 'collaborator') {
      const taskRes = await pool.query('SELECT assigned_to FROM tasks WHERE id = $1', [id]);
      if (taskRes.rows.length === 0) return res.status(404).json({ error: 'Tâche introuvable' });
      if (taskRes.rows[0].assigned_to != user_id) return res.status(403).json({ error: 'Permission refusée' });
      if (title !== undefined || description !== undefined || due_date !== undefined || assigned_to !== undefined) {
        return res.status(403).json({ error: 'Collaborator cannot modify this field' });
      }
    }

    let fields = [];
    let values = [];
    let idx = 1;
    if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (due_date !== undefined) { fields.push(`due_date = $${idx++}`); values.push(due_date); }
    if (assigned_to !== undefined) { fields.push(`assigned_to = $${idx++}`); values.push(assigned_to); }
    if (status !== undefined) { fields.push(`status = $${idx++}`); values.push(status); }
    if (fields.length === 0) return res.json({ message: 'Rien à mettre à jour' });

    values.push(id);
    const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${idx}`;
    await pool.query(query, values);
    res.json({ message: 'Tâche mise à jour !' });
  } catch (err) { console.error('ERROR PUT /tasks/:id', err); res.status(500).json({ error: err.message || 'Erreur serveur' }); }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { currentUserId } = req.body || {};
    if (!currentUserId) return res.status(400).json({ error: 'currentUserId requis' });
    if (parseInt(currentUserId) !== parseInt(id)) return res.status(403).json({ error: 'Vous ne pouvez supprimer que votre compte' });
    await pool.query('UPDATE tasks SET assigned_to = NULL WHERE assigned_to = $1', [id]);
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Compte supprimé' });
  } catch (err) { console.error('ERROR DELETE /users/:id', err); res.status(500).json({ error: err.message || 'Erreur serveur' }); }
});

app.get('/wedding/:weddingId/guests', async (req, res) => {
  try {
    const { weddingId } = req.params;
    const guests = await pool.query('SELECT * FROM guests WHERE wedding_id = $1 ORDER BY id DESC', [weddingId]);
    res.json(guests.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.post('/guests', async (req, res) => {
  try {
    const { wedding_id, first_name, last_name, side, table_id } = req.body;
    const newGuest = await pool.query(
      'INSERT INTO guests (wedding_id, first_name, last_name, side, table_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [wedding_id, first_name, last_name, side, table_id || null]
    );
    res.json(newGuest.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.put('/guests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, is_confirmed, table_id, side } = req.body;
    let fields = [];
    let values = [];
    let idx = 1;
    if (first_name !== undefined) { fields.push(`first_name = $${idx++}`); values.push(first_name); }
    if (last_name !== undefined) { fields.push(`last_name = $${idx++}`); values.push(last_name); }
    if (is_confirmed !== undefined) { fields.push(`is_confirmed = $${idx++}`); values.push(is_confirmed); }
    if (table_id !== undefined) { fields.push(`table_id = $${idx++}`); values.push(table_id); }
    if (side !== undefined) { fields.push(`side = $${idx++}`); values.push(side); }
    if (fields.length === 0) return res.json({ message: 'Nothing to update' });
    values.push(id);
    const query = `UPDATE guests SET ${fields.join(', ')} WHERE id = $${idx}`;
    await pool.query(query, values);
    res.json({ message: 'Guest updated' });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.delete('/guests/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM guests WHERE id = $1', [req.params.id]);
    res.json({ message: 'Guest deleted' });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.get('/wedding/:weddingId/tables', async (req, res) => {
  try {
    const { weddingId } = req.params;
    const tables = await pool.query('SELECT * FROM tables WHERE wedding_id = $1 ORDER BY id ASC', [weddingId]);
    res.json(tables.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.post('/tables', async (req, res) => {
  try {
    const { wedding_id, name, capacity } = req.body;
    const newTable = await pool.query(
      'INSERT INTO tables (wedding_id, name, capacity) VALUES ($1, $2, $3) RETURNING *',
      [wedding_id, name, capacity || 10]
    );
    res.json(newTable.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.delete('/tables/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tables WHERE id = $1', [req.params.id]);
    res.json({ message: 'Table deleted' });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.put('/tables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, capacity } = req.body;
    let fields = [];
    let values = [];
    let idx = 1;
    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (capacity !== undefined) { fields.push(`capacity = $${idx++}`); values.push(capacity); }
    if (fields.length === 0) return res.json({ message: 'Nothing to update' });
    values.push(id);
    const query = `UPDATE tables SET ${fields.join(', ')} WHERE id = $${idx}`;
    await pool.query(query, values);
    res.json({ message: 'Table updated' });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.get('/wedding/:weddingId/settings', async (req, res) => {
  try {
    const { weddingId } = req.params;
    const w = await pool.query('SELECT id, couple_names, event_date, max_guests FROM weddings WHERE id = $1', [weddingId]);
    if (w.rows.length === 0) return res.status(404).json({ error: 'Wedding not found' });
    res.json(w.rows[0]);
  } catch (err) { console.error('ERROR GET /wedding/:weddingId/settings', err); res.status(500).json({ error: err.message }); }
});

app.put('/wedding/:weddingId/settings', async (req, res) => {
  try {
    const { weddingId } = req.params;
    const { max_guests } = req.body;
    if (max_guests === undefined) return res.status(400).json({ error: 'max_guests required' });
    await pool.query('UPDATE weddings SET max_guests = $1 WHERE id = $2', [max_guests, weddingId]);
    res.json({ message: 'Settings updated' });
  } catch (err) { console.error('ERROR PUT /wedding/:weddingId/settings', err); res.status(500).json({ error: err.message }); }
});

// --- FIN DES ROUTES API ---

// 👇 SERVIR LE FRONTEND (À la toute fin, après les routes API)
// Cette ligne permet de servir les fichiers statiques (CSS, JS) du dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Pour n'importe quelle autre route (ex: /dashboard), on renvoie l'index.html de React
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Lancement
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Serveur complet lancé sur http://localhost:${port}`);
  });
}

module.exports = app;