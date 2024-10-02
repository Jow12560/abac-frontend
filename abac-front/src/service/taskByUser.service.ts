import { authAxiosClient } from "../config/axios.config";

// Get all tasks assigned to users
export async function getAllTasksByUser() {
  try {
    const response = await authAxiosClient.get('/task_by_user');
    return response.data.records;
  } catch (error: any) {
    throw new Error('Failed to fetch tasks by user: ' + error.message);
  }
}

// Get task IDs by user ID
export async function getTaskIdsByUserId(userId: number) {
  try {
    const response = await authAxiosClient.get(`/task_by_user/user/${userId}`);
    return response.data.taskIds;
  } catch (error: any) {
    throw new Error('Failed to fetch task IDs for user: ' + error.message);
  }
}

// Get user IDs by task ID
export async function getUserIdsByTaskId(taskId: number) {
  try {
    const response = await authAxiosClient.get(`/task_by_user/task/${taskId}`);
    return response.data.userIds;
  } catch (error: any) {
    throw new Error('Failed to fetch user IDs for task: ' + error.message);
  }
}

// Create a new record in the 'task_by_user' table
export async function createTaskByUser(taskByUserData: any) {
  try {
    const response = await authAxiosClient.post('/task_by_user', taskByUserData);
    return response.data;
  } catch (error: any) {
    throw new Error('Failed to create task_by_user record: ' + error.message);
  }
}

// Delete a record in the 'task_by_user' table by ID
export async function deleteTaskByUser(taskId: number) {
  try {
    const response = await authAxiosClient.delete(`/task_by_user/${taskId}`);
    return response.data;
  } catch (error: any) {
    throw new Error('Failed to delete task_by_user record: ' + error.message);
  }
}

// Delete all tasks by task ID
export async function deleteTasksByTaskId(taskId: number) {
  try {
    const response = await authAxiosClient.delete(`/task_by_user/task/${taskId}`);
    return response.data;
  } catch (error: any) {
    throw new Error('Failed to delete tasks by task ID: ' + error.message);
  }
}