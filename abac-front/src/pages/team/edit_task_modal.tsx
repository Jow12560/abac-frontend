import React, { useState, useEffect, CSSProperties } from 'react';
import { updateTask } from '../../service/task.service'; // Service for updating a task
import { getUsersByTeamId } from '../../service/userByTeam.service'; // Get users by team
import { createTaskByUser, deleteTasksByTaskId } from '../../service/taskByUser.service'; // Service for assigning and removing users

// Define the Task interface with proper typing
interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;  // Ensure due_date is included
  assigned_users: number[];
}

interface EditTaskModalProps {
  task: Task;  // Task is now fully typed
  onClose: () => void;
  teamId: string;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, onClose, teamId }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [taskDescription, setTaskDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.due_date || ''); // Due date field
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<any[]>([]); // Store users for assignment
  const [assignedUsers, setAssignedUsers] = useState<number[]>(task?.assigned_users || []); // Store the selected users

  // Fetch users for the team when the modal opens
  useEffect(() => {
    async function fetchUsers() {
      try {
        const usersData = await getUsersByTeamId(Number(teamId)); // Ensure teamId is handled correctly here
        setUsers(usersData.users || []); // Set users in state
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    }

    fetchUsers();
  }, [teamId]); // Ensure the teamId is passed correctly

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setTaskDescription(task.description);
      setDueDate(task.due_date);
      setAssignedUsers(task.assigned_users || []); // Set initially assigned users
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update the task details
      await updateTask(task.id, {
        title,
        description: taskDescription, // Corrected property name
        due_date: dueDate, // Include due_date in the payload
      });

      // Delete all previous task_by_user records for the task
      await deleteTasksByTaskId(task.id); // This will delete all users assigned to the task

      // Add the new user assignments
      for (const userId of assignedUsers) {
        await createTaskByUser({
          task_id: task.id, // Use the task ID
          user_id: userId,  // New assigned user ID
        });
      }

      onClose(); // Close the modal after updating the task
      window.location.reload(); // Refresh the data after completing the update
    } catch (error) {
      console.error((error as Error).message); 
      alert('Failed to update task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle checkbox change for assigning users
  const handleUserSelection = (userId: number) => {
    setAssignedUsers((prevAssigned) =>
      prevAssigned.includes(userId)
        ? prevAssigned.filter((id) => id !== userId) // Remove if already selected
        : [...prevAssigned, userId] // Add if not selected
    );
  };

  return (
    <div style={overlayStyles}>
      <div style={modalStyles}>
        <button onClick={onClose} style={closeButtonStyles}>×</button>
        <h2>Edit Task</h2>
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
            <label>Description:</label>
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
            {isSubmitting ? 'Updating...' : 'Update Task'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;

// Add your modal styles here
const modalStyles: CSSProperties = {
  padding: '2rem',
  backgroundColor: '#fff',
  borderRadius: '0.75rem',
  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
  width: '50%',
  height: '80%',
  zIndex: 1001,
  position: 'relative',
  overflowY: 'scroll' as 'scroll',
};

const overlayStyles: CSSProperties = {
  position: 'fixed',
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

const closeButtonStyles: CSSProperties = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
};
