import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import type { DoctorListItem } from '../lib/types';
import {
  Search,
  Star,
  Clock,
  DollarSign,
  GraduationCap,
  CalendarDays,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorsList() {
  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [selectedSpec, setSelectedSpec] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
    loadSpecializations();
  }, [selectedSpec]);

  const loadDoctors = async () => {
    try {
      const params = selectedSpec ? { specialization: selectedSpec } : {};
      const res = await api.get('/doctors/', { params });
      setDoctors(res.data);
    } catch {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const loadSpecializations = async () => {
    try {
      const res = await api.get('/doctors/specializations');
      setSpecializations(res.data);
    } catch {
      /* ignore */
    }
  };

  const filtered = doctors.filter(
    (d) =>
      d.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Find a Doctor</h1>
        <p className="text-gray-600 mt-1">
          Browse our specialists and book an appointment
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Search doctors by name or specialization..."
          />
        </div>
        <select
          value={selectedSpec}
          onChange={(e) => setSelectedSpec(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          <option value="">All Specializations</option>
          {specializations.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Doctors Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No doctors found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={
                      doctor.avatar_url ||
                      `https://api.dicebear.com/9.x/avataaars/svg?seed=${doctor.doctor_name}`
                    }
                    alt={doctor.doctor_name}
                    className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-100"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {doctor.doctor_name}
                    </h3>
                    <p className="text-blue-600 font-medium text-sm">
                      {doctor.specialization}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">5.0</span>
                    </div>
                  </div>
                </div>

                {doctor.bio && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{doctor.bio}</p>
                )}

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <Clock className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-900">
                      {doctor.experience_years}y
                    </p>
                    <p className="text-xs text-gray-500">Exp.</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <DollarSign className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-900">
                      ${doctor.consultation_fee}
                    </p>
                    <p className="text-xs text-gray-500">Fee</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <GraduationCap className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {doctor.qualification}
                    </p>
                    <p className="text-xs text-gray-500">Qual.</p>
                  </div>
                </div>

                <Link
                  to={`/book/${doctor.id}`}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  <CalendarDays className="h-4 w-4" />
                  Book Appointment
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
