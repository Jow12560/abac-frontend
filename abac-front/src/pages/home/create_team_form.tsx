import React, { useState, useEffect,CSSProperties } from 'react';
import { createTeam } from '../../service/team.service'; 
import { createUserByTeam } from '../../service/userByTeam.service';
import { getAllUser } from '../../service/user.service';
import {jwtDecode} from 'jwt-decode';
import Swal from 'sweetalert2';

const modalStyles: CSSProperties = {
  position: 'fixed' as 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  maxWidth: '1000px',
  height: '80%',
  backgroundColor: '#fff',
  padding: '2rem',
  borderRadius: '1rem',
  zIndex: 1000,
  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  overflowY: 'auto',
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

interface CreateTeamFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTeamForm: React.FC<CreateTeamFormProps> = ({ isOpen, onClose }) => {
  const [teamName, setTeamName] = useState(''); 
  const [teamDescription, setTeamDescription] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]); 
  const [allUsers, setAllUsers] = useState<any[]>([]); 
  const [currentUserUsername, setCurrentUserUsername] = useState<string>(''); // Store current user's username
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all users and decode the current user's username from the token
  useEffect(() => {
    async function fetchUsers() {
      try {
        const users = await getAllUser();
        setAllUsers(users);

        // Decode the token and get the current user's username
        const token = localStorage.getItem('token');
        if (token) {
          const decoded: { userId: number; username: string } = jwtDecode(token);
          setCurrentUserUsername(decoded.username); // Store current user's username
        }
      } catch (error) {
        console.error('Failed to fetch users or decode token:', error);
      }
    }
    fetchUsers();
  }, []);

  // Handle adding a user to the team
  const handleAddUser = () => {
    if (usernameInput === currentUserUsername) {
      return alert('You cannot add yourself as a member.');
    }

    const matchedUser = allUsers.find((user) => user.username === usernameInput);

    if (!matchedUser) {
      return alert('User not found with that username');
    }

    if (selectedUsers.some((user) => user.username === matchedUser.username)) {
      return alert('User is already added');
    }

    setSelectedUsers((prev) => [...prev, matchedUser]);
    setUsernameInput('');
  };

  const handleRemoveUser = (username: string) => {
    setSelectedUsers((prev) => prev.filter((user) => user.username !== username));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim() === '') {
      return alert('Please provide a team name');
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found.');

      const decoded: { userId: number } = jwtDecode(token);
      const userId = decoded.userId;

      const newTeam = await createTeam({
        team_name: teamName,
        team_description: teamDescription,
        owner: userId,
        create_by: userId,
      });

      const teamId = newTeam.teamId;

      await createUserByTeam({ team_id: teamId, user_id: userId });

      for (const user of selectedUsers) {
        if (!user.id) {
          console.error('Error: id is missing for user:', user);
          continue; // Skip users without id to avoid database constraint violation
        }
        await createUserByTeam({ team_id: teamId, user_id: user.id });
      }

      Swal.fire('Success', 'Team created successfully', 'success');
      setTeamName('');
      setTeamDescription('');
      setSelectedUsers([]);
      onClose();
      window.location.reload();
    } catch (error) {
      Swal.fire('Failed', 'Failed to create team. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div style={overlayStyles} onClick={onClose}></div>
      <div style={modalStyles}>
        <button onClick={onClose} style={{ float: 'right', cursor: 'pointer' }}>Close</button>
        <h2>Create New Team</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Team Name"
            required
            style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
          />
          <textarea
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
            placeholder="Team Description"
            style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
          />
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="Add member by username"
            style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
          />
          <button type="button" onClick={handleAddUser} style={{ marginBottom: '1rem' }}>Add Member</button>

          {/* Display selected users */}
          {selectedUsers.length > 0 && (
            <div>
              <h4>Selected Members:</h4>
              <ul>
                {selectedUsers.map((user, index) => (
                  <li key={user.id || index}>
                    {user.username}
                    <button onClick={() => handleRemoveUser(user.username)} style={{ marginLeft: '1rem', color: 'red', cursor: 'pointer' }}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Team'}
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateTeamForm;