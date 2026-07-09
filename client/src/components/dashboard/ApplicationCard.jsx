import { useState } from 'react';
import {
  Phone, Mail, MapPin, Home, Users, Clock,
  ChevronDown, ChevronUp, Check, X,
} from 'lucide-react';
import Badge from '../ui/Badge';

const statusVariant = {
  pending: 'new',
  reviewing: 'high',
  approved: 'stable',
  rejected: 'critical',
};

export default function ApplicationCard({ application, onDecision, busy }) {
  const [expanded, setExpanded] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [note, setNote] = useState('');

  const pet = application.pet || {};
  const applicant = application.applicant || {};
  const personal = application.personal || {};
  const home = application.home || {};
  const lifestyle = application.lifestyle || {};
  const photos = pet.photos || [];

  const isPending = ['pending', 'reviewing'].includes(application.status);
  const appliedDate = new Date(application.createdAt).toLocaleDateString();

  const handleApprove = () => onDecision(application._id, 'approved');

  const handleReject = () => {
    onDecision(application._id, 'rejected', note || 'Thank you for applying. We have decided to proceed with another applicant.');
    setShowReject(false);
    setNote('');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          {photos[0] ? (
            <img src={photos[0].url} alt={pet.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="min-w-0">
                <p className="font-black text-ink">{pet.name}</p>
                <p className="text-xs text-gray-400">{application.applicationNumber}</p>
              </div>
              <Badge variant={statusVariant[application.status]}>{application.status}</Badge>
            </div>

            <p className="text-sm text-gray-600 mt-2">
              Applicant: <span className="font-bold text-ink">{personal.fullName || applicant.name}</span>
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
              <Clock size={12} /> Applied {appliedDate}
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 mt-4 py-2 rounded-xl text-sm font-bold text-primary hover:bg-primary-50 transition-colors"
        >
          {expanded ? 'Hide details' : 'View full application'}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 sm:p-5 space-y-5 bg-gray-50">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Contact</p>
            <div className="space-y-2">
              <a href={'tel:' + personal.phone} className="flex items-center gap-2 text-sm text-ink hover:text-primary">
                <Phone size={14} className="text-gray-400" />
                {personal.phone}
              </a>
              <a href={'mailto:' + personal.email} className="flex items-center gap-2 text-sm text-ink hover:text-primary">
                <Mail size={14} className="text-gray-400" />
                {personal.email}
              </a>
              <p className="flex items-start gap-2 text-sm text-ink">
                <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                <span>{personal.address}, {personal.district}</span>
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Home</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-400">Type</p>
                <p className="text-sm font-bold text-ink capitalize">{home.homeType}</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-400">Own or rent</p>
                <p className="text-sm font-bold text-ink capitalize">{home.ownOrRent}</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-400">Household</p>
                <p className="text-sm font-bold text-ink">{home.householdSize} people</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-400">Yard</p>
                <p className="text-sm font-bold text-ink">{home.hasYard ? 'Yes' : 'No'}</p>
              </div>
            </div>
            {home.hasChildren && (
              <p className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                <Users size={14} className="text-gray-400" />
                Children in the home
              </p>
            )}
            {home.currentPets && (
              <div className="bg-white rounded-xl p-3 mt-3">
                <p className="text-xs text-gray-400 mb-1">Current pets</p>
                <p className="text-sm text-ink">{home.currentPets}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Lifestyle</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-400">Hours alone</p>
                <p className="text-sm font-bold text-ink">{lifestyle.hoursAlone} hrs/day</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-400">Activity level</p>
                <p className="text-sm font-bold text-ink capitalize">{lifestyle.activityLevel}</p>
              </div>
            </div>

            {lifestyle.experience && (
              <div className="bg-white rounded-xl p-3 mb-3">
                <p className="text-xs text-gray-400 mb-1">Experience</p>
                <p className="text-sm text-ink">{lifestyle.experience}</p>
              </div>
            )}

            <div className="bg-white rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Why they want to adopt</p>
              <p className="text-sm text-ink leading-relaxed">{lifestyle.reason}</p>
            </div>
          </div>

          {application.reviewNote && (
            <div className="bg-white rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Review note</p>
              <p className="text-sm text-ink">{application.reviewNote}</p>
            </div>
          )}
        </div>
      )}

      {isPending && (
        <div className="border-t border-gray-100 p-4 sm:p-5">
          {showReject ? (
            <div className="space-y-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Reason for rejection (optional, shown to applicant)"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink text-sm resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  disabled={busy}
                  className="flex-1 py-2.5 rounded-full bg-danger text-white text-sm font-bold disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => setShowReject(false)}
                  className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 text-sm font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleApprove}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                <Check size={16} />
                {busy ? 'Processing...' : 'Approve'}
              </button>
              <button
                onClick={() => setShowReject(true)}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 disabled:opacity-50"
              >
                <X size={16} />
                Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}