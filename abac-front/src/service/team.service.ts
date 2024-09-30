import { authAxiosClient } from "../config/axios.config";

// Get all teams
export async function getAllTeams() {
  try {
    const response = await authAxiosClient.get('/team');
    return response.data.records;
  } catch (error: any) {
    throw new Error('Failed to fetch teams: ' + error.message);
  }
}

// Get team by ID
export async function getTeamById(teamId: number) {
  try {
    const response = await authAxiosClient.get(`/team/${teamId}`);
    return response.data.record;
  } catch (error: any) {
    throw new Error('Failed to fetch team: ' + error.message);
  }
}

// Create a new team
export async function createTeam({ team_name, owner, created_by, team_description }: { 
  team_name: string, 
  owner: number, 
  created_by: number, 
  team_description?: string  // Optional description
}) {
  try {
    // Build the payload dynamically, excluding team_description if it's not provided
    const payload: any = { 
      team_name, 
      owner, 
      created_by 
    };

    if (team_description) {
      payload.team_description = team_description;
    }

    const response = await authAxiosClient.post('/team', payload);
    return response.data;
  } catch (error: any) {
    throw new Error('Failed to create team: ' + error.message);
  }
}

// Update team by ID
export async function updateTeam(teamId: number, { team_name, team_description }: { team_name?: string; team_description?: string; }): Promise<any> {
  try {
    const response = await authAxiosClient.patch(`/team/${teamId}`, {
      team_name,
      team_description
    });

    if (response.status !== 200) {
      throw new Error('Failed to update team');
    }

    return response.data;
  } catch (error: any) {
    throw new Error('Failed to update team: ' + (error.response?.data?.message || error.message));
  }
}

// Delete team by ID
export async function deleteTeam(teamId: number) {
  try {
    const response = await authAxiosClient.delete(`/team/${teamId}`);
    return response.data;
  } catch (error: any) {
    throw new Error('Failed to delete team: ' + error.message);
  }
}
