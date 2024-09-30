import React, { useState, useEffect } from 'react';
import { createTeam, updateTeam, getTeamById } from '../../service/team.service'; 
import { getAllUser } from '../../service/user.service';
import { createUserByTeam, getUsersByTeamId, deleteUserById } from '../../service/userByTeam.service'; // Import required services
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2'; // Import SweetAlert

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTeam?: TeamData | null;
}

interface DecodedToken {
  userId: number;
}

interface TeamData {
  team_id?: number;
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
  width: '80%',
  height: '80%',
  backgroundColor: '#fff',
  padding: '2rem',
  borderRadius: '1rem',
  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
  zIndex: 1000,
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

const CreateTeam: React.FC<ModalProps> = ({ isOpen, onClose, selectedTeam }) => {
  const [teamName, setTeamName] = useState(''); 
  const [teamDescription, setTeamDescription] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [existingUsers, setExistingUsers] = useState<any[]>([]); // Users already in the team
  const [newUsers, setNewUsers] = useState<any[]>([]); // Users added during the session
  const [allUsers, setAllUsers] = useState<any[]>([]); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ownerId, setOwnerId] = useState<number | null>(null); // Store owner ID

  // Fetch all users and existing team members when the modal opens
  useEffect(() => {
    async function fetchUsers() {
      try {
        const users = await getAllUser();
        setAllUsers(users);

        if (selectedTeam) {
          const teamData = await getTeamById(selectedTeam.team_id!); // Fetch team data by ID
          setTeamName(teamData.team_name);
          setTeamDescription(teamData.team_description || '');
          setOwnerId(teamData.owner); // Set owner ID

          const teamUsers = await getUsersByTeamId(selectedTeam.team_id!); // Fetch users of the selected team
          setExistingUsers(teamUsers.users); // Ensure this is setting correctly
        }
      } catch (error) {
        console.error('Failed to fetch users or team data:', error);
      }
    }
    fetchUsers();
  }, [selectedTeam]);

  // Handle username input change
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsernameInput(e.target.value);
  };

  // Add user to the newUsers list if it exists in allUsers and isn't already in the existingUsers list
  const handleAddUser = () => {
    const matchedUser = allUsers.find((user) => user.username === usernameInput);

    if (!matchedUser) {
      return alert('User not found with that username');
    }

    if (existingUsers.some((user) => user.username === matchedUser.username)) {
      return alert('User is already part of the team');
    }

    if (newUsers.some((user) => user.username === matchedUser.username)) {
      return alert('User is already added');
    }

    setNewUsers((prev) => [...prev, matchedUser]);
    setUsernameInput(''); 
  };

  // Remove user from either newUsers or existingUsers with confirmation
  const handleRemoveUser = async (userId: number, isNewUser: boolean) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to remove this user from the team?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'No, keep it',
    });

    if (result.isConfirmed) {
      try {
        if (!isNewUser && selectedTeam) {
          // Only allow deleting users if they are part of the original team and the team is being edited
          await deleteUserById(userId);
        }
        if (isNewUser) {
          setNewUsers((prev) => prev.filter((user) => user.user_id !== userId));
        } else {
          setExistingUsers((prev) => prev.filter((user) => user.user_id !== userId));
        }
        Swal.fire('Removed!', 'The user has been removed from the team.', 'success');
      } catch (error) {
        Swal.fire('Failed!', 'Failed to remove the user from the team.', 'error');
      }
    }
  };

  // Handle form submission (both create and edit logic)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim() === '') {
      return alert('Please provide a team name');
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found. Redirect to login.');
        return;
      }

      const decoded: DecodedToken = jwtDecode(token);
      const userId = decoded.userId;

      if (selectedTeam) {
        // Edit logic
        await updateTeam(selectedTeam.team_id!, {
          team_name: teamName,
          team_description: teamDescription,
        });
        console.log('Team Updated:', selectedTeam); 
      } else {
        // Create logic
        const teamData: TeamData = {
          team_name: teamName,
          team_description: teamDescription,
          owner: userId,
          created_by: userId,
        };

        const newTeam = await createTeam(teamData);
        const teamId = newTeam.teamId;

        await createUserByTeam({ team_id: teamId, user_id: userId });

        for (const user of newUsers) {
          await createUserByTeam({
            team_id: teamId,
            user_id: user.user_id,
          });
        }
      }

      setTeamName('');
      setTeamDescription('');
      setNewUsers([]);
      setExistingUsers([]);
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
        <h2>{selectedTeam ? 'Edit Team' : 'Add New Team'}</h2>
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

          {/* Display Existing Members with Remove Option */}
          {existingUsers.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h4>Existing Members:</h4>
              <ul>
                {existingUsers
                  .filter((user) => user.user_id !== ownerId) // Exclude the owner
                  .map((user) => (
                    <li key={user.user_id}>
                      {user.user_name}
                      <button
                        type="button"
                        onClick={() => handleRemoveUser(user.user_id, false)}
                        style={{ marginLeft: '1rem', color: 'red', width: '30%', height: '100%', borderRadius: '0.25rem', fontSize: '1rem', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Display Newly Added Members with Remove Option */}
          {newUsers.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h4>Newly Added Members:</h4>
              <ul>
                {newUsers.map((user) => (
                  <li key={user.user_id}>
                    {user.user_name}
                    <button
                      type="button"
                      onClick={() => handleRemoveUser(user.user_id, true)}
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
