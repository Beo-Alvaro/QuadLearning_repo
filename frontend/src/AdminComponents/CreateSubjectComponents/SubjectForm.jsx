import React, { useContext } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useSubjectDataContext } from '../../hooks/useSubjectDataContext'; // Adjust the import path as needed

const SubjectForm = () => {
    const {
        strands,
        yearLevels,
        error,
        loading,
        handleCreateSubject,
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
    } = useSubjectDataContext();

    const handleClear = () => {
        setSelectedStrand('');
        setSelectedYearLevel('');
        setName('');
        setCode('');
        setSelectedSemester('');
        fetchAllData();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const subjectData = {
            name,
            code,
            strand: selectedStrand,
            yearLevel: selectedYearLevel,
            semester: selectedSemester,
        };
        handleCreateSubject(subjectData);
                // Clear form
                setName('');
                setCode('');
                setSelectedStrand('');
                setSelectedYearLevel('');
                setSelectedSemester('');
    };

    return (
        <div>
            <Form onSubmit={handleSubmit}>
                {/* Strand Selection */}
                <Form.Group className="mb-3">
                    <Form.Label>Strand</Form.Label>
                    <Form.Select
                        value={selectedStrand}
                        onChange={(e) => setSelectedStrand(e.target.value)}
                        required
                    >
                        <option value="">Select Strand</option>
                        {strands && strands.length > 0 ? (
                            strands.map((strand) => (
                                <option key={strand._id} value={strand._id}>
                                    {strand.name}
                                </option>
                            ))
                        ) : (
                            <option value="">No strands available</option>
                        )}
                    </Form.Select>
                </Form.Group>

                {/* Year Level Selection */}
                <Form.Group className="mb-3">
                    <Form.Label>Year Level</Form.Label>
                    <Form.Control
                        as="select"
                        value={selectedYearLevel}
                        onChange={(e) => setSelectedYearLevel(e.target.value)}
                        required
                    >
                        <option value="">Select Year Level</option>
                        {yearLevels && yearLevels.length > 0 ? (
                            yearLevels.map((yearLevel) => (
                                <option key={yearLevel._id} value={yearLevel._id}>
                                    {yearLevel.name}
                                </option>
                            ))
                        ) : (
                            <option value="">No year levels available</option>
                        )}
                    </Form.Control>
                </Form.Group>

                {/* Semester Selection */}
                <Form.Group className="mb-3">
                    <Form.Label>Term</Form.Label>
                    <Form.Select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        required
                        disabled={!selectedStrand || !selectedYearLevel}
                    >
                        <option value="">Select Term</option>
                        {filteredSemesters && filteredSemesters.length > 0 ? (
                            filteredSemesters
                                .filter(semester => semester.status === 'active')
                                .map((semester) => (
                                    <option key={semester._id} value={semester._id}>
                                        {`${semester.name} - ${semester.strand.name}`}
                                    </option>
                                ))
                        ) : (
                            <option value="">No semesters available</option>
                        )}
                    </Form.Select>
                </Form.Group>

                {/* Subject Name Input */}
                <Form.Group className="mb-3">
                    <Form.Label>Subject Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter subject name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </Form.Group>

                {/* Subject Code Input */}
                <Form.Group className="mb-3">
                    <Form.Label>Subject Code</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter subject code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                    />
                </Form.Group>

                {/* Submit and Cancel Buttons */}
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-secondary"
                        onClick={() => handleClear()}
                    >
                        Clear
                    </Button>
                    <Button
                        variant="outline-success"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Subject'}
                    </Button>
                </div>
            </Form>
            {error && <div className="text-danger">{error}</div>}
        </div>
    );
};

export default SubjectForm;
