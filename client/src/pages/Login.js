import {useEffect, useState} from 'react';
import {jwtDecode} from "jwt-decode";
import {useNavigate} from 'react-router-dom';

export default function Login() {
    let navigate = useNavigate();
    function handleCredentialResponse(response) {
        console.log("Encoded JWT ID token: " + response.credential);
        var decodedToken = jwtDecode(response.credential);
        console.log(decodedToken);
        console.log("Email: " + decodedToken.email);
        return navigate("/Home");
      }
    
      useEffect(() => {
        /* global google */
        google.accounts.id.initialize({
          client_id: "626764053327-nee9hhqq1vc7t938bp832e9qtpioplug.apps.googleusercontent.com",
          callback: handleCredentialResponse
        });
    
        google.accounts.id.renderButton(
          document.getElementById("signInDiv"),
          {
            theme: "outline",
            size: "large",
            callback: handleCredentialResponse
          }
        );
    
      }, []);

      return (
        <div id="signInDiv"></div>
      )
    
}