import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/login/login";
import RegisterPage from "./pages/register/register";
import MiroStyleTeamPage from "./pages/home/selectTeam";
import ProfilePage from "./pages/profile/profile";
import TeamPage from "./pages/team/TeamPage";
import { Toaster } from "react-hot-toast"; // For toast notifications
import "./App.css"; // Global CSS if you use it

// Create a Private Route wrapper to check for the token
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000, // Toast duration (3 seconds)
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Private Routes - protected by token */}
        <Route 
          path="/select-team" 
          element={
            <PrivateRoute>
              <MiroStyleTeamPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/team/:team_id" 
          element={
            <PrivateRoute>
              <TeamPage />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
