const express = require('express');
const router = express.Router();
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

// Get all comments for a task
router.get('/task/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;

    // Verify user has access to the task's project
    const task = await pool.query('SELECT ProjectID FROM Task WHERE TaskID = $1', [taskId]);
    
    if (task.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const projectId = task.rows[0].projectid;

    const userProject = await pool.query(
      `SELECT 1 FROM Project p
       LEFT JOIN ProjectMember pm ON p.ProjectID = pm.projectId
       WHERE p.ProjectID = $1 AND (p.ownerId = $2 OR pm.userId = $2)`,
      [projectId, req.user.userId]
    );

    if (userProject.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const comments = await pool.query(
      `SELECT c.*, u.email as authorEmail, u.firstname as authorFirstName, u.lastname as authorLastName
       FROM TaskComment c
       LEFT JOIN appUser u ON c.authorId = u.userid
       WHERE c.taskId = $1
       ORDER BY c.createdAt ASC`,
      [taskId]
    );

    res.json(comments.rows);
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new comment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { taskId, content } = req.body;

    if (!taskId || !content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Task ID and content are required' });
    }

    // Verify user has access to the task's project
    const task = await pool.query('SELECT ProjectID FROM Task WHERE TaskID = $1', [taskId]);
    
    if (task.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const projectId = task.rows[0].projectid;

    const userProject = await pool.query(
      `SELECT 1 FROM Project p
       LEFT JOIN ProjectMember pm ON p.ProjectID = pm.projectId
       WHERE p.ProjectID = $1 AND (p.ownerId = $2 OR pm.userId = $2)`,
      [projectId, req.user.userId]
    );

    if (userProject.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const commentId = uuidv4();
    const newComment = await pool.query(
      `INSERT INTO TaskComment (commentId, taskId, authorId, content, createdAt) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [commentId, taskId, req.user.userId, content.trim(), new Date()]
    );

    // Get comment with author info
    const commentWithAuthor = await pool.query(
      `SELECT c.*, u.email as authorEmail, u.firstname as authorFirstName, u.lastname as authorLastName
       FROM TaskComment c
       LEFT JOIN appUser u ON c.authorId = u.userid
       WHERE c.commentId = $1`,
      [commentId]
    );
    
    res.status(201).json(commentWithAuthor.rows[0]);
  } catch (err) {
    console.error('Create comment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update comment
router.put('/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Verify comment exists and user is the author
    const existingComment = await pool.query(
      'SELECT authorId FROM TaskComment WHERE commentId = $1',
      [commentId]
    );

    if (existingComment.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (existingComment.rows[0].authorid !== req.user.userId) {
      return res.status(403).json({ error: 'You can only edit your own comments' });
    }

    const updatedComment = await pool.query(
      `UPDATE TaskComment SET content = $1 WHERE commentId = $2 RETURNING *`,
      [content.trim(), commentId]
    );

    // Get comment with author info
    const commentWithAuthor = await pool.query(
      `SELECT c.*, u.email as authorEmail, u.firstname as authorFirstName, u.lastname as authorLastName
       FROM TaskComment c
       LEFT JOIN appUser u ON c.authorId = u.userid
       WHERE c.commentId = $1`,
      [commentId]
    );
    
    res.json(commentWithAuthor.rows[0]);
  } catch (err) {
    console.error('Update comment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete comment
router.delete('/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    // Verify comment exists and user is the author
    const existingComment = await pool.query(
      'SELECT authorId FROM TaskComment WHERE commentId = $1',
      [commentId]
    );

    if (existingComment.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (existingComment.rows[0].authorid !== req.user.userId) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    await pool.query('DELETE FROM TaskComment WHERE commentId = $1', [commentId]);
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

