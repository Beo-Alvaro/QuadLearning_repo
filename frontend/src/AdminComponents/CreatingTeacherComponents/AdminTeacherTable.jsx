// AdminTeacherTable.js
import { Table, Button } from 'react-bootstrap';
import { useState } from 'react';
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
    const [sortField, setSortField] = useState('username');
    const [sortDirection, setSortDirection] = useState('asc');

    const getSortedTeachers = (teachers) => {
        return [...teachers].sort((a, b) => {
            let aValue = '';
            let bValue = '';

            switch(sortField) {
                case 'username':
                    aValue = a.username?.toLowerCase() || '';
                    bValue = b.username?.toLowerCase() || '';
                    break;
                case 'sections':
                    aValue = a.sections?.map(s => s.name).join(',').toLowerCase() || '';
                    bValue = b.sections?.map(s => s.name).join(',').toLowerCase() || '';
                    break;
                case 'advisorySection':
                    aValue = a.advisorySection?.section?.name?.toLowerCase() || '';
                    bValue = b.advisorySection?.section?.name?.toLowerCase() || '';
                    break;
                case 'subjects':
                    aValue = a.subjects?.map(s => s.name).join(',').toLowerCase() || '';
                    bValue = b.subjects?.map(s => s.name).join(',').toLowerCase() || '';
                    break;
                default:
                    return 0;
            }

            return sortDirection === 'asc' 
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        });
    };

    const sortedTeachers = getSortedTeachers(filteredUsers);

    const handleSort = (field) => {
        setSortDirection(sortField === field && sortDirection === 'asc' ? 'desc' : 'asc');
        setSortField(field);
    };

    return (
        <div>
            <Table responsive hover className='custom-table text-center align-middle'>
               <thead>
                    <tr>
                        <th onClick={() => handleSort('username')} style={{ cursor: 'pointer' }}>
                            Teacher ID {sortField === 'username' && (
                                <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                            )}
                        </th>
                        <th onClick={() => handleSort('sections')} style={{ cursor: 'pointer' }}>
                            Sections Handled {sortField === 'sections' && (
                                <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                            )}
                        </th>
                        <th onClick={() => handleSort('advisorySection')} style={{ cursor: 'pointer' }}>
                            Advisory Section {sortField === 'advisorySection' && (
                                <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                            )}
                        </th>
                        <th >
                            Subjects 
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedTeachers
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
