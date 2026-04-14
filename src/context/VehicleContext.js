import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';

const VehicleContext = createContext(null);

export const useVehicles = () => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  return context;
};

export const VehicleProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadVehicles = useCallback(async () => {
    try {
      const data = await api.get('/vehicles');
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const addVehicle = useCallback(async (vehicle) => {
    const newVehicle = {
      ...vehicle,
      status: vehicle.status || 'active',
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      year: Number(vehicle.year) || new Date().getFullYear(),
      transmission: vehicle.transmission || 'Automatic',
      fuelType: vehicle.fuelType || 'Gasoline',
      seats: Number(vehicle.seats) || 5,
      color: vehicle.color || '',
      plateNumber: vehicle.plateNumber || '',
      licenseRequired: vehicle.licenseRequired || 'Standard',
      description: vehicle.description || '',
      features: vehicle.features || [],
      availability: vehicle.availability !== undefined ? vehicle.availability : true,
      location: vehicle.location || '',
      deposit: Number(vehicle.deposit) || 0,
      insuranceIncluded: Boolean(vehicle.insuranceIncluded),
    };

    const createdVehicle = await api.post('/vehicles', newVehicle);
    setVehicles((prev) => [...prev, createdVehicle]);
    return createdVehicle;
  }, []);

  const updateVehicle = useCallback(async (id, updatedVehicle) => {
    const savedVehicle = await api.put(`/vehicles/${id}`, { ...updatedVehicle, id });
    setVehicles((prev) => prev.map((vehicle) => (String(vehicle.id) === String(id) ? savedVehicle : vehicle)));
    return savedVehicle;
  }, []);

  const deleteVehicle = useCallback(async (id) => {
    await api.delete(`/vehicles/${id}`);
    setVehicles((prev) => prev.filter((vehicle) => String(vehicle.id) !== String(id)));
  }, []);

  const toggleVehicleStatus = useCallback(async (id) => {
    const currentVehicle = vehicles.find((vehicle) => String(vehicle.id) === String(id));
    if (!currentVehicle) {
      return null;
    }

    const savedVehicle = await api.patch(`/vehicles/${id}`, {
      status: currentVehicle.status === 'active' ? 'inactive' : 'active',
    });

    setVehicles((prev) => prev.map((vehicle) => (String(vehicle.id) === String(id) ? savedVehicle : vehicle)));
    return savedVehicle;
  }, [vehicles]);

  const getActiveVehicles = useCallback(() => vehicles.filter((vehicle) => vehicle.status === 'active'), [vehicles]);

  const value = {
    vehicles,
    loading,
    setVehicles,
    loadVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    toggleVehicleStatus,
    getActiveVehicles,
  };

  return <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>;
};

export default VehicleContext;
