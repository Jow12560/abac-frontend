import React, { useEffect, useState } from 'react';
import { getTeamsByUserId } from '../../service/userByTeam.service';
import { createTeam, updateTeam } from '../../service/team.service';
import { jwtDecode } from 'jwt-decode';
import Header from '../../components/common/header';
import CreateTeam from './create_team_form'; // Import the modal form component
import SettingsIcon from '@mui/icons-material/Settings'; // Importing SettingsIcon from MUI

interface Team {
  team_id: number;
  team_name: string;
  team_description?: string;
  owner: number;
}

interface DecodedToken {
  userId: number;
}

const MiroStyleTeamPage = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Fetch teams and the current user's ID on component mount
  useEffect(() => {
    async function fetchTeams() {
      try {
        const token = localStorage.getItem('token'); 
        if (!token) {
          console.error('No token found. Redirect to login.');
          return; 
        }

        const decoded: DecodedToken = jwtDecode(token);
        const userId = decoded.userId;
        setCurrentUserId(userId); 

        const fetchedTeams = await getTeamsByUserId(userId); 
        setTeams(fetchedTeams.teams || []); 
      } catch (error) {
        console.error('Failed to fetch teams', error);
      }
    }

    fetchTeams();
  }, []);

  // Handle opening the modal for adding a new team
  const openAddTeamModal = () => {
    setSelectedTeam(null);
    setIsAddingTeam(true);
    setIsModalOpen(true); 
  };

  // Handle editing the details of a team
  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setIsAddingTeam(false);
    setIsModalOpen(true);
  };

  // Handle submission of new or updated team
  const handleAddOrUpdateTeamSubmit = async (team: { team_name: string; team_description?: string }) => {
    try {
      if (isAddingTeam) {
        await createTeam(team);
      } else if (selectedTeam) {
        await updateTeam(selectedTeam.team_id, { name: team.team_name, description: team.team_description });
      }
      setIsModalOpen(false);

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found. Redirect to login.');
        return;
      }

      const decoded: DecodedToken = jwtDecode(token);
      const userId = decoded.userId;
      const fetchedTeams = await getTeamsByUserId(userId);
      setTeams(fetchedTeams.teams || []);
    } catch (error) {
      console.error('Failed to create/update team', error);
    }
  };

  const pageStyles = {
    minHeight: '100vh',
    backgroundColor: '#f7fafc',
    padding: '2rem',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'column',
    width: '100vw',
    boxSizing: 'border-box',
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
    textAlign: 'left',
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
    gridTemplateColumns: 'repeat(4, 1fr)', // Four columns on desktop
    gap: '1.5rem',
    width: '100%',
  };

  const cardStyles = {
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '1rem',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    position: 'relative',
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

  const settingsIconStyles = {
    position: 'relative',
    top: '10px',
    right: '10px',
    cursor: 'pointer',
    color: '#3b82f6',
  };

  return (
    <div style={pageStyles}>
      <Header />
      <div style={containerStyles}>
        <div style={titleSectionStyles}>
          <h1 style={titleStyles}>Select Team</h1>
          <button style={addButtonStyles} onClick={openAddTeamModal}>
            Add Team
          </button>
        </div>

        <h2 style={titleStyles}>Teams</h2>
        <div style={gridStyles}>
          {teams.length === 0 ? (
            <p>No teams found.</p>
          ) : (
            teams.map((team) => (
              <div key={team.team_id} style={cardStyles}>
                <h2 style={cardTitleStyles}>{team.team_name}</h2>
                {team.owner === currentUserId && (
                  <SettingsIcon style={settingsIconStyles} onClick={() => handleEditTeam(team)} />
                )}
                <button style={buttonStyles}>View Details</button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for Adding or Editing Team */}
      <CreateTeam
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddOrUpdateTeamSubmit}
        selectedTeam={selectedTeam} 
      >
        {isAddingTeam ? (
          <div>
            <h2>Add New Team</h2>
          </div>
        ) : (
          selectedTeam && (
            <div>
              <h2>{selectedTeam.team_name}</h2>
              <p>Team ID: {selectedTeam.team_id}</p>
            </div>
          )
        )}
      </CreateTeam>
    </div>
  );
};

export default MiroStyleTeamPage;
