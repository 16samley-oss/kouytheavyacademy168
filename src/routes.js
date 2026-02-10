const routes = [
  {
    path: '/login',
    component: 'Login',
    isPublic: true,
  },
  {
    path: '/dashboard',
    component: 'Dashboard',
    isPublic: false,
  },
  {
    path: '/courses',
    component: 'CourseList',
    isPublic: false,
  },
  {
    path: '/courses/create',
    component: 'CourseCreate',
    isPublic: false,
  },
  {
    path: '/courses/edit/:id',
    component: 'CourseEdit',
    isPublic: false,
  },
  {
    path: '/users',
    component: 'UserList',
    isPublic: false,
  },
  {
    path: '/users/edit/:id',
    component: 'UserEdit',
    isPublic: false,
  },
  {
    path: '/payments',
    component: 'PaymentList',
    isPublic: false,
  },
  {
    path: '/enrollments',
    component: 'EnrollmentList',
    isPublic: false,
  },
  {
    path: '/settings',
    component: 'Settings',
    isPublic: false,
  },
];

export default routes;