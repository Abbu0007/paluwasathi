import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Clock, Calendar, SlidersHorizontal, X } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import TaskCard from '../../components/cards/TaskCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { TASK_CATEGORIES, TASK_SORT } from '../../constants/task-options';
import { NEPAL_DISTRICTS } from '../../constants/nepal-districts';
import { taskService } from '../../services/task.service';

export default function VolunteerListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ openTasks: 0, totalVolunteers: 0, hoursLogged: 0 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const district = searchParams.get('district') || '';
  const sort = searchParams.get('sort') || 'soonest';
  const urgentOnly = searchParams.get('urgent') === 'true';

  useEffect(() => {
    taskService.getStats().then(function (res) { setStats(res.data); }).catch(function () {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { sort, limit: 12 };
    if (category) params.category = category;
    if (district) params.district = district;
    if (urgentOnly) params.urgent = 'true';

    taskService.getAll(params)
      .then(function (res) { setTasks(res.data.tasks); })
      .catch(function () { setTasks([]); })
      .finally(function () { setLoading(false); });
  }, [searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const clearAll = () => setSearchParams({});
  const activeCount = (category ? 1 : 0) + (district ? 1 : 0) + (urgentOnly ? 1 : 0);

  const filterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between lg:hidden">
        <p className="font-black text-ink">Filters</p>
        <button onClick={function () { setFiltersOpen(false); }} className="text-gray-400">
          <X size={22} />
        </button>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Type of work</p>
        <div className="space-y-2">
          <button
            onClick={function () { updateParam('category', ''); }}
            className={!category
              ? 'w-full text-left px-3 py-2 rounded-xl text-sm font-bold bg-primary-50 text-primary-dark'
              : 'w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50'}
          >
            All types
          </button>
          {TASK_CATEGORIES.map(function (c) {
            const active = category === c.value;
            return (
              <button
                key={c.value}
                onClick={function () { updateParam('category', c.value); }}
                className={active
                  ? 'w-full text-left px-3 py-2 rounded-xl text-sm font-bold bg-primary-50 text-primary-dark'
                  : 'w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50'}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">District</p>
        <select
          value={district}
          onChange={function (e) { updateParam('district', e.target.value); }}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary bg-white text-ink text-sm outline-none"
        >
          <option value="">All districts</option>
          {NEPAL_DISTRICTS.map(function (d) {
            return <option key={d} value={d}>{d}</option>;
          })}
        </select>
      </div>

      <button
        onClick={function () { updateParam('urgent', urgentOnly ? '' : 'true'); }}
        className={urgentOnly
          ? 'w-full py-2.5 rounded-full text-sm font-bold border-2 border-danger bg-red-50 text-danger'
          : 'w-full py-2.5 rounded-full text-sm font-bold border-2 border-gray-200 text-gray-600'}
      >
        Urgent only
      </button>

      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="w-full py-2.5 rounded-full border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        <div className="mb-8">
          <p className="text-sm font-bold text-primary uppercase tracking-wide mb-1">Volunteer</p>
          <h1 className="text-3xl font-black text-ink">Give Your Time</h1>
          <p className="text-gray-500 mt-1 max-w-2xl">
            Rescue drives, shelter shifts, feeding rounds and medical camps.
            Find work that fits your schedule and skills.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
              <Calendar size={18} className="text-primary" />
            </div>
            <p className="text-xl sm:text-3xl font-black text-ink">{stats.openTasks}</p>
            <p className="text-xs sm:text-sm text-gray-500">Open opportunities</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
              <Users size={18} className="text-primary" />
            </div>
            <p className="text-xl sm:text-3xl font-black text-primary">{stats.totalVolunteers}</p>
            <p className="text-xs sm:text-sm text-gray-500">Volunteers signed up</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
              <Clock size={18} className="text-primary" />
            </div>
            <p className="text-xl sm:text-3xl font-black text-accent">{stats.hoursLogged}</p>
            <p className="text-xs sm:text-sm text-gray-500">Hours contributed</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            onClick={function () { setFiltersOpen(true); }}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm font-bold text-gray-600"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          <select
            value={sort}
            onChange={function (e) { updateParam('sort', e.target.value); }}
            className="ml-auto px-3 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm font-bold text-gray-600 outline-none focus:border-primary"
          >
            {TASK_SORT.map(function (o) {
              return <option key={o.value} value={o.value}>{o.label}</option>;
            })}
          </select>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-[240px] shrink-0">
            <div className="sticky top-[88px] bg-white rounded-2xl border border-gray-100 p-6">
              {filterPanel}
            </div>
          </aside>

          {filtersOpen && (
            <>
              <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={function () { setFiltersOpen(false); }} />
              <div className="lg:hidden fixed right-0 top-0 bottom-0 w-[300px] bg-white z-50 p-6 overflow-y-auto">
                {filterPanel}
              </div>
            </>
          )}

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="py-20"><Spinner size={40} /></div>
            ) : tasks.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                  <Users size={24} className="text-primary" />
                </div>
                <p className="font-bold text-ink mb-1">No opportunities match your filters</p>
                <p className="text-sm text-gray-500 mb-6">Try a different district or type of work.</p>
                <Button variant="outline" size="sm" onClick={clearAll}>Clear filters</Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  {tasks.length} opportunit{tasks.length !== 1 ? 'ies' : 'y'} found
                </p>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {tasks.map(function (t) {
                    return <TaskCard key={t._id} task={t} />;
                  })}
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}