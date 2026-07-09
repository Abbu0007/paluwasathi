import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, X, ArrowLeft, Camera } from 'lucide-react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { SPECIES, SIZES, TRAITS } from '../../constants/pet-options';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const SPECIES_OPTIONS = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'bird', label: 'Bird' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'other', label: 'Other' },
];

export default function ListPetPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef();

  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    ageUnit: 'years',
    gender: '',
    size: 'medium',
    traits: [],
    vaccinated: false,
    neutered: false,
    microchipped: false,
    description: '',
    shelterLocation: user?.district || '',
    shelterPhone: user?.phone || '',
  });

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTrait = (trait) => {
    setForm((prev) => ({
      ...prev,
      traits: prev.traits.includes(trait)
        ? prev.traits.filter((t) => t !== trait)
        : [...prev.traits, trait],
    }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setPhotos([...photos, ...files].slice(0, 8));
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const isValid =
    form.name &&
    form.species &&
    form.age &&
    form.gender &&
    form.description &&
    photos.length > 0;

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('species', form.species);
      formData.append('breed', form.breed || 'Mixed');
      formData.append('age', form.age);
      formData.append('ageUnit', form.ageUnit);
      formData.append('gender', form.gender);
      formData.append('size', form.size);
      formData.append('traits', JSON.stringify(form.traits));
      formData.append('vaccinated', form.vaccinated);
      formData.append('neutered', form.neutered);
      formData.append('microchipped', form.microchipped);
      formData.append('description', form.description);
      formData.append('shelter', JSON.stringify({
        name: user?.name,
        location: form.shelterLocation,
        phone: form.shelterPhone,
        verified: true,
      }));

      photos.forEach((file) => formData.append('photos', file));

      const { data } = await api.post('/pets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/adopt/' + data.pet._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to list pet. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl">
          <Link to="/dashboard/my-pets" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 mb-4">
            <ArrowLeft size={16} /> Back to my pets
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-black text-ink">List a Pet for Adoption</h1>
            <p className="text-gray-500 text-sm">
              Add an animal from your shelter to the adoption gallery.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3 mb-4">{error}</div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
            <h2 className="font-bold text-ink mb-4">Photos</h2>

            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
                <Upload size={22} className="text-primary" />
              </div>
              <p className="font-bold text-ink text-sm">Tap to upload photos</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG or WEBP · up to 8 photos</p>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                className="hidden"
              />
            </div>

            <button
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 mt-3 text-sm font-bold text-primary"
            >
              <Camera size={16} /> Use camera
            </button>

            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-5">
                {photos.map((file, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                    >
                      <X size={13} />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-3">{photos.length}/8 photos</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 space-y-5">
            <h2 className="font-bold text-ink">Basic Details</h2>

            <Input label="Pet name" value={form.name}
              onChange={(e) => update('name', e.target.value)} placeholder="e.g. Bruno" />

            <div>
              <label className="block text-sm font-bold text-ink mb-2">Species</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {SPECIES_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => update('species', s.value)}
                    className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                      form.species === s.value
                        ? 'border-primary bg-primary-50 text-primary-dark'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <Input label="Breed" value={form.breed}
              onChange={(e) => update('breed', e.target.value)}
              placeholder="e.g. Nepali Street Dog (leave blank for Mixed)" />

            <div className="grid grid-cols-2 gap-3">
              <Input label="Age" type="number" min="0" value={form.age}
                onChange={(e) => update('age', e.target.value)} />
              <div>
                <label className="block text-sm font-bold text-ink mb-2">Unit</label>
                <div className="grid grid-cols-2 gap-2">
                  {['months', 'years'].map((u) => (
                    <button
                      key={u}
                      onClick={() => update('ageUnit', u)}
                      className={`py-3 rounded-xl text-sm font-bold border-2 capitalize transition-all ${
                        form.ageUnit === u
                          ? 'border-primary bg-primary-50 text-primary-dark'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">Gender</label>
              <div className="grid grid-cols-2 gap-2">
                {['male', 'female'].map((g) => (
                  <button
                    key={g}
                    onClick={() => update('gender', g)}
                    className={`py-2.5 rounded-xl text-sm font-bold border-2 capitalize transition-all ${
                      form.gender === g
                        ? 'border-primary bg-primary-50 text-primary-dark'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">Size</label>
              <div className="grid grid-cols-3 gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => update('size', s.value)}
                    className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                      form.size === s.value
                        ? 'border-primary bg-primary-50 text-primary-dark'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
            <h2 className="font-bold text-ink mb-4">Personality</h2>
            <label className="block text-sm font-bold text-ink mb-2">Traits</label>
            <div className="flex flex-wrap gap-2">
              {TRAITS.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTrait(t)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
                    form.traits.includes(t)
                      ? 'border-primary bg-primary-50 text-primary-dark'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
            <h2 className="font-bold text-ink mb-4">Health</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.vaccinated}
                  onChange={(e) => update('vaccinated', e.target.checked)}
                  className="w-4 h-4 accent-[#40916C]" />
                <span className="text-sm text-gray-600">Vaccinated</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.neutered}
                  onChange={(e) => update('neutered', e.target.checked)}
                  className="w-4 h-4 accent-[#40916C]" />
                <span className="text-sm text-gray-600">Neutered / Spayed</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.microchipped}
                  onChange={(e) => update('microchipped', e.target.checked)}
                  className="w-4 h-4 accent-[#40916C]" />
                <span className="text-sm text-gray-600">Microchipped</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
            <h2 className="font-bold text-ink mb-4">Description</h2>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={5}
              maxLength={1000}
              placeholder="Tell adopters about this animal — their story, personality, and what kind of home they need."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{form.description.length}/1000</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 space-y-4">
            <h2 className="font-bold text-ink">Shelter Contact</h2>
            <div className="p-4 rounded-xl bg-primary-50">
              <p className="text-xs font-bold text-primary-dark uppercase">Listing as</p>
              <p className="font-bold text-primary-dark">{user?.name}</p>
            </div>

            <Input label="Shelter location" value={form.shelterLocation}
              onChange={(e) => update('shelterLocation', e.target.value)}
              placeholder="e.g. Chobhar, Kathmandu" />

            <Input label="Contact phone" value={form.shelterPhone}
              onChange={(e) => update('shelterPhone', e.target.value)}
              placeholder="98XXXXXXXX" />
          </div>

          <div className="flex items-center justify-between gap-4">
            <Link to="/dashboard/my-pets" className="text-sm font-bold text-gray-400 hover:text-gray-600">
              Cancel
            </Link>
            <Button
              variant="primary"
              size="lg"
              loading={submitting}
              disabled={!isValid}
              onClick={handleSubmit}
            >
              List Pet for Adoption
            </Button>
          </div>

          {!isValid && (
            <p className="text-xs text-gray-400 text-right mt-2">
              Name, species, age, gender, description and at least one photo are required.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}