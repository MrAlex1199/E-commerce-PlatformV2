import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();

  if (user === null) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!user) {
    // You might want to redirect to a login page
    return <Navigate to="/" />;
  }

  // You can add a loading indicator while the user data is being fetched
  if (user && !isAdmin) {
    // Redirect to home page if not an admin
    return <Navigate to="/" />;
  }

  return <>{user && isAdmin && children}</>;
};

export default AdminRoute;

