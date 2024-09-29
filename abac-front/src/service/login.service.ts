import { authAxiosClient } from "../config/axios.config"; // Import your axios client

// Login API Service
export async function login({ username, password }: { username: string; password: string }) {
  try {
    const response = await authAxiosClient.post('/login', { username, password });

    if (response.status !== 200) {
      throw new Error("Failed to login");
    }

    // Return both token and message from the response data
    return {
      token: response.data.token, 
      message: response.data.message
    };
  } catch (error: any) {
    throw new Error("Failed to login: " + (error.response?.data?.message || error.message));
  }
}