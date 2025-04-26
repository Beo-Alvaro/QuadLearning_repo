import React, { createContext, useContext, useState, useEffect } from 'react';
import apiConfig from "../config/apiConfig";

export const StudentDataContext = createContext();

export const StudentDataProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [strands, setStrands] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sanitizeData = (data) => data || [];

  const fetchData = async () => {
    try {
      setLoading(true);
      const baseUrl = apiConfig.getBaseUrl();
      const token = localStorage.getItem('token');
      
      // Define headers with authorization
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };
      
      // Fetch users data
      const usersResponse = await fetch(`${baseUrl}/admin/users`, {
        headers
      });
      if (!usersResponse.ok) {
        throw new Error(`HTTP error! Status: ${usersResponse.status}`);
      }
      const usersData = await usersResponse.json();

      // Fetch strands data
      const strandsResponse = await fetch(`${baseUrl}/strands`, {
        headers
      });
      if (!strandsResponse.ok) {
        throw new Error(`HTTP error! Status: ${strandsResponse.status}`);
      }
      const strandsData = await strandsResponse.json();

      // Fetch sections data
      const sectionsResponse = await fetch(`${baseUrl}/sections`, {
        headers
      });
      if (!sectionsResponse.ok) {
        throw new Error(`HTTP error! Status: ${sectionsResponse.status}`);
      }
      const sectionsData = await sectionsResponse.json();

      // Fetch subjects data
      const subjectsResponse = await fetch(`${baseUrl}/subjects`, {
        headers
      });
      if (!subjectsResponse.ok) {
        throw new Error(`HTTP error! Status: ${subjectsResponse.status}`);
      }
      const subjectsData = await subjectsResponse.json();

      // Fetch semesters data
      const semestersResponse = await fetch(`${baseUrl}/semesters`, {
        headers
      });
      if (!semestersResponse.ok) {
        throw new Error(`HTTP error! Status: ${semestersResponse.status}`);
      }
      const semestersData = await semestersResponse.json();

      // Fetch year levels data
      const yearLevelsResponse = await fetch(`${baseUrl}/year-levels`, {
        headers
      });
      if (!yearLevelsResponse.ok) {
        throw new Error(`HTTP error! Status: ${yearLevelsResponse.status}`);
      }
      const yearLevelsData = await yearLevelsResponse.json();

      // Filter and sanitize the data
      const data = [usersData, strandsData, sectionsData, subjectsData, semestersData, yearLevelsData];

      data.forEach((result, index) => {
        if (result !== null) {
          switch (index) {
            case 0:
              setUsers(sanitizeData(result));
              break;
            case 1:
              setStrands(sanitizeData(result));
              break;
            case 2:
              setSections(sanitizeData(result));
              break;
            case 3:
              setSubjects(sanitizeData(result));
              break;
            case 4:
              setSemesters(sanitizeData(result));
              break;
            case 5:
              setYearLevels(sanitizeData(result));
              break;
          }
        }
      });

    } catch (error) {
      console.error('Comprehensive Error fetching dropdown data:', error);
      setError('An unexpected error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentDataContext.Provider value={{ users, strands, sections, subjects, semesters, yearLevels, error, fetchData }}>
      {children}
    </StudentDataContext.Provider>
  );
};

