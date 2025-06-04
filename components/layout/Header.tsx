import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { UserRole } from '../../types';
import { Button } from '../common/Button';
import { APP_NAME } from '../../constants';

export const Header: React.FC = () => {
  const { currentUser, logout } = useAppContext();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-teal-500 text-white' : 'text-teal-700 hover:bg-teal-100 hover:text-teal-900'
    }`;

  return (
    <header className="bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="text-3xl font-extrabold text-teal-700">Hanami</NavLink>
            <span className="ml-2 text-sm text-teal-500 hidden sm:inline">{APP_NAME}</span>
          </div>
          <nav className="flex items-center space-x-4">
            {currentUser ? (
              <>
                {currentUser.role === UserRole.STUDENT && (
                  <>
                    <NavLink to="/dashboard/student/classes" className={navLinkClass}>Cours disponibles</NavLink>
                    <NavLink to="/dashboard/student/bookings" className={navLinkClass}>Mes réservations</NavLink>
                  </>
                )}
                {currentUser.role === UserRole.TEACHER && (
                  <>
                    <NavLink to="/dashboard/teacher/classes" className={navLinkClass}>Mes Cours</NavLink>
                    <NavLink to="/dashboard/teacher/schedule" className={navLinkClass}>Mon Planning</NavLink>
                  </>
                )}
                {currentUser.role === UserRole.ADMIN && (
                   <>
                    <NavLink to="/dashboard/admin/users" className={navLinkClass}>Utilisateurs</NavLink>
                    <NavLink to="/dashboard/admin/classes" className={navLinkClass}>Tous les cours</NavLink>
                   </>
                )}
                <span className="text-teal-600 text-sm hidden md:block">Bonjour, {currentUser.name} ({currentUser.role})</span>
                <Button onClick={logout} variant="ghost" size="sm" className="border-teal-600 text-teal-600 hover:bg-white hover:text-teal-700">
                  Déconnexion
                </Button>
              </>
            ) : (
              <NavLink to="/login" className={navLinkClass}>Connexion</NavLink>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
