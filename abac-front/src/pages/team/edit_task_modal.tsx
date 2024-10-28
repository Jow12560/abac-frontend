import React, { useState, useEffect, CSSProperties } from 'react';
import { updateTask } from '../../service/task.service'; // Service for updating a task
import { getUsersByTeamId } from '../../service/userByTeam.service'; // Get users by team
import { createTaskByUser, deleteTasksByTaskId } from '../../service/taskByUser.service'; // Service for assigning and removing users

interface Task {
  id: number;
  title: string;
  task_description: string; // Changed to task_description
  due_date: string;
  status: string;  // Include status in Task interface
  assigned_users: number[];
}

interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
  teamId: string;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, onClose, teamId }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [taskDescription, setTaskDescription] = useState(task?.task_description || ''); // Changed to task_description
  const [dueDate, setDueDate] = useState(task?.due_date || ''); // Due date field
  const [status, setStatus] = useState(task?.status || 'รอเริ่ม'); // Default to "รอเริ่ม" (Pending Start)
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
  }, [teamId]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setTaskDescription(task.task_description); // Changed to task_description
      setDueDate(task.due_date);
      setAssignedUsers(task.assigned_users || []);
      setStatus(task.status); // Set the task's status
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update the task details, including status
      await updateTask(task.id, {
        title,
        task_description: taskDescription, // Changed to task_description
        due_date: dueDate,
        status, // Include status in the payload
      });

      // Check if there are any selected assigned users
    if (assignedUsers.length > 0) {
      // Delete all previous task_by_user records for the task
      await deleteTasksByTaskId(task.id);

      // Add the new user assignments
      for (const userId of assignedUsers) {
        await createTaskByUser({
          task_id: task.id,
          user_id: userId,
        });
      }
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
            <label>Status:</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}>
              <option value="รอเริ่ม">รอเริ่ม (Pending Start)</option>
              <option value="กำลังทำ">กำลังทำ (In Progress)</option>
              <option value="เสร็จ">เสร็จ (Completed)</option>
              <option value="ล้มเหลว">ล้มเหลว (Failed)</option>
            </select>
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
