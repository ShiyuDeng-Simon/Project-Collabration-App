import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    // Remove any existing Google Sign-In scripts
    const removeExistingScript = () => {
      const existingScript = document.getElementById('google-signin');
      if (existingScript) {
        existingScript.remove();
      }
    };

    const loadGoogleScript = () => {
      removeExistingScript();
      
      const googleScript = document.createElement('script');
      googleScript.id = 'google-signin';
      googleScript.src = 'https://accounts.google.com/gsi/client';
      googleScript.async = true;
      googleScript.defer = true;

      googleScript.onload = () => {
        if (window.google && process.env.REACT_APP_GOOGLE_CLIENT_ID) {
          try {
            window.google.accounts.id.initialize({
              client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
              callback: handleCredentialResponse,
              auto_select: false,
              cancel_on_tap_outside: true
            });

            const signInDiv = document.getElementById("signInDiv");
            if (signInDiv) {
              window.google.accounts.id.renderButton(signInDiv, {
                theme: "outline",
                size: "large",
                type: "standard"
              });
            }
          } catch (error) {
            console.error('Error initializing Google Sign-In:', error);
          }
        } else {
          console.error('Google client library not loaded or Client ID not configured');
        }
      };

      document.body.appendChild(googleScript);
    };

    loadGoogleScript();

    // Cleanup function
    return () => {
      removeExistingScript();
    };
  }, []); // Empty dependency array

  async function handleCredentialResponse(response) {
    try {
      const decodedToken = jwtDecode(response.credential);
      
      const userData = {
        email: decodedToken.email,
        name: decodedToken.name
      };

      const apiResponse = await fetch(`${process.env.REACT_APP_SERVERURL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to save user');
      }

      const savedUser = await apiResponse.json();
      setUser(savedUser);
      navigate("/Home");
    } catch (err) {
      console.error('Login error:', err);
    }
  }

  return (
    <div className="login-container">
      <div id="signInDiv"></div>
    </div>
  );
}