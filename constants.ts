import { UserRole } from './types';
import { YogaClass } from './types';


export const APP_NAME = "Zenith Yoga Studio";

export const USER_ROLES_CONFIG: { value: UserRole; label: string }[] = [
  { value: UserRole.STUDENT, label: "Élève" },
  { value: UserRole.TEACHER, label: "Professeur" },
  { value: UserRole.ADMIN, label: "Administrateur" },
];

export const DAYS_OF_WEEK: YogaClass['dayOfWeek'][] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export const MOCK_USERS_STORAGE_KEY = 'zenith_yoga_users';
export const MOCK_CLASSES_STORAGE_KEY = 'zenith_yoga_classes';
export const MOCK_BOOKINGS_STORAGE_KEY = 'zenith_yoga_bookings';
export const CURRENT_USER_STORAGE_KEY = 'zenith_yoga_current_user';
