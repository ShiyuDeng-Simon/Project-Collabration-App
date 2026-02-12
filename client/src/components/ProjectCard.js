import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { 
  Card, 
  CardContent, 
  IconButton, 
  Menu, 
  MenuItem, 
  Chip, 
  Typography, 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { statusColors } from '../styles/theme';
import ProjectSettingsModal from './ProjectSettingsModal';

export default function ProjectCard({ project, onDelete, onUpdate }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOwner = project.userrole === 'Owner' || project.ownerid === user?.userId;
  const statusColor = statusColors[project.status] || statusColors.Active;

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVERURL || 'http://localhost:8000'}/api/projects/${project.projectid || project.ProjectID}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        onDelete(project.projectid || project.ProjectID);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
    setShowDeleteConfirm(false);
    handleMenuClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6
          },
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0'
        }}
        onClick={() => navigate(`/project/${project.projectid || project.ProjectID}`)}
      >
        <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
          {isOwner && (
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(255,255,255,0.9)',
                '&:hover': { bgcolor: 'white' }
              }}
            >
              <MoreVertIcon />
            </IconButton>
          )}

          <Chip
            label={project.status || 'Active'}
            size="small"
            sx={{
              mb: 2,
              bgcolor: statusColor.bg,
              color: statusColor.text,
              border: `1px solid ${statusColor.border}`,
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          />

          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              mb: 1,
              fontFamily: 'Poppins, sans-serif',
              color: '#1e293b',
              pr: isOwner ? 4 : 0
            }}
          >
            {project.title || project.projectname}
          </Typography>

          {project.description && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#64748b', 
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {project.description}
            </Typography>
          )}

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pt: 2,
            borderTop: '1px solid #f1f5f9'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
              <CalendarIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption">
                {formatDate(project.enddate)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PeopleIcon sx={{ fontSize: 16, color: '#64748b' }} />
              <Typography variant="caption" sx={{ fontWeight: 500, color: '#64748b' }}>
                {project.userrole || 'Member'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            setShowSettings(true);
            handleMenuClose();
          }}
        >
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit Project
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(true);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete Project
        </MenuItem>
      </Menu>

      {showSettings && (
        <ProjectSettingsModal
          project={project}
          onClose={() => setShowSettings(false)}
          onUpdate={onUpdate}
        />
      )}

      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      >
        <DialogTitle>Delete Project?</DialogTitle>
        <DialogContent>
          <Typography>
            This will permanently delete the project and all its tasks. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
