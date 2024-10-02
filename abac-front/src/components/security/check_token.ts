import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const checkTokenAndRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // If no token found, redirect to login page
      navigate('/');
    }
  }, [navigate]); // Only run when component mounts
};
