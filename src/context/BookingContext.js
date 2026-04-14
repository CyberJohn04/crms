import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';

const BookingContext = createContext(null);

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [returns, setReturns] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [bookingsData, returnsData, paymentsData] = await Promise.all([
        api.get('/bookings'),
        api.get('/returns'),
        api.get('/payments'),
      ]);

      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setReturns(Array.isArray(returnsData) ? returnsData : []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch (error) {
      console.error('Failed to load booking data:', error);
      setBookings([]);
      setReturns([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateReceiptNumber = useCallback(() => {
    const prefix = 'RCP';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }, []);

  const addBooking = useCallback(async (bookingData) => {
    const newBooking = {
      ...bookingData,
      status: 'Pending',
      remarks: bookingData.remarks || '',
      paymentMethod: bookingData.paymentMethod || '',
      createdAt: new Date().toISOString(),
    };

    const createdBooking = await api.post('/bookings', newBooking);
    setBookings((prev) => [...prev, createdBooking]);
    return createdBooking;
  }, []);

  const getBookings = useCallback(() => bookings, [bookings]);
  const getUserBookings = useCallback((userId) => bookings.filter((booking) => String(booking.userId) === String(userId)), [bookings]);
  const getBookingById = useCallback((bookingId) => bookings.find((booking) => String(booking.id) === String(bookingId)), [bookings]);

  const getApprovedBookingsForReturn = useCallback((userId) => {
    const returnedBookingIds = new Set(
      returns
        .filter((item) => ['Pending', 'Approved'].includes(item.status))
        .map((item) => String(item.bookingId))
    );

    const paidBookingIds = new Set(
      payments
        .filter((payment) => (payment.status || '').toLowerCase() === 'completed')
        .map((payment) => String(payment.bookingId))
    );

    return bookings.filter(
      (booking) =>
        String(booking.userId) === String(userId) &&
        (booking.status === 'Approved' || booking.status === 'Completed') &&
        paidBookingIds.has(String(booking.id)) &&
        !returnedBookingIds.has(String(booking.id))
    );
  }, [bookings, payments, returns]);

  const updateBookingStatus = useCallback(async (bookingId, status, remarks) => {
    const updatedBooking = await api.patch(`/bookings/${bookingId}`, {
      status,
      remarks,
      updatedAt: new Date().toISOString(),
    });

    setBookings((prev) => prev.map((booking) => (String(booking.id) === String(bookingId) ? updatedBooking : booking)));
    return updatedBooking;
  }, []);

  const updateBooking = useCallback(async (bookingId, updates) => {
    const updatedBooking = await api.patch(`/bookings/${bookingId}`, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    setBookings((prev) => prev.map((booking) => (String(booking.id) === String(bookingId) ? updatedBooking : booking)));
    return updatedBooking;
  }, []);

  const deleteBooking = useCallback(async (bookingId) => {
    await api.delete(`/bookings/${bookingId}`);
    setBookings((prev) => prev.filter((booking) => String(booking.id) !== String(bookingId)));
  }, []);

  const addPayment = useCallback(async (paymentData) => {
    const newPayment = {
      ...paymentData,
      receiptNumber: generateReceiptNumber(),
      status: 'Completed',
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const createdPayment = await api.post('/payments', newPayment);
    setPayments((prev) => [...prev, createdPayment]);
    return createdPayment;
  }, [generateReceiptNumber]);

  const getPayments = useCallback(() => payments, [payments]);
  const getUserPayments = useCallback((userId) => payments.filter((payment) => String(payment.userId) === String(userId)), [payments]);
  const getBookingPayment = useCallback((bookingId) => payments.find((payment) => String(payment.bookingId) === String(bookingId)), [payments]);

  const updatePayment = useCallback(async (paymentId, updates) => {
    const updatedPayment = await api.patch(`/payments/${paymentId}`, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    setPayments((prev) => prev.map((payment) => (String(payment.id) === String(paymentId) ? updatedPayment : payment)));
    return updatedPayment;
  }, []);

  const deletePayment = useCallback(async (paymentId) => {
    await api.delete(`/payments/${paymentId}`);
    setPayments((prev) => prev.filter((payment) => String(payment.id) !== String(paymentId)));
  }, []);

  const processPayment = useCallback(async (bookingId, userId, amount, method, metadata = {}) => {
    const payment = await addPayment({
      bookingId,
      userId,
      amount,
      method,
      ...metadata,
    });

    await updateBookingStatus(
      bookingId,
      'Approved',
      `Payment received via ${method === 'cash' ? 'Cash' : 'GCash'}`
    );

    return payment;
  }, [addPayment, updateBookingStatus]);

  const submitReturn = useCallback(async (returnData) => {
    const newReturn = {
      ...returnData,
      status: 'Pending',
      adminRemarks: '',
      createdAt: new Date().toISOString(),
    };

    const createdReturn = await api.post('/returns', newReturn);
    setReturns((prev) => [...prev, createdReturn]);

    await updateBookingStatus(returnData.bookingId, 'Returning', 'Return submitted');
    return createdReturn;
  }, [updateBookingStatus]);

  const getUserReturns = useCallback((userId) => returns.filter((item) => String(item.userId) === String(userId)), [returns]);
  const getAllReturns = useCallback(() => returns, [returns]);
  const getReturnById = useCallback((returnId) => returns.find((item) => String(item.id) === String(returnId)), [returns]);

  const updateReturnStatus = useCallback(async (returnId, status, adminRemarks) => {
    const updatedReturn = await api.patch(`/returns/${returnId}`, {
      status,
      adminRemarks,
      updatedAt: new Date().toISOString(),
    });

    setReturns((prev) => prev.map((item) => (String(item.id) === String(returnId) ? updatedReturn : item)));

    if (updatedReturn) {
      if (status === 'Approved') {
        await updateBookingStatus(updatedReturn.bookingId, 'Returned', adminRemarks || 'Return approved - No damage');
      }
      if (status === 'Rejected') {
        await updateBookingStatus(updatedReturn.bookingId, 'Return Rejected', adminRemarks || 'Return rejected - Please resolve issues');
      }
    }

    return updatedReturn;
  }, [updateBookingStatus]);

  const deleteReturn = useCallback(async (returnId) => {
    const existingReturn = returns.find((item) => String(item.id) === String(returnId));
    await api.delete(`/returns/${returnId}`);
    setReturns((prev) => prev.filter((item) => String(item.id) !== String(returnId)));

    if (existingReturn?.bookingId) {
      await updateBookingStatus(existingReturn.bookingId, 'Approved', 'Return record deleted by admin.');
    }
  }, [returns, updateBookingStatus]);

  const value = {
    bookings,
    returns,
    payments,
    loading,
    loadData,
    addBooking,
    getBookings,
    getUserBookings,
    getApprovedBookingsForReturn,
    updateBookingStatus,
    updateBooking,
    getBookingById,
    deleteBooking,
    addPayment,
    getPayments,
    getUserPayments,
    getBookingPayment,
    updatePayment,
    deletePayment,
    processPayment,
    submitReturn,
    getUserReturns,
    getAllReturns,
    getReturnById,
    updateReturnStatus,
    deleteReturn,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export default BookingContext;
