import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTasksByTeamId } from '../../service/task.service'; // Fetch tasks by team ID
import { getTeamById } from '../../service/team.service'; // Fetch team details
import { getTaskIdsByUserId } from '../../service/taskByUser.service'; // Get task IDs by user ID
import { jwtDecode } from 'jwt-decode'; // Decode the token to get the current user ID
import CreateTaskModal from './create_task_modal';
import EditTaskModal from './edit_task_modal';
import Header from '../../components/common/header'; // Import the header component
import { statusColors } from '../../config/color'; // Import the status colors
import SettingsIcon from '@mui/icons-material/Settings'; // Importing SettingsIcon from MUI
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; // Import Delete Icon
import Swal from 'sweetalert2'; // Import Swal for confirmation dialog
import TaskFilter from './task_filter'; // Import the TaskFilter component
import { deleteTask } from '../../service/task.service'; // Import delete task function


const TeamPage: React.FC = () => {
  const { team_id } = useParams<{ team_id: string }>(); // Get team ID from route params
  const [teamName, setTeamName] = useState(''); // Store team name
  const [tasks, setTasks] = useState<any[]>([]); // Store tasks
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]); // Store filtered tasks
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]); // Store tasks assigned to the user
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility for create
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Modal visibility for edit
  const [selectedTask, setSelectedTask] = useState<any | null>(null); // Selected task for editing
  const [showAllTasks, setShowAllTasks] = useState(true); // Toggle between all tasks and assigned tasks
  const [userId, setUserId] = useState<number | null>(null); // Store the current user ID

  // Fetch the current user's ID from the token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: { userId: number } = jwtDecode(token);
      setUserId(decoded.userId);
    }
  }, []);

  interface Task {
    id: Number;
    // other properties...
  }
  // Fetch team details and tasks assigned to the current user
  useEffect(() => {
    async function fetchTeamAndTasks() {
      try {
        const team = await getTeamById(Number(team_id)); // Fetch team by ID
        setTeamName(team.team_name);

        // Fetch tasks by team ID
        const fetchedTasks = await getTasksByTeamId(Number(team_id));
        setTasks(fetchedTasks); // Set fetched tasks in state
        setFilteredTasks(fetchedTasks); // Set filtered tasks initially

        // Fetch tasks assigned to the current user
        if (userId !== null) {
          const assignedTaskIds = await getTaskIdsByUserId(userId);
          // const assignedTasksList = fetchedTasks.filter((task) => assignedTaskIds.includes(task.id));
          const assignedTasksList = fetchedTasks.filter((task: Task) => assignedTaskIds.includes(task.id));  // Explicitly type 'task'
          setAssignedTasks(assignedTasksList); // Set tasks assigned to the current user
        }
      } catch (error) {
        console.error('Failed to fetch team or tasks:', error);
      }
    }

    if (userId !== null) {
      fetchTeamAndTasks();
    }
  }, [team_id, userId]);

  // Open create task modal
  const handleCreateTaskClick = () => {
    setIsModalOpen(true);
  };

  // Open edit task modal
  const handleEditTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  // Close create task modal
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // Close edit task modal
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedTask(null); // Reset selected task
  };

  // Handle filter change
  const handleFilterChange = ({ status, startDate, endDate }: { status?: string; startDate?: string; endDate?: string }) => {
    let filtered = [...tasks];

    // Filter by status
    if (status) {
      filtered = filtered.filter((task) => task.status === status);
    }

    // Filter by date range
    if (startDate || endDate) {
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.due_date);
        if (startDate && taskDate < new Date(startDate)) return false;
        if (endDate && taskDate > new Date(endDate)) return false;
        return true;
      });
    }

    setFilteredTasks(filtered);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilteredTasks(tasks);
  };

  // Toggle between All Tasks and Your Tasks
  const handleToggleTasks = () => {
    setShowAllTasks(!showAllTasks);
  };

  // Format the due_date for display
  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) {
      return 'No due date';
    }
    const date = new Date(dueDate);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Handle task deletion with confirmation dialog
  const handleDeleteTask = async (taskId: number) => {
    const confirmation = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this task? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    });

    if (confirmation.isConfirmed) {
      try {
        await deleteTask(taskId);
        Swal.fire('Deleted!', 'The task has been deleted.', 'success');
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        setFilteredTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      } catch (error) {
        Swal.fire('Failed', 'Failed to delete the task. Please try again.', 'error');
      }
    }
  };

  // Task List Render Function (reused for both All Tasks and My Tasks)
  const renderTaskList = (taskList: any[]) => {
    return (
      <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'left' }}>
        {taskList.map((task) => (
          <li
            key={task.id}
            style={{
              flex: '1 1 calc(33.333% - 1rem)',
              backgroundColor: '#fff',
              padding: '1rem',
              borderRadius: '0.5rem',
              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
              maxWidth: 'calc(30% - 1rem)',
              position: 'relative', // For positioning SettingsIcon and DeleteIcon
            }}
          >
            {/* Due Date at the top left */}
            <span style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '0.875rem', color: '#6b7280' }}>
              Due: {formatDueDate(task.due_date)}
            </span>
            
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem' }}>{task.title}</h3>
            <p style={{ marginTop: '0.5rem', fontSize: '1rem', color: '#6b7280' }}>
              {task.task_description || 'No description provided.'}
            </p>
            <div
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: statusColors[task.status] || '#ccc',
                borderRadius: '0.5rem',
                display: 'inline-block',
                color: '#fff',
              }}
            >
              <span style={{ fontSize: '1rem', fontWeight: '500' }}>{task.status}</span>
            </div>

            {/* Edit Task Icon (only show if the user is the creator or assigned to the task) */}
            {(task.create_by === userId || assignedTasks.some((assignedTask) => assignedTask.id === task.id)) && (
              <SettingsIcon
                onClick={() => handleEditTaskClick(task)} // Open the edit modal for the task
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '50px',
                  cursor: 'pointer',
                  color: '#3b82f6',
                }}
              />
            )}

            {/* Delete Task Icon */}
            {(task.create_by === userId || assignedTasks.some((assignedTask) => assignedTask.id === task.id)) && (
              <DeleteForeverIcon
                onClick={() => handleDeleteTask(task.id)} // Handle delete task
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  cursor: 'pointer',
                  color: 'red',
                }}
              />
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7fafc', padding: '2rem', width: '100%' }}>
      {/* Add the Header component */}
      <Header />
      <div style={{ width: '100%' }}>
        {/* Team Name */}
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>{teamName}</h1>

        {/* Task Filter */}
        <TaskFilter onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} />

        {/* Toggle Button for All Tasks / Your Tasks */}
        <button
          onClick={handleToggleTasks}
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#10b981',
            color: '#fff',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {showAllTasks ? 'Show My Tasks' : 'Show All Tasks'}
        </button>

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
            marginLeft: '1rem',
          }}
          onClick={handleCreateTaskClick}
        >
          Create Task
        </button>

        {/* Task List */}
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Tasks</h2>
        {showAllTasks ? (
          filteredTasks.length === 0 ? (
            <p>No tasks found.</p>
          ) : (
            renderTaskList(filteredTasks) // Render All Tasks
          )
        ) : (
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '2rem' }}>My Assigned Tasks</h2>
            {assignedTasks.length === 0 ? (
              <p>No assigned tasks found.</p>
            ) : (
              renderTaskList(assignedTasks) // Render My Assigned Tasks
            )}
          </div>
        )}

        {/* Create task modal */}
        {isModalOpen && <CreateTaskModal onClose={handleModalClose} teamId={team_id || ''} />}

        {/* Edit task modal */}
        {isEditModalOpen && selectedTask && (
          <EditTaskModal 
            task={selectedTask} 
            onClose={handleEditModalClose} 
            teamId={team_id || ''} // Pass the teamId prop here
          />
        )}
      </div>
    </div>
  );
};

export default TeamPage;
