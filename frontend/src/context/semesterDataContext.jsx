import { createContext, useState } from 'react';
import apiConfig from '../config/apiConfig';

export const SemesterDataContext = createContext();

export const SemesterDataProvider = ({ children }) => {
    const [semesters, setSemesters] = useState([]);
    const [strands, setStrands] = useState([]);
    const [yearLevels, setYearLevels] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            };
            const baseUrl = apiConfig.getBaseUrl();

            const [semestersRes, strandsRes, yearLevelsRes] = await Promise.all([
                fetch(`${baseUrl}/admin/semesters`, { headers }),
                fetch(`${baseUrl}/admin/getStrands`, { headers }),
                fetch(`${baseUrl}/admin/yearLevels`, { headers })
            ]);

            const checkResponse = async (res) => {
                if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
                return res.json();
            };

            const [semestersData, strandsData, yearLevelsData] = await Promise.all([
                checkResponse(semestersRes),
                checkResponse(strandsRes),
                checkResponse(yearLevelsRes)
            ]);

            const sanitizeData = (data) => Array.isArray(data) ? data.filter(item => item?._id) : [];

            setSemesters(sanitizeData(semestersData));
            setStrands(sanitizeData(strandsData));
            setYearLevels(sanitizeData(yearLevelsData));

        } catch (error) {
            console.error('Data Fetch Error:', error);
            setError(`Failed to load data: ${error.message}`);
        }
    };

    const deleteHandler = async (semesterId) => {
        const token = localStorage.getItem('token');
        try {
            const baseUrl = apiConfig.getBaseUrl();
            const response = await fetch(`${baseUrl}/admin/semesters/${semesterId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setSemesters(prevSemesters => prevSemesters.filter(semester => semester._id !== semesterId));
            } else {
                const error = await response.json();
                console.error('Error deleting semester:', error.message);
            }
        } catch (error) {
            console.error('Error deleting semester:', error.message);
        }
    };

    const handleSaveChanges = async (updatedSemester, selectedSemesterId) => {
        const token = localStorage.getItem('token');
      
        // Ensure the ID is a string
        const id = typeof selectedSemesterId === 'object' ? selectedSemesterId._id : selectedSemesterId;
        
        if (!id) {
          console.error('Invalid Semester ID:', selectedSemesterId);
          return;
        }
      
        try {
          const baseUrl = apiConfig.getBaseUrl();
          const response = await fetch(`${baseUrl}/admin/semesters/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedSemester),
          });
      
          let result;
          try {
            result = await response.json();
          } catch (err) {
            console.error('Failed to parse response:', err);
            result = { message: 'Invalid JSON response.' };
          }
      
          if (response.ok) {
            setSemesters((prevSemesters) =>
              prevSemesters.map((semester) =>
                semester._id === id ? result : semester
              )
            );
          } else {
            console.error('Error updating semester:', result.message || response.statusText);
          }
        } catch (error) {
          console.error('Failed to update semester:', error);
        }
      
        fetchData();
      };
      
      

    const handleSubmit = async (semesterData) => {
        const token = localStorage.getItem('token');
        setLoading(true);
        setError('');

        if (!semesterData.name || !semesterData.strand || !semesterData.yearLevel || !semesterData.startDate || !semesterData.endDate) {
            setError('All fields are required');
            setLoading(false);
            return;
        }

        try {
            const baseUrl = apiConfig.getBaseUrl();
            const response = await fetch(`${baseUrl}/admin/addSemesters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(semesterData),
            });

            const json = await response.json();

            if (!response.ok) {
                setError(json.message || 'Failed to create semester');
            } else {
                fetchData();
            }
        } catch (error) {
            setError('An error occurred while creating the semester');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SemesterDataContext.Provider
        value={{
            semesters,
            strands,
            yearLevels,
            error,
            loading,
            fetchData,
            deleteSemester: deleteHandler,
            updateSemester: handleSaveChanges,
            addSemester: handleSubmit, 
            setSemesters,
            setError,
        }}
        >
            {children}
        </SemesterDataContext.Provider>
    );
};
