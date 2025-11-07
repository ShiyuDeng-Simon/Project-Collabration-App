import { theme } from '../styles/theme';

function ProgressBar({ progress = 0, width = '100%' }) {
    const getColor = () => {
      if (progress === 100) return theme.colors.success;
      if (progress >= 50) return theme.colors.warning;
      return theme.colors.error;
    };

    return (
      <div style={{
        width: width,
        height: '24px',
        backgroundColor: theme.colors.borderLight,
        borderRadius: theme.borderRadius.full,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          width: `${Math.min(100, Math.max(0, progress))}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${getColor()} 0%, ${getColor()}dd 100%)`,
          transition: 'width 0.3s ease',
          borderRadius: theme.borderRadius.full,
          boxShadow: `0 2px 4px ${getColor()}40`
        }} />
        <span style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: theme.typography.fontSize.xs,
          fontWeight: 600,
          color: progress > 50 ? '#fff' : theme.colors.text,
          textShadow: progress > 50 ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
          zIndex: 1
        }}>
          {progress}%
        </span>
      </div>
    );
  }
  
  export default ProgressBar;