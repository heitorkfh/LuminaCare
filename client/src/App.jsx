// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Public Pages
import PublicBookingPage from './pages/PublicBookingPage';

// Dashboard Pages
import DashboardPage from './pages/DashboardPage';

// Patient Pages
import PatientsPage from './pages/PatientsPage';
import PatientDetailPage from './pages/PatientDetailPage';
import PatientFormPage from './pages/PatientFormPage';
import PatientMedicalRecordsPage from './pages/PatientMedicalRecordsPage';

// Medical Record Pages
import MedicalRecordDetailPage from './pages/MedicalRecordDetailPage';
import MedicalRecordFormPage from './pages/MedicalRecordFormPage';

// Appointment Pages
import AppointmentsPage from './pages/AppointmentsPage';
import AppointmentFormPage from './pages/AppointmentFormPage';

// Service Pages
import ServicesPage from './pages/ServicesPage';
import CategoriesPage from './pages/CategoriesPage';

// Settings Pages
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';

// Auth Provider
import { AuthProvider, RequireAuth } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Public Routes */}
          <Route path="/public/booking" element={<PublicBookingPage />} />
          
          {/* Protected Routes */}
          <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
            {/* Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Patients */}
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/new" element={<PatientFormPage />} />
            <Route path="/patients/:patientId" element={<PatientDetailPage />} />
            <Route path="/patients/:patientId/edit" element={<PatientFormPage />} />
            <Route path="/patients/:patientId/medical-records" element={<PatientMedicalRecordsPage />} />
            
            {/* Medical Records */}
            <Route path="/medical-records/new" element={<MedicalRecordFormPage />} />
            <Route path="/medical-records/:id" element={<MedicalRecordDetailPage />} />
            <Route path="/medical-records/edit/:id" element={<MedicalRecordFormPage />} />
            
            {/* Appointments */}
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/appointments/new" element={<AppointmentFormPage />} />
            <Route path="/appointments/:id" element={<AppointmentFormPage />} />
            
            {/* Services */}
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/registrations" element={<Navigate to="/services" replace />} />
            
            {/* Settings */}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AuthProvider>
  );
};

export default App;