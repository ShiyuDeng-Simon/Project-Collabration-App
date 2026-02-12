import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAuth } from '../context/AuthContext';
import { ArrowBack as ArrowBackIcon, Add as AddIcon, People as PeopleIcon } from '@mui/icons-material';
import { Box, Button, Chip, Typography, Paper, CircularProgress } from '@mui/material';
import { statusColors } from '../styles/theme';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import ProjectMembersModal from '../components/ProjectMembersModal';
import InviteMemberModal from '../components/InviteMemberModal';
import AppHeader from '../components/AppHeader';

const KANBAN_COLUMNS = [
  { id: 'todo', title: 'To Do', status: 'To Do' },
  { id: 'inprogress', title: 'In Progress', status: 'In Progress' },
  { id: 'complete', title: 'Complete', status: 'Complete' }
];

export default function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
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

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  }, [id, token]);

  useEffect(() => {
    if (id && token) {
      setLoading(true);
      Promise.all([fetchProject(), fetchTasks()]).finally(() => {
        setLoading(false);
      });
    }
  }, [id, token, fetchProject, fetchTasks]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = draggableId;
    const destinationColumnId = destination.droppableId;

    // Find task
    const task = tasks.find(t => String(t.taskid || t.TaskID) === taskId);

    if (!task) {
      console.error('Task not found:', taskId);
      return;
    }

    // Map column IDs to statuses
    const columnToStatus = {
      'todo': 'To Do',
      'inprogress': 'In Progress',
      'complete': 'Complete'
    };
    const newStatus = columnToStatus[destinationColumnId];

    if (!newStatus) return;

    // Optimistic update
    setTasks(prev => prev.map(t => {
      const tId = String(t.taskid || t.TaskID || '');
      return tId === taskId ? { ...t, status: newStatus } : t;
    }));

    // Update on server
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVERURL || 'http://localhost:8000'}/api/tasks/${task.taskid || task.TaskID}/status`,
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
        fetchTasks(); // Revert on error
      }
    } catch (err) {
      console.error('Update task status error:', err);
      fetchTasks();
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => {
      const taskStatus = (task.status || task.Status || 'To Do').trim();
      return taskStatus === status.trim();
    });
  };

  const renderClone = (provided, snapshot, rubric) => {
    const task = tasks.find(t => String(t.taskid || t.TaskID) === rubric.draggableId);
    return (
      <div
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        ref={provided.innerRef}
        style={{
          ...provided.draggableProps.style,
          // width: '280px', // Removed to allow dynamic width
          zIndex: 9999, // Ensure it's on top
        }}
      >
        <TaskCard task={task} isDragging={true} />
      </div>
    );
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

  if (error || !project) {
    return (
      <>
        <AppHeader />
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">{error || 'Project not found'}</Typography>
          <Button onClick={() => navigate('/Home')} sx={{ mt: 2 }}>
            Back to Home
          </Button>
        </Box>
      </>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <AppHeader />
      <Box sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }, py: 4 }}>
        {/* Project Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/Home')}
            sx={{ mb: 2, color: '#64748b' }}
          >
            Back to Projects
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h3" sx={{
                fontWeight: 800,
                mb: 1,
                fontFamily: 'Poppins, sans-serif',
                color: '#1e293b'
              }}>
                {project.title || project.Title}
              </Typography>
              {project.description && (
                <Typography variant="body1" sx={{ color: '#64748b', mb: 2 }}>
                  {project.description}
                </Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <PeopleIcon sx={{ color: '#64748b', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  {project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}
                </Typography>
                <Button
                  size="small"
                  onClick={() => setShowMembersModal(true)}
                  sx={{
                    minWidth: 'auto',
                    p: '2px 8px',
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    ml: 1
                  }}
                >
                  View Members
                </Button>
                <Button
                  size="small"
                  onClick={() => setShowInviteModal(true)}
                  sx={{
                    minWidth: 'auto',
                    p: '2px 8px',
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    ml: 0.5,
                    color: '#0ea5e9'
                  }}
                >
                  Invite
                </Button>
                {project.status && (
                  <>
                    <Chip
                      label={project.status}
                      size="small"
                      sx={{
                        bgcolor: statusColors[project.status]?.bg || '#f1f5f9',
                        color: statusColors[project.status]?.text || '#475569',
                        fontWeight: 600,
                        ml: 1
                      }}
                    />
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={onDragEnd}>
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
            mb: 4
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
                    display: 'flex',
                    flexDirection: 'column'
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
                    renderClone={renderClone}
                  >
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                          flexGrow: 1,
                          backgroundColor: snapshot.isDraggingOver
                            ? `${statusColors[column.status]?.bg || '#f1f5f9'}80`
                            : 'transparent',
                          borderRadius: '8px',
                          transition: 'background-color 0.2s',
                          padding: '8px 0',
                          minHeight: '100px'
                        }}
                      >
                        {columnTasks.map((task, index) => {
                          const taskId = String(task.taskid || task.TaskID);
                          return (
                            <Draggable key={taskId} draggableId={taskId} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    marginBottom: '12px',
                                    ...provided.draggableProps.style,
                                    ...(snapshot.isDragging ? { opacity: 0 } : {}) // Hide original when dragging
                                  }}
                                >
                                  <TaskCard
                                    task={task}
                                    onClick={() => setSelectedTask(task)}
                                    isDragging={snapshot.isDragging}
                                  />
                                </div>
                              )}
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

        {showCreateTask && (
          <CreateTaskModal
            projectId={id}
            projectMembers={project?.members || []}
            defaultStatus={selectedColumn || 'To Do'}
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
            projectId={id}
            projectMembers={project?.members || []}
            onClose={() => setSelectedTask(null)}
            onUpdate={fetchTasks}
            onDelete={() => {
              fetchTasks();
              setSelectedTask(null);
            }}
          />
        )}

        <ProjectMembersModal
          open={showMembersModal}
          onClose={() => setShowMembersModal(false)}
          members={project?.members || []}
        />

        <InviteMemberModal
          open={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          projectId={id}
          onSuccess={() => {
            fetchProject(); // Refresh project data to show new member
          }}
        />
      </Box>
    </Box>
  );
}
