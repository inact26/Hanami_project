export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email?: string; // Optional, for future use
  credits?: number; // Specifically for students, managed by teacher/admin
}

export interface YogaClass {
  id:string;
  name: string;
  teacherId: string; // ID of the teacher conducting the class
  teacherName?: string; // Denormalized for display
  dayOfWeek: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi' | 'Dimanche';
  startTime: string; // HH:MM format e.g., "09:00"
  endTime: string;   // HH:MM format e.g., "10:00"
  location: string;
  totalSlots: number;
  // bookedSlots will be calculated dynamically or stored if performance becomes an issue
  cancellationWindowHours: number; // e.g., 2 for 2 hours before
  description?: string;
}

export interface Booking {
  id: string;
  classId: string;
  studentId: string;
  studentName?: string; // Denormalized, can be fetched if needed
  bookingDate: string; // YYYY-MM-DD specific date of the class instance
  // classDetails?: Pick<YogaClass, 'name' | 'dayOfWeek' | 'startTime' | 'endTime' | 'location'>; // Denormalized for quick display
  status: 'confirmed' | 'cancelled_by_student' | 'cancelled_by_teacher' | 'cancelled_by_admin'; // Added admin cancellation
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: number;
}

// For class form
export type YogaClassFormData = Omit<YogaClass, 'id' | 'teacherName'>;