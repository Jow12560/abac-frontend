import React from 'react';
import { useNavigate } from 'react-router-dom';

// Placeholder for logout functionality
const handleLogout = () => {
  localStorage.removeItem('token'); // Remove the token (if using JWT)
  // You can add any other logout logic here
  window.location.href = '/'; // Redirect to login page
};

const Header = () => {
  const navigate = useNavigate();

  const handleTitleClick = () => {
    navigate('/select-team');
  };

  return (
    <header style={headerStyles}>
      {/* Website Name */}
      <div style={leftSectionStyles}>
        <h1 style={titleStyles} onClick={handleTitleClick}>JowManagement App</h1>
      </div>

      {/* Right Section - Profile and Logout */}
      <div style={rightSectionStyles}>
        {/* Profile Icon */}
        <div style={profileStyles} onClick={() => navigate('/profile')}>
          <img
            src="/path-to-your-profile-icon.png" // Replace with your profile icon path
            alt="Profile Icon"
            style={iconStyles}
          />
          <span style={profileTextStyles}>Profile</span>
        </div>

        {/* Logout Button */}
        <button style={logoutButtonStyles} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

// Inline CSS styles
const headerStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 2rem',
  backgroundColor: '#3b82f6', // Blue background
  color: '#fff', // White text
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  width: '100%', // Full width
  marginTop: '-4.0rem',
};

const leftSectionStyles = {
  flex: 1, // Push the name to the left
};

const titleStyles = {
  fontSize: '1.75rem',
  fontWeight: 'bold',
  marginLeft: '-85rem',
  cursor: 'pointer', // Add cursor pointer to indicate clickable
};

const rightSectionStyles = {
  display: 'flex',
  alignItems: 'center',
};

const profileStyles = {
  display: 'flex',
  alignItems: 'center',
  marginRight: '1rem',
  cursor: 'pointer',
};

const iconStyles = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  marginRight: '0.5rem',
};

const profileTextStyles = {
  fontSize: '1rem',
  color: '#fff',
};

const logoutButtonStyles = {
  padding: '0.5rem 1rem',
  backgroundColor: '#ef4444', // Red background
  color: '#fff',
  border: 'none',
  borderRadius: '0.5rem',
  cursor: 'pointer',
};

export default Header;