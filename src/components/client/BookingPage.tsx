import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Star, DollarSign, Calendar, Clock, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Service {
  id: string;
  service_name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
}

interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface AttorneyDetails {
  id: string;
  full_name: string;
  bio: string | null;
  years_of_experience: number;
  city: string | null;
  state: string | null;
  hourly_rate: number | null;
  office_address: string | null;
  practice_areas: string[];
}

interface BookingPageProps {
  attorneyId: string;
  onBack: () => void;
}

export default function BookingPage({ attorneyId, onBack }: BookingPageProps) {
  const { user } = useAuth();
  const [attorney, setAttorney] = useState<AttorneyDetails | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadAttorneyData();
  }, [attorneyId]);

  const loadAttorneyData = async () => {
    setLoading(true);

    const [profileResult, attorneyResult, servicesResult, availabilityResult, practiceAreasResult] =
      await Promise.all([
        supabase.from('user_profiles').select('full_name').eq('id', attorneyId).single(),
        supabase.from('attorney_profiles').select('*').eq('id', attorneyId).single(),
        supabase.from('services').select('*').eq('attorney_id', attorneyId).eq('is_active', true),
        supabase.from('availability_slots').select('*').eq('attorney_id', attorneyId).eq('is_available', true),
        supabase
          .from('attorney_practice_areas')
          .select('practice_areas(name)')
          .eq('attorney_id', attorneyId),
      ]);

    if (profileResult.data && attorneyResult.data) {
      setAttorney({
        id: attorneyId,
        full_name: profileResult.data.full_name,
        bio: attorneyResult.data.bio,
        years_of_experience: attorneyResult.data.years_of_experience,
        city: attorneyResult.data.city,
        state: attorneyResult.data.state,
        hourly_rate: attorneyResult.data.hourly_rate,
        office_address: attorneyResult.data.office_address,
        practice_areas:
          practiceAreasResult.data?.map((item: any) => item.practice_areas.name) || [],
      });
    }

    if (servicesResult.data) {
      setServices(servicesResult.data);
      if (servicesResult.data.length > 0) {
        setSelectedService(servicesResult.data[0].id);
      }
    }

    if (availabilityResult.data) {
      setAvailability(availabilityResult.data);
    }

    setLoading(false);
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();

      const hasAvailability = availability.some((slot) => slot.day_of_week === dayOfWeek);

      if (hasAvailability) {
        dates.push(date);
      }
    }

    return dates;
  };

  const getAvailableTimesForDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();

    const slots = availability.filter((slot) => slot.day_of_week === dayOfWeek);

    const times: string[] = [];
    slots.forEach((slot) => {
      const [startHour, startMinute] = slot.start_time.split(':').map(Number);
      const [endHour, endMinute] = slot.end_time.split(':').map(Number);

      for (let hour = startHour; hour < endHour; hour++) {
        times.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour * 60 + 30 < endHour * 60 + endMinute) {
          times.push(`${hour.toString().padStart(2, '0')}:30`);
        }
      }
    });

    return times;
  };

  const handleBooking = async () => {
    if (!user || !selectedService || !selectedDate || !selectedTime) {
      alert('Please select a service, date, and time');
      return;
    }

    setBooking(true);

    const selectedServiceData = services.find((s) => s.id === selectedService);
    if (!selectedServiceData) return;

    const startTime = selectedTime;
    const [hours, minutes] = startTime.split(':').map(Number);
    const endMinutes = hours * 60 + minutes + selectedServiceData.duration_minutes;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

    const { error } = await supabase.from('appointments').insert({
      attorney_id: attorneyId,
      client_id: user.id,
      appointment_date: selectedDate,
      start_time: startTime,
      end_time: endTime,
      service_id: selectedService,
      notes: notes || null,
      status: 'pending',
    });

    setBooking(false);

    if (error) {
      alert('Error booking appointment. Please try again.');
      console.error('Booking error:', error);
    } else {
      setBooked(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!attorney) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Attorney not found</p>
        <button onClick={onBack} className="mt-4 text-slate-900 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  if (booked) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Requested!</h2>
          <p className="text-slate-600 mb-6">
            Your appointment request has been sent to {attorney.full_name}. You'll be notified
            once they confirm your appointment.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const availableDates = getAvailableDates();
  const availableTimes = selectedDate ? getAvailableTimesForDate(selectedDate) : [];

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to search
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">{attorney.full_name}</h1>

            <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-6">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>{attorney.years_of_experience} years experience</span>
              </div>
              {attorney.city && attorney.state && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {attorney.city}, {attorney.state}
                  </span>
                </div>
              )}
              {attorney.hourly_rate && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>${attorney.hourly_rate}/hour</span>
                </div>
              )}
            </div>

            {attorney.practice_areas.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-700 mb-2">Practice Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {attorney.practice_areas.map((area, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {attorney.bio && (
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">About</h3>
                <p className="text-slate-600">{attorney.bio}</p>
              </div>
            )}

            {attorney.office_address && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 mb-2">Office Location</h3>
                <p className="text-slate-600">{attorney.office_address}</p>
              </div>
            )}
          </div>

          {services.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Services Offered</h2>
              <div className="space-y-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-slate-900">{service.service_name}</h3>
                      <span className="text-slate-900 font-bold">${service.price}</span>
                    </div>
                    {service.description && (
                      <p className="text-sm text-slate-600 mb-2">{service.description}</p>
                    )}
                    <span className="text-xs text-slate-500">{service.duration_minutes} minutes</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Book Appointment</h2>

            <div className="space-y-4">
              {services.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Service
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  >
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.service_name} - ${service.price}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Select Date
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime('');
                  }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="">Choose a date</option>
                  {availableDates.map((date) => (
                    <option key={date.toISOString()} value={date.toISOString().split('T')[0]}>
                      {date.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDate && availableTimes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Select Time
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  >
                    <option value="">Choose a time</option>
                    {availableTimes.map((time) => (
                      <option key={time} value={time}>
                        {formatTime(time)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="Brief description of your legal matter..."
                />
              </div>

              <button
                onClick={handleBooking}
                disabled={!selectedService || !selectedDate || !selectedTime || booking}
                className="w-full px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {booking ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Booking...
                  </span>
                ) : (
                  'Request Appointment'
                )}
              </button>
            </div>
          </div>
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
