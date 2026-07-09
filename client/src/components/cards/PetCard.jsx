import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Clock } from 'lucide-react';
import Badge from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { petService } from '../../services/pet.service';

export default function PetCard({ pet, saved = false, onSaveChange }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(saved);
  const [busy, setBusy] = useState(false);

  const toggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setBusy(true);
    try {
      if (isSaved) {
        await petService.unsave(pet._id);
        setIsSaved(false);
      } else {
        await petService.save(pet._id);
        setIsSaved(true);
      }
      onSaveChange?.(pet._id, !isSaved);
    } catch {
      // silently fail
    } finally {
      setBusy(false);
    }
  };

  const ageLabel = `${pet.age} ${pet.ageUnit === 'months' ? 'mo' : pet.age === 1 ? 'yr' : 'yrs'}`;
  const isAdopted = pet.status === 'adopted';

  return (
    <Link
      to={`/adopt/${pet._id}`}
      className="block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        {pet.photos?.[0] ? (
          <img
            src={pet.photos[0].url}
            alt={pet.name}
            loading="lazy"
            className={`w-full h-full object-cover ${isAdopted ? 'grayscale opacity-70' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No photo
          </div>
        )}

        <button
          onClick={toggleSave}
          disabled={busy || isAdopted}
          aria-label={isSaved ? 'Remove from saved' : 'Save pet'}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50"
        >
          <Heart
            size={17}
            className={isSaved ? 'fill-danger text-danger' : 'text-gray-400'}
          />
        </button>

        {isAdopted && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-ink text-white px-4 py-1.5 rounded-full text-sm font-bold">
              Adopted
            </span>
          </div>
        )}

        {!isAdopted && pet.waitingDays > 60 && (
          <span className="absolute top-3 left-3 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold">
            Waiting {pet.waitingDays} days
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-black text-ink text-lg">{pet.name}</h3>
          <Badge variant={pet.status === 'available' ? 'stable' : 'neutral'}>
            {pet.gender}
          </Badge>
        </div>

        <p className="text-sm text-gray-500 mb-2">
          {pet.breed} · {ageLabel} · {pet.size}
        </p>

        {pet.traits?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {pet.traits.slice(0, 2).map((t) => (
              <span key={t} className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-dark text-xs font-bold">
                {t}
              </span>
            ))}
            {pet.traits.length > 2 && (
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
                +{pet.traits.length - 2}
              </span>
            )}
          </div>
        )}

        <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{pet.shelter?.name}</span>
        </p>
      </div>
    </Link>
  );
}