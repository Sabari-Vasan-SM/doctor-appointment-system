import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { TimeSlot } from '../lib/types';
import {
  CalendarDays,
  Clock,
  Star,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  GraduationCap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';

interface DoctorDetail {
  id: number;
  doctor_name: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
}

export default function BookAppointment() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  });

  useEffect(() => {
    loadDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate && doctorId) {
      loadSlots();
    }
  }, [selectedDate, doctorId]);

  const loadDoctor = async () => {
    try {
      const res = await api.get(`/doctors/${doctorId}`);
      setDoctor(res.data);
    } catch {
      toast.error('Doctor not found');
      navigate('/doctors');
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async () => {
    setSlotsLoading(true);
    try {
      const res = await api.get(`/appointments/slots/${doctorId}/${selectedDate}`);
      setSlots(res.data);
      setSelectedTime('');
    } catch {
      toast.error('Failed to load time slots');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }
    setBooking(true);
    try {
      await api.post('/appointments/', {
        doctor_id: Number(doctorId),
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        reason: reason || null,
      });
      toast.success('Appointment booked successfully!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { detail: string } } }).response?.data?.detail
          : 'Booking failed';
      toast.error(msg || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/doctors')}
        className="flex items-center gap-1 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Doctors
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Doctor Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <div className="text-center mb-4">
              <img
                src={
                  doctor.avatar_url ||
                  `https://api.dicebear.com/9.x/avataaars/svg?seed=${doctor.doctor_name}`
                }
                alt={doctor.doctor_name}
                className="w-24 h-24 rounded-full mx-auto mb-4 bg-blue-50 border-4 border-blue-100"
              />
              <h2 className="text-xl font-bold text-gray-900">{doctor.doctor_name}</h2>
              <p className="text-blue-600 font-medium">{doctor.specialization}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-3 text-sm">
                <GraduationCap className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">{doctor.qualification}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">
                  {doctor.experience_years} years experience
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">
                  ${doctor.consultation_fee} per visit
                </span>
              </div>
            </div>

            {doctor.bio && (
              <p className="text-gray-600 text-sm mt-4 pt-4 border-t border-gray-100">
                {doctor.bio}
              </p>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              Book Appointment
            </h2>

            {/* Date Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Select Date</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {dates.map((date) => {
                  const d = new Date(date + 'T12:00:00');
                  const isSelected = selectedDate === date;
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`p-3 rounded-xl text-center transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                      }`}
                    >
                      <p className="text-xs font-medium">{format(d, 'EEE')}</p>
                      <p className="text-lg font-bold">{format(d, 'd')}</p>
                      <p className="text-xs">{format(d, 'MMM')}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Available Slots
                </h3>
                {slotsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">
                      No available slots on this date
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                          !slot.available
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                            : selectedTime === slot.time
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reason */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Reason for Visit (Optional)
              </h3>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                rows={3}
                placeholder="Describe your symptoms or reason for the appointment..."
              />
            </div>

            {/* Summary & Book */}
            {selectedDate && selectedTime && (
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Appointment Summary
                </h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>
                    <strong>Doctor:</strong> {doctor.doctor_name}
                  </p>
                  <p>
                    <strong>Date:</strong>{' '}
                    {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p>
                    <strong>Time:</strong> {selectedTime}
                  </p>
                  <p>
                    <strong>Fee:</strong> ${doctor.consultation_fee}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleBook}
              disabled={!selectedDate || !selectedTime || booking}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {booking ? (
                'Booking...'
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Confirm Booking
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
