import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
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
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });
         // Get filename from headers
         const filename = response.headers.get("X-Filename") || `Form137_${studentId}.xlsx`;
         // Convert response to a Blob
         const blob = await response.blob();

        // Save the file
        saveAs(blob, filename);
        toast.success('Form generated successfully!')
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to generate Form 137');
        }

        console.log(`✅ Form 137 downloaded successfully as ${filename}`);
    } catch (error) {
        console.error("❌ Error downloading Form 137:", error);

        setError(`Failed to generate Form 137: ${error.message}`);
    }
};

const handleSelectStudent = async (studentId) => {
    try {
        if (!studentId) throw new Error('Invalid Student ID');

        // Fetch student details
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

        // Fetch grades with populated semester information
        const gradesResponse = await fetch(`/api/teacher/student-grades/${studentId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });

        let grades = [];
        if (gradesResponse.ok) {
            const gradesData = await gradesResponse.json();
            console.log('Received grades data:', gradesData);
            
            // Group grades by year level and semester
            const gradeBySemester = {};
            
            gradesData.forEach(grade => {
                if (grade.semester && grade.semester._id) {
                    const key = `${grade.yearLevel}-${grade.semester._id}`;
                    if (!gradeBySemester[key]) {
                        gradeBySemester[key] = {
                            semesterInfo: grade.semester,
                            yearLevel: grade.yearLevel,
                            subjects: []
                        };
                    }
                    gradeBySemester[key].subjects.push(...grade.subjects.map(subject => ({
                        subject: subject.subject,
                        subjectName: subject.subject?.name,
                        midterm: subject.midterm,
                        finals: subject.finals,
                        finalRating: subject.finalRating,
                        action: subject.action
                    })));
                }
            });
        
            // Convert to array and sort by year level and semester name
            grades = Object.values(gradeBySemester).sort((a, b) => {
                // First sort by year level
                const yearLevelA = a.yearLevel || '';
                const yearLevelB = b.yearLevel || '';
                if (yearLevelA !== yearLevelB) {
                    return yearLevelA.localeCompare(yearLevelB);
                }
                // Then sort by semester name
                return (a.semesterInfo?.name || '').localeCompare(b.semesterInfo?.name || '');
            });
        
            console.log('Processed grades:', grades);
        }

        // Create the combined student object
        const studentWithGrades = {
            _id: data.data._id,
            username: data.data.username,
            firstName: data.data.firstName,
            lastName: data.data.lastName,
            middleName: data.data.middleName,
            section: data.data.section,
            yearLevel: data.data.yearLevel,
            strand: data.data.strand,
            gender: data.data.gender || 'Not Set',
            birthdate: data.data.birthdate ? new Date(data.data.birthdate).toLocaleDateString() : 'Not Set',
            address: data.data.address || 'Not Set',
            guardian: data.data.guardian?.name || 'Not Set',
            school: data.data.school?.name || 'Not Set',
            grades: grades
        };

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
