import React, { createContext, useState } from 'react';
import { useAuth } from './authContext';
import { ToastContainer, toast } from 'react-toastify';
import { apiRequest } from '../utils/api';

export const StrandDataContext = createContext();

export const StrandDataProvider = ({ children }) => {
  const { user, token } = useAuth()
  const [studStrands, setStudStrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  // Fetch all strands
  const fetchStrands = async () => {
    setLoading(true);
    const storedToken = localStorage.getItem("token")
    try {
      const data = await apiRequest('/api/admin/getStrands', {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
      setStudStrands(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new strand
  const addStrand = async (newStrand) => {
    const storedToken = localStorage.getItem('token');
    setLoading(true);
    try {
      await apiRequest('/api/admin/addStrands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedToken}`,
        },
        body: JSON.stringify(newStrand),
      });
      await fetchStrands();
      toast.success('Strand created successfully!')
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update a strand
  const updateStrand = async (id, updatedData) => {
    const storedToken = localStorage.getItem('token');
    try {
      await apiRequest(`/api/admin/strands/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedToken}`,
        },
        body: JSON.stringify(updatedData),
      });

      await fetchStrands();
      toast.success('Strand updated successfully!')
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a strand
  const deleteStrand = async (id) => {
    const storedToken = localStorage.getItem('token');
    try {
      await apiRequest(`/api/admin/strands/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      setStudStrands((prevStrands) => prevStrands.filter((strand) => strand._id !== id));
      toast.error('Strand deleted successfully!')
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <StrandDataContext.Provider
      value={{
        studStrands,
        loading,
        error,
        fetchStrands,
        addStrand,
        updateStrand,
        deleteStrand,
      }}
    >
      {children}
    </StrandDataContext.Provider>
  );
};
