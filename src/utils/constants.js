export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
export const ADMIN_URL = process.env.REACT_APP_ADMIN_URL || 'http://localhost:3001';

export const COURSE_TYPES = {
  FREE: 'free',
  PAID: 'paid',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const SIDEBAR_MENU_ITEMS = [
  {
    path: '/dashboard',
    icon: 'fas fa-home',
    label: 'Dashboard',
  },
  {
    path: '/courses',
    icon: 'fas fa-book',
    label: 'Courses',
  },
  {
    path: '/users',
    icon: 'fas fa-users',
    label: 'Users',
  },
  {
    path: '/payments',
    icon: 'fas fa-credit-card',
    label: 'Payments',
  },
  {
    path: '/enrollments',
    icon: 'fas fa-graduation-cap',
    label: 'Enrollments',
  },
  {
    path: '/settings',
    icon: 'fas fa-cog',
    label: 'Settings',
  },
];