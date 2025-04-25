import React, { createContext, useState } from 'react';
import { useAuth } from './authContext';
import { ToastContainer, toast } from 'react-toastify';
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
      const response = await fetch('/api/admin/getStrands', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch strands');

      const data = await response.json();
      setStudStrands(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new strand
  const addStrand = async (newStrand) => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const response = await fetch('/api/admin/addStrands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newStrand),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message || 'Failed to create strand');
      }
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
    try {
      const response = await fetch(`/api/admin/strands/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message || 'Failed to update strand');
      }

      await fetchStrands();
      toast.success('Strand updated successfully!')
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a strand
  const deleteStrand = async (id) => {
    try {
      const response = await fetch(`/api/admin/strands/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete strand');

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
