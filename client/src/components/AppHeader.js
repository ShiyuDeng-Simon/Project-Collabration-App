import { useAuth } from '../context/AuthContext';
import { LogoutOutlined, AccountCircle } from '@mui/icons-material';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Avatar, Box } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  if (!user) return null;

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
        boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.25)'
      }}
    >
      <Toolbar sx={{ maxWidth: '100%', margin: '0 auto', width: '100%', px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 } }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 700,
            fontFamily: 'Poppins, sans-serif',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/Home')}
        >
          UniCollab 🎓
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            sx={{
              display: { xs: 'none', sm: 'block' },
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.35)'
            }}
          >
            {user.firstName} {user.lastName}
          </Typography>
          <IconButton
            size="large"
            onClick={handleMenuOpen}
            sx={{ color: 'white' }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
              {user.firstName?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>
              <LogoutOutlined sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
