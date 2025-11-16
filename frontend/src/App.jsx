import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import FacultyDashboard from './pages/dashboard/FacultyDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';

// Protected Route component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/resetpassword/:resettoken" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/*"
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;

