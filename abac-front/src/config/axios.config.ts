import axios from "axios";

const ENDPOINT = import.meta.env.VITE_BACKEND_URL;

const authAxiosClient = axios.create();

authAxiosClient.interceptors.request.use((config) => {
  config.headers["x-api-key"] = import.meta.env.VITE_API_KEY;
  config.baseURL = ENDPOINT;
  return config;
});

authAxiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!error.response) {
      throw new Error("Network error. Please try again later.");
    }
    throw new Error(error.response.data.message || "An error occurred.");
  }
);

export { authAxiosClient };
