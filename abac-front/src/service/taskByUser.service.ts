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
