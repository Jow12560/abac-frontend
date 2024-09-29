import React, { useState, useEffect } from 'react';
import { updateUser } from '../../service/user.service';
import {jwtDecode} from 'jwt-decode'; // Import jwt-decode for decoding the token

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: {
    username: string;
    name: string;
    address: string;
    phone_number: string;
  };
}

interface DecodedToken {
  userId: number;
}

const modalStyles = {
  position: 'fixed' as 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#fff',
  padding: '2rem',
  borderRadius: '1rem',
  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
  zIndex: 1000,
};

const overlayStyles = {
  position: 'fixed' as 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 999,
};

const EditProfileModal: React.FC<ModalProps> = ({ isOpen, onClose, profileData }) => {
  const [formData, setFormData] = useState(profileData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null); // Store userId from the token

  useEffect(() => {
    // Decode token and extract userId
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: DecodedToken = jwtDecode(token);
      setUserId(decodedToken.userId);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (!userId) {
        setMessage('User ID not found, please log in again.');
        return;
      }

      // Update user using the userId from the token
      await updateUser(userId, formData);
      setMessage('Profile updated successfully!');
      onClose(); // Close the modal after successful update
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage('Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <>
      <div style={overlayStyles} onClick={onClose} />
      <div style={modalStyles}>
        <button onClick={onClose} style={{ float: 'right', cursor: 'pointer' }}>Close</button>
        <h2>Edit Profile</h2>
        {message && <p>{message}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Full Name:</label>
            <input
              type="text"
              name="fullname"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Address:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Phone Number:</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </>
  );
};

export default EditProfileModal;
