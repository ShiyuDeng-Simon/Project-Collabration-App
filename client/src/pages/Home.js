import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Add as AddIcon, Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { Box, Button, TextField, Select, MenuItem, Typography, Container, Chip, CircularProgress } from '@mui/material';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import AppHeader from '../components/AppHeader';

export default function Home() {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, Planning, Active, Completed
  const [sortBy, setSortBy] = useState('deadline'); // deadline, title, status
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, navigate]);

  const fetchProjects = useCallback(async () => {
    if (!user?.userId || !token) {
      console.log('Missing user or token:', { userId: user?.userId, hasToken: !!token });
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const url = `${process.env.REACT_APP_SERVERURL || 'http://localhost:8000'}/api/projects/user/${user.userId}`;
      console.log('Fetching projects from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        
        if (response.status === 401) {
          console.log('Unauthorized, redirecting to login');
          navigate('/');
          return;
        }
        throw new Error(errorData.error || `Failed to fetch projects: ${response.status}`);
      }

      const data = await response.json();
      console.log('Projects fetched:', data);
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.userId, token, navigate]);

  useEffect(() => {
    if (user?.userId) {
      fetchProjects();
    }
  }, [user?.userId, fetchProjects]);

  const handleProjectCreated = (newProject) => {
    setProjects([newProject, ...projects]);
      navigate(`/project/${newProject.projectid || newProject.ProjectID}`);
  };

  const handleProjectDeleted = (projectId) => {
    setProjects(projects.filter(p => p.projectid !== projectId));
  };

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      if (filter !== 'all' && project.status !== filter) return false;
      if (searchQuery && !project.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') {
        const aDate = a.enddate ? new Date(a.enddate) : new Date(0);
        const bDate = b.enddate ? new Date(b.enddate) : new Date(0);
        return aDate - bDate;
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'status') {
        const statusOrder = { Planning: 1, Active: 2, Completed: 3 };
        return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
      }
      return 0;
    });

  if (loading) {
    return (
      <>
        <AppHeader />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <AppHeader />
      <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }, maxWidth: '100%' }}>
        {/* Header */}
        <Box sx={{ 
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                mb: 1,
                fontFamily: 'Poppins, sans-serif',
                color: '#2d3436',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em'
              }}
            >
              Welcome back, {user?.firstName || 'User'}! 👋
            </Typography>
            <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 400 }}>
              Manage your projects and collaborate with your team
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateModal(true)}
            sx={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.25)',
              px: 3,
              py: 1.5,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #0284c7 0%, #7c3aed 100%)',
                boxShadow: '0 6px 20px 0 rgba(14, 165, 233, 0.35)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s'
            }}
          >
            Create Project
          </Button>
        </Box>

        {/* Filters and Search */}
        <Box sx={{ 
          mb: 3,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <TextField
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: '#94a3b8' }} />
            }}
            sx={{ 
              flex: 1, 
              minWidth: '200px',
              bgcolor: 'white',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FilterIcon sx={{ color: '#64748b' }} />
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{ 
                minWidth: '140px',
                bgcolor: 'white',
                borderRadius: 2
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="Planning">Planning</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={{ 
                minWidth: '160px',
                bgcolor: 'white',
                borderRadius: 2
              }}
            >
              <MenuItem value="deadline">Sort by Deadline</MenuItem>
              <MenuItem value="title">Sort by Title</MenuItem>
              <MenuItem value="status">Sort by Status</MenuItem>
            </Select>
          </Box>
        </Box>

        {/* Error Message */}
        {error && (
          <Box sx={{ 
            bgcolor: '#fee2e2',
            color: '#991b1b',
            p: 3,
            borderRadius: 2,
            mb: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {error}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => fetchProjects()}
              sx={{
                borderColor: '#991b1b',
                color: '#991b1b',
                '&:hover': {
                  borderColor: '#7f1d1d',
                  bgcolor: '#fecaca'
                }
              }}
            >
              Retry
            </Button>
          </Box>
        )}

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
              xl: 'repeat(5, 1fr)'
            },
            gap: 3
          }}>
            {filteredProjects.map((project) => (
              <Box key={project.projectid || project.ProjectID}>
                <ProjectCard
                  project={project}
                  onDelete={handleProjectDeleted}
                  onUpdate={fetchProjects}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{
            textAlign: 'center',
            p: 6,
            bgcolor: 'white',
            borderRadius: 3,
            boxShadow: 2
          }}>
            <Typography variant="h1" sx={{ mb: 2 }}>📁</Typography>
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, color: '#1e293b' }}>
              {searchQuery || filter !== 'all' 
                ? 'No projects match your filters' 
                : 'No projects yet'}
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
              {searchQuery || filter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first project to get started!'}
            </Typography>
            {!searchQuery && filter === 'all' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowCreateModal(true)}
                sx={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                Create Your First Project
              </Button>
            )}
          </Box>
        )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleProjectCreated}
        />
      )}
    </Container>
    </Box>
  );
}
