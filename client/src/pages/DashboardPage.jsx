import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Siren, Heart, Users, HandCoins, Plus, ArrowRight } from 'lucide-react';
import DashboardSidebar from '../components/layout/DashboardSidebar';
import VolunteerPanel from '../components/dashboard/VolunteerPanel';
import RescueCard from '../components/cards/RescueCard';
import { useAuth } from '../context/AuthContext';
import { rescueService } from '../services/rescue.service';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';
  const isVolunteer = user?.role === 'volunteer';
  const isNGO = user?.role === 'ngo';

  const [myRescues, setMyRescues] = useState([]);

  useEffect(() => {
    rescueService.getMine()
      .then(({ data }) => setMyRescues(data.rescues))
      .catch(() => {});
  }, []);

  const activeCount = myRescues.filter(
    (r) => r.status !== 'rescued' && r.status !== 'closed'
  ).length;

  const statCards = [
    { label: 'My Rescue Cases', value: myRescues.length, sub: `${activeCount} active`, Icon: Siren },
    { label: 'Saved Pets', value: 0, sub: '0 pending', Icon: Heart },
    { label: 'Volunteer Tasks', value: 0, sub: 'None upcoming', Icon: Users },
    { label: 'Total Donated', value: 'NPR 0', sub: 'All time', Icon: HandCoins },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-4 sm:p-6 lg:p-8">
        {/* Welcome banner */}
        <div className="bg-ink rounded-2xl p-5 sm:p-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-1 truncate">
              {greeting()}, {firstName}
            </h1>
            <p className="text-white/70 text-sm">
              {isVolunteer && 'Volunteer'}
              {isNGO && 'NGO Partner'}
              {!isVolunteer && !isNGO && "Here's what's happening in your area today."}
            </p>
          </div>
          <Link to="/rescue/report" className="shrink-0">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-5 py-3 rounded-full text-sm font-bold hover:bg-primary-dark transition-colors">
              <Plus size={18} />
              Report Rescue
            </button>
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {statCards.map(({ label, value, sub, Icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                <Icon size={18} className="text-primary" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-ink">{value}</p>
              <p className="text-xs sm:text-sm text-gray-500">{label}</p>
              <p className="text-xs text-gray-400 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* Volunteer-only panel */}
        {isVolunteer && (
          <div className="mb-6">
            <VolunteerPanel />
          </div>
        )}

        {/* Everyone: my reported rescues */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ink">My Reported Rescues</h2>
            <Link to="/rescue/report" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              Report New <ArrowRight size={14} />
            </Link>
          </div>

          {myRescues.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm mb-3">You haven't reported any rescues yet.</p>
              <Link to="/rescue/report" className="text-sm font-bold text-primary hover:underline">
                Report your first rescue
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {myRescues.slice(0, 4).map((rescue) => (
                <Link key={rescue._id} to={`/rescue/${rescue._id}`}>
                  <RescueCard rescue={rescue} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}