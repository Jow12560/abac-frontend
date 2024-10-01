import React, { useState } from 'react';
import { createTask } from '../../service/task.service';
import { jwtDecode } from 'jwt-decode'; // To decode the token

interface CreateTaskModalProps {
    onClose: () => void;
    teamId: string; // Team ID passed to the modal
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose, teamId }) => {
    const [title, setTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

            // Call the createTask function
            await createTask({
                title,
                task_description: taskDescription || '', // Send the task_description, default to empty string if not provided
                team_id: Number(teamId), // Use the teamId from props
                create_by: decoded.userId, // Pass the current user ID as created_by
            });

            onClose(); // Close the modal after successful creation
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
    maxWidth: '500px',
    width: '100%',
    zIndex: 1001,
    position: 'relative',
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