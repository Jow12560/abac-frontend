import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation
import { login } from '../../service/login.service';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      toast.loading("Logging in...");
      const response = await login({ username, password });

      console.log('Response:', response); // Log the entire response object

      const { token, message } = response;      
      console.log('Token:', token); // Log the token to the console
      localStorage.setItem('token', token);
      toast.dismiss();
      toast.success(message);
      navigate('/select-team');
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-white">
      <div className="max-w-md w-full bg-white p-8 border border-gray-300 rounded-lg shadow-md">
        <h1 className="text-2xl text-center mb-6 font-bold">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="w-full p-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Login
          </button>
        </form>
        {/* Link to registration page */}
        <p className="mt-4 text-center">
          Don't have an account? <Link to="/register" className="text-blue-500">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;