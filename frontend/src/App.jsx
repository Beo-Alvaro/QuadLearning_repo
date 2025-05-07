import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';
import AdminHomeScreen from './AdminScreens/AdminHomeScreen';
import AdminViewAllUsersScreen from './AdminScreens/AdminViewAllUsersScreen';
import Strands from './AdminScreens/Strands';
import StudentHomeScreen from './StudentScreens/StudentHomeScreen';
import TeacherHomeScreen from './TeacherScreens/TeacherHomeScreen';
import AdminCreateStudentAccount from './AdminScreens/AdminCreateStudentAccount';
import AdminCreateTeacherAccount from './AdminScreens/AdminCreateTeacherAccount';
import ManageSubjects from './AdminScreens/ManageSubjects';
import ManageSemesters from './AdminScreens/ManageSemesters';
import ManageSections from './AdminScreens/ManageSections';
import TeacherViewStudents from './TeacherScreens/TeacherViewStudents';
import TeacherEncodeGrade from './TeacherScreens/TeacherEncodeGrade';
import TeacherGenerateForm from './TeacherScreens/TeacherGenerateForm';
import StudentProfile from './StudentScreens/StudentProfile';
import StudentViewGrades from './StudentScreens/StudentViewGrades';
import StudentMessages from './StudentScreens/StudentMessages';
import AdminMessages from './AdminScreens/AdminMessages';
import TeacherAttendance from './TeacherScreens/TeacherAttendance';
import AdminPendingStudents from './AdminScreens/AdminPendingStudents';
import PrivateRoute from './components/PrivateRoute';
import UnauthorizedPage from './components/UnauthorizedPage';
import NotFoundPage from './components/NotFoundPage';
import RedirectIfAuthenticated from './components/RedirectIfAuthenticated';
const App = () => {
  return (
    <Router>
    <Routes>
      {/* Public Route */}

      <Route 
          path='/' 
          element={
            <RedirectIfAuthenticated>
              <LoginScreen />
            </RedirectIfAuthenticated>
          } 
        />

      <Route path='/unauthorized' element={<UnauthorizedPage />} />
      {/* Admin Routes */}
      <Route path='/admin/*' element={
        <PrivateRoute allowedRoles={['admin']}>
          <Routes>
            <Route path='home' element={<AdminHomeScreen />} />
            <Route path='strands' element={<Strands />} />
            <Route path='viewallusers' element={<AdminViewAllUsersScreen />} />
            <Route path='createstudent' element={<AdminCreateStudentAccount />} />
            <Route path='createteacher' element={<AdminCreateTeacherAccount />} />
            <Route path='messages' element={<AdminMessages />} />
            <Route path='pendingstudents' element={<AdminPendingStudents />} />
            <Route path='subjects' element={<ManageSubjects />} />
            <Route path='semesters' element={<ManageSemesters />} />
            <Route path='sections' element={<ManageSections />} />
          </Routes>
        </PrivateRoute>
      }/>

      {/* Teacher Routes */}
      <Route path='/teacher/*' element={
        <PrivateRoute allowedRoles={['teacher']}>
          <Routes>
            <Route path='home' element={<TeacherHomeScreen />} />
            <Route path='viewstudents' element={<TeacherViewStudents />} />
            <Route path='encodegrades' element={<TeacherEncodeGrade />} />
            <Route path='generateform' element={<TeacherGenerateForm />} />
            <Route path='attendance' element={<TeacherAttendance />} />
          </Routes>
        </PrivateRoute>
      }/>

      {/* Student Routes */}
      <Route path='/student/*' element={
        <PrivateRoute allowedRoles={['student']}>
          <Routes>
            <Route path='home' element={<StudentHomeScreen />} />
            <Route path='profile' element={<StudentProfile />} />
            <Route path='grades' element={<StudentViewGrades />} />
            <Route path='messages' element={<StudentMessages />} />
          </Routes>
        </PrivateRoute>
      }/>

      {/* Catch all - replace with 404 component */}
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  </Router>
  );
};

export default App;
