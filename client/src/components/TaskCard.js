import { CalendarToday as CalendarIcon, Person as PersonIcon } from '@mui/icons-material';
import { Card, CardContent, Chip, Typography, Box } from '@mui/material';
import { priorityColors } from '../styles/theme';
import ProgressBar from './ProgressBar';

export default function TaskCard({ task, onClick, isDragging }) {
  const priorityColor = priorityColors[task.priority] || priorityColors.Medium;
  const assigneeName = task.assigneefirstname 
    ? `${task.assigneefirstname} ${task.assigneelastname || ''}`.trim()
    : 'Unassigned';

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        // Critical: Remove all transforms when dragging - react-beautiful-dnd controls positioning
        transform: isDragging ? 'none !important' : 'none',
        transition: isDragging ? 'none !important' : 'all 0.2s',
        mb: 0,
        borderRadius: 2,
        border: `1px solid ${priorityColor.border}`,
        background: 'white',
        // Ensure visibility during drag
        opacity: isDragging ? 1 : 1,
        visibility: isDragging ? 'visible' : 'visible',
        pointerEvents: isDragging ? 'none' : 'auto',
        // Remove any Material-UI default transforms
        '&::before': {
          display: isDragging ? 'none' : 'none'
        },
        '&:hover': {
          boxShadow: isDragging ? 'none' : 4,
          transform: isDragging ? 'none !important' : 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Chip
          label={task.priority || 'Medium'}
          size="small"
          sx={{
            mb: 1.5,
            bgcolor: priorityColor.bg,
            color: priorityColor.text,
            border: `1px solid ${priorityColor.border}`,
            fontWeight: 600,
            fontSize: '0.7rem',
            height: '20px'
          }}
        />

        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: '#1e293b',
            fontSize: '0.95rem'
          }}
        >
          {task.title || task.taskname}
        </Typography>

        {task.description && (
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              mb: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: '0.8rem'
            }}
          >
            {task.description}
          </Typography>
        )}

        <Box sx={{ mb: 1.5 }}>
          <ProgressBar progress={task.progress || 0} />
        </Box>

        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PersonIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption">{assigneeName}</Typography>
          </Box>
          {task.deadline && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption">{formatDate(task.deadline)}</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
