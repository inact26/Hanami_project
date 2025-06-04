import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { UserRole } from '../types';
import { USER_ROLES_CONFIG, APP_NAME } from '../constants';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';

export const LoginPage: React.FC = () => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError("Le nom est requis.");
      return;
    }
    const user = login(name.trim(), role, password);
    if (user) {
      switch (user.role) {
        case UserRole.STUDENT:
          navigate('/dashboard/student/classes');
          break;
        case UserRole.TEACHER:
          navigate('/dashboard/teacher/classes');
          break;
        case UserRole.ADMIN:
          navigate('/dashboard/admin/users');
          break;
        default:
          navigate('/');
      }
    } else {
      setError("Échec de la connexion. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-teal-700">{APP_NAME}</h1>
          <p className="mt-2 text-slate-600">Connectez-vous pour accéder à votre espace.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Select
              label="Je suis un(e)"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              options={USER_ROLES_CONFIG}
            />
          </div>
          <div>
          <Input
            label="Votre Nom"
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Marie Dupont"
            required
          />
        </div>
        <div>
          <Input
            label="Mot de passe"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <div>
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Se connecter
            </Button>
          </div>
        </form>
         <div className="text-center text-xs text-slate-500 mt-4">
          <p>Noms de test (Professeur): Professeur Oak / mot de passe: teacher</p>
          <p>Noms de test (Élève): Élève Sacha / mot de passe: student</p>
          <p>Noms de test (Admin): Admin User / mot de passe: admin</p>
          <p>Ou entrez un nouveau nom pour créer un compte.</p>
        </div>
      </div>
    </div>
  );
};
