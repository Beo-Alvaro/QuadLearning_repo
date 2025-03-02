import React, { createContext, useContext, useState, useCallback } from 'react';

export const TeacherUserContext = createContext();

export const TeacherUserContextProvider = ({ children }) => {
    const [sections, setSections] = useState([]);
    const [teacherAdvisoryClassId, setTeacherAdvisoryClassId] = useState(null);
    const [strands, setStrands] = useState([]);
    const [yearLevels, setYearLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Use useCallback to memoize the fetchData function
    const fetchData = useCallback(async () => {
        // Use a local variable to track if we're already fetching
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo.token || localStorage.getItem('token');
        
        try {
            setLoading(true);
            setError(null);
            
            if (!token) {
                throw new Error('No authentication token found. Please log in again.');
            }

            console.log('Fetching sections with token:', token.substring(0, 10) + '...');
            
            const sectionsResponse = await fetch('/api/teacher/sections', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Sections response status:', sectionsResponse.status);

            if (!sectionsResponse.ok) {
                if (sectionsResponse.status === 401) {
                    throw new Error('Your session has expired. Please log in again.');
                }
                throw new Error(`Failed to fetch sections (Status: ${sectionsResponse.status})`);
            }

            const sectionsData = await sectionsResponse.json();
            console.log('Fetched sections:', sectionsData);

            // Check if we got valid data
            if (!Array.isArray(sectionsData)) {
                console.error('Unexpected response format:', sectionsData);
                throw new Error('Received invalid data format from server');
            }

            const advisorySection = sectionsData.find(section => section.isAdvisory);
            if (advisorySection) {
                setTeacherAdvisoryClassId(advisorySection._id);
            }

            setSections(sectionsData);

            // Extract unique strands and year levels
            const uniqueStrands = [...new Set(sectionsData
                .filter(section => section.strand && section.strand.name)
                .map(section => section.strand.name))];
                
            const uniqueYearLevels = [...new Set(sectionsData
                .filter(section => section.yearLevel && section.yearLevel.name)
                .map(section => section.yearLevel.name))];

            setStrands(uniqueStrands);
            setYearLevels(uniqueYearLevels);
        } catch (error) {
            console.error('Error fetching teacher data:', error);
            setError(error.message || 'Failed to load sections. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array

    // Handle Form 137 Generation
    const handleGenerateForm = async (studentId) => {
        try {
            if (!studentId) throw new Error('Invalid Student ID');

            const response = await fetch(`/api/teacher/generate-form137/${studentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to generate Form 137');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `form137-${studentId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Detailed Error generating Form 137:', error);
            setError(`Failed to generate Form 137: ${error.message}`);
        }
    };

    // Handle Selecting a Student and Fetching Details
    const handleSelectStudent = async (studentId) => {
        try {
            if (!studentId) throw new Error('Invalid Student ID');

            // First fetch the student details
            const response = await fetch(`/api/teacher/student/${studentId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch student details');
            }

            const data = await response.json();
            console.log('Student data from API:', data);

            // Now fetch the student's grades separately
            const gradesResponse = await fetch(`/api/teacher/student-grades/${studentId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            let gradesData = [];
            if (gradesResponse.ok) {
                gradesData = await gradesResponse.json();
                console.log('Grades data from API:', gradesData);
            } else {
                console.warn('Failed to fetch grades, but continuing with student data');
            }

            // Create the student object with personal info and academic details
            const studentWithGrades = {
                _id: data._id,
                username: data.username,
                firstName: data.firstName,
                lastName: data.lastName,
                middleInitial: data.middleInitial,
                section: data.section?.name || 'No Section',
                yearLevel: data.yearLevel?.name || 'Not Set',
                strand: data.strand?.name || 'Not Set',
                gender: data.gender || 'Not Set',
                birthdate: data.birthdate ? new Date(data.birthdate).toLocaleDateString() : 'Not Set',
                address: data.address || 'Not Set',
                guardian: data.guardian?.name || 'Not Set',
                school: data.school?.name || 'Not Set',
                // Add the separately fetched grades
                grades: gradesData.map(grade => ({
                    semester: grade.semester || 'No Semester',
                    semesterId: grade.semesterId || null,
                    subjects: grade.subjects.map(subject => ({
                        subjectId: subject.subjectId || null,
                        subjectName: subject.subjectName || 'No Subject',
                        midterm: subject.midterm || 'N/A',
                        finals: subject.finals || 'N/A',
                        finalRating: subject.finalRating || 'N/A',
                        action: subject.action || 'N/A',
                    })),
                })),
            };

            console.log('Setting selected student with grades:', studentWithGrades);
            setSelectedStudent(studentWithGrades);
        } catch (error) {
            console.error('Error fetching student details:', error);
            setError(`Failed to fetch student details: ${error.message}`);
        }
    };

    return (
        <TeacherUserContext.Provider
            value={{
                sections,
                teacherAdvisoryClassId,
                strands,
                yearLevels,
                loading,
                error,
                handleGenerateForm,
                handleSelectStudent,
                selectedStudent,
                fetchData,
                setSelectedStudent
            }}
        >
            {children}
        </TeacherUserContext.Provider>
    );
};

export const useTeacherUserContext = () => useContext(TeacherUserContext);
