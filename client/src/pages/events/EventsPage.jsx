import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Users, CheckCircle2, SlidersHorizontal, X } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import EventCard from '../../components/cards/EventCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { EVENT_CATEGORIES, EVENT_SORT } from '../../constants/event-options';
import { NEPAL_DISTRICTS } from '../../constants/nepal-districts';
import { eventService } from '../../services/event.service';

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ upcoming: 0, attendees: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const district = searchParams.get('district') || '';
  const sort = searchParams.get('sort') || 'soonest';
  const freeOnly = searchParams.get('free') === 'true';

  useEffect(() => {
    eventService.getStats().then(function (res) { setStats(res.data); }).catch(function () {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { sort, limit: 12 };
    if (category) params.category = category;
    if (district) params.district = district;

    eventService.getAll(params)
      .then(function (res) {
        let list = res.data.events;
        if (freeOnly) list = list.filter(function (e) { return e.isFree; });
        setEvents(list);
      })
      .catch(function () { setEvents([]); })
      .finally(function () { setLoading(false); });
  }, [searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const clearAll = () => setSearchParams({});
  const activeCount = (category ? 1 : 0) + (district ? 1 : 0) + (freeOnly ? 1 : 0);

  const filterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between lg:hidden">
        <p className="font-black text-ink">Filters</p>
        <button onClick={function () { setFiltersOpen(false); }} className="text-gray-400">
          <X size={22} />
        </button>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Event type</p>
        <div className="space-y-2">
          <button
            onClick={function () { updateParam('category', ''); }}
            className={!category
              ? 'w-full text-left px-3 py-2 rounded-xl text-sm font-bold bg-primary-50 text-primary-dark'
              : 'w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50'}
          >
            All events
          </button>
          {EVENT_CATEGORIES.map(function (c) {
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
        onClick={function () { updateParam('free', freeOnly ? '' : 'true'); }}
        className={freeOnly
          ? 'w-full py-2.5 rounded-full text-sm font-bold border-2 border-primary bg-primary-50 text-primary-dark'
          : 'w-full py-2.5 rounded-full text-sm font-bold border-2 border-gray-200 text-gray-600'}
      >
        Free events only
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
          <p className="text-sm font-bold text-primary uppercase tracking-wide mb-1">Events</p>
          <h1 className="text-3xl font-black text-ink">What's Happening</h1>
          <p className="text-gray-500 mt-1 max-w-2xl">
            Adoption fairs, vaccination camps, workshops and fundraisers
            organised by verified NGOs across Nepal.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
              <Calendar size={18} className="text-primary" />
            </div>
            <p className="text-xl sm:text-3xl font-black text-ink">{stats.upcoming}</p>
            <p className="text-xs sm:text-sm text-gray-500">Upcoming events</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
              <Users size={18} className="text-primary" />
            </div>
            <p className="text-xl sm:text-3xl font-black text-primary">{stats.attendees}</p>
            <p className="text-xs sm:text-sm text-gray-500">People attending</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
              <CheckCircle2 size={18} className="text-primary" />
            </div>
            <p className="text-xl sm:text-3xl font-black text-accent">{stats.completed}</p>
            <p className="text-xs sm:text-sm text-gray-500">Events held</p>
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
            {EVENT_SORT.map(function (o) {
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
            ) : events.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                  <Calendar size={24} className="text-primary" />
                </div>
                <p className="font-bold text-ink mb-1">No events match your filters</p>
                <p className="text-sm text-gray-500 mb-6">Try a different district or event type.</p>
                <Button variant="outline" size="sm" onClick={clearAll}>Clear filters</Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  {events.length} event{events.length !== 1 ? 's' : ''}
                </p>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {events.map(function (e) {
                    return <EventCard key={e._id} event={e} />;
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