/**
 * Centralized API service for the application
 * Uses the apiRequest utility for all API calls
 */

import { apiRequest } from '../utils/api';

// Helper function to get the auth token
const getToken = () => localStorage.getItem('token');

// User related API calls
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return apiRequest('/api/student/profile', {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
  },
  
  // Update user profile
  updateProfile: async (userData) => {
    return apiRequest('/api/student/update-profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(userData)
    });
  },
  
  // Get all users (admin only)
  getAllUsers: async () => {
    return apiRequest('/api/admin/getUsers', {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
  },
  
  // Get users by role
  getUsersByRole: async (role) => {
    return apiRequest(`/api/admin/users?role=${role}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
  },
  
  // Add new user
  addUser: async (userData) => {
    return apiRequest('/api/admin/addUsers', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(userData)
    });
  },
  
  // Update user
  updateUser: async (userId, userData) => {
    return apiRequest(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(userData)
    });
  },
  
  // Delete user
  deleteUser: async (userId) => {
    return apiRequest(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
  },
  
  // Reset user password
  resetPassword: async (userId, newPassword) => {
    return apiRequest(`/api/admin/resetPassword/${userId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({ newPassword })
    });
  }
};

// Student related API calls
export const studentAPI = {
  // Get student grades
  getGrades: async () => {
    return apiRequest('/api/student/grades', {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
  },
  
  // Enroll student
  enrollStudent: async (enrollmentData) => {
    return apiRequest('/api/admin/enroll-student', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(enrollmentData)
    });
  },
  
  // Get pending students
  getPendingStudents: async () => {
    return apiRequest('/api/admin/pending-students', {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
  },
  
  // Get student by ID
  getStudentById: async (studentId) => {
    return apiRequest(`/api/teacher/student/${studentId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
  },
  
  // Generate Form 137
  generateForm137: async (studentId) => {
    return apiRequest(`/api/teacher/generate-form137/${studentId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
  }
};

// Teacher related API calls
export const teacherAPI = {
  // Get teacher sections
  getSections: async () => {
    return apiRequest('/api/teacher/sections', {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
  },
  
  // Get teacher subjects
  getSubjects: async (semesterId) => {
    return apiRequest(`/api/teacher/subjects?semesterId=${semesterId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
  },
  
  // Add grades
  addGrades: async (gradesData) => {
    return apiRequest('/api/teacher/add-grades', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(gradesData)
    });
  },
  
  // Bulk add grades
  bulkAddGrades: async (gradesData) => {
    return apiRequest('/api/teacher/bulk-add-grades', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(gradesData)
    });
  },
  
  // Get student grades
  getStudentGrades: async (studentId) => {
    return apiRequest(`/api/teacher/student-grades/${studentId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
  },
  
  // Get student by ID
  getStudentById: async (studentId) => {
    try {
      console.log('Getting student by ID:', studentId);
      const response = await apiRequest(`/api/teacher/student/${studentId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      return response;
    } catch (error) {
      console.error('Error fetching student by ID:', error);
      throw error;
    }
  },
  
  // Update student data
  updateStudent: async (studentId, studentData) => {
    try {
      const response = await apiRequest(`/api/teacher/student/${studentId}/form`, {
        method: 'POST', 
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(studentData)
      });
      
      return response;
    } catch (error) {
      console.error('Error updating student:', error);
      return {
        success: false,
        message: error.message || 'Failed to update student information'
      };
    }
  },
  
  // Generate Form 137
  generateForm137: async (studentId) => {
    try {
      const response = await fetch(`/api/teacher/generate-form137/${studentId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate Form 137');
      }
      
      // Check if response is a blob
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/pdf')) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Form137_${studentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return { success: true };
      } else {
        // If not a blob, parse as JSON
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('Error generating Form 137:', error);
      throw error;
    }
  }
};

// Admin related API calls
export const adminAPI = {
  // Get all users
  getAllUsers: async () => {
    return apiRequest('/api/admin/getUsers', {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
  },
  
  // Get semesters
  getSemesters: async () => {
    return apiRequest('/api/admin/semesters', {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
  },
  
  // End semester
  endSemester: async (semesterId) => {
    return apiRequest(`/api/admin/endSemester/${semesterId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
  },
  
  // Get sections
  getSections: async () => {
    return apiRequest('/api/admin/getSections', {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
  },
  
  // Get strands
  getStrands: async () => {
    return apiRequest('/api/admin/getStrands', {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
  },
  
  // Get year levels
  getYearLevels: async () => {
    return apiRequest('/api/admin/yearLevels', {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
  },
  
  // Filter subjects
  filterSubjects: async (filterData) => {
    return apiRequest('/api/admin/subjects/filter', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(filterData)
    });
  }
};

// Centralized export for all API services
export default {
  user: userAPI,
  student: studentAPI,
  teacher: teacherAPI,
  admin: adminAPI
}; 