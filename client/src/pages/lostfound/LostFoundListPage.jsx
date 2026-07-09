import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Plus, Heart, SlidersHorizontal, X } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import LostFoundCard from '../../components/cards/LostFoundCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { SPECIES_OPTIONS, LF_SORT } from '../../constants/lostfound-options';
import { NEPAL_DISTRICTS } from '../../constants/nepal-districts';
import { lostFoundService } from '../../services/lostfound.service';

export default function LostFoundListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ lost: 0, found: 0, reunited: 0 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const type = searchParams.get('type') || '';
  const species = searchParams.get('species') || '';
  const district = searchParams.get('district') || '';
  const sort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    lostFoundService.getStats().then(function (res) { setStats(res.data); }).catch(function () {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { sort, limit: 12 };
    if (type) params.type = type;
    if (species) params.species = species;
    if (district) params.district = district;

    lostFoundService.getAll(params)
      .then(function (res) { setReports(res.data.reports); })
      .catch(function () { setReports([]); })
      .finally(function () { setLoading(false); });
  }, [searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const clearAll = () => setSearchParams({});
  const activeCount = (type ? 1 : 0) + (species ? 1 : 0) + (district ? 1 : 0);

  const filterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between lg:hidden">
        <p className="font-black text-ink">Filters</p>
        <button onClick={function () { setFiltersOpen(false); }} className="text-gray-400">
          <X size={22} />
        </button>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Report type</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={function () { updateParam('type', ''); }}
            className={!type
              ? 'py-2.5 rounded-xl text-xs font-bold border-2 border-primary bg-primary-50 text-primary-dark'
              : 'py-2.5 rounded-xl text-xs font-bold border-2 border-gray-200 text-gray-600'}
          >
            All
          </button>
          <button
            onClick={function () { updateParam('type', 'lost'); }}
            className={type === 'lost'
              ? 'py-2.5 rounded-xl text-xs font-bold border-2 border-danger bg-red-50 text-danger'
              : 'py-2.5 rounded-xl text-xs font-bold border-2 border-gray-200 text-gray-600'}
          >
            Lost
          </button>
          <button
            onClick={function () { updateParam('type', 'found'); }}
            className={type === 'found'
              ? 'py-2.5 rounded-xl text-xs font-bold border-2 border-primary bg-primary-50 text-primary-dark'
              : 'py-2.5 rounded-xl text-xs font-bold border-2 border-gray-200 text-gray-600'}
          >
            Found
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Animal</p>
        <div className="space-y-2">
          <button
            onClick={function () { updateParam('species', ''); }}
            className={!species
              ? 'w-full text-left px-3 py-2 rounded-xl text-sm font-bold bg-primary-50 text-primary-dark'
              : 'w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50'}
          >
            All animals
          </button>
          {SPECIES_OPTIONS.map(function (s) {
            const active = species === s.value;
            return (
              <button
                key={s.value}
                onClick={function () { updateParam('species', s.value); }}
                className={active
                  ? 'w-full text-left px-3 py-2 rounded-xl text-sm font-bold bg-primary-50 text-primary-dark'
                  : 'w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50'}
              >
                {s.label}
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

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-bold text-primary uppercase tracking-wide mb-1">Lost & Found</p>
            <h1 className="text-3xl font-black text-ink">Reuniting Pets and Families</h1>
            <p className="text-gray-500 mt-1 max-w-2xl">
              Report a missing pet or an animal you have found. We automatically
              match reports within 5km of each other.
            </p>
          </div>
          <Link to="/lost-found/report" className="shrink-0">
            <Button variant="primary" icon={Plus}>Report a Pet</Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <p className="text-xl sm:text-3xl font-black text-danger">{stats.lost}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Currently missing</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <p className="text-xl sm:text-3xl font-black text-ink">{stats.found}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Found, seeking owner</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <p className="text-xl sm:text-3xl font-black text-primary">{stats.reunited}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Reunited</p>
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
            {LF_SORT.map(function (o) {
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
            ) : reports.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-primary" />
                </div>
                <p className="font-bold text-ink mb-1">No reports match your filters</p>
                <p className="text-sm text-gray-500 mb-6">Try a different district or animal type.</p>
                <Button variant="outline" size="sm" onClick={clearAll}>Clear filters</Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  {reports.length} report{reports.length !== 1 ? 's' : ''}
                </p>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {reports.map(function (r) {
                    return <LostFoundCard key={r._id} report={r} />;
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