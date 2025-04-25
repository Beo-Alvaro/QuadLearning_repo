import React, { createContext, useReducer } from 'react';

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
      const [usersRes, sectionsRes, subjectsRes, semestersRes, advisorySectionsRes] = await Promise.all([
        fetch('/api/admin/users?role=teacher', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/getSections', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/getSubjects', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/semesters', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/advisorySections', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const payload = {
        teacherUsers: await usersRes.json(),
        sections: await sectionsRes.json(),
        subjects: await subjectsRes.json(),
        semesters: await semestersRes.json(),
        advisorySections: await advisorySectionsRes.json(),
      };

      dispatch({ type: 'SET_DATA', payload });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: 'Failed to load data' });
    }
  };

  return (
    <TeacherDataContext.Provider value={{ ...state, dispatch, fetchData }}>
      {children}
    </TeacherDataContext.Provider>
  );
};
