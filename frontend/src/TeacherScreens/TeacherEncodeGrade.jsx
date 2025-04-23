import { useState, useEffect } from 'react';
import TeacherDashboardNavbar from '../TeacherComponents/TeacherDashboardNavbar';
import { Table, Container, Alert, Card, Badge, Button } from 'react-bootstrap';
import './TeacherViewStudent.css';
import TeacherGradeHeader from '../TeacherComponents/TeacherGradeHeader';
import TeacherEncodeGradeFilter from '../TeacherComponents/TeacherEncodeFilter';
import { useGradeDataContext } from '../hooks/useGradeDataContext';
import { ToastContainer, toast } from 'react-toastify';
const TeacherEncodeGrade = () => {
    const [error, setError] = useState(null);
    const { selectedSubject, currentSemester, studentGrades, setStudentGrades,
        subjects, successMessage, setSuccessMessage, filteredStudents, setCurrentSemester,
        selectedStrand, selectedYearLevel, selectedSection,
        semesters, fetchSubjectStudents, fetchSubjects, fetchData, fetchSemesters, loading,
        yearLevels, availableSections, setEditedGrades, strands, setSelectedSubject, setSelectedStrand,
         setSelectedYearLevel, setSelectedSection } = useGradeDataContext();

    const [localGrades, setLocalGrades] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [editModeStudents, setEditModeStudents] = useState({}); // Track which students are in edit mode

    // Toggle edit mode for a specific student
    const toggleEditMode = (studentId) => {
        setEditModeStudents(prev => {
            const updated = { ...prev };
            updated[studentId] = !prev[studentId];
            
            // If turning off edit mode, clear any local changes for this student
            if (!updated[studentId] && localGrades[studentId]) {
                setLocalGrades(prevGrades => {
                    const updatedGrades = { ...prevGrades };
                    delete updatedGrades[studentId];
                    return updatedGrades;
                });
            }
            
            return updated;
        });
    };

// Update the handleGradeChange function
const handleGradeChange = (e, studentId, gradeType) => {
    const value = e.target.value !== '' ? parseFloat(e.target.value) : '';

    setLocalGrades(prevGrades => {
        const updatedGrades = { ...prevGrades };
        if (!updatedGrades[studentId]) updatedGrades[studentId] = {};
        
        updatedGrades[studentId][gradeType] = value;

        // Calculate final rating if both grades exist
        const midterm = updatedGrades[studentId].midterm ?? 
            (studentGrades[studentId]?.[selectedSubject]?.midterm ?? 0);
        const finals = updatedGrades[studentId].finals ?? 
            (studentGrades[studentId]?.[selectedSubject]?.finals ?? 0);

        if (midterm !== '' && finals !== '') {
            // Round to nearest whole number
            const finalRating = Math.round((midterm * 0.4 + finals * 0.6));
            updatedGrades[studentId].finalRating = finalRating.toString();
        }

        return updatedGrades;
    });
};

    // Save a single student's grade
    const addGrade = async (studentId) => {
        if (isSaving) return;
        setIsSaving(true);
    
        const student = filteredStudents.find(s => s._id === studentId);
        if (!student) {
            setIsSaving(false);
            console.error('Student not found');
            return;
        }
    
        try {
            const studentLocalGrades = localGrades[studentId] || {};
            const existingGrades = studentGrades[studentId]?.[selectedSubject] || {};
    
            const midterm = studentLocalGrades.midterm !== undefined ? 
                studentLocalGrades.midterm : existingGrades.midterm;
            const finals = studentLocalGrades.finals !== undefined ? 
                studentLocalGrades.finals : existingGrades.finals;
    
            if (midterm === undefined && finals === undefined) {
                setIsSaving(false);
                return;
            }
            console.log('Student data:', student);

            console.log('Sending data:', {
                studentId,
                subjectId: selectedSubject,
                semesterId: currentSemester,
                midterm,
                finals,
                section: student.sectionName,      // Updated this line
                yearLevel: student.yearLevelName   // And this one
            });
            
    
            const response = await fetch('/api/teacher/add-grades', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    studentId,
                    subjectId: selectedSubject,
                    semesterId: currentSemester,
                    midterm,
                    finals,
                    section: student.sectionName,      // Updated this line
                    yearLevel: student.yearLevelName   // And this one
                })
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save grade');
            }
    
            const result = await response.json();
            console.log('Grade save result:', result);
    
            const updatedGrades = { ...studentGrades };
            if (!updatedGrades[studentId]) {
                updatedGrades[studentId] = {};
            }
    
            updatedGrades[studentId][selectedSubject] = {
                midterm,
                finals,
                finalRating: result.data.finalRating,
                action: result.data.action
            };
            
    
            setStudentGrades(updatedGrades);
            setLocalGrades(prev => {
                const updated = { ...prev };
                delete updated[studentId];
                return updated;
            });
    
            setEditModeStudents(prev => {
                const updated = { ...prev };
                updated[studentId] = false;
                return updated;
            });
            toast.success('Grades saved successfully!')
        } catch (error) {
            console.error('Failed to add grade:', error);
            setError(error.message || 'Failed to add grade');
        } finally {
            setIsSaving(false);
        }
    };

    
    
    // Save all changed grades at once
    const saveAllGrades = async () => {
        if (isSaving || Object.keys(localGrades).length === 0) return;
        setIsSaving(true);
        
        try {
            // Prepare updates array
            const updates = Object.entries(localGrades).map(([studentId, grades]) => {
                const student = filteredStudents.find(s => s._id === studentId); // Get section and year level
                const existingGrades = studentGrades[studentId]?.[selectedSubject] || {};
            
                return {
                    studentId,
                    subjectId: selectedSubject,
                    semesterId: currentSemester,
                    midterm: grades.midterm !== undefined ? grades.midterm : existingGrades.midterm,
                    finals: grades.finals !== undefined ? grades.finals : existingGrades.finals,
                    section: student.sectionName,      // Updated this line
                    yearLevel: student.yearLevelName   // And this one
                };
            }).filter(update => update.midterm !== undefined || update.finals !== undefined);
            
            
            if (updates.length === 0) {
                setIsSaving(false);
                return;
            }

            const response = await fetch('/api/teacher/bulk-add-grades', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('token')}`
              },
                body: JSON.stringify({ updates })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save grades');
            }

            const result = await response.json();
            console.log('Bulk save result:', result);
            
            // Update the UI immediately with the saved data
            const updatedGrades = { ...studentGrades };
            
            // Process each update to update the UI
            updates.forEach(update => {
                const { studentId, subjectId, midterm, finals } = update;
                
                // Initialize student entry if it doesn't exist
                if (!updatedGrades[studentId]) {
                    updatedGrades[studentId] = {};
                }
                
                // Calculate final rating
                const midtermValue = midterm !== undefined ? parseFloat(midterm) : 0;
                const finalsValue = finals !== undefined ? parseFloat(finals) : 0;
                const finalRating = Math.round(midtermValue * 0.4 + finalsValue * 0.6);
                const action = parseFloat(finalRating) >= 75 ? 'PASSED' : 'FAILED';
                
                // Update the grades for this student and subject
                updatedGrades[studentId][subjectId] = {
                    midterm: midterm,
                    finals: finals,
                    finalRating: finalRating,
                    action: action
                };
            });
            
            // Save to state
            setStudentGrades(updatedGrades);

            // Clear all local changes
            setLocalGrades({});
            
            // Exit edit mode for all students
            const updatedEditModes = {};
            Object.keys(editModeStudents).forEach(studentId => {
                updatedEditModes[studentId] = false;
            });
            setEditModeStudents(updatedEditModes);
            
            toast.success('All grades saved successfully!')
            // Refresh grades from server (but we've already updated the UI)
            try {
                await getSubjectGrades();
            } catch (fetchError) {
                console.warn('Failed to refresh grades after bulk save, but save was successful:', fetchError);
                // UI is already updated above, so this is just a warning
            }
        } catch (error) {
            console.error('Failed to save grades:', error);
            setError(error.message || 'Failed to save grades');
        } finally {
            setIsSaving(false);
        }
    };

    const getSubjectGrades = async () => {
        try {
            if (!selectedSubject || !currentSemester) {
                setStudentGrades({});
                return;
            }

            console.log(`Fetching grades for subject: ${selectedSubject}, semester: ${currentSemester}`);

            const response = await fetch(
                `/api/teacher/subject-grades/${selectedSubject}?semesterId=${currentSemester}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch grades with status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('Fetched grades data:', data);
            
            // Check if data is empty
            if (Object.keys(data).length === 0) {
                console.log('No grades found for this subject and semester');
            }
            
            // Always update the state with what we got from the server
            setStudentGrades(data);
        } catch (error) {
            console.error('Error fetching grades:', error);
            setError('Failed to fetch grades: ' + error.message);
        }
    };

    // Get the display value for a grade field
    const getGradeDisplayValue = (studentId, gradeType) => {
        // First check local changes
        if (localGrades[studentId]?.[gradeType] !== undefined) {
            return localGrades[studentId][gradeType];
        }
        
        // Then check saved grades - make sure we're accessing the correct path
        const studentGrade = studentGrades[studentId];
        if (studentGrade && studentGrade[selectedSubject]) {
            return studentGrade[selectedSubject][gradeType] ?? '';
        }
        
        return '';
    };

    // Get final rating (either from local changes or saved data)
    const getFinalRating = (studentId) => {
        if (localGrades[studentId]?.finalRating !== undefined) {
            return localGrades[studentId].finalRating;
        }
        
        // Make sure we're accessing the correct path
        const studentGrade = studentGrades[studentId];
        if (studentGrade && studentGrade[selectedSubject]) {
            return studentGrade[selectedSubject].finalRating ?? 'N/A';
        }
        
        return 'N/A';
    };

    // Check if there are any unsaved changes
    const hasUnsavedChanges = Object.keys(localGrades).length > 0;

    useEffect(() => {
        fetchSubjectStudents();
    }, [selectedSubject, currentSemester]);

    useEffect(() => {
        setEditedGrades({});
        setLocalGrades({});
        setEditModeStudents({}); // Reset edit modes when subject/semester changes
    }, [selectedSubject, currentSemester]);

    useEffect(() => {
        fetchSubjects();
    }, [currentSemester]);

    useEffect(() => {
        fetchData();
    }, [currentSemester]);

    useEffect(() => {
        fetchSemesters();
    }, []);

    useEffect(() => {
        if (selectedSubject && currentSemester) {
            getSubjectGrades();
        }
    }, [selectedSubject, currentSemester]);

    // Add this effect to ensure grades are fetched when needed
    useEffect(() => {
        const fetchGradesIfNeeded = async () => {
            if (selectedSubject && currentSemester) {
                console.log('Fetching grades on component mount or subject/semester change');
                await getSubjectGrades();
            }
        };
        
        fetchGradesIfNeeded();
        
        // This will run when the component unmounts
        return () => {
            console.log('Component unmounting or subject/semester changing');
        };
    }, [selectedSubject, currentSemester]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <TeacherDashboardNavbar />
            <ToastContainer />
            <Container className="mt-4">
                <TeacherGradeHeader />
                <TeacherEncodeGradeFilter
                    successMessage={successMessage}
                    error={error}
                    loading={loading}
                    currentSemester={currentSemester}
                    selectedSubject={selectedSubject}
                    selectedStrand={selectedStrand}
                    selectedYearLevel={selectedYearLevel}
                    selectedSection={selectedSection}
                    semesters={semesters}
                    strands={strands}
                    subjects={subjects}
                    yearLevels={yearLevels}
                    availableSections={availableSections}
                    setSuccessMessage={setSuccessMessage}
                    setError={setError}
                    setSelectedSubject={setSelectedSubject}
                    setSelectedStrand={setSelectedStrand}
                    setSelectedYearLevel={setSelectedYearLevel}
                    setSelectedSection={setSelectedSection}
                    setCurrentSemester={setCurrentSemester}
                    setCurrentSemester={setCurrentSemester}
                />

                {!selectedSubject ? (
                    <Alert variant="info">Please select a subject to encode grades.</Alert>
                ) : (
                    <Card className="shadow-sm">
                        <Card.Body className="p-0">
                            {hasUnsavedChanges && (
                                <div className="d-flex justify-content-end p-2">
                                    <Button 
                                        variant="success" 
                                        onClick={saveAllGrades}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Saving...' : 'Save All Changes'}
                                    </Button>
                                </div>
                            )}
                            <Table responsive hover className='custom-table text-center align-middle'>
                                <thead className="bg-light">
                                    <tr>
                                        <th>Student Name</th>
                                        <th>Section</th>
                                        <th>Midterm</th>
                                        <th>Finals</th>
                                        <th>Final Rating</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((student) => {
                                        const finalRating = getFinalRating(student._id);
                                        const hasLocalChanges = !!localGrades[student._id];
                                        const isEditing = editModeStudents[student._id];
                                        
                                        return (
                                            <tr key={student._id} className={hasLocalChanges ? 'table-warning' : ''}>
                                                <td>{student.username}</td>
                                                <td>{student.sectionName}</td>
                                                <td>
                                                    {isEditing ? (
                                                   <input 
                                                   type="number" 
                                                   min="0" 
                                                   max="100"
                                                   step="0.01" // Allows decimal values
                                                   value={getGradeDisplayValue(student._id, 'midterm')} 
                                                   onChange={(e) => handleGradeChange(e, student._id, 'midterm')}
                                                   onBlur={(e) => {
                                                       // Clean up the value on blur
                                                       if (e.target.value === '') return;
                                                       const value = Math.min(100, Math.max(0, parseFloat(e.target.value)));
                                                       handleGradeChange({ target: { value } }, student._id, 'midterm');
                                                   }}
                                               />
                                                    ) : (
                                                        <span>{getGradeDisplayValue(student._id, 'midterm') || 'N/A'}</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {isEditing ? (
                                                      <input 
                                                      type="number" 
                                                      min="0" 
                                                      max="100"
                                                      step="0.01" // Allows decimal values
                                                      value={getGradeDisplayValue(student._id, 'finals')} 
                                                      onChange={(e) => handleGradeChange(e, student._id, 'finals')}
                                                      onBlur={(e) => {
                                                          // Clean up the value on blur
                                                          if (e.target.value === '') return;
                                                          const value = Math.min(100, Math.max(0, parseFloat(e.target.value)));
                                                          handleGradeChange({ target: { value } }, student._id, 'finals');
                                                      }}
                                                  />
                                                    ) : (
                                                        <span>{getGradeDisplayValue(student._id, 'finals') || 'N/A'}</span>
                                                    )}
                                                </td>
                                                <td>{finalRating}</td>
                                                <td>
                                                    {finalRating !== 'N/A' && (
                                                        <Badge bg={parseFloat(finalRating) >= 75 ? 'success' : 'danger'}>
                                                            {parseFloat(finalRating) >= 75 ? 'Passed' : 'Failed'}
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td>
                                                    {isEditing ? (
                                                        <div className="d-flex gap-2 justify-content-center">
                                                            <Button 
                                                                onClick={() => addGrade(student._id)}
                                                                disabled={isSaving || !hasLocalChanges}
                                                                variant="success"
                                                                size="sm"
                                                            >
                                                                {isSaving ? 'Saving...' : 'Save'}
                                                            </Button>
                                                            <Button 
                                                                onClick={() => toggleEditMode(student._id)}
                                                                variant="secondary"
                                                                size="sm"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex gap-2 justify-content-center">
                                                            <Button 
                                                                onClick={() => toggleEditMode(student._id)}
                                                                variant="outline-success"
                                                                className='action-btn'
                                                                size="sm"
                                                            >
                                                                Edit
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </>
    );
};

export default TeacherEncodeGrade;
