import { createContext, useState } from 'react';
import { toast } from 'react-toastify';
import { apiRequest } from '../utils/api';

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
                Authorization: `Bearer ${token}`,
            };

            const [semestersData, strandsData, yearLevelsData] = await Promise.all([
                apiRequest('/api/admin/semesters', { headers }),
                apiRequest('/api/admin/getStrands', { headers }),
                apiRequest('/api/admin/yearLevels', { headers })
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
            await apiRequest(`/api/admin/semesters/${semesterId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSemesters(prevSemesters => prevSemesters.filter(semester => semester._id !== semesterId));
        } catch (error) {
            console.error('Error deleting semester:', error.message);
        }
    };

    const handleSaveChanges = async (updatedSemester, selectedSemesterId) => {
        const token = localStorage.getItem('token');
        
        try {
            const data = await apiRequest(`/api/admin/semesters/${selectedSemesterId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedSemester),
            });
    
            // Update the local state only if the API call was successful
            setSemesters((prevSemesters) =>
                prevSemesters.map((semester) =>
                    semester._id === selectedSemesterId ? data : semester
                )
            );
    
            return {
                success: true,
                data: data
            };
    
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to update semester'
            };
        }
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
            await apiRequest('/api/admin/addSemesters', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(semesterData),
            });

            fetchData();
            toast.success('Semester created successfully!');
        } catch (error) {
            setError(error.message || 'An error occurred while creating the semester');
            toast.error(error.message || 'Failed to create semester');
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
