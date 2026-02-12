import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Close as CloseIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  ChatBubbleOutline as ChatIcon 
} from '@mui/icons-material';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Chip, 
  Box, 
  Typography, 
  IconButton,
  Slider,
  Alert,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import { priorityColors } from '../styles/theme';
import ProgressBar from './ProgressBar';

export default function TaskDetailModal({ task, projectMembers, onClose, onUpdate }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title || task.taskname || '',
    description: task.description || '',
    deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
    assigneeId: task.assigneeid || '',
    priority: task.priority || 'Medium',
    progress: task.progress || 0,
    status: task.status || 'To Do'
  });
  const taskId = task.taskid || task.TaskID;

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVERURL || 'http://localhost:8000'}/api/comments/task/${taskId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  }, [taskId, token]);

  useEffect(() => {
    if (taskId) {
      fetchComments();
      // Poll for new comments every 5 seconds (simple real-time)
      const interval = setInterval(fetchComments, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchComments, taskId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProgressChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, progress: newValue }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVERURL || 'http://localhost:8000'}/api/tasks/${taskId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formData,
            assigneeId: formData.assigneeId || null
          })
        }
      );

      const updated = await response.json();

      if (!response.ok) {
        throw new Error(updated.error || 'Failed to update task');
      }

      setIsEditing(false);
      onUpdate();
    } catch (err) {
      console.error('Update task error:', err);
      setError(err.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVERURL || 'http://localhost:8000'}/api/tasks/${taskId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        onUpdate();
      }
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVERURL || 'http://localhost:8000'}/api/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            taskId,
            content: newComment.trim()
          })
        }
      );

      if (response.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (err) {
      console.error('Add comment error:', err);
    }
  };

  const assignee = projectMembers.find(m => m.userid === (task.assigneeid || task.assigneeId));
  const assigneeName = assignee 
    ? `${assignee.firstname || assignee.firstName} ${assignee.lastname || assignee.lastName || ''}`.trim()
    : 'Unassigned';

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'center',
          justifyContent: 'center'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Task Details
        </Typography>
        <Box>
          <IconButton
            onClick={() => setIsEditing(!isEditing)}
            sx={{ mr: 1 }}
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={handleDelete}
            sx={{ mr: 1 }}
            size="small"
            color="error"
          >
            <DeleteIcon />
          </IconButton>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {isEditing ? (
          <form onSubmit={handleUpdate}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Assign To</InputLabel>
              <Select
                name="assigneeId"
                value={formData.assigneeId}
                onChange={handleChange}
                label="Assign To"
              >
                <MenuItem value="">Unassigned</MenuItem>
                {projectMembers.map(member => (
                  <MenuItem key={member.userid} value={member.userid}>
                    {member.firstname || member.firstName} {member.lastname || member.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mb: 2 }}>
              <Typography gutterBottom>
                Progress: {formData.progress}%
              </Typography>
              <Slider
                name="progress"
                value={formData.progress}
                onChange={handleProgressChange}
                min={0}
                max={100}
                marks
                step={5}
              />
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <DialogActions>
              <Button onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={20} /> : 'Save Changes'}
              </Button>
            </DialogActions>
          </form>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={task.priority || 'Medium'}
                  sx={{
                    bgcolor: priorityColors[task.priority]?.bg || priorityColors.Medium.bg,
                    color: priorityColors[task.priority]?.text || priorityColors.Medium.text,
                    fontWeight: 600
                  }}
                />
                <Chip
                  label={task.status || 'To Do'}
                  variant="outlined"
                />
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {task.title || task.taskname}
              </Typography>

              {task.description && (
                <Typography variant="body1" sx={{ color: '#64748b', mb: 2 }}>
                  {task.description}
                </Typography>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                  Progress
                </Typography>
                <ProgressBar progress={task.progress || 0} />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Assigned to:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {assigneeName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Deadline:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Comments Section */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ChatIcon />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Comments ({comments.length})
                </Typography>
              </Box>

              <Box sx={{ 
                maxHeight: '300px', 
                overflow: 'auto', 
                mb: 2,
                pr: 1
              }}>
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <Paper
                      key={comment.commentid}
                      sx={{
                        p: 2,
                        mb: 1.5,
                        bgcolor: '#f8fafc',
                        borderRadius: 2
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {comment.authorfirstname || comment.authorFirstName} {comment.authorlastname || comment.authorLastName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {new Date(comment.createdat || comment.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#1e293b' }}>
                        {comment.content}
                      </Typography>
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', py: 4 }}>
                    No comments yet. Be the first to comment!
                  </Typography>
                )}
              </Box>

              <form onSubmit={handleAddComment}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!newComment.trim()}
                  sx={{
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)'
                  }}
                >
                  Post Comment
                </Button>
              </form>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
