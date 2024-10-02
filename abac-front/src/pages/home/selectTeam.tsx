import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { getTeamsByUserId } from '../../service/userByTeam.service';
import { deleteTeam } from '../../service/team.service'; // Import the deleteTeam function
import { jwtDecode } from 'jwt-decode';
import Header from '../../components/common/header';
import CreateTeamForm from './create_team_form'; // Modal for creating a team
import EditTeamForm from './edit_team_form'; // Modal for editing a team
import SettingsIcon from '@mui/icons-material/Settings'; // Importing SettingsIcon from MUI
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; // Importing DeleteForeverIcon
import Swal from 'sweetalert2'; // For sweet alert

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
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const navigate = useNavigate(); // Use navigate for routing

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

  // Handle opening the modal for editing a team
  const openEditTeamModal = (team: Team) => {
    setSelectedTeam(team);
    setIsAddingTeam(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle deleting a team
  const handleDeleteTeam = async (team: Team) => {
    const confirmation = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this team? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    });

    if (confirmation.isConfirmed) {
      try {
        await deleteTeam(team.team_id);
        Swal.fire('Deleted!', 'The team has been deleted.', 'success');
        setTeams((prevTeams) => prevTeams.filter((t) => t.team_id !== team.team_id)); // Remove the deleted team from the list
      } catch (error) {
        Swal.fire('Failed', 'Failed to delete the team. Please try again.', 'error');
      }
    }
  };

  // Navigate to the team detail page
  const handleViewTeam = (team_id: number) => {
    navigate(`/team/${team_id}`); // Navigate to /team/{team_id}
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7fafc', padding: '2rem', width: '100%' }}>
      <Header />
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Select Team</h1>
          <button
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#10b981',
              color: '#fff',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={openAddTeamModal}
          >
            Add Team
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {teams.length === 0 ? (
            <p>No teams found.</p>
          ) : (
            teams.map((team) => (
              <div
                key={team.team_id}
                style={{
                  backgroundColor: '#fff',
                  padding: '1rem',
                  borderRadius: '1rem',
                  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>{team.team_name}</h2>

                {team.owner === currentUserId && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '10px' }}>
                    <SettingsIcon
                      style={{ cursor: 'pointer', color: '#3b82f6' }}
                      onClick={() => openEditTeamModal(team)}
                    />
                    <DeleteForeverIcon
                      style={{ cursor: 'pointer', color: 'red' }}
                      onClick={() => handleDeleteTeam(team)}
                    />
                  </div>
                )}
                <button
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#3b82f6',
                    color: '#fff',
                    borderRadius: '0.75rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleViewTeam(team.team_id)} // Navigate to the team page on click
                >
                  View Team
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Conditionally render CreateTeamForm or EditTeamForm based on isAddingTeam */}
      {isModalOpen && (
        isAddingTeam ? (
          <CreateTeamForm isOpen={isModalOpen} onClose={closeModal} />
        ) : (
          <EditTeamForm isOpen={isModalOpen} onClose={closeModal} selectedTeam={selectedTeam} />
        )
      )}
    </div>
  );
};

export default MiroStyleTeamPage;
