import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTaskById } from '../../service/task.service'; // Assuming task service
import { getTeamById } from '../../service/team.service'; // Assuming team service
import CreateTaskModal from './CreateTaskModal';
import Header from '../../components/common/header'; // Import the header component

const TaskPage: React.FC = () => {
  const { team_id } = useParams<{ team_id: string }>(); // Get team ID from route params
  const [teamName, setTeamName] = useState('');
  const [tasks, setTasks] = useState<any[]>([]); // Store tasks
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility

  // Fetch team details and tasks
  useEffect(() => {
    async function fetchTeamAndTasks() {
      try {
        const team = await getTeamById(Number(team_id)); // Fetch team by ID
        setTeamName(team.team_name);

        // Fetch tasks by team ID (replace with the correct task fetching logic if needed)
        const task = await getTaskById(Number(team_id));
        setTasks([task]); // Assuming a single task, adjust this for multiple tasks if needed
      } catch (error) {
        console.error('Failed to fetch team or tasks:', error);
      }
    }
    fetchTeamAndTasks();
  }, [team_id]);

  // Open create task modal
  const handleCreateTaskClick = () => {
    setIsModalOpen(true);
  };

  // Close create task modal
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7fafc', padding: '2rem', width: '100%' }}>
      {/* Add the Header component */}
      <Header />
      <div style={{ width: '100%' }}>
        {/* Team Name */}
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>{teamName}</h1>

        {/* Create Task Button */}
        <button
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: '#fff',
            borderRadius: '0.75rem',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '2rem',
          }}
          onClick={handleCreateTaskClick}
        >
          Create Task
        </button>

        {/* Task List */}
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Tasks</h2>
        {tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {tasks.map((task) => (
              <li
                key={task.id}
                style={{
                  backgroundColor: '#fff',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600' }}>{task.title}</h3>
                <p style={{ marginTop: '0.5rem', fontSize: '1rem', color: '#6b7280' }}>{task.description}</p>
              </li>
            ))}
          </ul>
        )}

        {/* Create task modal */}
        {isModalOpen && <CreateTaskModal onClose={handleModalClose} teamId={team_id} />}
      </div>
    </div>
  );
};

export default TaskPage;
