const express = require('express');
const router = express.Router();
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const { validateProject } = require('../middleware/validation');

// Get all projects for a user (as owner or member)
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const projects = await pool.query(
      `SELECT DISTINCT p.*, 
        CASE WHEN p.ownerId = $1 THEN 'Owner' ELSE pm.role END as userRole
       FROM Project p
       LEFT JOIN ProjectMember pm ON p.ProjectID = pm.projectId AND pm.userId = $1
       WHERE p.ownerId = $1 OR pm.userId = $1
       ORDER BY p.Time DESC`,
      [userId]
    );
    
    res.json(projects.rows);
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single project by ID
router.get('/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if user is owner or member
    const project = await pool.query(
      `SELECT p.*, 
        CASE WHEN p.ownerId = $2 THEN 'Owner' ELSE pm.role END as userRole
       FROM Project p
       LEFT JOIN ProjectMember pm ON p.ProjectID = pm.projectId AND pm.userId = $2
       WHERE p.ProjectID = $1 AND (p.ownerId = $2 OR pm.userId = $2)`,
      [projectId, req.user.userId]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    // Get project members
    const members = await pool.query(
      `SELECT u.userid, u.email, u.firstname, u.lastname, 
        CASE WHEN p.ownerId = u.userid THEN 'Owner' ELSE pm.role END as role
       FROM Project p
       LEFT JOIN ProjectMember pm ON p.ProjectID = pm.projectId
       LEFT JOIN appUser u ON (pm.userId = u.userid OR p.ownerId = u.userid)
       WHERE p.ProjectID = $1 AND u.userid IS NOT NULL`,
      [projectId]
    );

    res.json({
      ...project.rows[0],
      members: members.rows
    });
  } catch (err) {
    console.error('Get project error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new project
router.post('/', authenticateToken, validateProject, async (req, res) => {
  try {
    const { title, description, startDate, endDate, status } = req.body;
    const projectId = uuidv4();

    // Create project
    await pool.query(
      `INSERT INTO Project (ProjectID, title, Description, Status, Time, ownerId, startDate, endDate) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [projectId, title, description || null, status || 'Planning', new Date(), req.user.userId, startDate || null, endDate || null]
    );

    // Owner is automatically a member
    await pool.query(
      'INSERT INTO ProjectMember (projectId, userId, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [projectId, req.user.userId, 'Owner']
    );

    const newProject = await pool.query(
      'SELECT * FROM Project WHERE ProjectID = $1',
      [projectId]
    );

    res.status(201).json(newProject.rows[0]);
  } catch (err) {
    console.error('Create project error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Project title already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project
router.put('/:projectId', authenticateToken, validateProject, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, startDate, endDate, status } = req.body;

    // Check if user is owner
    const project = await pool.query(
      'SELECT ownerId FROM Project WHERE ProjectID = $1',
      [projectId]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.rows[0].ownerid !== req.user.userId) {
      return res.status(403).json({ error: 'Only project owners can update projects' });
    }

    const updatedProject = await pool.query(
      `UPDATE Project SET title = $1, Description = $2, Status = $3, startDate = $4, endDate = $5 
       WHERE ProjectID = $6 RETURNING *`,
      [title, description, status, startDate, endDate, projectId]
    );

    res.json(updatedProject.rows[0]);
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete project
router.delete('/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if user is owner
    const project = await pool.query(
      'SELECT ownerId FROM Project WHERE ProjectID = $1',
      [projectId]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.rows[0].ownerid !== req.user.userId) {
      return res.status(403).json({ error: 'Only project owners can delete projects' });
    }

    await pool.query('DELETE FROM Project WHERE ProjectID = $1', [projectId]);
    
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Invite member to project
router.post('/:projectId/invitations', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    // Check if user is owner
    const project = await pool.query(
      'SELECT ownerId FROM Project WHERE ProjectID = $1',
      [projectId]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.rows[0].ownerid !== req.user.userId) {
      return res.status(403).json({ error: 'Only project owners can invite members' });
    }

    // Check if user exists
    const user = await pool.query('SELECT userid FROM appUser WHERE email = $1', [email]);
    
    const invitationId = uuidv4();
    await pool.query(
      `INSERT INTO ProjectInvitation (invitationId, projectId, email, invitedBy, status) 
       VALUES ($1, $2, $3, $4, 'Pending')`,
      [invitationId, projectId, email, req.user.userId]
    );

    // If user exists, automatically add them as member
    if (user.rows.length > 0) {
      await pool.query(
        'INSERT INTO ProjectMember (projectId, userId, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [projectId, user.rows[0].userid, 'Member']
      );
      await pool.query(
        'UPDATE ProjectInvitation SET status = $1 WHERE invitationId = $2',
        ['Accepted', invitationId]
      );
    }

    res.status(201).json({ message: 'Invitation sent', invitationId });
  } catch (err) {
    console.error('Invite member error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get project invitations
router.get('/:projectId/invitations', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if user is owner
    const project = await pool.query(
      'SELECT ownerId FROM Project WHERE ProjectID = $1',
      [projectId]
    );

    if (project.rows.length === 0 || project.rows[0].ownerid !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const invitations = await pool.query(
      'SELECT * FROM ProjectInvitation WHERE projectId = $1 ORDER BY createdAt DESC',
      [projectId]
    );

    res.json(invitations.rows);
  } catch (err) {
    console.error('Get invitations error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove invitation
router.delete('/:projectId/invitations/:invitationId', authenticateToken, async (req, res) => {
  try {
    const { projectId, invitationId } = req.params;

    // Check if user is owner
    const project = await pool.query(
      'SELECT ownerId FROM Project WHERE ProjectID = $1',
      [projectId]
    );

    if (project.rows.length === 0 || project.rows[0].ownerid !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query('DELETE FROM ProjectInvitation WHERE invitationId = $1', [invitationId]);
    res.json({ message: 'Invitation removed' });
  } catch (err) {
    console.error('Remove invitation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tasks for a project
router.get('/:projectId/tasks', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify user works on project
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
       ORDER BY t.createdAt DESC`,
      [projectId]
    );

    res.json(tasks.rows);
  } catch (err) {
    console.error('Get project tasks error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
