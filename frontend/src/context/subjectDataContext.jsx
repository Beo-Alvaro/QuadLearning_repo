import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import apiConfig from '../config/apiConfig';
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
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };
    
        try {
            const baseUrl = apiConfig.getBaseUrl();
            const [subjectsResponse, semestersResponse, strandsResponse, yearLevelsResponse] = await Promise.all([
                fetch(`${baseUrl}/admin/getSubjects`, { headers }),
                fetch(`${baseUrl}/admin/semesters`, { headers }),
                fetch(`${baseUrl}/admin/getStrands`, { headers }),
                fetch(`${baseUrl}/admin/yearLevels`, { headers })
            ]);
    
            const [subjectsData, semestersData, strandsData, yearLevelsData] = await Promise.all([
                subjectsResponse.json(),
                semestersResponse.json(),
                strandsResponse.json(),
                yearLevelsResponse.json()
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
            const baseUrl = apiConfig.getBaseUrl();
            const response = await fetch(`${baseUrl}/admin/addSubjects`, {
                method: 'POST',
                body: JSON.stringify(subjectData),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
    
            const json = await response.json();
    
            if (!response.ok) {
                toast.error(json.message || 'Failed to create subject');
            } else {
                fetchAllData();
                console.log('Subject created successfully');
                toast.success('Subject created successfully!')
            }
        } catch (error) {
            setError('An error occurred while creating the subject');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle updating a subject
    const handleUpdateSubject = async (selectedSubjectId, updatedSubject) => {
        const token = localStorage.getItem('token');
        
        try {
          const baseUrl = apiConfig.getBaseUrl();
          const response = await fetch(`${baseUrl}/admin/subjects/${selectedSubjectId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedSubject),
          });
          
          const result = await response.json();
          
          if (response.ok) {
            setStudSubjects((prevSubjects) =>
              prevSubjects.map((subject) =>
                subject._id === selectedSubjectId ? result : subject
              )
            );
            toast.success('Subject updated successfully!')
          } else {
            console.error('Error updating subject:', result);
            toast.error(result.message || 'Failed to update subject');
          }
        } catch (error) {
          console.error('Failed to update subject:', error);
          toast.error('An error occurred while updating the subject');
        }
        fetchAllData();
      };
      
      

    // Handle deleting a subject
    const handleDeleteSubject = async (subjectId) => {
        const token = localStorage.getItem('token');
        try {
            const baseUrl = apiConfig.getBaseUrl();
            const response = await fetch(`${baseUrl}/admin/subjects/${subjectId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
            });
    
            if (response.ok) {
                setStudSubjects(prevSubjects => prevSubjects.filter(subject => subject._id !== subjectId));
            } else {
                const json = await response.json();
                setError(json.message);
            }
        } catch (error) {
            setError('Failed to delete subject');
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
