import React, { useState } from 'react';
import { YogaClass, UserRole, Booking } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { Button } from '../common/Button';
import { getUpcomingClassDates, formatDateToYYYYMMDD } from '../../utils/dateUtils';
import { Modal } from '../common/Modal';


interface ClassCardProps {
  yogaClass: YogaClass;
  onEdit?: (yogaClass: YogaClass) => void;
  onDelete?: (classId: string) => void;
}

const AttendeeListModal: React.FC<{ bookings: Booking[], classDate: string, onClose: () => void, classNameVal: string }> = ({ bookings, classDate, onClose, classNameVal }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title={`Participants: ${classNameVal} (${formatDateToYYYYMMDD(new Date(classDate))})`}>
      {bookings.length > 0 ? (
        <ul className="space-y-2">
          {bookings.map(booking => (
            <li key={booking.id} className="text-slate-700 p-2 bg-slate-100 rounded">
              {booking.studentName || booking.studentId}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-600">Aucun participant pour cette date.</p>
      )}
    </Modal>
  );
};


export const ClassCard: React.FC<ClassCardProps> = ({ yogaClass, onEdit, onDelete }) => {
  const { currentUser, createBooking, getAvailableSlots, getBookingsForClassAndDate, bookings: allBookings } = useAppContext();
  const [selectedDateForModal, setSelectedDateForModal] = useState<string>(''); // Used to pass date to modal
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [attendeesForDate, setAttendeesForDate] = useState<Booking[]>([]);

  const upcomingInstances = getUpcomingClassDates(yogaClass);

  const handleBookClass = (classDate: string) => {
    if (!currentUser || currentUser.role !== UserRole.STUDENT) return;
    createBooking(yogaClass.id, classDate);
  };

  const handleViewAttendees = (classDate: string) => {
    const attendees = getBookingsForClassAndDate(yogaClass.id, classDate);
    setAttendeesForDate(attendees);
    setSelectedDateForModal(classDate); // Set the date for the modal
    setShowAttendeesModal(true);
  };
  
  const isStudentBookedForDate = (classDate: string): boolean => {
    if (!currentUser || currentUser.role !== UserRole.STUDENT) return false;
    return allBookings.some(b => b.studentId === currentUser.id && b.classId === yogaClass.id && b.bookingDate === classDate && b.status === 'confirmed');
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 space-y-4 border border-emerald-100 hover:shadow-emerald-200/50 transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-teal-700">{yogaClass.name}</h3>
          <p className="text-sm text-slate-500">Avec {yogaClass.teacherName || 'Professeur Inconnu'}</p>
        </div>
        {currentUser?.role === UserRole.TEACHER && yogaClass.teacherId === currentUser.id && onEdit && onDelete && (
          <div className="flex space-x-2">
            <Button onClick={() => onEdit(yogaClass)} variant="secondary" size="sm">Modifier</Button>
            <Button onClick={() => onDelete(yogaClass.id)} variant="danger" size="sm">Supprimer</Button>
          </div>
        )}
         {currentUser?.role === UserRole.ADMIN && onEdit && onDelete && (
          <div className="flex space-x-2">
            <Button onClick={() => onEdit(yogaClass)} variant="secondary" size="sm">Modifier (Admin)</Button>
            <Button onClick={() => onDelete(yogaClass.id)} variant="danger" size="sm">Supprimer (Admin)</Button>
          </div>
        )}
      </div>
      
      <div className="text-sm text-slate-600 space-y-1">
        <p><span className="font-medium">Jour:</span> {yogaClass.dayOfWeek}</p>
        <p><span className="font-medium">Horaire:</span> {yogaClass.startTime} - {yogaClass.endTime}</p>
        <p><span className="font-medium">Lieu:</span> {yogaClass.location}</p>
        <p><span className="font-medium">Places totales:</span> {yogaClass.totalSlots}</p>
        {yogaClass.description && <p className="italic text-slate-500 pt-1">{yogaClass.description}</p>}
      </div>

      {upcomingInstances.length > 0 && (
        <div className="space-y-3 pt-2">
          <p className="text-sm font-medium text-slate-700">Prochains créneaux disponibles :</p>
          {upcomingInstances.map(({ date }) => { // Removed classDateTime from destructuring as it's not used here
            const availableSlots = getAvailableSlots(yogaClass.id, date);
            const isBookedByCurrentUser = isStudentBookedForDate(date);
            const classFull = availableSlots <= 0;
            const canBook = currentUser?.role === UserRole.STUDENT && !isBookedByCurrentUser && !classFull;

            return (
              <div key={date} className="p-3 bg-emerald-50 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <div>
                  <p className="text-sm text-teal-700 font-medium">{new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-xs text-slate-500">
                    {isBookedByCurrentUser ? (
                        <span className="text-green-600 font-semibold">Vous êtes inscrit!</span>
                    ) : classFull ? (
                        <span className="text-red-500 font-semibold">Complet</span>
                    ) : (
                        `Places restantes: ${availableSlots}`
                    )}
                  </p>
                </div>
                <div className="flex space-x-2 items-center">
                  {currentUser?.role === UserRole.STUDENT && (
                    <Button 
                      onClick={() => handleBookClass(date)} 
                      disabled={!canBook}
                      size="sm"
                      variant={isBookedByCurrentUser || classFull ? "secondary" : "primary"}
                    >
                      {isBookedByCurrentUser ? "Déjà réservé" : classFull ? "Complet" : "Réserver ce créneau"}
                    </Button>
                  )}
                  {((currentUser?.role === UserRole.TEACHER && yogaClass.teacherId === currentUser.id) || currentUser?.role === UserRole.ADMIN) ? (
                     <Button onClick={() => handleViewAttendees(date)} variant="ghost" size="sm">
                        Voir Participants ({getBookingsForClassAndDate(yogaClass.id, date).length})
                     </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {upcomingInstances.length === 0 && (
        <p className="text-sm text-slate-500 italic">Aucun créneau à venir pour ce cours dans les prochaines semaines.</p>
      )}
      {showAttendeesModal && (
        <AttendeeListModal 
            bookings={attendeesForDate} 
            classDate={selectedDateForModal} 
            onClose={() => setShowAttendeesModal(false)}
            classNameVal={yogaClass.name}
        />
      )}
    </div>
  );
};
