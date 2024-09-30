import React, { useState, useEffect } from 'react';
import { createTeam } from '../../service/team.service';
import { getAllUser } from '../../service/user.service';
import { createUserByTeam } from '../../service/userByTeam.service';
import Swal from 'sweetalert2';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTeam: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [newUsers, setNewUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const users = await getAllUser();
        setAllUsers(users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    }
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const handleAddUser = () => {
    const matchedUser = allUsers.find((user) => user.username === usernameInput);
    if (!matchedUser) {
      return alert('User not found with that username');
    }
    if (newUsers.some((user) => user.username === matchedUser.username)) {
      return alert('User is already added');
    }
    setNewUsers((prev) => [...prev, matchedUser]);
    setUsernameInput('');
  };

  const handleRemoveUser = (userId: number) => {
    setNewUsers((prev) => prev.filter((user) => user.user_id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      return alert('Please provide a team name');
    }
    setIsSubmitting(true);
    try {
      const newTeam = await createTeam({ team_name: teamName, team_description: teamDescription });
      for (const user of newUsers) {
        await createUserByTeam({ team_id: newTeam.teamId, user_id: user.user_id });
      }
      onClose();
    } catch (error) {
      console.error('Failed to create team:', error);
      alert('Failed to create team. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div>
      <h2>Add New Team</h2>
      <form onSubmit={handleSubmit}>
        <input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Team Name" required />
        <textarea value={teamDescription} onChange={(e) => setTeamDescription(e.target.value)} placeholder="Team Description" />
        <input value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="Add Member by Username" />
        <button type="button" onClick={handleAddUser}>Add Member</button>
        <ul>
          {newUsers.map((user) => (
            <li key={user.user_id}>{user.username} <button onClick={() => handleRemoveUser(user.user_id)}>Remove</button></li>
          ))}
        </ul>
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Create Team'}</button>
      </form>
    </div>
  );
};

export default CreateTeam;
