import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Phone, ArrowLeft, CheckCircle2, Shield, Syringe, Cpu, Calendar, ArrowRight } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import PetCard from '../../components/cards/PetCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { petService } from '../../services/pet.service';

const ADOPTION_STEPS = [
  'Submit application',
  'Shelter reviews',
  'Meet and greet',
  'Home check',
  'Welcome home',
];

export default function PetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [pet, setPet] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [activePhoto, setActivePhoto] = useState(0);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingBusy, setSavingBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    petService.getById(id)
      .then(function (res) {
        setPet(res.data.pet);
        setSimilar(res.data.similar);
        setActivePhoto(0);
      })
      .catch(function () { setPet(null); })
      .finally(function () { setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    petService.getSaved()
      .then(function (res) {
        setSaved(res.data.pets.some(function (p) { return p._id === id; }));
      })
      .catch(function () {});
  }, [id, isAuthenticated]);

  const toggleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSavingBusy(true);
    try {
      if (saved) {
        await petService.unsave(id);
        setSaved(false);
      } else {
        await petService.save(id);
        setSaved(true);
      }
    } catch (e) {
      setSaved(saved);
    }
    setSavingBusy(false);
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/adopt/' + id + '/apply');
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Spinner size={40} />
        </div>
      </PageWrapper>
    );
  }

  if (!pet) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-black text-ink mb-2">Pet not found</h1>
          <p className="text-gray-500 mb-6">This listing does not exist or was removed.</p>
          <Link to="/adopt" className="font-bold text-primary hover:underline">
            Browse all pets
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const shelter = pet.shelter || {};
  const photos = pet.photos || [];
  const traits = pet.traits || [];
  const isAvailable = pet.status === 'available';

  let ageUnitLabel = 'years';
  if (pet.ageUnit === 'months') {
    ageUnitLabel = 'months';
  } else if (pet.age === 1) {
    ageUnitLabel = 'year';
  }
  const ageLabel = pet.age + ' ' + ageUnitLabel;

  const mainImageClass = isAvailable
    ? 'w-full h-full object-cover'
    : 'w-full h-full object-cover grayscale opacity-70';

  const saveBtnClass = saved
    ? 'w-full flex items-center justify-center gap-2 py-3 rounded-full border-2 text-sm font-bold border-danger text-danger bg-red-50 disabled:opacity-50'
    : 'w-full flex items-center justify-center gap-2 py-3 rounded-full border-2 text-sm font-bold border-gray-200 text-gray-600 disabled:opacity-50';

  const medical = [
    { label: 'Vaccinated', value: pet.vaccinated, Icon: Syringe },
    { label: 'Neutered', value: pet.neutered, Icon: Shield },
    { label: 'Microchipped', value: pet.microchipped, Icon: Cpu },
  ];

  const adoptedTitle = pet.name + ' found a home';

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/adopt" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 mb-6">
          <ArrowLeft size={16} /> Back to all pets
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-3">
                {photos[activePhoto] ? (
                  <img src={photos[activePhoto].url} alt={pet.name} className={mainImageClass} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No photo available
                  </div>
                )}
              </div>

              {photos.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {photos.map(function (photo, i) {
                    const thumbClass = activePhoto === i
                      ? 'aspect-square rounded-lg overflow-hidden border-2 border-primary'
                      : 'aspect-square rounded-lg overflow-hidden border-2 border-transparent';
                    return (
                      <button key={i} onClick={function () { setActivePhoto(i); }} className={thumbClass}>
                        <img src={photo.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-black text-ink">{pet.name}</h1>
                  <p className="text-gray-500 mt-1">
                    {pet.breed} · {ageLabel} · {pet.gender} · {pet.size}
                  </p>
                </div>
                {!isAvailable && (
                  <Badge variant="neutral">
                    {pet.status === 'adopted' ? 'Adopted' : 'Pending'}
                  </Badge>
                )}
              </div>

              {traits.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {traits.map(function (t) {
                    return (
                      <span key={t} className="px-3 py-1.5 rounded-full bg-primary-50 text-primary-dark text-sm font-bold">
                        {t}
                      </span>
                    );
                  })}
                </div>
              )}

              <p className="text-gray-600 leading-relaxed mb-6">{pet.description}</p>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar size={14} />
                Waiting {pet.waitingDays} days for a home
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-ink mb-4">Health and Care</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {medical.map(function (item) {
                  const Icon = item.Icon;
                  const boxClass = item.value
                    ? 'flex items-center gap-3 p-4 rounded-xl bg-primary-50'
                    : 'flex items-center gap-3 p-4 rounded-xl bg-gray-50';
                  const iconClass = item.value ? 'text-primary' : 'text-gray-400';
                  const labelClass = item.value ? 'text-sm font-bold text-primary-dark' : 'text-sm font-bold text-gray-500';
                  const valueClass = item.value ? 'text-xs text-primary-dark' : 'text-xs text-gray-400';
                  return (
                    <div key={item.label} className={boxClass}>
                      <Icon size={18} className={iconClass} />
                      <div>
                        <p className={labelClass}>{item.label}</p>
                        <p className={valueClass}>{item.value ? 'Yes' : 'Not yet'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-ink mb-5">How adoption works</h2>
              <div className="space-y-4">
                {ADOPTION_STEPS.map(function (step, i) {
                  return (
                    <div key={step} className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-dark text-sm font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-600">{step}</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="space-y-6">
            <div className="lg:sticky lg:top-[88px] space-y-6">

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                {isAvailable ? (
                  <div>
                    <Button variant="primary" size="lg" className="w-full mb-3" iconRight={ArrowRight} onClick={handleApply}>
                      Apply to Adopt
                    </Button>
                    <button onClick={toggleSave} disabled={savingBusy} className={saveBtnClass}>
                      <Heart size={16} className={saved ? 'fill-danger' : ''} />
                      {saved ? 'Saved to wishlist' : 'Save for later'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle2 size={32} className="text-primary mx-auto mb-3" />
                    <p className="font-bold text-ink mb-1">
                      {pet.status === 'adopted' ? adoptedTitle : 'Application pending'}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      {pet.status === 'adopted' ? 'This pet has been adopted.' : 'Someone has applied for this pet.'}
                    </p>
                    <Link to="/adopt">
                      <Button variant="outline" size="sm" className="w-full">
                        Browse other pets
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Shelter</p>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-ink text-sm truncate">{shelter.name}</p>
                      {shelter.verified && <CheckCircle2 size={14} className="text-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500">{shelter.location}</p>
                  </div>
                </div>

                {shelter.phone && (
                  <a
                    href={'tel:' + shelter.phone}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50"
                  >
                    <Phone size={15} />
                    Call shelter
                  </a>
                )}
              </div>

            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-ink mb-6">
              Other {pet.species}s looking for a home
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {similar.map(function (p) {
                return <PetCard key={p._id} pet={p} />;
              })}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}