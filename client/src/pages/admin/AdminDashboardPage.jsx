import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Siren, PawPrint, HandCoins, Heart, Search,
  MessageCircle, Calendar, Clock, ArrowRight, TrendingUp,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import AdminSidebar from '../../components/layout/AdminSidebar';
import Spinner from '../../components/ui/Spinner';
import { adminService } from '../../services/admin.service';

const formatNPR = (n) => 'NPR ' + Number(n || 0).toLocaleString('en-IN');

const URGENCY_COLORS = { critical: '#C0392B', high: '#E8845A', moderate: '#40916C' };
const STATUS_COLORS = ['#40916C', '#52B788', '#E8845A', '#D26F45', '#C0392B', '#6B5544'];
const SPECIES_COLORS = ['#40916C', '#52B788', '#E8845A', '#6B5544', '#2D6A4F'];

const timeAgo = (date) => {
  const secs = Math.floor((Date.now() - new Date(date)) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return Math.floor(secs / 60) + 'm ago';
  if (secs < 86400) return Math.floor(secs / 3600) + 'h ago';
  return Math.floor(secs / 86400) + 'd ago';
};

function StatCard({ Icon, label, value, sub, to, accent }) {
  const iconBg = accent || 'bg-primary-50';
  const iconColor = accent ? 'text-white' : 'text-primary';

  const body = (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-300 transition-colors h-full">
      <div className="flex items-start justify-between mb-4">
        <div className={'w-10 h-10 rounded-xl flex items-center justify-center ' + iconBg}>
          <Icon size={18} className={iconColor} />
        </div>
        {to && <ArrowRight size={15} className="text-gray-300" />}
      </div>
      <p className="text-2xl font-black text-ink leading-none mb-1.5">{value}</p>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-2">{sub}</p>}
    </div>
  );

  return to ? <Link to={to}>{body}</Link> : body;
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="mb-5">
        <h3 className="font-black text-ink text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

const tooltipStyle = {
  borderRadius: '12px',
  border: '1px solid #eee',
  fontSize: '12px',
  fontWeight: 600,
};

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminService.getOverview(), adminService.getActivity()])
      .then(function (results) {
        setData(results[0].data);
        setActivity(results[1].data);
      })
      .catch(function () { setData(null); })
      .finally(function () { setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="lg:ml-[260px] pt-[64px] lg:pt-0 flex items-center justify-center h-screen">
          <Spinner size={40} />
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-8">
          <p className="text-gray-500">Failed to load dashboard data.</p>
        </main>
      </div>
    );
  }

  const charts = data.charts;
  const hasRescueData = charts.rescuesOverTime.some(function (d) { return d.value > 0; });
  const hasDonationData = charts.donationsOverTime.some(function (d) { return d.value > 0; });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl">

          <div className="mb-8">
            <h1 className="text-2xl font-black text-ink">Platform Overview</h1>
            <p className="text-gray-500 text-sm">
              Everything happening across PaluwaSathi right now.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <StatCard
              Icon={Users}
              label="Total Users"
              value={data.users.total}
              sub={data.users.volunteers + ' volunteers, ' + data.users.ngos + ' NGOs'}
              to="/admin/users"
            />
            <StatCard
              Icon={Siren}
              label="Rescue Cases"
              value={data.rescues.total}
              sub={data.rescues.active + ' still active'}
              to="/admin/rescues"
              accent="bg-danger"
            />
            <StatCard
              Icon={PawPrint}
              label="Pets Listed"
              value={data.pets.total}
              sub={data.pets.adopted + ' adopted, ' + data.pets.available + ' waiting'}
              to="/admin/pets"
            />
            <StatCard
              Icon={HandCoins}
              label="Raised"
              value={formatNPR(data.donations.total)}
              sub={data.donations.count + ' donations'}
              to="/admin/donations"
              accent="bg-accent"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              Icon={Heart}
              label="Adoptions"
              value={data.adoptions.total}
              sub={data.adoptions.pending + ' pending review'}
              to="/admin/adoptions"
            />
            <StatCard
              Icon={Search}
              label="Lost & Found"
              value={data.lostFound.total}
              sub={data.lostFound.reunited + ' reunited'}
              to="/admin/lostfound"
            />
            <StatCard
              Icon={MessageCircle}
              label="Community Posts"
              value={data.community.posts}
              to="/admin/posts"
            />
            <StatCard
              Icon={Calendar}
              label="Events"
              value={data.events.total}
              sub={data.events.rsvps + ' RSVPs'}
              to="/admin/events"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mb-4">
            <ChartCard title="Rescue cases" subtitle="Last 12 months">
              {hasRescueData ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={charts.rescuesOverTime}>
                    <defs>
                      <linearGradient id="rescueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C0392B" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#C0392B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#C0392B"
                      strokeWidth={2}
                      fill="url(#rescueGrad)"
                      name="Cases"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">
                  Not enough data yet
                </div>
              )}
            </ChartCard>

            <ChartCard title="Donations received" subtitle="Last 12 months, NPR">
              {hasDonationData ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={charts.donationsOverTime}>
                    <defs>
                      <linearGradient id="donateGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#40916C" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#40916C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={function (v) { return formatNPR(v); }} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#40916C"
                      strokeWidth={2}
                      fill="url(#donateGrad)"
                      name="Raised"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">
                  Not enough data yet
                </div>
              )}
            </ChartCard>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 mb-4">
            <ChartCard title="Cases by urgency">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={charts.rescuesByUrgency}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {charts.rescuesByUrgency.map(function (entry) {
                      return <Cell key={entry.name} fill={URGENCY_COLORS[entry.name] || '#6B5544'} />;
                    })}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {charts.rescuesByUrgency.map(function (e) {
                  return (
                    <div key={e.name} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: URGENCY_COLORS[e.name] || '#6B5544' }}
                      />
                      <span className="text-xs text-gray-500 capitalize">{e.name}</span>
                    </div>
                  );
                })}
              </div>
            </ChartCard>

            <ChartCard title="Cases by status">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={charts.rescuesByStatus} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#fafafa' }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Cases">
                    {charts.rescuesByStatus.map(function (entry, i) {
                      return <Cell key={entry.name} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Pets by species">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={charts.petsBySpecies}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {charts.petsBySpecies.map(function (entry, i) {
                      return <Cell key={entry.name} fill={SPECIES_COLORS[i % SPECIES_COLORS.length]} />;
                    })}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {charts.petsBySpecies.map(function (e, i) {
                  return (
                    <div key={e.name} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: SPECIES_COLORS[i % SPECIES_COLORS.length] }}
                      />
                      <span className="text-xs text-gray-500 capitalize">{e.name}</span>
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          </div>

          <ChartCard title="New users" subtitle="Last 12 months">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={charts.usersOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#fafafa' }} />
                <Bar dataKey="value" fill="#52B788" radius={[6, 6, 0, 0]} name="Signups" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {activity && (
            <div className="grid lg:grid-cols-2 gap-4 mt-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-ink text-sm">Latest rescue cases</h3>
                  <Link to="/admin/rescues" className="text-xs font-bold text-primary hover:underline">
                    View all
                  </Link>
                </div>
                <div className="space-y-2">
                  {activity.rescues.length === 0 && (
                    <p className="text-sm text-gray-400 py-4 text-center">No cases yet</p>
                  )}
                  {activity.rescues.map(function (r) {
                    const dotColor = URGENCY_COLORS[r.urgency] || '#6B5544';
                    return (
                      <div key={r._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-ink truncate">{r.caseNumber}</p>
                          <p className="text-xs text-gray-400 capitalize">
                            {r.animalType} &middot; {r.status.replace('_', ' ')}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">{timeAgo(r.createdAt)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-ink text-sm">Newest members</h3>
                  <Link to="/admin/users" className="text-xs font-bold text-primary hover:underline">
                    View all
                  </Link>
                </div>
                <div className="space-y-2">
                  {activity.users.map(function (u) {
                    const initials = u.name.split(' ').map(function (n) { return n[0]; })
                      .slice(0, 2).join('').toUpperCase();
                    return (
                      <div key={u._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                        <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-dark text-xs font-bold flex items-center justify-center shrink-0">
                          {initials}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-ink truncate">{u.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{u.role} &middot; {u.district}</p>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">{timeAgo(u.createdAt)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <div className="bg-ink rounded-2xl p-5 text-white">
              <Clock size={18} className="text-white/40 mb-3" />
              <p className="text-2xl font-black">{data.volunteering.hours}</p>
              <p className="text-xs text-white/50 mt-1">Volunteer hours logged</p>
            </div>
            <div className="bg-ink rounded-2xl p-5 text-white">
              <Users size={18} className="text-white/40 mb-3" />
              <p className="text-2xl font-black">{data.volunteering.signups}</p>
              <p className="text-xs text-white/50 mt-1">
                Signups across {data.volunteering.tasks} opportunities
              </p>
            </div>
            <div className="bg-ink rounded-2xl p-5 text-white">
              <TrendingUp size={18} className="text-white/40 mb-3" />
              <p className="text-2xl font-black">{data.campaigns.active}</p>
              <p className="text-xs text-white/50 mt-1">
                Active campaigns of {data.campaigns.total}
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}