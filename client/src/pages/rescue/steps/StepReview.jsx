import { MapPin, Phone } from 'lucide-react';
import { ANIMAL_TYPES, URGENCY_LEVELS } from '../../../constants/rescue-options';

export default function StepReview({ data }) {
  const animalLabel = ANIMAL_TYPES.find((a) => a.value === data.animalType)?.label || '—';
  const urgencyLabel = URGENCY_LEVELS.find((u) => u.value === data.urgency)?.label || '—';

  return (
    <div>
      <h2 className="text-xl font-black text-ink mb-2">Review your report</h2>
      <p className="text-gray-500 text-sm mb-6">
        Check everything is correct before submitting.
      </p>

      {data.photos.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-6">
          {data.photos.map((file, i) => (
            <img
              key={i}
              src={URL.createObjectURL(file)}
              alt={`Photo ${i + 1}`}
              className="aspect-square rounded-xl object-cover border border-gray-200"
            />
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
          <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Location</p>
            <p className="text-sm text-ink">{data.location.address || '—'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase">Animal</p>
            <p className="text-sm text-ink font-bold">{animalLabel}</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase">Urgency</p>
            <p className="text-sm text-ink font-bold">{urgencyLabel}</p>
          </div>
        </div>

        {data.conditions.length > 0 && (
          <div className="p-4 rounded-xl bg-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Conditions</p>
            <div className="flex flex-wrap gap-2">
              {data.conditions.map((c) => (
                <span key={c} className="px-3 py-1 rounded-full bg-white text-xs font-bold text-ink border border-gray-200">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.description && (
          <div className="p-4 rounded-xl bg-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase">Details</p>
            <p className="text-sm text-ink">{data.description}</p>
          </div>
        )}

        {data.contactPhone && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
            <Phone size={18} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Contact</p>
              <p className="text-sm text-ink">{data.contactPhone}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}