import React, { useState, useEffect } from 'react';
import { updateTeam, getTeamById } from '../../service/team.service';
import { getUsersByTeamId, createUserByTeam, deleteUserById } from '../../service/userByTeam.service';
import Swal from 'sweetalert2';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTeam: { team_id: number; team_name: string; team_description?: string };
}

const EditTeam: React.FC<ModalProps> = ({ isOpen, onClose, selectedTeam }) => {
  const [teamName, setTeamName] = useState(selectedTeam.team_name);
  const [teamDescription, setTeamDescription] = useState(selectedTeam.team_description || '');
  const [existingUsers, setExistingUsers] = useState<any[]>([]);
  const [newUsers, setNewUsers] = useState<any[]>([]);

  useEffect(() => {
    if (selectedTeam && isOpen) {
      async function fetchTeamData() {
        try {
          const teamUsers = await getUsersByTeamId(selectedTeam.team_id);
          setExistingUsers(teamUsers.users);
        } catch (error) {
          console.error('Failed to fetch team users:', error);
        }
      }
      fetchTeamData();
    }
  }, [selectedTeam, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateTeam(selectedTeam.team_id, { team_name: teamName, team_description: teamDescription });
      for (const user of newUsers) {
        await createUserByTeam({ team_id: selectedTeam.team_id, user_id: user.user_id });
      }
      onClose();
    } catch (error) {
      console.error('Failed to update team:', error);
      alert('Failed to update team. Please try again.');
    }
  };

  const handleRemoveUser = async (userId: number, isNew: boolean) => {
    if (isNew) {
      setNewUsers((prev) => prev.filter((user) => user.user_id !== userId));
    } else {
      try {
        await deleteUserById(userId);
        setExistingUsers((prev) => prev.filter((user) => user.user_id !== userId));
      } catch (error) {
        Swal.fire('Failed!', 'Failed to remove the user from the team.', 'error');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div>
      <h2>Edit Team</h2>
      <form onSubmit={handleSubmit}>
        <input value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
        <textarea value={teamDescription} onChange={(e) => setTeamDescription(e.target.value)} />
        <ul>
          {existingUsers.map((user) => (
            <li key={user.user_id}>{user.username} <button onClick={() => handleRemoveUser(user.user_id, false)}>Remove</button></li>
          ))}
        </ul>
        <button type="submit">Update Team</button>
      </form>
    </div>
  );
};

export default EditTeam;
