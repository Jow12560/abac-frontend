import React, { useState, useEffect } from 'react';
import { createTask } from '../../service/task.service';
import { createTaskByUser } from '../../service/taskByUser.service'; // Import the createTaskByUser function
import { getUsersByTeamId } from '../../service/userByTeam.service'; // Function to get users by team
import { jwtDecode } from 'jwt-decode'; // To decode the token

interface CreateTaskModalProps {
  onClose: () => void;
  teamId: string; // Team ID passed to the modal
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose, teamId }) => {
  const [title, setTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [dueDate, setDueDate] = useState(''); // Due date state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<any[]>([]); // Store the users in the team
  const [assignedUsers, setAssignedUsers] = useState<number[]>([]); // Store selected users' IDs

  // Fetch users for the team
  useEffect(() => {
    async function fetchUsers() {
      try {
        const usersData = await getUsersByTeamId(Number(teamId));
        setUsers(usersData.users || []); // Set the users in the state
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    }
    fetchUsers();
  }, [teamId]);

  // Handle checkbox change for assigning users
  const handleUserSelection = (userId: number) => {
    setAssignedUsers((prevAssigned) =>
      prevAssigned.includes(userId)
        ? prevAssigned.filter((id) => id !== userId) // Remove if already selected
        : [...prevAssigned, userId] // Add if not selected
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get userId from the token for created_by field
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }

      const decoded: { userId: number } = jwtDecode(token);

      // Create the task
      const taskResponse = await createTask({
        title,
        task_description: taskDescription || '', // Send the task_description, default to empty string if not provided
        team_id: Number(teamId), // Use the teamId from props
        create_by: decoded.userId, // Pass the current user ID as created_by
        due_date: dueDate, // Pass the due date
      });

      // Get the taskId from the response
      const taskId = taskResponse.taskId; // Make sure taskId is retrieved correctly

      // Create 'task_by_user' records for each assigned user
      for (const userId of assignedUsers) {
        await createTaskByUser({
          task_id: taskId, // Use the retrieved taskId
          user_id: userId, // The ID of the assigned user
        });
      }

      onClose(); // Close the modal after successful creation
      window.location.reload(); // Refresh the page
    } catch (error) {
      console.error(error.message);
      alert('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={overlayStyles}>
      <div style={modalStyles}>
        <button onClick={onClose} style={closeButtonStyles}>×</button>
        <h2>Create New Task</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
            />
          </div>
          <div>
            <label>Description (optional):</label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
            />
          </div>
          <div>
            <label>Due Date:</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
            />
          </div>
          <div>
            <label>Assign To:</label>
            <div style={{ marginBottom: '1rem' }}>
              {users.map((user) => (
                <div key={user.user_id} style={{ marginBottom: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id={`user-${user.user_id}`}
                    checked={assignedUsers.includes(user.user_id)}
                    onChange={() => handleUserSelection(user.user_id)}
                  />
                  <label htmlFor={`user-${user.user_id}`} style={{ marginLeft: '0.5rem' }}>
                    {user.user_name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: '#fff',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;

// Add your modal styles here
const modalStyles = {
  padding: '2rem',
  backgroundColor: '#fff',
  borderRadius: '0.75rem',
  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
  width: '50%',
  height: '80%',
  zIndex: 1001,
  position: 'relative',
  overflowY: 'auto'
};

const overlayStyles = {
  position: 'fixed' as 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const closeButtonStyles = {
  position: 'absolute' as 'absolute',
  top: '1rem',
  right: '1rem',
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
};
