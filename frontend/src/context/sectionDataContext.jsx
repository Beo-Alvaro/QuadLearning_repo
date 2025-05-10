import React, { createContext, useState } from 'react';
import { toast } from 'react-toastify';
import { apiRequest } from '../utils/api';

export const SectionDataContext = createContext();

export const SectionDataProvider = ({ children }) => {
    const [studSections, setStudSections] = useState([]);
    const [studStrands, setStudStrands] = useState([]);
    const [yearLevels, setYearLevels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [linkedStrand, setLinkedStrand] = useState('');
    const [linkedYearLevel, setLinkedYearLevel] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState(null);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        try {
            const headers = { Authorization: `Bearer ${token}` };
            
            const [sectionsData, strandsData, yearLevelsData] = await Promise.all([
                apiRequest('/api/admin/getSections', { headers }),
                apiRequest('/api/admin/getStrands', { headers }),
                apiRequest('/api/admin/yearLevels', { headers }),
            ]);

            setStudSections(sectionsData || []);
            setStudStrands(strandsData || []);
            setYearLevels(yearLevelsData || []);
        } catch (error) {
            setError('An error occurred while fetching data');
            console.error('Error fetching data:', error.message);
        }
    };

    const handleSaveChanges = async (selectedSectionId) => {
        if (!selectedSectionId) {
            console.error('No section selected for update!');
            return false; 
        }
    
        const updatedSection = { 
            id: selectedSectionId, 
            name, 
            strand: linkedStrand, 
            yearLevel: linkedYearLevel 
        };
    
        // Check for required fields
        if (!updatedSection.name || !updatedSection.strand || !updatedSection.yearLevel) {
            toast.error('Please fill in all fields.');
            return false;
        }
    
        // Check for duplicate section, excluding the current section being edited
        if (checkDuplicateSection(name, linkedStrand, linkedYearLevel, selectedSectionId)) {
            toast.error('A section with this name already exists for the selected strand and year level');
            return false;
        }
    
        const token = localStorage.getItem('token');
    
        try {
            const result = await apiRequest(`/api/admin/sections/${selectedSectionId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(updatedSection),
            });
    
            // Update the sections state in the context
            setStudSections((prevSections) =>
                prevSections.map((section) =>
                    section._id === selectedSectionId ? result : section
                )
            );
            return true;
        } catch (error) {
            console.error('Failed to update section:', error);
            toast.error(error.message || 'An error occurred while updating the section');
            return false;
        }
    };
    
    
    
    const deleteHandler = async (sectionId) => {
        const token = localStorage.getItem('token');
        try {
            await apiRequest(`/api/admin/sections/${sectionId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            setStudSections((prevSections) => prevSections.filter((section) => section._id !== sectionId));
        } catch (error) {
            setError('Failed to delete section');
        }
        fetchData();
    };

// Add after your state declarations
const checkDuplicateSection = (sectionName, strandId, yearLevelId, currentId = null) => {
    return studSections.some(section => 
        section.name.toLowerCase() === sectionName.toLowerCase() &&
        section.strand._id === strandId &&
        section.yearLevel._id === yearLevelId &&
        section._id !== currentId
    );
};

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const cleanYearLevelId = linkedYearLevel.replace(/[^0-9a-fA-F]/g, '');

            // Check for required fields
    if (!name || !linkedStrand || !cleanYearLevelId) {
        setError('Please fill in all fields');
        setLoading(false);
        toast.error('Please fill in all fields');
        return;
    }

    // Check for duplicate section
    if (checkDuplicateSection(name, linkedStrand, cleanYearLevelId)) {
        setError('A section with this name already exists for the selected strand and year level');
        setLoading(false);
        toast.error('A section with this name already exists for the selected strand and year level');
        return;
    }

        const sectionData = {
            name,
            strand: linkedStrand,
            yearLevel: cleanYearLevelId,
        };

        try {
            const token = localStorage.getItem('token');
            await apiRequest('/api/admin/addSections', {
                method: 'POST',
                body: JSON.stringify(sectionData),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            setName('');
            setLinkedStrand('');
            setLinkedYearLevel('');
            fetchData();
            toast.success('Section created successfully!')
        } catch (error) {
            setError(error.message || 'An error occurred while creating the section');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SectionDataContext.Provider
            value={{
                studSections,
                studStrands,
                yearLevels,
                loading,
                error,
                name,
                setName,
                linkedStrand,
                setLinkedStrand,
                linkedYearLevel,
                setLinkedYearLevel,
                handleSaveChanges,
                deleteHandler,
                handleSubmit,
                fetchData,
                setSelectedSectionId,
            }}
        >
            {children}
        </SectionDataContext.Provider>
    );
};
