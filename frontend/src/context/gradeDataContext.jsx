import React, { createContext, useState, useMemo } from 'react';
// Create Context
export const GradeDataContext = createContext();

export const GradeDataContextProvider = ({ children }) => {
    const [selectedSubject, setSelectedSubject] = useState('');
    const [currentSemester, setCurrentSemester] = useState('');
    const [studentGrades, setStudentGrades] = useState({});
    const [editedGrades, setEditedGrades] = useState({});
    const [subjectStudents, setSubjectStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [sections, setSections] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    // Filter states
    const [strands, setStrands] = useState([]);
    const [yearLevels, setYearLevels] = useState([]);
    const [availableSections, setAvailableSections] = useState([]);
    const [showAdvisoryOnly, setShowAdvisoryOnly] = useState(false);
    // Selected filter states
    const [selectedStrand, setSelectedStrand] = useState('');
    const [selectedYearLevel, setSelectedYearLevel] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    // State to store the teacher's advisory class ID
    const [teacherAdvisoryClassId, setTeacherAdvisoryClassId] = useState(null);
    const [semesters, setSemesters] = useState([]);
    const [isBulkSaving, setIsBulkSaving] = useState(false);
    const filteredStudents = useMemo(() => {
      if (!selectedSubject || !currentSemester) {
          return [];
      }
  
      // Map student data for display
      let filteredList = subjectStudents.map(student => ({
          _id: student._id,
          username: student.username,
          sectionName: student.sections?.length > 0 ? 
           student.sections.map(section => section.name).join(', ') : 
           'No Section',
          yearLevelName: student.yearLevel?.name || 'Not Set',
          strandName: student.strand?.name || 'Not Set',
          isAdvisory: student.isAdvisory
      }));
  
      // Apply filters
      if (showAdvisoryOnly) {
          filteredList = filteredList.filter(student => student.isAdvisory);
      } else {
          if (selectedStrand) {
              filteredList = filteredList.filter(student =>
                  student.strandName?.toLowerCase().trim() === selectedStrand.toLowerCase().trim()
              );
          }
  
          if (selectedYearLevel) {
              filteredList = filteredList.filter(student =>
                  student.yearLevelName?.toLowerCase().trim() === selectedYearLevel.toLowerCase().trim()
              );
          }
  
          if (selectedSection) {
              filteredList = filteredList.filter(student =>
                  student.sectionName?.toLowerCase().trim() === selectedSection.toLowerCase().trim()
              );
          }          
      }
      return filteredList;
  }, [
      subjectStudents,
      selectedSubject,
      currentSemester,
      showAdvisoryOnly,
      selectedStrand,
      selectedYearLevel,
      selectedSection
  ]);

  // Updated function to handle the new Grade model structure
  const fetchSubjectGrades = async (subjectId, semesterId) => {
    if (!subjectId || !semesterId) {
        setStudentGrades({});
        return;
    }

    try {
        setLoading(true);
        console.log(`Context: Fetching grades for subject: ${subjectId}, semester: ${semesterId}`);
        
        const response = await fetch(
            `/api/teacher/subject-grades/${subjectId}?semesterId=${semesterId}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch grades: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Context: Fetched grades data:', data);
        
        // Always update the state, even if empty
        setStudentGrades(data);
    } catch (error) {
        console.error('Context: Error fetching grades:', error);
        setError('Failed to fetch grades: ' + error.message);
        setStudentGrades({});
    } finally {
        setLoading(false);
    }
};
  
// Add a new function for bulk saving grades
const bulkSaveGrades = async (updates) => {
    if (isBulkSaving || !updates || updates.length === 0) return;
    
    try {
        setIsBulkSaving(true);
        setError(null);
        
        const response = await fetch('/api/teacher/bulk-add-grades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ updates })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save grades');
        }

        const result = await response.json();
        setSuccessMessage('All grades saved successfully!');
        
        // Refresh grades after bulk save
        await fetchSubjectGrades(selectedSubject, currentSemester);
        
        return result;
    } catch (error) {
        console.error('Error in bulk save:', error);
        setError(error.message || 'Failed to save grades');
        throw error;
    } finally {
        setIsBulkSaving(false);
    }
};

// Add a new function for saving a single student's grade
const saveStudentGrade = async (studentId, subjectId, semesterId, midterm, finals) => {
    try {
        setError(null);
        
        const response = await fetch('/api/teacher/add-grades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                studentId,
                subjectId,
                semesterId,
                midterm,
                finals
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save grade');
        }

        const result = await response.json();
        setSuccessMessage('Grade saved successfully!');
        
        // Refresh grades
        await fetchSubjectGrades(subjectId, semesterId);
        
        return result;
    } catch (error) {
        console.error('Error saving grade:', error);
        setError(error.message || 'Failed to save grade');
        throw error;
    }
};

      const fetchSubjectStudents = async () => {
          if (!selectedSubject || !currentSemester) {
              setSubjectStudents([]);
              return;
          }
  
          try {
              const response = await fetch(
                  `/api/teacher/subject-students?subjectId=${selectedSubject}&semesterId=${currentSemester}`,
                  {
                      headers: {
                          'Authorization': `Bearer ${localStorage.getItem('token')}`
                      }
                  }
              );
  
              if (!response.ok) {
                  throw new Error('Failed to fetch subject students');
              }
  
              const data = await response.json();
              setSubjectStudents(data);
          } catch (error) {
              console.error('Error:', error);
              setError('Failed to fetch subject students');
          }
      };
  
      const fetchSubjects = async () => {
          if (!currentSemester) return; // Don't fetch if no semester selected
  
          try {
              const response = await fetch(`/api/teacher/subjects?semesterId=${currentSemester}`, {
                  headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
              });
  
              if (!response.ok) {
                  throw new Error('Failed to fetch subjects');
              }
  
              const data = await response.json();
              setSubjects(data);
              setSelectedSubject(''); // Reset subject selection
          } catch (error) {
              console.error('Error:', error);
              setError('Failed to fetch subjects');
          }
      };

      const fetchSemesters = async () => {
          try {
              const token = localStorage.getItem('token');
              if (!token) {
                  throw new Error('No authentication token found');
              }
      
              const response = await fetch('/api/admin/semesters', {
                  method: 'GET',
                  headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                  }
              });
      
              // Log full response for debugging
              console.log('Semesters Response:', {
                  status: response.status,
                  headers: Object.fromEntries(response.headers.entries())
              });
      
              // Check response status
              if (!response.ok) {
                  // Try to parse error message from response
                  const errorBody = await response.text();
                  console.error('Error Response Body:', errorBody);
      
                  throw new Error(`Semester fetch failed: ${response.status} - ${errorBody}`);
              }
      
              // Parse JSON
              const data = await response.json();
      
              // Validate data
              if (!Array.isArray(data)) {
                  throw new Error('Invalid response format');
              }
      
              // Set semesters
              if (data.length > 0) {
                  setSemesters(data);
                  setCurrentSemester(data[0]._id);
              } else {
                  setError('No semesters found');
              }
          } catch (error) {
              console.error('Semester Fetch Error:', {
                  message: error.message,
                  stack: error.stack
              });
              setError(`Failed to fetch semesters: ${error.message}`);
              setLoading(false);
          }
      };
  
      const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');
            if (!currentSemester) return;
    
            const [sectionsResponse, subjectsResponse] = await Promise.all([
                fetch('/api/teacher/sections', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`/api/teacher/subjects?semesterId=${currentSemester}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            ]);
    
            const sectionsData = await sectionsResponse.json();
            const subjectsData = await subjectsResponse.json();
    
            if (!sectionsData || !Array.isArray(sectionsData)) {
                throw new Error('Invalid sections data received');
            }
    
            if (!subjectsData || !Array.isArray(subjectsData)) {
                throw new Error('Invalid subjects data received');
            }
    
            console.log('Fetched Sections:', sectionsData);
    
            const advisorySection = sectionsData.find(section => section.advisoryClass);
            setTeacherAdvisoryClassId(advisorySection?.advisoryClass || '');
    
            const uniqueStrands = [...new Set(sectionsData
                .filter(section => section.strand?.name)
                .map(section => section.strand.name))];
    
            const uniqueYearLevels = [...new Set(sectionsData
                .filter(section => section.yearLevel?.name)
                .map(section => section.yearLevel.name))];
    
            const uniqueSections = [...new Set(sectionsData.map(section => section.name))];
    
            setStrands(uniqueStrands);
            setYearLevels(uniqueYearLevels);
            setSections(sectionsData);
            setAvailableSections(uniqueSections); // Set available sections for the filter
            setSubjects(subjectsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    

      const value = {
        selectedSubject,
        setSelectedSubject,
        currentSemester,
        setCurrentSemester,
        studentGrades,
        setStudentGrades,
        subjectStudents,
        setSubjectStudents,
        subjects,
        setSubjects,
        sections,
        setSections,
        editedGrades,
        setEditedGrades,
        isEditing,
        setIsEditing,
        error,
        setError,
        successMessage,
        setSuccessMessage,
        setLoading,
        filteredStudents,
        strands,
        setStrands,
        yearLevels,
        setYearLevels,
        availableSections,
        setAvailableSections,
        showAdvisoryOnly,
        setShowAdvisoryOnly,
        selectedStrand,
        setSelectedStrand,
        selectedYearLevel,
        setSelectedYearLevel,
        selectedSection,
        setSelectedSection,
        teacherAdvisoryClassId,
        setTeacherAdvisoryClassId,
        semesters,
        setSemesters,
        fetchSubjectStudents,
        fetchSubjects,
        fetchData,
        fetchSemesters,
        loading,
        fetchSubjectGrades,
        bulkSaveGrades,
        saveStudentGrade,
        isBulkSaving
    };


    return (
        <GradeDataContext.Provider value={value}>
            {children}
        </GradeDataContext.Provider>
    );
};
