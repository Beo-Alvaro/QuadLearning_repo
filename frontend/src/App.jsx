import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
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
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomeScreen />} />
        <Route path='/login' element={<LoginScreen />} />
        <Route path='/admin' element={<AdminHomeScreen />} />
        <Route path='/admin/Strands' element={<Strands />} />
        <Route path='/login/AdminScreens/AdminHomeScreen' element={<AdminHomeScreen />} />
        <Route path='/admin/AdminViewAllUsersScreen' element={<AdminViewAllUsersScreen />} />
        <Route path='/login/StudentScreens/StudentHomeScreen' element={<StudentHomeScreen />} />
        <Route path='/login/TeacherScreens/TeacherHomeScreen' element={<TeacherHomeScreen />} />
        <Route path='/admin/AdminCreateStudentAccount/' element={<AdminCreateStudentAccount />} />
        <Route path='/admin/AdminCreateTeacherAccount' element={<AdminCreateTeacherAccount />} />
        <Route path='/admin/AdminMessages' element={<AdminMessages />} />
        <Route path='/admin/AdminPendingStudents' element={<AdminPendingStudents />} />
        <Route path='/admin/ManageSubjects' element={<ManageSubjects />} />
        <Route path='/admin/ManageSemesters' element={<ManageSemesters />} />
        <Route path='/admin/ManageSections' element={<ManageSections />} />
        <Route path='/login/TeacherScreens/TeacherViewStudents' element={<TeacherViewStudents />} />
        <Route path='/login/TeacherScreens/TeacherEncodeGrade' element={<TeacherEncodeGrade />} />
        <Route path='/login/TeacherScreens/TeacherGenerateForm' element={<TeacherGenerateForm />} />
        <Route path='/login/TeacherScreens/TeacherAttendance' element={<TeacherAttendance />} />
        <Route path='/login/StudentScreens/StudentProfile' element={<StudentProfile />} />
        <Route path='/login/StudentScreens/StudentViewGrades' element={<StudentViewGrades />} />
        <Route path='/login/StudentScreens/StudentMessages' element={<StudentMessages />} />
      </Routes>
    </Router>
  );
};

export default App;
