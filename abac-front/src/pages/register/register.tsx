import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUser } from '../../service/user.service';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [name, setName] = useState(''); // State for the user's name
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      toast.loading("Creating account...");
      await createUser({ name, username, password }); // Include the name in the request
      toast.dismiss();
      toast.success("Account created successfully!");
      navigate('/'); // Redirect to login page after successful registration
    } catch (error: any) {
      toast.dismiss();
      toast.error("Error creating account");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-white">
      <div className="max-w-md w-full bg-white p-8 border border-gray-300 rounded-lg shadow-md">
        <h1 className="text-2xl text-center mb-6 font-bold">Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
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
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium">Confirm Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="w-full p-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center">
          Already have an account? <Link to="/" className="text-blue-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;