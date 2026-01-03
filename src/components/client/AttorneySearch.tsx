import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Briefcase, Loader2, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AttorneyProfile {
  id: string;
  user_id: string;
  full_name: string;
  bar_number: string;
  practice_areas: string[];
  city: string;
  state: string;
  bio: string;
}

interface AttorneySearchProps {
  onSelectAttorney?: (attorneyId: string) => void;
}

export default function AttorneySearch({ onSelectAttorney }: AttorneySearchProps) {
  const [attorneys, setAttorneys] = useState<AttorneyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [practiceAreaFilter, setPracticeAreaFilter] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState({ city: '', state: '' });

  const practiceAreaOptions = [
    'Criminal Defense', 'Family Law', 'Personal Injury',
    'Corporate Law', 'Real Estate', 'Intellectual Property',
    'Employment Law', 'Immigration', 'Tax Law', 'Estate Planning'
  ];

  useEffect(() => {
    loadAttorneys();
  }, []);

  const loadAttorneys = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('attorney_profiles')
      .select('id, user_id, bar_number, practice_areas, city, state, bio, user_profiles(full_name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading attorneys:', error);
    } else {
      // Transform the data to match the AttorneyProfile interface
      const transformedAttorneys = data?.map((profile: any) => {
        const userProfiles = profile.user_profiles;
        const fullName =
          Array.isArray(userProfiles)
            ? userProfiles?.[0]?.full_name
            : userProfiles?.full_name;
      
        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: fullName || 'Unknown',
          bar_number: profile.bar_number,
          practice_areas: profile.practice_areas,
          city: profile.city,
          state: profile.state,
          bio: profile.bio
        };
      }) || [];
      

      setAttorneys(transformedAttorneys);
    }

    setLoading(false);
  };

  const filteredAttorneys = attorneys.filter(attorney => {
    const matchesSearchTerm = attorney.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attorney.bio.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPracticeAreas = practiceAreaFilter.length === 0 ||
      practiceAreaFilter.some(area => attorney.practice_areas.includes(area));

    const matchesLocation =
      (!locationFilter.city || attorney.city.toLowerCase().includes(locationFilter.city.toLowerCase())) &&
      (!locationFilter.state || attorney.state.toLowerCase().includes(locationFilter.state.toLowerCase()));

    return matchesSearchTerm && matchesPracticeAreas && matchesLocation;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-orange-50 p-8 rounded-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Find an Attorney</h1>
        <p className="text-slate-600">Search and connect with experienced legal professionals</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search attorneys by name or expertise"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="City"
            value={locationFilter.city}
            onChange={(e) => setLocationFilter(prev => ({ ...prev, city: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
          <select
            multiple
            value={practiceAreaFilter}
            onChange={(e) => {
              const selectedAreas = Array.from(e.target.selectedOptions, option => option.value);
              setPracticeAreaFilter(selectedAreas);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            {practiceAreaOptions.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredAttorneys.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No attorneys found matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttorneys.map(attorney => (
            <div
              key={attorney.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{attorney.full_name}</h3>
                  <p className="text-sm text-slate-600">Bar #: {attorney.bar_number}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {attorney.practice_areas.map(area => (
                  <span
                    key={area}
                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                <MapPin className="w-4 h-4" />
                <span>{attorney.city}, {attorney.state}</span>
              </div>

              <p className="text-sm text-slate-700 line-clamp-3 mb-4">
                {attorney.bio}
              </p>

              <div className="flex justify-end">
                <button
                  onClick={() => onSelectAttorney?.(attorney.id)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}