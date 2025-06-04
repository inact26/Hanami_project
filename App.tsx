
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from './contexts/AppContext';
import { Header } from './components/layout/Header';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboardPage, StudentAvailableClasses, StudentMyBookings } from './pages/StudentDashboardPage';
import { TeacherDashboardPage, TeacherMyClasses, TeacherSchedule } from './pages/TeacherDashboardPage';
import { AdminDashboardPage, AdminManageUsers, AdminManageClasses } from './pages/AdminDashboardPage';
import { NotificationBar } from './components/notifications/NotificationBar';
import { UserRole } from './types';
import { APP_NAME } from './constants'; // Import APP_NAME

const ProtectedRoute: React.FC<{ allowedRoles: UserRole[] }> = ({ allowedRoles }) => {
  const { currentUser, isLoading } = useAppContext();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p className="text-xl text-teal-600">Chargement...</p></div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    // Redirect to a generic dashboard or home if role doesn't match, or to login
    // For simplicity, redirecting to login might be too aggressive if they are logged in with another role.
    // Redirect to their own default dashboard might be better.
    // For now, let's send them to their default view or root.
    let defaultPath = '/';
    if (currentUser.role === UserRole.STUDENT) defaultPath = '/dashboard/student/classes';
    if (currentUser.role === UserRole.TEACHER) defaultPath = '/dashboard/teacher/classes';
    if (currentUser.role === UserRole.ADMIN) defaultPath = '/dashboard/admin/users';
    return <Navigate to={defaultPath} replace />;
  }

  return <Outlet />; // Render child routes
};


const App: React.FC = () => {
  const { currentUser, isLoading } = useAppContext();

  if (isLoading && !currentUser) { // Show loading only on initial load before user check
    return <div className="flex justify-center items-center h-screen"><p className="text-xl text-teal-600">Chargement de l'application...</p></div>;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-emerald-50">
      <Header />
      <NotificationBar />
      <main className="flex-grow">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.STUDENT]} />}>
            <Route path="/dashboard/student" element={<StudentDashboardPage />}>
                <Route path="classes" element={<StudentAvailableClasses />} />
                <Route path="bookings" element={<StudentMyBookings />} />
                <Route index element={<Navigate to="classes" replace />} />
            </Route>
          </Route>

          {/* Teacher Routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.TEACHER]} />}>
             <Route path="/dashboard/teacher" element={<TeacherDashboardPage />}>
                <Route path="classes" element={<TeacherMyClasses />} />
                <Route path="schedule" element={<TeacherSchedule />} />
                <Route index element={<Navigate to="classes" replace />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
            <Route path="/dashboard/admin" element={<AdminDashboardPage />}>
                <Route path="users" element={<AdminManageUsers />} />
                <Route path="classes" element={<AdminManageClasses />} />
                <Route index element={<Navigate to="users" replace />} />
            </Route>
          </Route>
          
          {/* Default route redirection based on login status and role */}
          <Route 
            path="/" 
            element={
              currentUser ? (
                currentUser.role === UserRole.STUDENT ? <Navigate to="/dashboard/student/classes" replace /> :
                currentUser.role === UserRole.TEACHER ? <Navigate to="/dashboard/teacher/classes" replace /> :
                currentUser.role === UserRole.ADMIN ? <Navigate to="/dashboard/admin/users" replace /> :
                <Navigate to="/login" replace /> // Should not happen if role is set
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} /> {/* Catch all */}
        </Routes>
      </main>
      <footer className="py-4 text-center text-sm text-slate-500 border-t border-emerald-200 bg-emerald-100">
        © {new Date().getFullYear()} {APP_NAME}. Tous droits réservés. Simple. Zen. Efficace.
      </footer>
    </div>
  );
};

export default App;
