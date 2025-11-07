// Modern, cool, but warm theme
export const theme = {
  colors: {
    primary: '#0ea5e9', // Sky blue
    primaryLight: '#38bdf8',
    primaryDark: '#0284c7',
    secondary: '#8b5cf6', // Violet
    secondaryLight: '#a78bfa',
    accent: '#f59e0b', // Warm amber
    accent2: '#10b981', // Emerald
    accent3: '#ec4899', // Pink (subtle)
    success: '#10b981', // Emerald
    warning: '#f59e0b', // Amber
    error: '#ef4444', // Red
    background: '#f8fafc', // Cool gray
    surface: '#ffffff',
    surfaceHover: '#f1f5f9',
    text: '#1e293b', // Slate
    textLight: '#64748b',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)', // Sky blue to violet
    secondary: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', // Violet to pink
    accent: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', // Amber to red
    warm: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', // Cool gray background
    vibrant: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 50%, #ec4899 100%)', // Multi-color
    modern: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', // Deep blue
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    colored: '0 4px 14px 0 rgba(14, 165, 233, 0.15)',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      display: ['Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  transitions: {
    default: 'all 0.2s ease-in-out',
    fast: 'all 0.15s ease-in-out',
    slow: 'all 0.3s ease-in-out',
  },
};

export const priorityColors = {
  Low: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' }, // Amber
  Medium: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' }, // Blue
  High: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' }, // Red
};

export const statusColors = {
  'To Do': { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' }, // Cool gray
  'In Progress': { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' }, // Blue
  'Complete': { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' }, // Green
  Planning: { bg: '#f3e8ff', text: '#6b21a8', border: '#c084fc' }, // Purple
  Active: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' }, // Blue
  Completed: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' }, // Green
};
