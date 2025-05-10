import React, { createContext, useReducer } from 'react';
import { apiRequest } from '../utils/api';

export const TeacherDataContext = createContext();

const initialState = {
  teacherUsers: [],
  sections: [],
  subjects: [],
  semesters: [],
  advisorySections: [],
  loading: false,
  error: null,
};

const dataReducer = (state, action) => {
  switch (action.type) {
    case 'SET_DATA': // Combined start and success into SET_DATA
      return { ...state, ...action.payload, loading: false, error: null };
    case 'SET_LOADING': // For setting loading state
      return { ...state, loading: true };
    case 'SET_ERROR': // For setting error state
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
};

export const TeacherDataContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  const fetchData = async () => {
    const token = localStorage.getItem('token');

    // Return early if no token is found (i.e., user is not logged in)
    if (!token) {
      dispatch({ type: 'SET_ERROR', error: 'No token found, unable to fetch data' });
      return;
    }

    dispatch({ type: 'SET_LOADING' });

    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [teacherUsers, sections, subjects, semesters, advisorySections] = await Promise.all([
        apiRequest('/api/admin/users?role=teacher', { headers }),
        apiRequest('/api/admin/getSections', { headers }),
        apiRequest('/api/admin/getSubjects', { headers }),
        apiRequest('/api/admin/semesters', { headers }),
        apiRequest('/api/admin/advisorySections', { headers })
      ]);

      const payload = {
        teacherUsers,
        sections,
        subjects,
        semesters,
        advisorySections,
      };

      dispatch({ type: 'SET_DATA', payload });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: error.message || 'Failed to load data' });
    }
  };

  return (
    <TeacherDataContext.Provider value={{ ...state, dispatch, fetchData }}>
      {children}
    </TeacherDataContext.Provider>
  );
};
