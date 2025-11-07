const express = require('express');
const router = express.Router();
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

// Get all tasks for a project
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify user has access to project
    const userProject = await pool.query(
      `SELECT 1 FROM Project p
       LEFT JOIN ProjectMember pm ON p.ProjectID = pm.projectId
       WHERE p.ProjectID = $1 AND (p.ownerId = $2 OR pm.userId = $2)`,
      [projectId, req.user.userId]
    );

    if (userProject.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tasks = await pool.query(
      `SELECT t.*, 
        u.email as assigneeEmail, u.firstname as assigneeFirstName, u.lastname as assigneeLastName
       FROM Task t
       LEFT JOIN appUser u ON t.assigneeId = u.userid
       WHERE t.ProjectID = $1
       ORDER BY 
         CASE t.Status 
           WHEN 'To Do' THEN 1
           WHEN 'In Progress' THEN 2
           WHEN 'Complete' THEN 3
         END,
         t.createdAt DESC`,
      [projectId]
    );

    res.json(tasks.rows);
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single task
router.get('/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await pool.query(
      `SELECT t.*, 
        u.email as assigneeEmail, u.firstname as assigneeFirstName, u.lastname as assigneeLastName
       FROM Task t
       LEFT JOIN appUser u ON t.assigneeId = u.userid
       WHERE t.TaskID = $1`,
      [taskId]
    );

    if (task.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify user has access to project
    const userProject = await pool.query(
      `SELECT 1 FROM Project p
       LEFT JOIN ProjectMember pm ON p.ProjectID = pm.projectId
       WHERE p.ProjectID = $1 AND (p.ownerId = $2 OR pm.userId = $2)`,
      [task.rows[0].projectid, req.user.userId]
    );

    if (userProject.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(task.rows[0]);
  } catch (err) {
    console.error('Get task error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new task
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { projectId, title, description, deadline, assigneeId, priority, progress } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ error: 'Title and projectId are required' });
    }

    // Verify user has access to project
    const userProject = await pool.query(
      `SELECT 1 FROM Project p
       LEFT JOIN ProjectMember pm ON p.ProjectID = pm.projectId
       WHERE p.ProjectID = $1 AND (p.ownerId = $2 OR pm.userId = $2)`,
      [projectId, req.user.userId]
    );

    if (userProject.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Verify assignee is a project member if provided
    if (assigneeId) {
      const assigneeCheck = await pool.query(
        `SELECT 1 FROM Project p
         LEFT JOIN ProjectMember pm ON p.ProjectID = pm.projectId
         WHERE p.ProjectID = $1 AND (pm.userId = $2 OR p.ownerId = $2)`,
        [projectId, assigneeId]
      );

      if (assigneeCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Assignee must be a project member' });
      }
    }

    const taskId = uuidv4();
    const newTask = await pool.query(
      `INSERT INTO Task (TaskID, ProjectID, title, Description, deadline, assigneeId, priority, progress, Status, createdAt) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        taskId, 
        projectId, 
        title, 
        description || null, 
        deadline || null, 
        assigneeId || null, 
        priority || 'Medium',
        progress || 0,
        'To Do',
        new Date()
      ]
    );
    
    res.status(201).json(newTask.rows[0]);
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update task
router.put('/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, deadline, assigneeId, priority, progress, status } = req.body;

    // Get task and verify access
    const existingTask = await pool.query(
      'SELECT ProjectID FROM Task WHERE TaskID = $1',
      [taskId]
    );

    if (existingTask.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const projectId = existingTask.rows[0].projectid;

    // Verify user has access to project
    const userProject = await pool.query(
      `SELECT 1 FROM Project p
       LEFT JOIN ProjectMember pm ON p.ProjectID = pm.projectId
       WHERE p.ProjectID = $1 AND (p.ownerId = $2 OR pm.userId = $2)`,
      [projectId, req.user.userId]
    );

    if (userProject.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Verify assignee is a project member if provided
    if (assigneeId) {
      const assigneeCheck = await pool.query(
        `SELECT 1 FROM Project p
         LEFT JOIN ProjectMember pm ON p.ProjectID = pm.projectId
         WHERE p.ProjectID = $1 AND (pm.userId = $2 OR p.ownerId = $2)`,
        [projectId, assigneeId]
      );

      if (assigneeCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Assignee must be a project member' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`Description = $${paramCount++}`);
      values.push(description);
    }
    if (deadline !== undefined) {
      updates.push(`deadline = $${paramCount++}`);
      values.push(deadline);
    }
    if (assigneeId !== undefined) {
      updates.push(`assigneeId = $${paramCount++}`);
      values.push(assigneeId);
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramCount++}`);
      values.push(priority);
    }
    if (progress !== undefined) {
      updates.push(`progress = $${paramCount++}`);
      values.push(progress);
    }
    if (status !== undefined) {
      updates.push(`Status = $${paramCount++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(taskId);
    const query = `UPDATE Task SET ${updates.join(', ')} WHERE TaskID = $${paramCount} RETURNING *`;

    const updatedTask = await pool.query(query, values);
    
    res.json(updatedTask.rows[0]);
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update task status (for drag-and-drop)
router.patch('/:taskId/status', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!['To Do', 'In Progress', 'Complete'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be: To Do, In Progress, or Complete' });
    }

    // Get task and verify access
    const existingTask = await pool.query(
      'SELECT ProjectID FROM Task WHERE TaskID = $1',
      [taskId]
    );

    if (existingTask.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const projectId = existingTask.rows[0].projectid;

    // Verify user has access to project
    const userProject = await pool.query(
      `SELECT 1 FROM Project p
       LEFT JOIN ProjectMember pm ON p.ProjectID = pm.projectId
       WHERE p.ProjectID = $1 AND (p.ownerId = $2 OR pm.userId = $2)`,
      [projectId, req.user.userId]
    );

    if (userProject.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedTask = await pool.query(
      'UPDATE Task SET Status = $1 WHERE TaskID = $2 RETURNING *',
      [status, taskId]
    );
    
    res.json(updatedTask.rows[0]);
  } catch (err) {
    console.error('Update task status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete task
router.delete('/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;

    // Get task and verify access
    const existingTask = await pool.query(
      'SELECT ProjectID FROM Task WHERE TaskID = $1',
      [taskId]
    );

    if (existingTask.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const projectId = existingTask.rows[0].projectid;

    // Verify user has access to project
    const userProject = await pool.query(
      `SELECT 1 FROM Project p
       LEFT JOIN ProjectMember pm ON p.ProjectID = pm.projectId
       WHERE p.ProjectID = $1 AND (p.ownerId = $2 OR pm.userId = $2)`,
      [projectId, req.user.userId]
    );

    if (userProject.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query('DELETE FROM Task WHERE TaskID = $1', [taskId]);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
