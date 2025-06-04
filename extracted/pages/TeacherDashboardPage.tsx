import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { YogaClass, YogaClassFormData, UserRole, Booking } from '../types';
import { ClassCard } from '../components/classes/ClassCard';
import { ClassForm } from '../components/classes/ClassForm';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { getUpcomingClassDates } from '../utils/dateUtils';


const MyClasses: React.FC = () => {
  const { classes, currentUser, addClass, updateClass, deleteClass } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<YogaClass | undefined>(undefined);

  const teacherClasses = classes.filter(c => c.teacherId === currentUser?.id);

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
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce cours et toutes ses réservations associées?")) {
      deleteClass(classId);
    }
  };

  return (
     <div className="space-y-6">
       <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-teal-700">Mes Cours</h2>
        <Button onClick={() => handleOpenModal()} variant="primary">
          Ajouter un cours
        </Button>
      </div>

      {teacherClasses.length === 0 && <p className="text-slate-600">Vous n'avez aucun cours assigné pour le moment.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teacherClasses.map(cls => (
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
        title={editingClass ? "Modifier le cours" : "Créer un nouveau cours"}
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

const TeacherSchedule: React.FC = () => {
  const { classes, currentUser, bookings, users } = useAppContext();
  if (!currentUser) return null;

  const teacherClasses = classes.filter(c => c.teacherId === currentUser.id);
  const upcomingScheduleItems: { classInfo: YogaClass, date: string, classDateTime: Date, bookings: Booking[] }[] = [];

  teacherClasses.forEach(cls => {
    const upcomingDates = getUpcomingClassDates(cls, 2); // For next 2 weeks
    upcomingDates.forEach(instance => {
      const classBookings = bookings.filter(b => b.classId === cls.id && b.bookingDate === instance.date && b.status === 'confirmed');
      upcomingScheduleItems.push({
        classInfo: cls,
        date: instance.date,
        classDateTime: instance.classDateTime,
        bookings: classBookings
      });
    });
  });
  
  // Sort by date and time
  upcomingScheduleItems.sort((a,b) => a.classDateTime.getTime() - b.classDateTime.getTime());

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-teal-700 mb-2">Mon Planning (Prochains Cours)</h2>
      </div>
      {upcomingScheduleItems.length === 0 && <p className="text-slate-600">Aucun cours programmé dans les prochaines semaines.</p>}
      <div className="space-y-4">
        {upcomingScheduleItems.map(item => (
          <div key={`${item.classInfo.id}-${item.date}`} className="bg-white p-4 rounded-lg shadow border border-emerald-200">
            <h3 className="text-lg font-semibold text-teal-600">{item.classInfo.name}</h3>
            <p className="text-sm text-slate-600">
              Date: {new Date(item.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-sm text-slate-600">Horaire: {item.classInfo.startTime} - {item.classInfo.endTime}</p>
            <p className="text-sm text-slate-600">Lieu: {item.classInfo.location}</p>
            <p className="text-sm text-slate-600">Participants: {item.bookings.length} / {item.classInfo.totalSlots}</p>
            {item.bookings.length > 0 && (
              <div className="mt-2">
                <h4 className="text-xs font-semibold text-slate-500">Liste des inscrits:</h4>
                <ul className="list-disc list-inside text-xs text-slate-500">
                  {item.bookings.map(b => {
                    const student = users.find(u => u.id === b.studentId);
                    return <li key={b.id}>{student?.name || 'Élève inconnu'}</li>;
                  })}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};


export const TeacherDashboardPage: React.FC = () => {
  const { currentUser } = useAppContext();

  if (!currentUser || currentUser.role !== UserRole.TEACHER) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Outlet />
    </div>
  );
};

export { MyClasses as TeacherMyClasses };
export { TeacherSchedule };
