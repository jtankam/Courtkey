import { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, Loader2, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { AppointmentStatus } from '../../lib/database.types';

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string | null;
  attorney_name: string;
  attorney_city: string | null;
  attorney_state: string | null;
  service_name: string | null;
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const loadAppointments = async () => {
    if (!user) return;
    setLoading(true);

    const { data: appointmentsData, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('client_id', user.id)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error loading appointments:', error);
      setLoading(false);
      return;
    }

    if (!appointmentsData) {
      setLoading(false);
      return;
    }

    const attorneyIds = appointmentsData.map((apt) => apt.attorney_id);
    const serviceIds = appointmentsData
      .map((apt) => apt.service_id)
      .filter((id): id is string => id !== null);

    const [profilesResult, attorneysResult, servicesResult] = await Promise.all([
      supabase.from('user_profiles').select('id, full_name').in('id', attorneyIds),
      supabase.from('attorney_profiles').select('id, city, state').in('id', attorneyIds),
      serviceIds.length > 0
        ? supabase.from('services').select('id, service_name').in('id', serviceIds)
        : { data: [], error: null },
    ]);

    const profileMap = new Map(
      profilesResult.data?.map((profile) => [profile.id, profile.full_name])
    );

    const attorneyMap = new Map(
      attorneysResult.data?.map((attorney) => [
        attorney.id,
        { city: attorney.city, state: attorney.state },
      ])
    );

    const serviceMap = new Map(
      servicesResult.data?.map((service) => [service.id, service.service_name])
    );

    const enrichedAppointments: Appointment[] = appointmentsData.map((apt) => ({
      id: apt.id,
      appointment_date: apt.appointment_date,
      start_time: apt.start_time,
      end_time: apt.end_time,
      status: apt.status,
      notes: apt.notes,
      attorney_name: profileMap.get(apt.attorney_id) || 'Unknown',
      attorney_city: attorneyMap.get(apt.attorney_id)?.city || null,
      attorney_state: attorneyMap.get(apt.attorney_id)?.state || null,
      service_name: apt.service_id ? serviceMap.get(apt.service_id) || null : null,
    }));

    setAppointments(enrichedAppointments);
    setLoading(false);
  };

  const cancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId);

    if (!error) {
      await loadAppointments();
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const pendingCount = appointments.filter((apt) => apt.status === 'pending').length;
  const upcomingCount = appointments.filter(
    (apt) => apt.status === 'confirmed' && new Date(apt.appointment_date) >= new Date()
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Appointments</h1>
        <p className="text-slate-600">View and manage your legal consultations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-slate-900">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Upcoming</p>
              <p className="text-3xl font-bold text-slate-900">{upcomingCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-slate-900">{appointments.length}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pending {pendingCount > 0 && `(${pendingCount})`}
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'confirmed'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Completed
          </button>
        </div>

        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No {filter !== 'all' && filter} appointments found.</p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-6 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : appointment.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : appointment.status === 'declined'
                            ? 'bg-red-100 text-red-700'
                            : appointment.status === 'cancelled'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                      {appointment.service_name && (
                        <span className="text-sm text-slate-600">{appointment.service_name}</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{appointment.attorney_name}</span>
                      </div>
                      {appointment.attorney_city && appointment.attorney_state && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {appointment.attorney_city}, {appointment.attorney_state}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                        </span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-700">
                          <span className="font-medium">Your notes:</span> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {(appointment.status === 'pending' || appointment.status === 'confirmed') &&
                    new Date(appointment.appointment_date) >= new Date() && (
                      <button
                        onClick={() => cancelAppointment(appointment.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}
