import React, { createContext, useContext, useState } from 'react';

export const TeacherUserContext = createContext();

export const TeacherUserContextProvider = ({ children }) => {
    const [sections, setSections] = useState([]);
    const [teacherAdvisoryClassId, setTeacherAdvisoryClassId] = useState(null);
    const [strands, setStrands] = useState([]);
    const [yearLevels, setYearLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Fetch Data for Sections, Advisory Class, Strands, and Year Levels
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const sectionsResponse = await fetch('/api/teacher/sections', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!sectionsResponse.ok) throw new Error('Failed to fetch sections');

            const sectionsData = await sectionsResponse.json();

            const advisorySection = sectionsData.find(section => section.advisoryClass);
            if (advisorySection?.advisoryClass) {
                setTeacherAdvisoryClassId(advisorySection.advisoryClass.trim());
            }

            setSections(sectionsData);

            const uniqueStrands = [...new Set(sectionsData.map(section => section.strand?.name))].filter(Boolean);
            const uniqueYearLevels = [...new Set(sectionsData.map(section => section.yearLevel?.name))].filter(Boolean);

            setStrands(uniqueStrands);
            setYearLevels(uniqueYearLevels);
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

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
