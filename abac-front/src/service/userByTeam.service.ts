import { authAxiosClient } from "../config/axios.config";

// Get all users by team
export async function getAllUsersByTeam() {
  try {
    const response = await authAxiosClient.get('/user_by_team');
    return response.data.records;
  } catch (error: any) {
    throw new Error('Failed to fetch users by team: ' + error.message);
  }
}

// Get teams by user ID
export async function getTeamsByUserId(userId: number) {
  try {
    const response = await authAxiosClient.get(`/user_by_team/user/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error('Failed to fetch teams for user: ' + error.message);
  }
}

// Get users by team ID
export async function getUsersByTeamId(teamId: number) {
  try {
    const response = await authAxiosClient.get(`/user_by_team/team/${teamId}`);
    return response.data;
  } catch (error: any) {
    throw new Error('Failed to fetch users for team: ' + error.message);
  }
}

export async function createUserByTeam(userByTeamData: any) {
  try {
    const response = await authAxiosClient.post('/user_by_team', userByTeamData);
    return response.data;
  } catch (error: any) {
    throw new Error('Failed to create user_by_team record: ' + error.message);
  }
}

export async function deleteUserById(userByTeamId: number) {
  try {
    const response = await authAxiosClient.delete(`/user_by_team/${userByTeamId}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to delete user from team: ' + error.message);
  }
}