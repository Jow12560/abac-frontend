import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/login/login";
import RegisterPage from "./pages/register/register";
import TeamPage from "./pages/home/selectTeam";
import ProfilePage from "./pages/profile/profile";
import { Toaster } from "react-hot-toast"; // For toast notifications
import "./App.css"; // Global CSS if you use it

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
        {/* Only the login page is active for now */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/select-team" element={<TeamPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
