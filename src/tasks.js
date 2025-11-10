const express = require('express');
const db = require('./database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get all tasks for the authenticated user
router.get('/', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, tasks) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch tasks' });
      }
      res.json(tasks);
    }
  );
});

// Create a new task
router.post('/', authenticateToken, (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.run(
    'INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)',
    [req.user.id, title, description || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create task' });
      }

      db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, task) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch created task' });
        }
        res.status(201).json(task);
      });
    }
  );
});

// Update a task
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  // First check if task belongs to user
  db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id], (err, task) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (completed !== undefined) {
      updates.push('completed = ?');
      values.push(completed ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id, req.user.id);

    db.run(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      values,
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to update task' });
        }

        db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, updatedTask) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch updated task' });
          }
          res.json(updatedTask);
        });
      }
    );
  });
});

// Delete a task
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM tasks WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete task' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ message: 'Task deleted successfully' });
    }
  );
});

module.exports = router;
