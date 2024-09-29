import React, { useState, useEffect } from 'react';
import { getUserById } from '../../service/user.service';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode for decoding the token
import EditProfileModal from './EditProfileModal';
import Header from '../../components/common/header';

interface DecodedToken {
  userId: number;
}

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState({
    username: '',
    name: '',
    address: '',
    phone_number: '',
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch user profile when component mounts
  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem('token'); // Get the token from localStorage
        if (!token) {
          setMessage('No token found, please log in.');
          return;
        }

        const decoded: DecodedToken = jwtDecode(token); // Decode the token to get the userId
        const userId = decoded.userId;

        const userData = await getUserById(userId); // Fetch user data by userId
        setProfileData(userData);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setMessage('Failed to load user profile.');
      }
    }

    fetchProfile();
  }, []);

  // Toggle modal open/close state
  const toggleEditModal = () => {
    setIsEditModalOpen(!isEditModalOpen);
  };

  // Styles (similar to MiroStyleTeamPage)
  const pageStyles = {
    minHeight: '100vh',
    backgroundColor: '#f7fafc',
    padding: '2rem',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'column',
    width: '100vw',
    boxSizing: 'border-box' as const,
  };

  const containerStyles = {
    width: '100%',
  };

  const titleSectionStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  };

  const titleStyles = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    textAlign: 'left' as const,
  };

  const addButtonStyles = {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#10b981',
    color: '#fff',
    borderRadius: '0.5rem',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.5rem',
    width: '100%',
  };

  const cardStyles = {
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '1rem',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
    textAlign: 'center' as const,
  };

  const cardTitleStyles = {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1rem',
  };

  const buttonStyles = {
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: '#fff',
    borderRadius: '0.75rem',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
  };

  return (
    <div style={pageStyles}>
      <Header />
      <div style={containerStyles}>
        {/* Title Section */}
        <div style={titleSectionStyles}>
          <h1 style={titleStyles}>Profile</h1>
        </div>

        {/* Profile Information */}
        <div style={gridStyles}>
          <div style={cardStyles}>
            <h2 style={cardTitleStyles}>Username: {profileData.username}</h2>
            <p><strong>Name:</strong> {profileData.name || 'Not provided'}</p>
            <p><strong>Address:</strong> {profileData.address || 'Not provided'}</p>
            <p><strong>Phone Number:</strong> {profileData.phone_number || 'Not provided'}</p>
            <button style={buttonStyles} onClick={toggleEditModal}>
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && <EditProfileModal isOpen={isEditModalOpen} onClose={toggleEditModal} profileData={profileData} />}
    </div>
  );
};

export default ProfilePage;
