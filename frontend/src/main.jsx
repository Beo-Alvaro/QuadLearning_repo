import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { TeacherDataContextProvider } from './context/teacherDataContext.jsx';
import { UserContextProvider } from './context/userDataContext.jsx'
import { StudentDataProvider } from './context/studentDataContext.jsx'
import { StrandDataProvider } from './context/strandDataContext.jsx'
import { SemesterDataProvider } from './context/semesterDataContext.jsx'
import { SectionDataProvider } from './context/sectionDataContext.jsx'
import { SubjectDataProvider } from './context/subjectDataContext.jsx'
import { TeacherUserContextProvider } from './context/teacherUserContext.jsx'
import { GradeDataContextProvider } from './context/gradeDataContext.jsx'
import { AuthProvider } from './context/authContext.jsx';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
    <UserContextProvider>
      <TeacherDataContextProvider>
        <TeacherUserContextProvider>
          <GradeDataContextProvider>
           <SectionDataProvider>
            <StrandDataProvider>
             <SemesterDataProvider>
               <SubjectDataProvider>
                <StudentDataProvider>
                 <App />
                </StudentDataProvider>
               </SubjectDataProvider>
              </SemesterDataProvider>
             </StrandDataProvider>
            </SectionDataProvider>
          </GradeDataContextProvider>
        </TeacherUserContextProvider>
      </TeacherDataContextProvider>
    </UserContextProvider>
    </AuthProvider>
  </React.StrictMode>
);
