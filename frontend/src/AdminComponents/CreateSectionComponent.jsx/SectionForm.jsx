import {Form, Button } from 'react-bootstrap';
const SectionForm = ({
    name,
    setName,
    linkedStrand,
    setLinkedStrand,
    linkedYearLevel,
    setLinkedYearLevel,
    studStrands,
    yearLevels,
    loading,
    handleSubmit,
    navigate
}) => {
    return ( 
        <div>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Section Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter section name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Strands:</Form.Label>
                    <Form.Select
                        value={linkedStrand}
                        onChange={(e) => {
                            setLinkedStrand(e.target.value);
                        }}
                        required
                    >
                        <option value="">Select Strand</option>
                        {Array.isArray(studStrands) && studStrands.length > 0 ? (
                            studStrands.map((strand) => (
                                <option key={strand._id} value={strand._id}>
                                    {strand.name}
                                </option>
                            ))
                        ) : (
                            <option disabled>No strands available</option>  
                        )}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Year Level:</Form.Label>
                    <Form.Select
                        value={linkedYearLevel}
                        onChange={(e) => {
                            const selectedId = e.target.value;
                            setLinkedYearLevel(selectedId);
                        }}
                        required
                    >
                        <option value="">Select Year Level</option>
                        {yearLevels.map(yearLevel => {
                            return (
                                <option key={yearLevel._id} value={yearLevel._id}>
                                    {yearLevel.name}
                                </option>
                            );
                        })}
                    </Form.Select>
                </Form.Group>

                <div className="d-flex gap-2">
                    <Button
                        variant="outline-secondary"
                        onClick={() => navigate('/admin/ManageSections')}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="outline-success"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Section'}
                    </Button>
                </div>
            </Form>
        </div>
    );
}
export default SectionForm;