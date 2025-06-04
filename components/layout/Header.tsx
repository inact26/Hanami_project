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
      isActive ? 'bg-teal-700 text-white' : 'text-emerald-100 hover:bg-teal-600 hover:text-white'
    }`;

  return (
    <header className="bg-teal-600 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="text-2xl font-bold text-white">
              {APP_NAME}
            </NavLink>
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
                <span className="text-emerald-100 text-sm hidden md:block">Bonjour, {currentUser.name} ({currentUser.role})</span>
                <Button onClick={logout} variant="ghost" size="sm" className="border-emerald-100 text-emerald-100 hover:bg-white hover:text-teal-600">
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
