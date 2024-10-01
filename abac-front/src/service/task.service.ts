import { authAxiosClient } from "../config/axios.config";

// Get all tasks
export async function getAllTasks() {
  try {
    const response = await authAxiosClient.get('/task');
    return response.data.records;
  } catch (error: any) {
    throw new Error('Failed to fetch tasks: ' + error.message);
  }
}

// Get task by ID
export async function getTaskById(taskId: number) {
  try {
    const response = await authAxiosClient.get(`/task/${taskId}`);
    return response.data.record;
  } catch (error: any) {
    throw new Error('Failed to fetch task: ' + error.message);
  }
}

export async function createTask({
  title,
  task_description = '', // Updated to match your DB column
  team_id,
  create_by, // Extracted from token
}: {
  title: string;
  task_description: string;
  team_id: number; // Add team_id here
  create_by: number; // Add user ID here from token
}) {
  try {
    const response = await authAxiosClient.post('/task', {
      title,
      task_description,
      team_id, // Team ID
      create_by, // User ID
    });
    return response.data;
  } catch (error: any) {
    throw new Error('Failed to create task: ' + error.message);
  }
}

// Update task by ID
export async function updateTask(taskId: number, updateData: { title?: string; description?: string }) {
  try {
    const response = await authAxiosClient.patch(`/task/${taskId}`, updateData);
    return response.data;
  } catch (error: any) {
    throw new Error('Failed to update task: ' + error.message);
  }
}

// Delete task by ID
export async function deleteTask(taskId: number) {
  try {
    const response = await authAxiosClient.delete(`/task/${taskId}`);
    return response.data;
  } catch (error: any) {
    throw new Error('Failed to delete task: ' + error.message);
  }
}
