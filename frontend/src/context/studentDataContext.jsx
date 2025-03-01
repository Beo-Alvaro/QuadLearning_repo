import React, { createContext, useContext, useState, useEffect } from 'react';

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
      const endpoints = [
        { url: '/api/admin/users?role=student', label: 'Users', setter: setUsers },
        { url: '/api/admin/getStrands', label: 'Strands', setter: setStrands },
        { url: '/api/admin/getSections', label: 'Sections', setter: setSections },
        { url: '/api/admin/getSubjects', label: 'Subjects', setter: setSubjects },
        { url: '/api/admin/semesters', label: 'Semesters', setter: setSemesters },
        { url: '/api/admin/yearLevels', label: 'Year Levels', setter: setYearLevels },
      ];

      const fetchPromises = endpoints.map(({ url }) => 
        fetch(url, { method: 'GET', headers: { Authorization: `Bearer ${token}` } })
      );

      const responses = await Promise.all(fetchPromises);

      const handleResponse = async (res, label) => {
        if (!res.ok) {
          const errorDetails = await res.clone().text();
          console.error(`${label} Error:`, {
            status: res.status,
            statusText: res.statusText,
            errorDetails,
          });
          return null;
        }
        return await res.json();
      };

      const data = await Promise.all(responses.map((res, index) =>
        handleResponse(res, endpoints[index].label)
      ));

      data.forEach((result, index) => {
        if (result !== null) {
          endpoints[index].setter(sanitizeData(result));
        }
      });

    } catch (error) {
      console.error('Comprehensive Error fetching dropdown data:', error);
      setError('An unexpected error occurred while fetching data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  

  return (
    <StudentDataContext.Provider value={{ users, strands, sections, subjects, semesters, yearLevels, error, fetchData }}>
      {children}
    </StudentDataContext.Provider>
  );
};

