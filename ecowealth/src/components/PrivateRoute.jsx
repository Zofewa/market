import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function PrivateRoute({ children }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:5001/checklogin', { withCredentials: true });
        setIsAuth(response.data.loggedIn); 
      } catch {
        setIsAuth(false);
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  if (!authChecked) return <div>Checking authentication...</div>;
  return isAuth ? children : <Navigate to="/signin" replace />;
}