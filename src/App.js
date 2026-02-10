import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/Common/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/Courses/CourseList';
import CourseCreate from './pages/Courses/CourseCreate';
import CourseEdit from './pages/Courses/CourseEdit';
import LessonList from './pages/Lessons/LessonList';
import LessonCreate from './pages/Lessons/LessonCreate';
import LessonEdit from './pages/Lessons/LessonEdit';
import UserList from './pages/Users/UserList';
import UserEdit from './pages/Users/UserEdit';
import PaymentList from './pages/Payments/PaymentList';
import EnrollmentList from './pages/Enrollments/EnrollmentList';
import Settings from './pages/Settings';
import BackupRestore from './pages/BackupRestore';
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/courses" element={<CourseList />} />
                <Route path="/courses/create" element={<CourseCreate />} />
                <Route path="/courses/edit/:id" element={<CourseEdit />} />
                
                {/* Lesson management routes */}
                <Route path="/courses/:courseId/lessons" element={<LessonList />} />
                <Route path="/courses/:courseId/lessons/create" element={<LessonCreate />} />
                <Route path="/courses/:courseId/lessons/edit/:lessonId" element={<LessonEdit />} />
                
                <Route path="/users" element={<UserList />} />
                <Route path="/users/edit/:id" element={<UserEdit />} />
                <Route path="/payments" element={<PaymentList />} />
                <Route path="/enrollments" element={<EnrollmentList />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/backup" element={<BackupRestore />} />
                
                {/* Redirect root to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;