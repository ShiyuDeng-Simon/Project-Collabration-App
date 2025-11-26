import { useEffect, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, Alert, CircularProgress, Container, Paper } from '@mui/material';

export default function Login() {
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCredentialResponse = useCallback(async (response) => {
    try {
      setLoading(true);
      setError(null);
      
      // Send Google credential token to backend for verification
      // Backend will verify the token and extract user info
      const serverResponse = await fetch(`${process.env.REACT_APP_SERVERURL || 'http://localhost:8000'}/api/auth/google-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: response.credential // Send the raw credential token
        })
      });

      const data = await serverResponse.json();

      if (!serverResponse.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Login with token from server
      login(data.token, data.user);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to authenticate. Please try again.');
      setLoading(false);
    }
  }, [login]);

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
        if (!clientId) {
          console.error('REACT_APP_GOOGLE_CLIENT_ID is not set!');
          setError('Google OAuth is not configured. Please set REACT_APP_GOOGLE_CLIENT_ID.');
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse
        });

        window.google.accounts.id.renderButton(
          document.getElementById("signInDiv"),
          {
            theme: "outline",
            size: "large"
          }
        );
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [handleCredentialResponse]);

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
      padding: 3
    }}>
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: 5,
            borderRadius: 4,
            textAlign: 'center',
            background: 'white'
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 1,
              fontFamily: 'Poppins, sans-serif',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 2
            }}
          >
            UniCollab 🎓
          </Typography>
          <Typography variant="h6" sx={{ color: '#64748b', mb: 4, fontWeight: 400 }}>
            Your project collaboration platform
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ mb: 3 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2, color: '#64748b' }}>
                Authenticating...
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <div id="signInDiv"></div>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
