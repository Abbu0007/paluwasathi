import { Link } from 'react-router-dom';
import { Siren, Heart, Users, HandCoins, Plus, ArrowRight } from 'lucide-react';
import DashboardSidebar from '../components/layout/DashboardSidebar';
import { useAuth } from '../context/AuthContext';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const STAT_CARDS = [
  { label: 'My Rescue Cases', value: '0', sub: '0 active', Icon: Siren },
  { label: 'Saved Pets', value: '0', sub: '0 pending', Icon: Heart },
  { label: 'Volunteer Tasks', value: '0', sub: 'None upcoming', Icon: Users },
  { label: 'Total Donated', value: 'NPR 0', sub: 'All time', Icon: HandCoins },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="ml-[260px] p-8 lg:p-10">
        {/* Welcome banner */}
        <div className="bg-ink rounded-2xl p-8 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-white mb-1">
              {greeting()}, {firstName}
            </h1>
            <p className="text-white/70 text-sm">
              Here's what's happening in your area today.
            </p>
          </div>
          <Link to="/rescue/report">
            <button className="hidden sm:flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-full text-sm font-bold hover:bg-primary-dark transition-colors">
              <Plus size={18} />
              Report Rescue
            </button>
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map(({ label, value, sub, Icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                <Icon size={20} className="text-primary" />
              </div>
              <p className="text-2xl font-black text-ink">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xs text-gray-400 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* Two column widgets */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* My Rescue Cases */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-ink">My Rescue Cases</h2>
              <Link to="/dashboard/rescues" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm mb-3">You haven't reported any rescues yet.</p>
              <Link to="/rescue/report" className="text-sm font-bold text-primary hover:underline">
                Report your first rescue
              </Link>
            </div>
          </div>

          {/* Saved Pets */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-ink">Saved Pets</h2>
              <Link to="/dashboard/saved-pets" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm mb-3">No saved pets yet.</p>
              <Link to="/adopt" className="text-sm font-bold text-primary hover:underline">
                Browse pets
              </Link>
            </div>
          </div>

          {/* Donation History */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-ink">Donation History</h2>
              <Link to="/dashboard/donations" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm mb-3">No donations yet.</p>
              <Link to="/donate" className="text-sm font-bold text-primary hover:underline">
                Support a campaign
              </Link>
            </div>
          </div>

          {/* Volunteer Tasks */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-ink">Volunteer Tasks</h2>
              <Link to="/dashboard/volunteer" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm mb-3">No upcoming tasks.</p>
              <Link to="/volunteer" className="text-sm font-bold text-primary hover:underline">
                Find opportunities
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}