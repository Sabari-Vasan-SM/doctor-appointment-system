import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import type { Appointment, DashboardStats } from '../lib/types';
import {
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  confirmed: <CheckCircle className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, apptRes] = await Promise.all([
        api.get('/appointments/stats'),
        api.get('/appointments/my'),
      ]);
      setStats(statsRes.data);
      setAppointments(apptRes.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      toast.success(`Appointment ${status}`);
      loadData();
    } catch {
      toast.error('Failed to update appointment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, {user?.full_name}!
        </h1>
        <p className="text-gray-600 mt-1">
          {user?.role === 'doctor'
            ? 'Manage your appointments and schedule'
            : 'View and manage your appointments'}
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            {
              label: 'Total',
              value: stats.total_appointments,
              icon: Activity,
              color: 'bg-gray-100 text-gray-700',
              iconColor: 'text-gray-500',
            },
            {
              label: 'Pending',
              value: stats.pending_appointments,
              icon: Clock,
              color: 'bg-yellow-50 text-yellow-700',
              iconColor: 'text-yellow-500',
            },
            {
              label: 'Confirmed',
              value: stats.confirmed_appointments,
              icon: CheckCircle,
              color: 'bg-blue-50 text-blue-700',
              iconColor: 'text-blue-500',
            },
            {
              label: 'Completed',
              value: stats.completed_appointments,
              icon: CheckCircle,
              color: 'bg-green-50 text-green-700',
              iconColor: 'text-green-500',
            },
            {
              label: 'Cancelled',
              value: stats.cancelled_appointments,
              icon: XCircle,
              color: 'bg-red-50 text-red-700',
              iconColor: 'text-red-500',
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`${stat.color} rounded-xl p-4 flex flex-col`}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-75">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Appointments List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            {user?.role === 'doctor' ? 'Patient Appointments' : 'My Appointments'}
          </h2>
        </div>

        {appointments.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No appointments yet</p>
            <p className="text-gray-400 text-sm mt-1">
              {user?.role === 'patient'
                ? 'Browse doctors to book your first appointment'
                : 'Appointments will appear here when patients book with you'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user?.role === 'doctor'
                          ? appt.patient_name
                          : `Dr. ${appt.doctor_name?.replace('Dr. ', '')}`}
                      </p>
                      {appt.specialization && (
                        <p className="text-sm text-gray-500">{appt.specialization}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {appt.appointment_date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {appt.appointment_time}
                        </span>
                      </div>
                      {appt.reason && (
                        <p className="text-sm text-gray-500 mt-1">
                          Reason: {appt.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColors[appt.status]}`}
                    >
                      {statusIcons[appt.status]}
                      {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                    </span>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {user?.role === 'doctor' && appt.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(appt.id, 'confirmed')}
                            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => updateStatus(appt.id, 'cancelled')}
                            className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {user?.role === 'doctor' && appt.status === 'confirmed' && (
                        <button
                          onClick={() => updateStatus(appt.id, 'completed')}
                          className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      {user?.role === 'patient' && appt.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(appt.id, 'cancelled')}
                          className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
