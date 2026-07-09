import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search, Heart } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import PetCard from '../../components/cards/PetCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { SPECIES, SIZES, TRAITS, SORT_OPTIONS } from '../../constants/pet-options';
import { petService } from '../../services/pet.service';
import { useAuth } from '../../context/AuthContext';

export default function AdoptionGalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [pets, setPets] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [stats, setStats] = useState({ available: 0, adopted: 0 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const species = searchParams.get('species')?.split(',').filter(Boolean) || [];
  const sizes = searchParams.get('size')?.split(',').filter(Boolean) || [];
  const traits = searchParams.get('traits')?.split(',').filter(Boolean) || [];
  const gender = searchParams.get('gender') || '';
  const sort = searchParams.get('sort') || 'newest';
  const search = searchParams.get('search') || '';
  const page = Number(searchParams.get('page')) || 1;

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    petService.getStats().then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    petService.getSaved()
      .then(({ data }) => setSavedIds(data.pets.map((p) => p._id)))
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    setLoading(true);
    const params = { page, sort };
    if (species.length) params.species = species.join(',');
    if (sizes.length) params.size = sizes.join(',');
    if (traits.length) params.traits = traits.join(',');
    if (gender) params.gender = gender;
    if (search) params.search = search;

    petService.getAll(params)
      .then(({ data }) => {
        setPets(data.pets);
        setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
      })
      .catch(() => setPets([]))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || (Array.isArray(value) && value.length === 0)) {
      next.delete(key);
    } else {
      next.set(key, Array.isArray(value) ? value.join(',') : value);
    }
    next.delete('page');
    setSearchParams(next);
  };

  const toggleArrayParam = (key, current, value) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateParam(key, next);
  };

  const clearAll = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const activeCount = species.length + sizes.length + traits.length + (gender ? 1 : 0) + (search ? 1 : 0);

  const handleSaveChange = (petId, isSaved) => {
    setSavedIds((prev) => (isSaved ? [...prev, petId] : prev.filter((id) => id !== petId)));
  };

  const filterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between lg:hidden">
        <p className="font-black text-ink">Filters</p>
        <button onClick={() => setFiltersOpen(false)} className="text-gray-400">
          <X size={22} />
        </button>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Animal Type</p>
        <div className="space-y-2">
          {SPECIES.map((s) => (
            <label key={s.value} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={species.includes(s.value)}
                onChange={() => toggleArrayParam('species', species, s.value)}
                className="w-4 h-4 accent-[#40916C]"
              />
              <span className="text-sm text-gray-600">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Gender</p>
        <div className="flex gap-2">
          {['', 'male', 'female'].map((g) => (
            <button
              key={g || 'any'}
              onClick={() => updateParam('gender', g)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 capitalize transition-all ${
                gender === g
                  ? 'border-primary bg-primary-50 text-primary-dark'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              {g || 'Any'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Size</p>
        <div className="space-y-2">
          {SIZES.map((s) => (
            <label key={s.value} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={sizes.includes(s.value)}
                onChange={() => toggleArrayParam('size', sizes, s.value)}
                className="w-4 h-4 accent-[#40916C]"
              />
              <span className="text-sm text-gray-600">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Traits</p>
        <div className="flex flex-wrap gap-2">
          {TRAITS.map((t) => (
            <button
              key={t}
              onClick={() => toggleArrayParam('traits', traits, t)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                traits.includes(t)
                  ? 'border-primary bg-primary-50 text-primary-dark'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
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
        <div className="mb-8">
          <p className="text-sm font-bold text-primary uppercase tracking-wide mb-1">Adoption</p>
          <h1 className="text-3xl font-black text-ink">Find Your Companion</h1>
          <p className="text-gray-500 mt-1">
            {stats.available} animals waiting for a home · {stats.adopted} already adopted
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && updateParam('search', searchInput)}
              placeholder="Search by name or breed"
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink bg-white"
            />
          </div>
          <button
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 rounded-xl border-2 border-gray-200 bg-white text-sm font-bold text-gray-600"
          >
            <SlidersHorizontal size={16} />
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-[260px] shrink-0">
            <div className="sticky top-[88px] bg-white rounded-2xl border border-gray-100 p-6">
              {filterPanel}
            </div>
          </aside>

          {filtersOpen && (
            <>
              <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setFiltersOpen(false)} />
              <div className="lg:hidden fixed right-0 top-0 bottom-0 w-[300px] bg-white z-50 p-6 overflow-y-auto">
                {filterPanel}
              </div>
            </>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {loading ? 'Loading...' : `${pagination.total} pet${pagination.total !== 1 ? 's' : ''} found`}
              </p>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="px-3 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm font-bold text-gray-600 outline-none focus:border-primary"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="py-20"><Spinner size={40} /></div>
            ) : pets.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                  <Heart size={24} className="text-primary" />
                </div>
                <p className="font-bold text-ink mb-1">No pets match your filters</p>
                <p className="text-sm text-gray-500 mb-6">Try widening your search.</p>
                <Button variant="outline" size="sm" onClick={clearAll}>Clear filters</Button>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  {pets.map((pet) => (
                    <PetCard
                      key={pet._id}
                      pet={pet}
                      saved={savedIds.includes(pet._id)}
                      onSaveChange={handleSaveChange}
                    />
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => updateParam('page', String(p))}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                          pagination.page === p
                            ? 'bg-primary text-white'
                            : 'bg-white border-2 border-gray-200 text-gray-600'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}