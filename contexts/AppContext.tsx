

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, UserRole, YogaClass, Booking, AppNotification, YogaClassFormData } from '../types';
import { MOCK_USERS_STORAGE_KEY, MOCK_CLASSES_STORAGE_KEY, MOCK_BOOKINGS_STORAGE_KEY, CURRENT_USER_STORAGE_KEY } from '../constants';
import { getWeekNumber, formatDateToYYYYMMDD, combineDateAndTime } from '../utils/dateUtils';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  classes: YogaClass[];
  bookings: Booking[];
  notifications: AppNotification[];
  isLoading: boolean;
  login: (name: string, role: UserRole, password: string) => User | null;
  logout: () => void;
  addNotification: (message: string, type: AppNotification['type']) => void;
  dismissNotification: (id: string) => void;
  // Class Management
  addClass: (classData: YogaClassFormData) => YogaClass | null;
  updateClass: (classId: string, classData: Partial<YogaClassFormData>) => YogaClass | null;
  deleteClass: (classId: string) => void;
  getAvailableSlots: (classId: string, classDate: string) => number;
  // Booking Management
  createBooking: (classId: string, classDate: string) => Booking | null;
  cancelBooking: (bookingId: string) => boolean;
  getBookingsForCurrentUser: () => Booking[];
  getBookingsForClassAndDate: (classId: string, classDate: string) => Booking[];
  getBookingsThisWeekForCurrentUser: () => number;
  // User Management (Admin)
  updateUserCredits: (studentId: string, newCreditAmount: number) => boolean;
  createUser: (data: {name: string; role: UserRole; password?: string; credits?: number}) => User | null;
  updateUser: (userId: string, data: Partial<Omit<User, 'id'>>) => User | null;
  deleteUser: (userId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialAdminUser: User = { id: 'admin-001', name: 'Admin User', role: UserRole.ADMIN, password: 'admin' };
const initialTeacherUser: User = { id: 'teacher-001', name: 'Professeur Oak', role: UserRole.TEACHER, password: 'teacher' };
const initialStudentUser: User = { id: 'student-001', name: 'Élève Sacha', role: UserRole.STUDENT, credits: 10, password: 'student' };

const initialClasses: YogaClass[] = [
  { id: 'class-001', name: 'Yin Yoga Doux', teacherId: 'teacher-001', teacherName: 'Professeur Oak', dayOfWeek: 'Mercredi', startTime: '18:00', endTime: '19:00', location: 'Salle Harmonie', totalSlots: 15, cancellationWindowHours: 2, description: 'Un cours doux pour étirer en profondeur.' },
  { id: 'class-002', name: 'Vinyasa Flow', teacherId: 'teacher-001', teacherName: 'Professeur Oak', dayOfWeek: 'Vendredi', startTime: '09:00', endTime: '10:00', location: 'Salle Énergie', totalSlots: 20, cancellationWindowHours: 24, description: 'Un flow dynamique pour énergiser.' },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem(MOCK_USERS_STORAGE_KEY);
    return storedUsers ? JSON.parse(storedUsers) : [initialAdminUser, initialTeacherUser, initialStudentUser];
  });
  const [classes, setClasses] = useState<YogaClass[]>(() => {
    const storedClasses = localStorage.getItem(MOCK_CLASSES_STORAGE_KEY);
    return storedClasses ? JSON.parse(storedClasses) : initialClasses;
  });
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const storedBookings = localStorage.getItem(MOCK_BOOKINGS_STORAGE_KEY);
    return storedBookings ? JSON.parse(storedBookings) : [];
  });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(MOCK_CLASSES_STORAGE_KEY, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(MOCK_BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  }, [bookings]);
  
  useEffect(() => {
    const storedUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const addNotification = useCallback((message: string, type: AppNotification['type']) => {
    const newNotification: AppNotification = { id: `notif-${Date.now()}`, message, type, timestamp: Date.now() };
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep last 5 notifications
  }, []);

  const login = useCallback((name: string, role: UserRole, password: string): User | null => {
    let user = users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.role === role);
    if (user) {
      if (user.password && user.password !== password) {
        addNotification('Mot de passe incorrect.', 'error');
        return null;
      }
      if (!user.password) {
        // First login, set password
        const updated = { ...user, password };
        setUsers(prev => prev.map(u => u.id === user!.id ? updated : u));
        user = updated;
      }
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        role,
        password: password || undefined,
        credits: role === UserRole.STUDENT ? 10 : undefined // New students get 10 credits
      };
      setUsers(prev => [...prev, newUser]);
      user = newUser;
    }
    setCurrentUser(user);
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    addNotification(`Bienvenue ${user.name}!`, 'success');
    return user;
  }, [users, setUsers, addNotification]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    addNotification('Vous avez été déconnecté.', 'info');
  }, [addNotification]); 

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // User Management (Admin)
  const updateUserCredits = useCallback((studentId: string, newCreditAmount: number): boolean => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      addNotification("Action non autorisée. Seuls les administrateurs peuvent modifier les crédits.", "error");
      return false;
    }
    if (newCreditAmount < 0) {
        addNotification("Le nombre de crédits ne peut pas être négatif.", "error");
        return false;
    }

    let studentName = '';
    let success = false;
    setUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id === studentId && u.role === UserRole.STUDENT) {
          studentName = u.name;
          success = true;
          return { ...u, credits: newCreditAmount };
        }
        return u;
      })
    );

    if (success) {
        addNotification(`Crédits mis à jour pour ${studentName} à ${newCreditAmount}.`, "success");
        // If the updated user is the current user, update currentUser state as well
        if (currentUser.id === studentId) {
            setCurrentUser(prev => prev ? {...prev, credits: newCreditAmount} : null);
        }
        return true;
    } else {
        addNotification("Élève non trouvé ou rôle incorrect.", "error");
        return false;
    }
  }, [currentUser, addNotification, setUsers, setCurrentUser]);

  const createUser = useCallback((data: {name: string; role: UserRole; password?: string; credits?: number}): User | null => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      addNotification('Action non autorisée.', 'error');
      return null;
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      role: data.role,
      password: data.password,
      credits: data.role === UserRole.STUDENT ? (data.credits ?? 0) : undefined
    };
    setUsers(prev => [...prev, newUser]);
    addNotification('Utilisateur créé.', 'success');
    return newUser;
  }, [currentUser, addNotification, setUsers]);

  const updateUser = useCallback((userId: string, data: Partial<Omit<User, 'id'>>): User | null => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      addNotification('Action non autorisée.', 'error');
      return null;
    }
    let updated: User | null = null;
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        updated = { ...u, ...data };
        return updated;
      }
      return u;
    }));
    if (updated) {
      if (currentUser.id === userId) setCurrentUser(updated);
      addNotification('Utilisateur mis à jour.', 'success');
      return updated;
    }
    addNotification('Utilisateur non trouvé.', 'error');
    return null;
  }, [currentUser, addNotification, setUsers, setCurrentUser]);

  const deleteUser = useCallback((userId: string): boolean => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      addNotification('Action non autorisée.', 'error');
      return false;
    }
    const exists = users.some(u => u.id === userId);
    if (!exists) {
      addNotification('Utilisateur non trouvé.', 'error');
      return false;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUser.id === userId) logout();
    addNotification('Utilisateur supprimé.', 'success');
    return true;
  }, [currentUser, users, addNotification, setUsers, logout]);


  // Class Management
  const addClass = useCallback((classData: YogaClassFormData): YogaClass | null => {
    if (!currentUser || (currentUser.role !== UserRole.TEACHER && currentUser.role !== UserRole.ADMIN)) { 
      addNotification("Seuls les professeurs ou administrateurs peuvent ajouter des cours.", "error");
      return null;
    }
    const teacher = users.find(u => u.id === classData.teacherId); 
    const newClass: YogaClass = { 
      ...classData, 
      id: `class-${Date.now()}`, 
      teacherName: teacher?.name || 'Professeur Inconnu'
    };
    setClasses(prev => [...prev, newClass]);
    addNotification(`Cours "${newClass.name}" ajouté avec succès.`, "success");
    return newClass;
  }, [currentUser, users, addNotification]);

  const updateClass = useCallback((classId: string, classData: Partial<YogaClassFormData>): YogaClass | null => {
     if (!currentUser || (currentUser.role !== UserRole.TEACHER && currentUser.role !== UserRole.ADMIN) ) {
      addNotification("Action non autorisée.", "error");
      return null;
    }
    let updatedClass: YogaClass | null = null;
    setClasses(prev => prev.map(c => {
      if (c.id === classId && (c.teacherId === currentUser.id || currentUser.role === UserRole.ADMIN)) {
        const teacher = users.find(u => u.id === (classData.teacherId || c.teacherId));
        updatedClass = { ...c, ...classData, teacherName: teacher?.name || c.teacherName };
        return updatedClass;
      }
      return c;
    }));
    if (updatedClass) {
      addNotification(`Cours "${updatedClass.name}" mis à jour.`, "success");
    } else {
      addNotification("Cours non trouvé ou non autorisé à modifier.", "error");
    }
    return updatedClass;
  }, [currentUser, users, addNotification]);

  const deleteClass = useCallback((classId: string) => {
    if (!currentUser || (currentUser.role !== UserRole.TEACHER && currentUser.role !== UserRole.ADMIN)) {
      addNotification("Action non autorisée.", "error");
      return;
    }
    const classToDelete = classes.find(c => c.id === classId);
    if (!classToDelete || (classToDelete.teacherId !== currentUser.id && currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.TEACHER)) {
        addNotification("Cours non trouvé ou non autorisé à supprimer.", "error");
        return;
    }

    setClasses(prev => prev.filter(c => c.id !== classId));
    
    const affectedBookings = bookings.filter(b => b.classId === classId && b.status === 'confirmed');
    
    // Update bookings to cancelled and refund credits
    setBookings(prevBookings => prevBookings.map(b => 
        b.classId === classId && b.status === 'confirmed' 
        ? { ...b, status: currentUser.role === UserRole.TEACHER ? 'cancelled_by_teacher' : 'cancelled_by_admin' } 
        : b
    ));

    setUsers(prevUsers => {
        let newUsers = [...prevUsers];
        let studentsRefundedNames: string[] = [];
        affectedBookings.forEach(booking => {
            const studentIndex = newUsers.findIndex(u => u.id === booking.studentId && u.role === UserRole.STUDENT);
            if (studentIndex !== -1) {
                const student = newUsers[studentIndex];
                newUsers[studentIndex] = { ...student, credits: (student.credits || 0) + 1 };
                studentsRefundedNames.push(student.name);

                // If the current user is one of the affected students, update their state
                if (currentUser && currentUser.id === student.id) {
                    setCurrentUser(prev => prev ? { ...prev, credits: (prev.credits || 0) + 1 } : null);
                }
            }
        });
        if (studentsRefundedNames.length > 0) {
           addNotification(`Crédits remboursés à: ${studentsRefundedNames.join(', ')} suite à l'annulation du cours ${classToDelete.name}.`, "info");
        }
        return newUsers;
    });

    addNotification(`Cours "${classToDelete.name}" supprimé. Réservations associées annulées et crédits potentiellement remboursés.`, "success");
  }, [currentUser, classes, bookings, users, addNotification, setBookings, setUsers, setCurrentUser]);

  const getAvailableSlots = useCallback((classId: string, classDate: string): number => {
    const currentYogaClass = classes.find(c => c.id === classId);
    if (!currentYogaClass) return 0;
    const bookedCount = bookings.filter(b => b.classId === classId && b.bookingDate === classDate && b.status === 'confirmed').length;
    return currentYogaClass.totalSlots - bookedCount;
  }, [classes, bookings]);

  // Booking Management
  const getBookingsThisWeekForCurrentUser = useCallback((): number => {
    if (!currentUser || currentUser.role !== UserRole.STUDENT) return 0;
    const currentWeekNum = getWeekNumber(new Date());
    return bookings.filter(b => {
      if (b.studentId === currentUser.id && b.status === 'confirmed') {
        const bookingDate = combineDateAndTime(b.bookingDate, "00:00"); 
        return getWeekNumber(bookingDate) === currentWeekNum;
      }
      return false;
    }).length;
  }, [currentUser, bookings]);
  
  const createBooking = useCallback((classId: string, classDate: string): Booking | null => {
    if (!currentUser || currentUser.role !== UserRole.STUDENT) {
      addNotification("Seuls les élèves peuvent réserver des cours.", "error");
      return null;
    }

    // Check credits first
    const studentUser = users.find(u => u.id === currentUser.id);
    if (!studentUser || (studentUser.credits !== undefined && studentUser.credits < 1)) {
        addNotification("Crédits insuffisants pour réserver ce cours. Veuillez contacter l'administrateur.", "error");
        return null;
    }

    const bookingsThisWeek = getBookingsThisWeekForCurrentUser();
    if (bookingsThisWeek >= 1) { 
        addNotification("Vous avez déjà atteint votre limite de réservation pour cette semaine (1 cours).", "error");
        return null;
    }

    const availableSlots = getAvailableSlots(classId, classDate);
    if (availableSlots <= 0) {
      addNotification("Ce cours est complet pour cette date.", "error");
      return null;
    }

    const existingBooking = bookings.find(b => b.studentId === currentUser.id && b.classId === classId && b.bookingDate === classDate && b.status === 'confirmed');
    if (existingBooking) {
        addNotification("Vous avez déjà réservé ce créneau.", "error");
        return null;
    }
    
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      classId,
      studentId: currentUser.id,
      studentName: studentUser?.name || 'Élève Inconnu',
      bookingDate: classDate,
      status: 'confirmed',
    };
    setBookings(prev => [...prev, newBooking]);

    // Deduct credit
    const updatedCredits = (studentUser.credits || 0) - 1;
    const updatedStudentUser = { ...studentUser, credits: updatedCredits };
    setUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? updatedStudentUser : u));
    setCurrentUser(updatedStudentUser); // Update current user state immediately

    addNotification(`Réservation confirmée! 1 crédit débité. Crédits restants: ${updatedCredits}.`, "success");
    return newBooking;
  }, [currentUser, users, bookings, getAvailableSlots, addNotification, getBookingsThisWeekForCurrentUser, setUsers, setCurrentUser, setBookings]);

  const cancelBooking = useCallback((bookingId: string): boolean => {
    if (!currentUser) return false;

    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) {
      addNotification("Réservation non trouvée.", "error");
      return false;
    }

    const bookingToCancel = bookings[bookingIndex];
    let cancellationRole: Booking['status'] = 'cancelled_by_student'; // Default

    // Permission check
    if (bookingToCancel.studentId !== currentUser.id && currentUser.role === UserRole.STUDENT) {
         addNotification("Non autorisé à annuler cette réservation.", "error");
         return false;
    } else if (currentUser.role === UserRole.TEACHER) {
        const classOfBooking = classes.find(c => c.id === bookingToCancel.classId);
        if (!classOfBooking || classOfBooking.teacherId !== currentUser.id) {
            addNotification("Non autorisé: ce n'est pas votre cours.", "error");
            return false;
        }
        cancellationRole = 'cancelled_by_teacher';
    } else if (currentUser.role === UserRole.ADMIN) {
        cancellationRole = 'cancelled_by_admin';
    }
    
    const yogaClassDetails = classes.find(c => c.id === bookingToCancel.classId);
    if (!yogaClassDetails) {
        addNotification("Cours associé à la réservation non trouvé. Annulation forcée.", "error");
        // Fallback: still mark as cancelled and refund if it was the student
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: cancellationRole } : b));
         // Refund logic here even if class details are missing, if student cancelled
        if (bookingToCancel.status === 'confirmed' && bookingToCancel.studentId) {
            const studentToRefund = users.find(u => u.id === bookingToCancel.studentId && u.role === UserRole.STUDENT);
            if (studentToRefund) {
                const newCredits = (studentToRefund.credits || 0) + 1;
                const updatedStudent = { ...studentToRefund, credits: newCredits };
                setUsers(prevUsers => prevUsers.map(u => u.id === bookingToCancel.studentId ? updatedStudent : u));
                if (currentUser.id === bookingToCancel.studentId) setCurrentUser(updatedStudent);
                addNotification(`Crédit remboursé (cours introuvable). Crédits: ${newCredits}.`, "info");
            }
        }
        return true;
    }

    const classDateTime = combineDateAndTime(bookingToCancel.bookingDate, yogaClassDetails.startTime);
    const now = new Date();
    const diffHours = (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (currentUser.role === UserRole.STUDENT && diffHours < yogaClassDetails.cancellationWindowHours) {
        addNotification(`Annulation non permise. Le délai de ${yogaClassDetails.cancellationWindowHours}h avant le cours est dépassé.`, "error");
        return false;
    }
    
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: cancellationRole } : b));
    
    // Refund credit if booking was confirmed
    if (bookingToCancel.status === 'confirmed') {
        const studentToRefund = users.find(u => u.id === bookingToCancel.studentId && u.role === UserRole.STUDENT);
        if (studentToRefund) {
            const newCredits = (studentToRefund.credits || 0) + 1;
            const updatedStudent = { ...studentToRefund, credits: newCredits };
            setUsers(prevUsers => prevUsers.map(u => u.id === bookingToCancel.studentId ? updatedStudent : u));
            
            // If the current user is the student who cancelled, or if admin/teacher cancelled for this student
            if (currentUser.id === bookingToCancel.studentId) {
                setCurrentUser(updatedStudent);
                addNotification(`Réservation annulée. 1 crédit remboursé. Crédits restants: ${newCredits}.`, "success");
            } else if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.TEACHER) {
                 addNotification(`Réservation annulée pour ${studentToRefund.name}. 1 crédit remboursé. Crédits de ${studentToRefund.name}: ${newCredits}.`, "success");
            }
        } else {
            addNotification("Réservation annulée. (Élève pour remboursement non trouvé)", "success");
        }
    } else {
         addNotification("Réservation annulée (pas de remboursement car non confirmée initialement).", "success");
    }
    return true;
  }, [currentUser, bookings, classes, users, addNotification, setUsers, setCurrentUser, setBookings]);

  const getBookingsForCurrentUser = useCallback((): Booking[] => {
    if (!currentUser) return [];
    // Show all bookings (active and cancelled) for history, sort by date
    return bookings.filter(b => b.studentId === currentUser.id)
                   .sort((a,b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
  }, [currentUser, bookings]);

  const getBookingsForClassAndDate = useCallback((classId: string, classDate: string): Booking[] => {
    return bookings.filter(b => b.classId === classId && b.bookingDate === classDate && b.status === 'confirmed');
  }, [bookings]);


  const value = {
    currentUser, users, classes, bookings, notifications, isLoading,
    login, logout, addNotification, dismissNotification,
    addClass, updateClass, deleteClass, getAvailableSlots,
    createBooking, cancelBooking, getBookingsForCurrentUser, getBookingsForClassAndDate,
    getBookingsThisWeekForCurrentUser,
    updateUserCredits, createUser, updateUser, deleteUser
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};