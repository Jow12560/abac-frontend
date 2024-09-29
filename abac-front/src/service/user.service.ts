import { authAxiosClient } from "../config/axios.config";
// Get all user records
export async function getAllUser() {
    try {
      const response = await authAxiosClient.get('/user');
      if (response.status !== 200) {
        throw new Error('Failed to fetch user');
      }
      return response.data.records; // Assuming the backend sends user data in "records"
    } catch (error: any) {
      throw new Error('Failed to fetch user: ' + (error.response?.data?.message || error.message));
    }
  }
  
  // Get a single user by ID
  export async function getUserById(userId: number) {
    try {
      const response = await authAxiosClient.get(`/user/${userId}`);
      if (response.status !== 200) {
        throw new Error('Failed to fetch user by ID');
      }
      return response.data.record; // Assuming the backend sends user data in "record"
    } catch (error: any) {
      throw new Error('Failed to fetch user by ID: ' + (error.response?.data?.message || error.message));
    }
  }

export async function createUser({ username, password ,name}: { username: string; password: string; name: string; }): Promise<any> {
  try {
    const response = await authAxiosClient.post('/user', {
      username,
      password,
      name
    });

    if (response.status !== 201) {
      throw new Error('Failed to create user');
    }

    return response.data;
  } catch (error: any) {
    throw new Error("Failed to create user: " + (error.response?.data?.message || error.message));
  }
}

// Delete a user by ID
export async function deleteUser(userId: number) {
    try {
      const response = await authAxiosClient.delete(`/user/${userId}`);
      if (response.status !== 200) {
        throw new Error('Failed to delete user');
      }
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to delete user: ' + (error.response?.data?.message || error.message));
    }
  }


// Update a user by ID
export async function updateUser(userId: number, { username, password, name, address, phone_number }: { username: string; password: string; name?: string; address?: string; phone_number?: string; }): Promise<any> {
  try {
    const response = await authAxiosClient.patch(`/user/${userId}`, {
      username,
      password,
      name,
      address,
      phone_number
    });

    if (response.status !== 200) {
      throw new Error('Failed to update user');
    }

    return response.data;
  } catch (error: any) {
    throw new Error('Failed to update user: ' + (error.response?.data?.message || error.message));
  }
}