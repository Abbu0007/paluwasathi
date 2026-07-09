import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Siren, Heart, Users, HandCoins, Plus, ArrowRight,
  CheckCircle2, FileText, PawPrint,
} from 'lucide-react';
import DashboardSidebar from '../components/layout/DashboardSidebar';
import VolunteerPanel from '../components/dashboard/VolunteerPanel';
import NgoPanel from '../components/dashboard/NgoPanel';
import RescueCard from '../components/cards/RescueCard';
import { useAuth } from '../context/AuthContext';
import { rescueService } from '../services/rescue.service';
import { adoptionService } from '../services/pet.service';

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

  const [reported, setReported] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [ngoStats, setNgoStats] = useState({ listed: 0, available: 0, adopted: 0, pending: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        if (isNGO) {
          const { data } = await adoptionService.getNgoStats();
          setNgoStats(data);
        }
        const mine = await rescueService.getMine();
        setReported(mine.data.rescues);
        if (isVolunteer) {
          const assigned = await rescueService.getAssigned();
          setAccepted(assigned.data.rescues);
        }
      } catch {
        setReported([]);
      }
    };
    load();
  }, [isVolunteer, isNGO]);

  const activeReported = reported.filter((r) => !['rescued', 'closed'].includes(r.status)).length;
  const activeAccepted = accepted.filter((r) => !['rescued', 'closed'].includes(r.status)).length;
  const completedRescues = accepted.filter((r) => r.status === 'rescued').length;

  let statCards;
  if (isNGO) {
    statCards = [
      { label: 'Pending Applications', value: ngoStats.pending, sub: 'Need review', Icon: FileText },
      { label: 'Pets Listed', value: ngoStats.listed, sub: `${ngoStats.available} available`, Icon: PawPrint },
      { label: 'Pets Adopted', value: ngoStats.adopted, sub: 'Found homes', Icon: CheckCircle2 },
      { label: 'Donations Received', value: 'NPR 0', sub: 'All time', Icon: HandCoins },
    ];
  } else if (isVolunteer) {
    statCards = [
      { label: 'Animals Rescued', value: completedRescues, sub: 'Completed by you', Icon: CheckCircle2 },
      { label: 'Active Cases', value: activeAccepted, sub: 'In progress', Icon: Siren },
      { label: 'Cases Reported', value: reported.length, sub: `${activeReported} active`, Icon: Heart },
      { label: 'Total Donated', value: 'NPR 0', sub: 'All time', Icon: HandCoins },
    ];
  } else {
    statCards = [
      { label: 'My Rescue Cases', value: reported.length, sub: `${activeReported} active`, Icon: Siren },
      { label: 'Saved Pets', value: 0, sub: '0 pending', Icon: Heart },
      { label: 'Volunteer Tasks', value: 0, sub: 'None upcoming', Icon: Users },
      { label: 'Total Donated', value: 'NPR 0', sub: 'All time', Icon: HandCoins },
    ];
  }

  let subtitle = "Here's what's happening in your area today.";
  if (isNGO) {
    subtitle = ngoStats.pending > 0
      ? `${ngoStats.pending} application${ngoStats.pending !== 1 ? 's' : ''} waiting for your review.`
      : 'No applications pending review.';
  } else if (isVolunteer && completedRescues > 0) {
    subtitle = `You've rescued ${completedRescues} animal${completedRescues !== 1 ? 's' : ''}. Thank you.`;
  } else if (isVolunteer) {
    subtitle = 'Volunteer — check available cases below.';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="bg-ink rounded-2xl p-5 sm:p-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-1 truncate">
              {greeting()}, {firstName}
            </h1>
            <p className="text-white/70 text-sm">{subtitle}</p>
          </div>
          <Link to={isNGO ? '/dashboard/my-pets' : '/rescue/report'} className="shrink-0">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-5 py-3 rounded-full text-sm font-bold hover:bg-primary-dark transition-colors">
              <Plus size={18} />
              {isNGO ? 'List a Pet' : 'Report Rescue'}
            </button>
          </Link>
        </div>

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

        {isNGO && (
          <div className="mb-6">
            <NgoPanel />
          </div>
        )}

        {isVolunteer && (
          <div className="mb-6">
            <VolunteerPanel />
          </div>
        )}

        {isVolunteer && completedRescues > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-primary" />
                <h2 className="font-bold text-ink">Recently Rescued</h2>
              </div>
              <Link to="/dashboard/rescues" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {accepted.filter((r) => r.status === 'rescued').slice(0, 2).map((rescue) => (
                <Link key={rescue._id} to={'/rescue/' + rescue._id}>
                  <RescueCard rescue={rescue} />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ink">My Reported Rescues</h2>
            <Link to="/rescue/report" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              Report New <ArrowRight size={14} />
            </Link>
          </div>

          {reported.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm mb-3">You haven't reported any rescues yet.</p>
              <Link to="/rescue/report" className="text-sm font-bold text-primary hover:underline">
                Report your first rescue
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {reported.slice(0, 4).map((rescue) => (
                <Link key={rescue._id} to={'/rescue/' + rescue._id}>
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