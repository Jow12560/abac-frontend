import React, { useState, useEffect ,CSSProperties} from 'react';
import { updateTeam, getTeamById } from '../../service/team.service'; 
import { getUsersByTeamId, deleteUserById, createUserByTeam } from '../../service/userByTeam.service';
import { getAllUser } from '../../service/user.service';
import Swal from 'sweetalert2';

const modalStyles:CSSProperties = {
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

interface EditTeamFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTeam: TeamData | null;
}

interface TeamData {
  team_id: number;
  team_name: string;
  owner: number;
  team_description?: string;
}

const EditTeamForm: React.FC<EditTeamFormProps> = ({ isOpen, onClose, selectedTeam }) => {
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [usernameInput, setUsernameInput] = useState(''); // Input for adding a member
  const [currentTeamMembers, setCurrentTeamMembers] = useState<any[]>([]); // Existing users in the team
  const [allUsers, setAllUsers] = useState<any[]>([]); // All users fetched from the service
  const [usersToAdd, setUsersToAdd] = useState<any[]>([]); // Users added during this session
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        if (selectedTeam) {
          // Fetch team data
          const teamData = await getTeamById(selectedTeam.team_id);
          setTeamName(teamData.team_name);
          setTeamDescription(teamData.team_description || '');

          // Fetch users of the team
          const teamUsers = await getUsersByTeamId(selectedTeam.team_id);

          // Filter out the owner from the list of users
          const nonOwnerUsers = teamUsers.users.filter((user: any) => user.user_id !== selectedTeam.owner);
          setCurrentTeamMembers(nonOwnerUsers);
        }

        // Fetch all users for adding a new member
        const users = await getAllUser();
        setAllUsers(users);
      } catch (error) {
        console.error('Failed to fetch users or team data:', error);
      }
    }
    fetchUsers();
  }, [selectedTeam]);

  // Add a user to the selected list (to be added when form is submitted)
  const handleAddUser = () => {
    const matchedUser = allUsers.find((user) => user.username === usernameInput);
  
    if (!matchedUser) {
      return alert('User not found with that username');
    }
  
    // Ensure the user is not in the current team members, the newly added members, or the owner
    const isUserInTeam = currentTeamMembers.some((user) => user.user_id === matchedUser.id); // Use `id` here
    const isUserAlreadyAdded = usersToAdd.some((user) => user.id === matchedUser.id); // Use `id` here
    const isOwner = matchedUser.id === selectedTeam?.owner; // Use `id` here
  
    if (isUserInTeam || isUserAlreadyAdded || isOwner) {
      return alert('This user is already a member of the team or is the owner.');
    }
  
    // If all checks pass, add the user to the list of users to add
    setUsersToAdd((prev) => [...prev, matchedUser]);
    setUsernameInput(''); // Clear input
  };

  // Remove a user from the current team
  const handleRemoveCurrentUser = async (userByTeamId: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to remove this user from the team?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
    });
  
    if (result.isConfirmed) {
      try {
        // Call the delete function using the user_by_team_id
        await deleteUserById(userByTeamId); 
  
        // Filter the user out from the currentTeamMembers list using user_by_team_id
        setCurrentTeamMembers((prev) =>
          prev.filter((user) => user.user_by_team_id !== userByTeamId)
        );
        
        Swal.fire('Removed!', 'The user has been removed from the team.', 'success');
      } catch (error) {
        Swal.fire('Failed!', 'Failed to remove the user from the team.', 'error');
      }
    }
  };

  // Remove a newly added user (without triggering any API calls)
  const handleRemoveNewUser = (userId: number) => {
    setUsersToAdd((prev) => prev.filter((user) => user.id !== userId)); // Ensure you're using `id` consistently
  };

  // Submit the team update form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
  
    setIsSubmitting(true);
  
    try {
      // Update the team name and description
      await updateTeam(selectedTeam.team_id, {
        team_name: teamName,
        team_description: teamDescription,
      });
  
      // Add new users to the team, mapping 'id' to 'user_id'
      for (const user of usersToAdd) {
        await createUserByTeam({ team_id: selectedTeam.team_id, user_id: user.id }); // Map 'id' to 'user_id'
      }
  
      Swal.fire('Success', 'Team updated successfully', 'success');
      onClose();
    } catch (error) {
      Swal.fire('Failed', 'Failed to update team. Please try again.', 'error');
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
        <h2>Edit Team</h2>
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
          <button type="button" onClick={handleAddUser} style={{ marginBottom: '1rem' }}>
            Add Member
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Team'}
          </button>

          <h4>Current Team Members (excluding the owner):</h4>
          <ul>
            {currentTeamMembers.map((user) => (
              <li key={user.user_by_team_id}> {/* Use user_by_team_id as key */}
                {user.user_name}
                <button 
                  type="button" // Ensure this button does not submit the form
                  onClick={() => handleRemoveCurrentUser(user.user_by_team_id)} // Pass user_by_team_id for deletion
                  style={{ marginLeft: '1rem', color: 'red', cursor: 'pointer' }}>
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <h4>Newly Added Members:</h4>
          <ul>
            {usersToAdd.length === 0 ? (
              <li>No new members added yet.</li>
            ) : (
              usersToAdd.map((user, index) => (
                <li key={`${user.id}-${index}`}> {/* Ensure unique key using `id` */}
                  {user.user_name || user.username || user.name} {/* Check different possible fields */}
                  <button
                    type="button" // Prevent form submission
                    onClick={() => handleRemoveNewUser(user.id)}
                    style={{ marginLeft: '1rem', color: 'red', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </li>
              ))
            )}
          </ul>
        </form>
      </div>
    </>
  );
};

export default EditTeamForm;
