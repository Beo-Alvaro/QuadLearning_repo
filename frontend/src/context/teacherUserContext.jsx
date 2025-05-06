import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import apiConfig from '../config/apiConfig';
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
            console.log('API Base URL:', apiConfig.getBaseUrl());
            
            const baseUrl = apiConfig.getBaseUrl();
            const sectionsResponse = await fetch(`${baseUrl}/teacher/sections`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Sections response status:', sectionsResponse.status);

            if (!sectionsResponse.ok) {
                const errorText = await sectionsResponse.text();
                console.error('API Error Response:', errorText);
                
                if (sectionsResponse.status === 401) {
                    throw new Error('Your session has expired. Please log in again.');
                }
                throw new Error(`Failed to fetch sections (Status: ${sectionsResponse.status}): ${errorText}`);
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
            toast.error(error.message || 'Failed to load sections. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array

    // Handle selecting a student
    const handleSelectStudent = async (studentId) => {
        try {
            setSelectedStudent(null); // Reset previous selection
            const token = localStorage.getItem('token');
            const baseUrl = apiConfig.getBaseUrl();
            
            console.log('Fetching student details for ID:', studentId);
            
            // Show loading toast
            const loadingToastId = toast.loading("Loading student data...");
            
            // Fetch the student details
            const studentResponse = await fetch(`${baseUrl}/teacher/student/${studentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Student response status:', studentResponse.status);
            
            if (!studentResponse.ok) {
                const errorText = await studentResponse.text();
                console.error('Student API Error Response:', errorText);
                toast.update(loadingToastId, {
                    render: `Failed to fetch student details: ${errorText}`,
                    type: "error",
                    isLoading: false,
                    autoClose: 3000
                });
                throw new Error(`Failed to fetch student details: ${errorText}`);
            }

            const studentData = await studentResponse.json();
            console.log('Fetched student data:', studentData);
            
            // Fetch grades with populated semester information
            const gradesResponse = await fetch(`${baseUrl}/teacher/student-grades/${studentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
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
                
                // Convert to array
                grades = Object.values(gradeBySemester);
            }
            
            // Get section data for display
            let sectionInfo = null;
            if (studentData.section) {
                const sectionId = studentData.section;
                const matchingSection = sections.find(s => s._id === sectionId);
                if (matchingSection) {
                    sectionInfo = {
                        name: matchingSection.name,
                        yearLevel: matchingSection.yearLevel?.name,
                        strand: matchingSection.strand?.name
                    };
                }
            }
            
            // Format the student data for display
            const formattedStudentData = {
                ...studentData,
                section: sectionInfo?.name || 'Not Assigned',
                yearLevel: sectionInfo?.yearLevel || 'Not Assigned',
                strand: sectionInfo?.strand || 'Not Assigned',
                grades
            };
            
            setSelectedStudent(formattedStudentData);
            
            toast.update(loadingToastId, {
                render: "Student data loaded successfully!",
                type: "success",
                isLoading: false,
                autoClose: 1500
            });
            
        } catch (error) {
            console.error('Error fetching student details:', error);
            toast.error(error.message || 'Failed to load student details');
        }
    };

  // Handle Form 137 Generation
  const handleGenerateForm = async (studentId) => {
    try {
        if (!studentId) throw new Error('Invalid Student ID');
        
        // Show loading toast
        const loadingToastId = toast.loading("Generating Form 137...");
        
        const token = localStorage.getItem('token');
        const baseUrl = apiConfig.getBaseUrl();
        
        // Fetch the student's basic information
        const studentResponse = await fetch(`${baseUrl}/teacher/student/${studentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!studentResponse.ok) {
            const errorText = await studentResponse.text();
            toast.update(loadingToastId, {
                render: `Error: Failed to fetch student data - ${errorText}`,
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
            return;
        }

        const studentData = await studentResponse.json();
        
        // Check if we have sufficient student data
        if (!studentData.firstName || !studentData.lastName) {
            toast.update(loadingToastId, {
                render: "Student profile incomplete. Please complete the student information first.",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
            return;
        }

        // Fetch grades with populated semester information
        const gradesResponse = await fetch(`${baseUrl}/teacher/student-grades/${studentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
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
            
            // Convert to array
            grades = Object.values(gradeBySemester);
        }
        
        // Set the complete student data including grades
        setSelectedStudent({
            ...studentData,
            grades
        });
        
        toast.update(loadingToastId, {
            render: "Student data loaded successfully!",
            type: "success",
            isLoading: false,
            autoClose: 1500
        });
    } catch (error) {
        console.error('Error loading student data:', error);
        toast.error(error.message || 'Error loading student data');
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
