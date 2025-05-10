import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export const StudentDataContext = createContext();

export const StudentDataProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [strands, setStrands] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);
  const [error, setError] = useState(null);

  const sanitizeData = (data) => data || [];

  const fetchData = async () => {
    const token = localStorage.getItem('token');

    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const endpoints = [
        { url: '/api/admin/users?role=student', label: 'Users', setter: setUsers },
        { url: '/api/admin/getStrands', label: 'Strands', setter: setStrands },
        { url: '/api/admin/getSections', label: 'Sections', setter: setSections },
        { url: '/api/admin/getSubjects', label: 'Subjects', setter: setSubjects },
        { url: '/api/admin/semesters', label: 'Semesters', setter: setSemesters },
        { url: '/api/admin/yearLevels', label: 'Year Levels', setter: setYearLevels },
      ];

      const apiPromises = endpoints.map(({ url }) => 
        apiRequest(url, { headers })
      );

      const results = await Promise.all(apiPromises);

      // Update state with the results
      endpoints.forEach((endpoint, index) => {
        if (results[index] !== null) {
          endpoint.setter(sanitizeData(results[index]));
        }
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'An unexpected error occurred while fetching data');
    }
  };

  return (
    <StudentDataContext.Provider value={{ users, strands, sections, subjects, semesters, yearLevels, error, fetchData }}>
      {children}
    </StudentDataContext.Provider>
  );
};

