// AdminTeacherTable.js
import { Table, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import '../AdminTableList.css';

const AdminTeacherTable = ({
    filteredUsers,
    showEditModal,
    handleShow,
    currentPage,
    entriesPerPage,
    handlePageChange,
    totalPages
}) => {
    return (
        <div>
            <Table responsive hover className='custom-table text-center align-middle'>
                <thead>
                    <tr>
                        <th>Teacher ID</th>
                        <th>Sections Handled</th>
                        <th>Advisory Section</th>
                        <th>Subjects</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers
                        .slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)
                        .map(user => (
                            <tr key={user._id}>
                                <td>
                                    <div className="d-flex align-items-center justify-content-center">
                                        {user.username}
                                    </div>
                                </td>
                                <td>
                                    <div className="subjects-list">
                                        {user.sections?.map((section) => (
                                            <span key={`${user._id}-${section._id}`} className="subject-pill">
                                                {section.name}
                                            </span>
                                        )) || 'No Sections'}
                                    </div>
                                </td>
                                <td>
                                    <span className="text-muted">
                                        {user.advisorySection?.section?.name || 'Not Assigned'}
                                    </span>
                                </td>
                                <td>
                                    <div className="subjects-list">
                                        {user.subjects?.map((subject) => (
                                            <span key={`${user._id}-${subject._id}`} className="subject-pill">
                                                {subject.name}
                                            </span>
                                        )) || 'No Subjects'}
                                    </div>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                    <Button 
                                    variant="outline-success" 
                                    size="sm" 
                                    className="btn-action"
                                    onClick={() => showEditModal(user)} // This should now work, since showEditModal is a function
                                >
                                    <i className="bi bi-pencil-square me-1"></i>
                                    Edit
                                </Button>

                                <Button 
    variant="outline-danger" 
    size="sm" 
    className="btn-action"
    onClick={() => handleShow(user._id)} // Directly call handleShow here
>
    <i className="bi bi-trash me-1"></i>
    Delete
</Button>

                                    </div>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </Table>

            {/* Pagination controls */}
            <div className="d-flex justify-content-between mt-3">
                <Button
                    variant="outline-primary" 
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange('prev')}
                >
                    Previous
                </Button>
                <span>Page {currentPage} of {totalPages}</span>
                <Button 
                    variant="outline-primary" 
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange('next')}
                >
                    Next
                </Button>
            </div>
        </div>
    );
};

export default AdminTeacherTable;
