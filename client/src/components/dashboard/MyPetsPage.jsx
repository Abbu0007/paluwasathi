import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, ArrowRight } from 'lucide-react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { petService } from '../../services/pet.service';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'pending', label: 'Pending' },
  { value: 'adopted', label: 'Adopted' },
];

const statusVariant = {
  available: 'stable',
  pending: 'high',
  adopted: 'neutral',
};

export default function MyPetsPage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    petService.getListed()
      .then(({ data }) => setPets(data.pets))
      .catch(() => setPets([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? pets : pets.filter((p) => p.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-ink">My Listed Pets</h1>
            <p className="text-gray-500 text-sm">
              Animals your shelter has listed for adoption.
            </p>
          </div>
          <Button variant="primary" icon={Plus} className="shrink-0">
            List a Pet
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
                filter === f.value
                  ? 'border-primary bg-primary-50 text-primary-dark'
                  : 'border-gray-200 text-gray-600 bg-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20"><Spinner size={40} /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <Heart size={24} className="text-primary" />
            </div>
            <p className="font-bold text-ink mb-1">
              {filter === 'all' ? 'No pets listed yet' : `No ${filter} pets`}
            </p>
            <p className="text-sm text-gray-500">
              Pets you list for adoption will appear here.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((pet) => {
              const photos = pet.photos || [];
              return (
                <Link
                  key={pet._id}
                  to={'/adopt/' + pet._id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[4/3] bg-gray-100">
                    {photos[0] ? (
                      <img src={photos[0].url} alt={pet.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-black text-ink">{pet.name}</h3>
                      <Badge variant={statusVariant[pet.status]}>{pet.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {pet.breed} · {pet.gender}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      Waiting {pet.waitingDays} days
                      <ArrowRight size={12} className="ml-auto" />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}