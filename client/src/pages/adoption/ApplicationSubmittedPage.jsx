import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Phone, MapPin, ArrowLeft, Clock } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { adoptionService } from '../../services/pet.service';

const STAGES = [
  { key: 'pending', label: 'Submitted' },
  { key: 'reviewing', label: 'Under Review' },
  { key: 'approved', label: 'Approved' },
];

const statusVariant = {
  pending: 'new',
  reviewing: 'high',
  approved: 'stable',
  rejected: 'critical',
};

export default function ApplicationSubmittedPage() {
  const { id } = useParams();
  const location = useLocation();
  const justCreated = location.state && location.state.justCreated;

  const [adoption, setAdoption] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adoptionService.getById(id)
      .then(function (res) { setAdoption(res.data.adoption); })
      .catch(function () { setAdoption(null); })
      .finally(function () { setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Spinner size={40} />
        </div>
      </PageWrapper>
    );
  }

  if (!adoption) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-black text-ink mb-2">Application not found</h1>
          <Link to="/dashboard/saved-pets" className="font-bold text-primary hover:underline">
            View your applications
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const pet = adoption.pet || {};
  const shelter = pet.shelter || {};
  const photos = pet.photos || [];
  const personal = adoption.personal || {};
  const home = adoption.home || {};
  const lifestyle = adoption.lifestyle || {};

  const isRejected = adoption.status === 'rejected';
  const currentStage = STAGES.findIndex(function (s) { return s.key === adoption.status; });
  const submittedDate = new Date(adoption.createdAt).toLocaleDateString();
  const rejectNote = adoption.reviewNote || 'The shelter has decided to proceed with another applicant.';

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {justCreated && (
          <div className="bg-primary-50 rounded-2xl p-5 mb-6 flex items-start gap-3">
            <CheckCircle2 size={24} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-primary-dark">Application submitted</p>
              <p className="text-sm text-primary-dark mt-0.5">
                {shelter.name} will review your application and contact you within 3 to 5 days.
              </p>
            </div>
          </div>
        )}

        <Link to="/dashboard/saved-pets" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 mb-6">
          <ArrowLeft size={16} /> My applications
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Application Number</p>
              <h1 className="text-xl font-black text-ink">{adoption.applicationNumber}</h1>
            </div>
            <Badge variant={statusVariant[adoption.status]}>{adoption.status}</Badge>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
            {photos[0] && (
              <img src={photos[0].url} alt={pet.name} className="w-20 h-20 rounded-xl object-cover" />
            )}
            <div className="min-w-0">
              <p className="font-black text-ink text-lg">{pet.name}</p>
              <p className="text-sm text-gray-500">{pet.breed} · {pet.gender}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <MapPin size={12} /> {shelter.name}
              </p>
            </div>
          </div>
        </div>

        {isRejected ? (
          <div className="bg-red-50 rounded-2xl p-6 mb-6">
            <p className="font-bold text-red-700 mb-1">Application not successful</p>
            <p className="text-sm text-red-700">{rejectNote}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="font-bold text-ink mb-6">Application Progress</h2>
            <div className="flex justify-between">
              {STAGES.map(function (stage, i) {
                const done = i <= currentStage;
                const circleClass = done
                  ? 'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-primary text-white'
                  : 'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-gray-100 text-gray-400';
                const labelClass = done
                  ? 'text-xs mt-2 text-center text-ink font-bold'
                  : 'text-xs mt-2 text-center text-gray-400';
                return (
                  <div key={stage.key} className="flex flex-col items-center flex-1">
                    <span className={circleClass}>
                      {i < currentStage ? <CheckCircle2 size={18} /> : i + 1}
                    </span>
                    <span className={labelClass}>{stage.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-ink mb-4">Submitted Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Applicant</span>
              <span className="font-bold text-ink">{personal.fullName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Contact</span>
              <span className="font-bold text-ink">{personal.phone}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Home type</span>
              <span className="font-bold text-ink capitalize">{home.homeType}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Activity level</span>
              <span className="font-bold text-ink capitalize">{lifestyle.activityLevel}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Submitted</span>
              <span className="font-bold text-ink flex items-center gap-1">
                <Clock size={12} />
                {submittedDate}
              </span>
            </div>
          </div>
        </div>

        {shelter.phone && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Shelter Contact</p>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-bold text-ink text-sm truncate">{shelter.name}</p>
                <p className="text-xs text-gray-500">{shelter.location}</p>
              </div>
              <a
                href={'tel:' + shelter.phone}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-white text-sm font-bold shrink-0"
              >
                <Phone size={15} /> Call
              </a>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/dashboard/saved-pets" className="flex-1">
            <Button variant="primary" className="w-full">View My Applications</Button>
          </Link>
          <Link to="/adopt" className="flex-1">
            <Button variant="outline" className="w-full">Browse More Pets</Button>
          </Link>
        </div>

      </div>
    </PageWrapper>
  );
}