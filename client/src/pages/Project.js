import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAuth } from '../context/AuthContext';
import { ArrowBack as ArrowBackIcon, Add as AddIcon, People as PeopleIcon } from '@mui/icons-material';
import { Box, Button, Chip, Typography, Paper, CircularProgress } from '@mui/material';
import { theme, statusColors, priorityColors } from '../styles/theme';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import AppHeader from '../components/AppHeader';

const KANBAN_COLUMNS = [
  { id: 'todo', title: 'To Do', status: 'To Do' },
  { id: 'inprogress', title: 'In Progress', status: 'In Progress' },
  { id: 'complete', title: 'Complete', status: 'Complete' }
];

export default function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, navigate]);

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVERURL || 'http://localhost:8000'}/api/projects/${id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/');
          return;
        }
        throw new Error('Failed to fetch project');
      }

      const data = await response.json();
      setProject(data);
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Failed to load project');
    }
  }, [id, token, navigate]);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVERURL || 'http://localhost:8000'}/api/tasks/project/${id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Normalize task status values to ensure compatibility
        const normalizedTasks = data.map(task => ({
          ...task,
          status: task.status || task.Status || 'To Do',
          taskid: task.taskid || task.TaskID
        }));
        setTasks(normalizedTasks);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  }, [id, token]);

  useEffect(() => {
    if (id && token) {
      fetchProject();
      fetchTasks();
      setLoading(false);
    }
  }, [id, token, fetchProject, fetchTasks]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    
    // Find task by matching the draggableId with taskid or TaskID
    const task = tasks.find(t => {
      const tId = String(t.taskid || t.TaskID || '');
      return tId === String(draggableId);
    });
    
    if (!task) {
      console.error('Task not found:', draggableId);
      return;
    }
    
    const currentStatus = task.status || task.Status || 'To Do';
    
    // Map droppableId back to status
    const droppableToStatus = {
      'todo': 'To Do',
      'inprogress': 'In Progress',
      'complete': 'Complete'
    };
    const newStatus = droppableToStatus[destination.droppableId] || destination.droppableId;
    
    if (currentStatus === newStatus) return;

    // Optimistic update
    setTasks(prev => prev.map(t => {
      const tId = String(t.taskid || t.TaskID || '');
      return tId === String(draggableId) ? { ...t, status: newStatus } : t;
    }));

    // Update on server
    try {
      const taskId = task.taskid || task.TaskID;
      const response = await fetch(
        `${process.env.REACT_APP_SERVERURL || 'http://localhost:8000'}/api/tasks/${taskId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!response.ok) {
        // Revert on error
        fetchTasks();
      }
    } catch (err) {
      console.error('Update task status error:', err);
      fetchTasks();
    }
  };

  const getTasksByStatus = (status) => {
    // Normalize status values to match column statuses
    return tasks.filter(task => {
      const taskStatus = (task.status || task.Status || 'To Do').trim();
      const normalizedColumnStatus = status.trim();
      // Exact match required
      return taskStatus === normalizedColumnStatus;
    });
  };

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

  if (error && !project) {
    return (
      <>
        <AppHeader />
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'error.main', mb: 2 }}>{error}</Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/Home')}
          >
            Back to Home
          </Button>
        </Box>
      </>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <AppHeader />
      <Box sx={{ 
        maxWidth: '100%',
        margin: '0 auto', 
        padding: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }
      }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/Home')}
            sx={{ mb: 2, color: '#0ea5e9', fontWeight: 600 }}
          >
            Back to Projects
          </Button>
          
          {project && (
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 1,
                  fontFamily: 'Poppins, sans-serif',
                  color: '#2d3436',
                  letterSpacing: '-0.02em'
                }}
              >
                {project.title || project.projectname}
              </Typography>
              {project.description && (
                <Typography variant="body1" sx={{ color: '#64748b', mb: 2 }}>
                  {project.description}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip 
                  label={project.status || 'Active'} 
                  sx={{
                    bgcolor: statusColors[project.status]?.bg || statusColors.Active.bg,
                    color: statusColors[project.status]?.text || statusColors.Active.text,
                    fontWeight: 600
                  }}
                />
                {project.members && project.members.length > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                    <PeopleIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2">
                      {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* Kanban Board */}
        <DragDropContext 
          onDragEnd={handleDragEnd}
        >
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: '1fr',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(3, 1fr)',
              xl: 'repeat(3, 1fr)'
            },
            gap: { xs: 2, sm: 2, md: 3 },
            mb: 4,
            position: 'relative',
            overflow: 'visible'
          }}>
            {KANBAN_COLUMNS.map((column) => {
              const columnTasks = getTasksByStatus(column.status);
              return (
                <Paper 
                  key={column.id} 
                  elevation={2}
                  sx={{
                    p: 3,
                    minHeight: '600px',
                    bgcolor: 'white',
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'visible',
                    '& > *': {
                      overflow: 'visible !important'
                    }
                  }}
                >
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    pb: 2,
                    borderBottom: `3px solid ${statusColors[column.status]?.border || '#e2e8f0'}`
                  }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600,
                      color: statusColors[column.status]?.text || '#1e293b'
                    }}>
                      {column.title}
                    </Typography>
                    <Chip 
                      label={columnTasks.length} 
                      size="small"
                      sx={{
                        bgcolor: statusColors[column.status]?.bg || '#f1f5f9',
                        color: statusColors[column.status]?.text || '#475569',
                        fontWeight: 600
                      }}
                    />
                  </Box>

                  {column.status === 'To Do' && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setSelectedColumn('To Do');
                        setShowCreateTask(true);
                      }}
                      sx={{ 
                        mb: 2,
                        borderColor: '#0ea5e9',
                        color: '#0ea5e9',
                        '&:hover': {
                          borderColor: '#0284c7',
                          bgcolor: 'rgba(14, 165, 233, 0.08)'
                        }
                      }}
                    >
                      Add Task
                    </Button>
                  )}

                  <Droppable 
                    droppableId={column.id}
                    type="TASK"
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          minHeight: '500px',
                          backgroundColor: snapshot.isDraggingOver 
                            ? `${statusColors[column.status]?.bg || '#f1f5f9'}80`
                            : 'transparent',
                          borderRadius: '8px',
                          transition: 'background-color 0.2s',
                          padding: snapshot.isDraggingOver ? '8px' : '0',
                          position: 'relative',
                          overflow: 'visible'
                        }}
                      >
                        {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: '#94a3b8',
                            fontSize: '0.875rem',
                            pointerEvents: 'none'
                          }}>
                            Drop tasks here
                          </div>
                        )}
                        {columnTasks.map((task, index) => {
                          const taskId = String(task.taskid || task.TaskID);
                          if (!taskId || taskId === 'undefined' || taskId === 'null') {
                            console.error('Invalid task ID:', task);
                            return null;
                          }
                          return (
                          <Draggable 
                            key={taskId} 
                            draggableId={taskId} 
                            index={index}
                            type="TASK"
                          >
                            {(provided, snapshot) => {
                              // CRITICAL: When dragging, use the style EXACTLY as provided
                              // Do NOT modify, merge, or override any properties
                              const baseStyle = provided.draggableProps.style || {};
                              
                              // Only modify style when NOT dragging
                              const finalStyle = snapshot.isDragging 
                                ? baseStyle  // Use exactly as-is when dragging
                                : {
                                    ...baseStyle,
                                    marginBottom: '12px'
                                  };
                              
                              return (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={finalStyle}
                                >
                                  <TaskCard
                                    task={task}
                                    onClick={() => setSelectedTask(task)}
                                    isDragging={snapshot.isDragging}
                                  />
                                </div>
                              );
                            }}
                          </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Paper>
              );
            })}
          </Box>
        </DragDropContext>
      </Box>

      {showCreateTask && (
        <CreateTaskModal
          projectId={id}
          projectMembers={project?.members || []}
          defaultStatus={selectedColumn}
          onClose={() => {
            setShowCreateTask(false);
            setSelectedColumn(null);
          }}
          onSuccess={() => {
            fetchTasks();
            setShowCreateTask(false);
            setSelectedColumn(null);
          }}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projectMembers={project?.members || []}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => {
            fetchTasks();
            setSelectedTask(null);
          }}
        />
      )}
    </Box>
  );
}
