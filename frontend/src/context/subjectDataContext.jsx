import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { apiRequest } from '../utils/api';

export const SubjectDataContext = createContext();

export const SubjectDataProvider = ({ children }) => {
    const [studSubjects, setStudSubjects] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [strands, setStrands] = useState([]);
    const [yearLevels, setYearLevels] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Form data state
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [selectedStrand, setSelectedStrand] = useState('');
    const [selectedYearLevel, setSelectedYearLevel] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');

    // Fetch all data
    const fetchAllData = async () => {
        const token = localStorage.getItem('token');
        const headers = {
            Authorization: `Bearer ${token}`,
        };
    
        try {
            const [subjectsData, semestersData, strandsData, yearLevelsData] = await Promise.all([
                apiRequest('/api/admin/getSubjects', { headers }),
                apiRequest('/api/admin/semesters', { headers }),
                apiRequest('/api/admin/getStrands', { headers }),
                apiRequest('/api/admin/yearLevels', { headers })
            ]);
    
            setStudSubjects(subjectsData);
            setSemesters(semestersData);
            setStrands(strandsData);
            setYearLevels(yearLevelsData);
        } catch (error) {
            console.error('Error fetching data:', error.message);
            setError('An error occurred while fetching data');
        }
    };

    // Handle creating a subject
    const handleCreateSubject = async (subjectData) => {
        const token = localStorage.getItem('token');
        setLoading(true);
        setError('');
    
        try {
            await apiRequest('/api/admin/addSubjects', {
                method: 'POST',
                body: JSON.stringify(subjectData),
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            fetchAllData();
            console.log('Subject created successfully');
            toast.success('Subject created successfully!')
        } catch (error) {
            setError(error.message || 'An error occurred while creating the subject');
            console.error('Error:', error);
            toast.error(error.message || 'Failed to create subject');
        } finally {
            setLoading(false);
        }
    };

    // Handle updating a subject
    const handleUpdateSubject = async (selectedSubjectId, updatedSubject) => {
        const token = localStorage.getItem('token');
        
        try {
          const result = await apiRequest(`/api/admin/subjects/${selectedSubjectId}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedSubject),
          });
          
          setStudSubjects((prevSubjects) =>
            prevSubjects.map((subject) =>
              subject._id === selectedSubjectId ? result : subject
            )
          );
          toast.success('Subject updated successfully!')
        } catch (error) {
          console.error('Failed to update subject:', error);
          toast.error(error.message || 'An error occurred while updating the subject');
        }
        fetchAllData();
      };
      
      

    // Handle deleting a subject
    const handleDeleteSubject = async (subjectId) => {
        const token = localStorage.getItem('token');
        try {
            await apiRequest(`/api/admin/subjects/${subjectId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
    
            setStudSubjects(prevSubjects => prevSubjects.filter(subject => subject._id !== subjectId));
        } catch (error) {
            setError(error.message || 'Failed to delete subject');
        }
        fetchAllData();
    };

    const filteredSemesters = semesters.filter(semester => {
        return (
          semester.status === 'active' && // Add this condition
          (selectedStrand ? semester.strand._id === selectedStrand : true) &&
          (selectedYearLevel ? semester.yearLevel._id === selectedYearLevel : true)
        );
    });
      

    return (
        <SubjectDataContext.Provider
            value={{
                setStudSubjects,
                studSubjects,
                semesters,
                strands,
                yearLevels,
                error,
                loading,
                handleCreateSubject,
                handleUpdateSubject,
                handleDeleteSubject,
                fetchAllData,
                selectedSemester,
                setSelectedSemester,
                name,
                setName,
                code,
                setCode,
                filteredSemesters,
                selectedStrand,
                setSelectedStrand,
                selectedYearLevel,
                setSelectedYearLevel
            }}
        >
            {children}
        </SubjectDataContext.Provider>
    );
};
