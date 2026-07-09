import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';
import StepPhotos from './steps/StepPhotos';
import StepLocation from './steps/StepLocation';
import StepDescribe from './steps/StepDescribe';
import StepReview from './steps/StepReview';
import { useRescueDraft } from '../../hooks/useRescueDraft';
import api from '../../services/api';

const STEPS = ['Photos', 'Location', 'Describe', 'Review'];

export default function RescueReportPage() {
  const navigate = useNavigate();
  const { draft, updateDraft, restoreDraft, clearDraft, hasSavedDraft } = useRescueDraft();
  const [step, setStep] = useState(0);
  const [showDraftPrompt, setShowDraftPrompt] = useState(hasSavedDraft);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canProceed = () => {
    if (step === 1) return draft.location.lat && draft.location.address;
    if (step === 2) return draft.animalType && draft.urgency;
    return true;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('lat', draft.location.lat);
      formData.append('lng', draft.location.lng);
      formData.append('address', draft.location.address);
      formData.append('animalType', draft.animalType);
      formData.append('urgency', draft.urgency);
      formData.append('conditions', JSON.stringify(draft.conditions));
      formData.append('description', draft.description);
      formData.append('contactPhone', draft.contactPhone);
      draft.photos.forEach((file) => formData.append('photos', file));

      const { data } = await api.post('/rescues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearDraft();
      navigate(`/rescue/${data.rescue._id}`, { state: { justCreated: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Draft restore prompt */}
        {showDraftPrompt && (
          <div className="bg-primary-50 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-primary-dark font-medium">
              You have an unfinished report. Continue where you left off?
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => { restoreDraft(); setShowDraftPrompt(false); }}
                className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold"
              >
                Continue
              </button>
              <button
                onClick={() => { clearDraft(); setShowDraftPrompt(false); }}
                className="px-3 py-1.5 rounded-full bg-white text-gray-600 text-xs font-bold border border-gray-200"
              >
                Start Fresh
              </button>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-primary' : 'text-gray-300'}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i < step ? 'bg-primary text-white'
                  : i === step ? 'bg-primary-50 text-primary border-2 border-primary'
                  : 'bg-gray-100 text-gray-400'
                }`}>
                  {i < step ? <Check size={16} /> : i + 1}
                </span>
                <span className="hidden sm:inline text-sm font-bold">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-primary' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mt-6">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3 mb-4">{error}</div>
          )}

          {step === 0 && (
            <StepPhotos
              photos={draft.photos}
              onChange={(photos) => updateDraft({ photos })}
            />
          )}
          {step === 1 && (
            <StepLocation
              location={draft.location}
              onChange={(location) => updateDraft({ location })}
            />
          )}
          {step === 2 && (
            <StepDescribe
              data={draft}
              onChange={(updates) => updateDraft(updates)}
            />
          )}
          {step === 3 && <StepReview data={draft} />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          {step > 0 ? (
            <Button variant="ghost" icon={ArrowLeft} onClick={handleBack}>
              Back
            </Button>
          ) : (
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm font-bold text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <Button
              variant="primary"
              iconRight={ArrowRight}
              disabled={!canProceed()}
              onClick={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              loading={submitting}
              onClick={handleSubmit}
            >
              Submit Report
            </Button>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}