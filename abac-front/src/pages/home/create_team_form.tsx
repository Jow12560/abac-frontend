import React, { useState, useEffect } from 'react';
import { createTeam, updateTeam } from '../../service/team.service'; // Import updateTeam service
import { getAllUser } from '../../service/user.service';
import { createUserByTeam } from '../../service/userByTeam.service';
import { jwtDecode } from 'jwt-decode'; // Correctly import jwt-decode

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTeam?: TeamData | null; // Add selectedTeam prop for editing
}

interface DecodedToken {
  userId: number;
}

interface TeamData {
  team_id?: number; // For editing we need the team ID
  team_name: string;
  owner: number;
  created_by: number;
  team_description?: string;
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

const CreateTeam: React.FC<ModalProps> = ({ isOpen, onClose, selectedTeam }) => {
  const [teamName, setTeamName] = useState(selectedTeam?.team_name || ''); // Pre-populate for editing
  const [teamDescription, setTeamDescription] = useState(selectedTeam?.team_description || ''); // Pre-populate for editing
  const [usernameInput, setUsernameInput] = useState(''); // Input for typing a username
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]); // Users added to the team
  const [allUsers, setAllUsers] = useState<any[]>([]); // Store all users
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all users on component mount
  useEffect(() => {
    async function fetchUsers() {
      try {
        const users = await getAllUser();
        setAllUsers(users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    }

    fetchUsers();
  }, []);

  // Handle username input change
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsernameInput(e.target.value);
  };

  // Add user to selectedUsers if it exists in allUsers
  const handleAddUser = () => {
    const matchedUser = allUsers.find((user) => user.username === usernameInput);

    if (!matchedUser) {
      return alert('User not found with that username');
    }

    if (selectedUsers.some((user) => user.username === matchedUser.username)) {
      return alert('User is already added');
    }

    setSelectedUsers((prev) => [...prev, matchedUser]);
    setUsernameInput(''); // Clear the username input after adding
  };

  // Remove user from selectedUsers
  const handleRemoveUser = (userId: number) => {
    setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  // Handle form submission (both create and edit logic)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim() === '') {
      return alert('Please provide a team name');
    }

    console.log('Team Name:', teamName); // Log team name
    console.log('Team Description:', teamDescription); // Log team description

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      if (!token) {
        console.error('No token found. Redirect to login.');
        return; // Handle no token case (e.g., redirect to login)
      }

      const decoded: DecodedToken = jwtDecode(token); // Decode the token to get the userId
      const userId = decoded.userId;

      if (selectedTeam) {
        // If selectedTeam exists, we are editing a team
        const updatedTeamData: TeamData = {
          team_id: selectedTeam.team_id,
          team_name: teamName,
          team_description: teamDescription,
          owner: selectedTeam.owner,
          created_by: selectedTeam.created_by,
        };

        // Call update API
        await updateTeam(updatedTeamData.team_id!, {
          name: updatedTeamData.team_name,
          description: updatedTeamData.team_description,
        });
        console.log('Team Updated:', updatedTeamData); // Log updated team response

      } else {
        // Else, create a new team
        const teamData: TeamData = {
          team_name: teamName,
          team_description: teamDescription,
          owner: userId,
          created_by: userId,
        };

        console.log('Data being sent to createTeam API:', teamData); // Log team data

        // Create the team first
        const newTeam = await createTeam(teamData);
        console.log('New Team Created:', newTeam); // Log the new team response

        const teamId = newTeam.teamId; // Get the teamId from the response

        // Add the current user (creator) to the team
        await createUserByTeam({
          team_id: teamId,
          user_id: userId,
        });

        // Add each selected user to the team
        for (const user of selectedUsers) {
          await createUserByTeam({
            team_id: teamId,
            user_id: user.id,
          });
        }
      }

      // Clear inputs and close modal after success
      setTeamName('');
      setTeamDescription('');
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      console.error('Failed to create or update team or add members:', error);
      alert('Failed to create or update team or add members. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div style={overlayStyles} onClick={onClose} />
      <div style={modalStyles}>
        <button onClick={onClose} style={{ float: 'right', cursor: 'pointer' }}>Close</button>
        <h2>{selectedTeam ? 'Edit Team' : 'Add New Team'}</h2> {/* Change title based on mode */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>
              Team Name:
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
                style={{ padding: '0.5rem', width: '100%', borderRadius: '0.25rem', marginTop: '0.5rem' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>
              Team Description (optional):
              <textarea
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                style={{ padding: '0.5rem', width: '100%', borderRadius: '0.25rem', marginTop: '0.5rem' }}
              />
            </label>
          </div>

          {/* Add Member Section */}
          <div style={{ marginBottom: '1rem' }}>
            <label>
              Add Member by Username:
              <input
                type="text"
                value={usernameInput}
                onChange={handleUsernameChange}
                style={{ padding: '0.5rem', width: '100%', borderRadius: '0.25rem', marginTop: '0.5rem' }}
                placeholder="Search by exact username"
              />
            </label>
            <button type="button" onClick={handleAddUser} style={{ marginTop: '0.5rem' }}>
              Add Member
            </button>
          </div>

          {/* Display Selected Members with Remove Option */}
          {selectedUsers.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h4>Selected Members:</h4>
              <ul>
                {selectedUsers.map((user) => (
                  <li key={user.id}>
                    {user.username}
                    <button
                      type="button"
                      onClick={() => handleRemoveUser(user.id)}
                      style={{ marginLeft: '1rem', color: 'red', width: '30%', height: '100%', borderRadius: '0.25rem', fontSize: '1rem', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: '#fff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : selectedTeam ? 'Update Team' : 'Submit'}
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateTeam;
