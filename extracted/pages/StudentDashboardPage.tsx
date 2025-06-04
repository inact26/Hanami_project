import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { YogaClass, Booking, UserRole } from '../types';
import { ClassCard } from '../components/classes/ClassCard';
import { Button } from '../components/common/Button';
import { isCancellationAllowed, combineDateAndTime } from '../utils/dateUtils';

const AvailableClasses: React.FC = () => {
  const { classes, currentUser, getBookingsThisWeekForCurrentUser } = useAppContext();
  
  if (!currentUser || currentUser.role !== UserRole.STUDENT) return <p>Accès non autorisé.</p>;

  const bookingsThisWeek = getBookingsThisWeekForCurrentUser();
  const canBookMoreThisWeek = bookingsThisWeek < 1; // Assuming limit is 1 per week


  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-xl shadow-lg border border-emerald-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
                <h2 className="text-3xl font-semibold text-teal-700">Cours Disponibles</h2>
                <p className="text-slate-600">Parcourez nos cours et réservez votre séance de bien-être.</p>
            </div>
            <div className="mt-3 sm:mt-0 text-right">
                <p className="text-lg font-medium text-teal-600">
                    Vos crédits : <span className="text-2xl font-bold">{currentUser.credits ?? 0}</span>
                </p>
            </div>
        </div>

        {!canBookMoreThisWeek && (
            <p className="text-sm text-amber-700 bg-amber-100 p-3 rounded-md mb-4">
                Vous avez atteint votre limite de réservation pour cette semaine (1 cours). Vous pourrez réserver à nouveau la semaine prochaine.
            </p>
        )}
         {canBookMoreThisWeek && currentUser.credits !== undefined && currentUser.credits > 0 && (
            <p className="text-sm text-emerald-700 bg-emerald-100 p-3 rounded-md mb-4">
                Vous pouvez réserver {1 - bookingsThisWeek} cours cette semaine.
            </p>
        )}
         {currentUser.credits !== undefined && currentUser.credits <= 0 && (
             <p className="text-sm text-red-700 bg-red-100 p-3 rounded-md mb-4">
                Vous n'avez plus de crédits. Veuillez contacter l'administrateur pour en obtenir davantage.
            </p>
         )}
      </div>
      {classes.length === 0 && <p className="text-slate-600 mt-4">Aucun cours disponible pour le moment.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {classes.map(cls => (
          <ClassCard key={cls.id} yogaClass={cls} />
        ))}
      </div>
    </div>
  );
};

const MyBookings: React.FC = () => {
  const { getBookingsForCurrentUser, cancelBooking, classes, currentUser } = useAppContext();
  // getBookingsForCurrentUser now returns all bookings (active and cancelled)
  const userBookings = getBookingsForCurrentUser(); 

  if (!currentUser || currentUser.role !== UserRole.STUDENT) return <p>Accès non autorisé.</p>;

  const handleCancel = (bookingId: string) => {
    cancelBooking(bookingId);
  };
  
  const getFullClassDetails = (booking: Booking): YogaClass | undefined => {
    return classes.find(c => c.id === booking.classId);
  }

  const getStatusLabel = (status: Booking['status']): {text: string, color: string} => {
    switch(status) {
        case 'confirmed': return {text: 'Confirmée', color: 'text-green-600 bg-green-100'};
        case 'cancelled_by_student': return {text: 'Annulée par vous', color: 'text-red-600 bg-red-100'};
        case 'cancelled_by_teacher': return {text: 'Annulée par le professeur', color: 'text-orange-600 bg-orange-100'};
        case 'cancelled_by_admin': return {text: 'Annulée par l\'admin', color: 'text-purple-600 bg-purple-100'};
        default: return {text: status, color: 'text-slate-600 bg-slate-100'};
    }
  }

  return (
    <div className="space-y-6">
       <div className="p-6 bg-white rounded-xl shadow-lg border border-emerald-100">
        <h2 className="text-3xl font-semibold text-teal-700 mb-1">Mes Réservations</h2>
        <p className="text-slate-600">Consultez l'historique de vos réservations passées et à venir.</p>
      </div>
      {userBookings.length === 0 && <p className="text-slate-600 mt-4">Vous n'avez aucune réservation.</p>}
      <div className="space-y-4">
        {userBookings.map(booking => {
          const yogaClass = getFullClassDetails(booking);
          if (!yogaClass) return <div key={booking.id} className="p-4 bg-red-100 text-red-700 rounded-lg shadow">Cours non trouvé pour la réservation ID {booking.id}. Cela peut arriver si le cours a été supprimé.</div>;
          
          const classDateTime = combineDateAndTime(booking.bookingDate, yogaClass.startTime);
          const canCancel = booking.status === 'confirmed' && isCancellationAllowed(classDateTime, yogaClass.cancellationWindowHours);
          const statusInfo = getStatusLabel(booking.status);

          return (
            <div key={booking.id} className="bg-white p-5 rounded-lg shadow-md border border-emerald-200 hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start">
                <div>
                    <h3 className="text-xl font-semibold text-teal-700">{yogaClass.name}</h3>
                    <p className="text-sm text-slate-500 mb-1">Avec {yogaClass.teacherName}</p>
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                        {statusInfo.text}
                    </span>
                </div>
                <div className="mt-2 sm:mt-0 sm:text-right">
                     <p className="text-sm text-slate-700 font-medium">
                        {new Date(booking.bookingDate + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-slate-500">{yogaClass.startTime} - {yogaClass.endTime} | {yogaClass.location}</p>
                </div>
              </div>
             
              {booking.status === 'confirmed' && (
                <div className="mt-4 pt-3 border-t border-slate-200">
                    <Button
                    onClick={() => handleCancel(booking.id)}
                    variant="danger"
                    size="sm"
                    disabled={!canCancel}
                    title={!canCancel ? `Annulation possible jusqu'à ${yogaClass.cancellationWindowHours}h avant.` : 'Annuler la réservation'}
                    >
                    Annuler la réservation
                    </Button>
                    {!canCancel && <p className="text-xs text-red-500 mt-1">Délai d'annulation dépassé.</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


export const StudentDashboardPage: React.FC = () => {
  const { currentUser } = useAppContext();

  if (!currentUser || currentUser.role !== UserRole.STUDENT) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
        <Outlet /> {/* This is where nested routes will render their components */}
    </div>
  );
};

export { AvailableClasses as StudentAvailableClasses };
export { MyBookings as StudentMyBookings };
