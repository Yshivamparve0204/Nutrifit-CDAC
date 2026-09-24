import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import './App.css';
import Navbar from "./components/Navbar";
import AdminDashboard from './pages/AdminDashboard';
import AdminHealth from './pages/AdminHealth';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import RegisterAdmin from './pages/RegisterAdmin';
import RegisterUser from './pages/RegisterUser';
import UserHealth from './pages/UserHealth';

// ✅ NEW DASHBOARD MODULE FILES
import BmiPage from "./pages/BmiPage";
import Dashboard from "./pages/Dashboard";
import DietPage from "./pages/DietPage";
import WorkoutPage from './pages/WorkoutPage';
import GoalPage from "./pages/GoalPage";
import ProgressPage from "./pages/ProgressPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* ===== BASIC ROUTES ===== */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-user" element={<RegisterUser />} />
        <Route path="/register-admin" element={<RegisterAdmin />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ===== OLD DIRECT HEALTH ROUTES (KEEP) ===== */}
        <Route path="/health" element={<UserHealth />} />
        <Route path="/admin-health" element={<AdminHealth />} />

        {/* ===== ✅ USER DASHBOARD ROUTES (NEW) ===== */}
        <Route path="/dashboard" element={<Dashboard />}>

          {/* Default: /dashboard → /dashboard/bmi */}
          <Route index element={<Navigate to="bmi" replace />} />

          <Route path="bmi" element={<BmiPage />} />
          <Route path="health" element={<UserHealth />} />
          <Route path="workout" element={<WorkoutPage />} />
          <Route path="diet" element={<DietPage />} />
          <Route path="goals" element={<GoalPage />} />
          <Route path="progress" element={<ProgressPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;