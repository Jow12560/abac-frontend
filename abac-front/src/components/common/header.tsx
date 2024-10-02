import { useNavigate, NavigateFunction } from 'react-router-dom';

// Placeholder for logout functionality
const handleLogout = (navigate: NavigateFunction) => {
  localStorage.removeItem('token'); // Remove the token
  // You can add any other logout logic here (e.g., clearing other session data)
  navigate('/', { replace: true }); // Redirect to login page and replace the current entry in the history stack
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
        <button style={logoutButtonStyles} onClick={() => handleLogout(navigate)}>
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
  marginLeft: '-4.0rem',
  flexWrap: 'wrap', // Allow wrapping for smaller screens
};

const leftSectionStyles = {
  flex: 1, // Push the name to the left
  textAlign: 'center', // Center text on smaller screens
};

const titleStyles = {
  fontSize: '1.75rem',
  fontWeight: 'bold',
  cursor: 'pointer', // Add cursor pointer to indicate clickable
  margin: '0', // Remove margin
};

const rightSectionStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center', // Center items on smaller screens
  flexWrap: 'wrap', // Allow wrapping for smaller screens
};

const profileStyles = {
  display: 'flex',
  alignItems: 'center',
  marginRight: '1rem',
  cursor: 'pointer',
  marginBottom: '0.5rem', // Add margin bottom for spacing on smaller screens
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
  marginBottom: '0.5rem', // Add margin bottom for spacing on smaller screens
};

// Media queries for responsive design
const mediaQueries = `
  @media (max-width: 768px) {
    ${headerStyles} {
      flexDirection: 'column',
      alignItems: 'center',
    }
    ${leftSectionStyles} {
      textAlign: 'center',
      marginBottom: '1rem',
    }
    ${rightSectionStyles} {
      justifyContent: 'center',
    }
  }
`;

// Inject media queries into the document
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(mediaQueries, styleSheet.cssRules.length);

export default Header;