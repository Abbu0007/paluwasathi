import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, FileText, ArrowRight } from 'lucide-react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import PetCard from '../../components/cards/PetCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { petService, adoptionService } from '../../services/pet.service';

const statusVariant = {
  pending: 'new',
  reviewing: 'high',
  approved: 'stable',
  rejected: 'critical',
};

export default function SavedPetsPage() {
  const [tab, setTab] = useState('saved');
  const [savedPets, setSavedPets] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [saved, apps] = await Promise.all([
        petService.getSaved(),
        adoptionService.getMine(),
      ]);
      setSavedPets(saved.data.pets);
      setApplications(apps.data.adoptions);
    } catch {
      // empty states handle it
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSaveChange = (petId, isSaved) => {
    if (!isSaved) setSavedPets((prev) => prev.filter((p) => p._id !== petId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-ink">Saved Pets</h1>
            <p className="text-gray-500 text-sm">
              Pets you've saved and applications you've submitted.
            </p>
          </div>
          <Link to="/adopt" className="shrink-0">
            <Button variant="primary" icon={Heart}>Browse Pets</Button>
          </Link>
        </div>

        <div className="flex gap-1 bg-white p-1 rounded-2xl border border-gray-100 mb-6 w-fit">
          <button
            onClick={() => setTab('saved')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              tab === 'saved' ? 'bg-primary-50 text-primary-dark' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Heart size={16} />
            Wishlist
            <span className="text-xs opacity-60">({savedPets.length})</span>
          </button>
          <button
            onClick={() => setTab('applications')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              tab === 'applications' ? 'bg-primary-50 text-primary-dark' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <FileText size={16} />
            Applications
            <span className="text-xs opacity-60">({applications.length})</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20"><Spinner size={40} /></div>
        ) : tab === 'saved' ? (
          savedPets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                <Heart size={24} className="text-primary" />
              </div>
              <p className="font-bold text-ink mb-1">No saved pets yet</p>
              <p className="text-sm text-gray-500 mb-6">
                Tap the heart on any pet to save them here.
              </p>
              <Link to="/adopt">
                <Button variant="outline" size="sm">Browse Pets</Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {savedPets.map((pet) => (
                <PetCard key={pet._id} pet={pet} saved onSaveChange={handleSaveChange} />
              ))}
            </div>
          )
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-primary" />
            </div>
            <p className="font-bold text-ink mb-1">No applications yet</p>
            <p className="text-sm text-gray-500 mb-6">
              When you apply to adopt, your application will appear here.
            </p>
            <Link to="/adopt">
              <Button variant="outline" size="sm">Find a Pet</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Link
                key={app._id}
                to={`/adopt/application/${app._id}`}
                className="block bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4">
                  {app.pet?.photos?.[0] ? (
                    <img src={app.pet.photos[0].url} alt={app.pet.name}
                      className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gray-100 shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-black text-ink">{app.pet?.name}</p>
                      <Badge variant={statusVariant[app.status]}>{app.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{app.applicationNumber}</p>
                    <p className="text-sm text-gray-500 truncate">{app.pet?.shelter?.name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <ArrowRight size={18} className="text-gray-300 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}