import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import TimetablePage from './pages/TimetablePage';
import AssignmentsPage from './pages/AssignmentsPage';
import NotesPage from './pages/NotesPage';
import AIAssistant from './pages/AIAssistant';
import CustomisePage from './pages/CustomisePage';

function AppRoutes() {
  const { token } = useAuth();
  if (!token) return <Auth />;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/ai" element={<AIAssistant />} />
        <Route path="/customise" element={<CustomisePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
