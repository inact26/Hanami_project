import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { User, UserRole, YogaClass, YogaClassFormData } from '../types';
import { ClassCard } from '../components/classes/ClassCard';
import { ClassForm } from '../components/classes/ClassForm';
import { Modal } from '../components/common/Modal';
import { USER_ROLES_CONFIG } from '../constants';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';


const ManageUsers: React.FC = () => {
  const { users, currentUser, updateUserCredits, createUser, updateUser, deleteUser } = useAppContext();
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const [selectedStudentForCredits, setSelectedStudentForCredits] = useState<User | null>(null);
  const [newCreditValue, setNewCreditValue] = useState<string>('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.STUDENT);
  const [userPassword, setUserPassword] = useState('');

  if (!currentUser || currentUser.role !== UserRole.ADMIN) return null;

  const handleOpenCreditsModal = (user: User) => {
    if (user.role !== UserRole.STUDENT) return;
    setSelectedStudentForCredits(user);
    setNewCreditValue((user.credits !== undefined ? user.credits : 0).toString());
    setIsCreditsModalOpen(true);
  };

  const handleCloseCreditsModal = () => {
    setIsCreditsModalOpen(false);
    setSelectedStudentForCredits(null);
    setNewCreditValue('');
  }

  const handleSaveCredits = () => {
    if (selectedStudentForCredits) {
      const creditsNum = parseInt(newCreditValue, 10);
      if (!isNaN(creditsNum) && creditsNum >= 0) {
        const success = updateUserCredits(selectedStudentForCredits.id, creditsNum);
        if (success) {
          handleCloseCreditsModal();
        } else {
          // Error already shown by context's addNotification
        }
      } else {
         // This could be an addNotification call too
         alert("Veuillez entrer un nombre de crédits valide (entier positif).");
      }
    }
  };

  const handleOpenUserModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUserName(user.name);
      setUserRole(user.role);
      setUserPassword('');
    } else {
      setEditingUser(null);
      setUserName('');
      setUserRole(UserRole.STUDENT);
      setUserPassword('');
    }
    setIsUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      updateUser(editingUser.id, { name: userName, role: userRole, password: userPassword || undefined });
    } else {
      createUser({ name: userName, role: userRole, password: userPassword });
    }
    handleCloseUserModal();
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Supprimer cet utilisateur ?')) {
      deleteUser(userId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white rounded-xl shadow-lg border border-emerald-100">
        <div>
          <h2 className="text-3xl font-semibold text-teal-700 mb-1">Gestion des Utilisateurs</h2>
          <p className="text-slate-600">Visualisez et gérez les utilisateurs de la plateforme.</p>
        </div>
        <Button onClick={() => handleOpenUserModal()} variant="primary" className="mt-3 sm:mt-0">Ajouter un utilisateur</Button>
      </div>
      <div className="bg-white shadow-md overflow-hidden sm:rounded-lg">
        <ul role="list" className="divide-y divide-slate-200">
          {users.map((user) => (
            <li key={user.id} className="px-4 py-4 sm:px-6 hover:bg-emerald-50 transition-colors">
              <div className="flex items-center justify-between">
                <p className="text-base font-medium text-teal-700 truncate">{user.name}</p>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800' :
                    user.role === UserRole.TEACHER ? 'bg-sky-100 text-sky-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {USER_ROLES_CONFIG.find(r => r.value === user.role)?.label || user.role}
                  </p>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between items-center">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    ID: {user.id}
                  </p>
                  {user.role === UserRole.STUDENT && (
                     <p className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0 sm:ml-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-.567-.267C8.07 8.34 8 8.688 8 9v2c0 .312.07.66.433.849.22.186.497.291.82.355V14c0 .552.448 1 1 1h2c.552 0 1-.448 1-1v-.798c.323-.064.599-.17.82-.355.363-.188.433-.537.433-.849V9c0-.312-.07-.66-.433-.849a2.805 2.805 0 00-.82-.355V7.5c0-.552-.448-1-1-1h-2c-.552 0-1 .448-1 1v.202c-.323.064-.599.17-.82.355-.363.189-.433.537-.433.849zM3.5 3A1.5 1.5 0 002 4.5v11A1.5 1.5 0 003.5 17h13a1.5 1.5 0 001.5-1.5v-11A1.5 1.5 0 0016.5 3h-13z" />
                        </svg>
                        Crédits: {user.credits !== undefined ? user.credits : 'N/A'}
                     </p>
                  )}
                </div>
                <div className="flex space-x-2 mt-2 sm:mt-0">
                  {user.role === UserRole.STUDENT && (
                      <Button
                          size="sm"
                          variant="ghost"
                          className="text-teal-600 hover:text-teal-700"
                          onClick={() => handleOpenCreditsModal(user)}
                      >
                        Crédits
                      </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleOpenUserModal(user)}>Éditer</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteUser(user.id)}>Supprimer</Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {selectedStudentForCredits && (
        <Modal 
            isOpen={isCreditsModalOpen} 
            onClose={handleCloseCreditsModal} 
            title={`Gérer les crédits de ${selectedStudentForCredits.name}`}
        >
            <div className="space-y-4 py-2">
                <p className="text-sm text-slate-600">Crédits actuels : {selectedStudentForCredits.credits !== undefined ? selectedStudentForCredits.credits : 'N/A'}</p>
                <Input
                label="Nouveau solde de crédits"
                type="number"
                id="newCredits"
                value={newCreditValue}
                onChange={(e) => setNewCreditValue(e.target.value)}
                min="0"
                placeholder="Entrez le nombre total de crédits"
                />
            </div>
            <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={handleCloseCreditsModal}>Annuler</Button>
                <Button onClick={handleSaveCredits}>Sauvegarder Crédits</Button>
            </div>
        </Modal>
      )}
      <Modal
        isOpen={isUserModalOpen}
        onClose={handleCloseUserModal}
        title={editingUser ? 'Modifier un utilisateur' : 'Créer un utilisateur'}
      >
        <div className="space-y-4 py-2">
          <Input label="Nom" type="text" id="userName" value={userName} onChange={e => setUserName(e.target.value)} />
          <Select label="Rôle" id="userRole" value={userRole} onChange={e => setUserRole(e.target.value as UserRole)} options={USER_ROLES_CONFIG} />
          <Input label="Mot de passe" type="password" id="userPassword" value={userPassword} onChange={e => setUserPassword(e.target.value)} />
        </div>
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={handleCloseUserModal}>Annuler</Button>
          <Button onClick={handleSaveUser}>Sauvegarder</Button>
        </div>
      </Modal>
    </div>
  );
};

const ManageClasses: React.FC = () => {
  const { classes, addClass, updateClass, deleteClass } = useAppContext(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<YogaClass | undefined>(undefined);

  const handleOpenModal = (cls?: YogaClass) => {
    setEditingClass(cls);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingClass(undefined);
    setIsModalOpen(false);
  };

  const handleSaveClass = (data: YogaClassFormData) => {
    if (editingClass) {
      updateClass(editingClass.id, data);
    } else {
      addClass(data); 
    }
    handleCloseModal();
  };
  
  const handleDeleteClass = (classId: string) => {
    if (window.confirm("ADMIN: Êtes-vous sûr de vouloir supprimer ce cours? Toutes les réservations confirmées associées seront annulées et les crédits remboursés.")) {
      deleteClass(classId);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white rounded-xl shadow-lg border border-emerald-100">
        <div>
            <h2 className="text-3xl font-semibold text-teal-700">Gestion de Tous les Cours</h2>
            <p className="text-slate-600 mt-1">Créez, modifiez ou supprimez des cours pour tous les professeurs.</p>
        </div>
         <Button onClick={() => handleOpenModal()} variant="primary" className="mt-3 sm:mt-0">
          Ajouter un cours
        </Button>
      </div>
      
      {classes.length === 0 && <p className="text-slate-600 mt-4">Aucun cours n'a encore été créé.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {classes.map(cls => (
          <ClassCard 
            key={cls.id} 
            yogaClass={cls}
            onEdit={() => handleOpenModal(cls)}
            onDelete={() => handleDeleteClass(cls.id)}
          />
        ))}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingClass ? "Modifier le cours (Admin)" : "Créer un nouveau cours (Admin)"}
      >
        <ClassForm
          initialData={editingClass}
          onSave={handleSaveClass}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};


export const AdminDashboardPage: React.FC = () => {
  const { currentUser } = useAppContext();

  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Outlet />
    </div>
  );
};

export { ManageUsers as AdminManageUsers };
export { ManageClasses as AdminManageClasses }

