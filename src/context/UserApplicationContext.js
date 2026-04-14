import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';

const UserApplicationContext = createContext(null);

export const useUserApplication = () => {
  const context = useContext(UserApplicationContext);
  if (!context) {
    throw new Error('useUserApplication must be used within a UserApplicationProvider');
  }
  return context;
};

export const UserApplicationProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadApplications = useCallback(async () => {
    try {
      const data = await api.get('/userApplications');
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const saveApplication = useCallback(async (userId, applicationData) => {
    const existingApplication = applications.find((item) => String(item.userId) === String(userId));
    const payload = {
      ...applicationData,
      userId,
      status: 'pending',
      remarks: '',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingApplication) {
      const updatedApplication = await api.put(`/userApplications/${existingApplication.id}`, {
        ...existingApplication,
        ...payload,
        id: existingApplication.id,
      });
      setApplications((prev) => prev.map((item) => (item.id === existingApplication.id ? updatedApplication : item)));
      return updatedApplication;
    }

    const createdApplication = await api.post('/userApplications', payload);
    setApplications((prev) => [...prev, createdApplication]);
    return createdApplication;
  }, [applications]);

  const getApplication = useCallback((userId) => applications.find((item) => String(item.userId) === String(userId)) || null, [applications]);

  const updateApplicationStatus = useCallback(async (userId, status, remarks) => {
    const existingApplication = applications.find((item) => String(item.userId) === String(userId));
    if (!existingApplication) {
      return null;
    }

    const updatedApplication = await api.patch(`/userApplications/${existingApplication.id}`, {
      status,
      remarks,
      updatedAt: new Date().toISOString(),
    });

    setApplications((prev) => prev.map((item) => (item.id === existingApplication.id ? updatedApplication : item)));
    return updatedApplication;
  }, [applications]);

  const updateApplication = useCallback(async (userId, applicationData) => {
    const existingApplication = applications.find((item) => String(item.userId) === String(userId));
    if (!existingApplication) {
      return null;
    }

    const updatedApplication = await api.patch(`/userApplications/${existingApplication.id}`, {
      ...applicationData,
      updatedAt: new Date().toISOString(),
    });

    setApplications((prev) => prev.map((item) => (item.id === existingApplication.id ? updatedApplication : item)));
    return updatedApplication;
  }, [applications]);

  const deleteApplication = useCallback(async (userId) => {
    const existingApplication = applications.find((item) => String(item.userId) === String(userId));
    if (!existingApplication) {
      return null;
    }

    await api.delete(`/userApplications/${existingApplication.id}`);
    setApplications((prev) => prev.filter((item) => item.id !== existingApplication.id));
    return existingApplication;
  }, [applications]);

  const getAllApplications = useCallback(() => applications, [applications]);
  const getPendingApplications = useCallback(() => applications.filter((item) => item.status === 'pending'), [applications]);

  const value = {
    applications,
    loading,
    loadApplications,
    saveApplication,
    getApplication,
    updateApplication,
    deleteApplication,
    updateApplicationStatus,
    getAllApplications,
    getPendingApplications,
  };

  return <UserApplicationContext.Provider value={value}>{children}</UserApplicationContext.Provider>;
};

export default UserApplicationContext;
