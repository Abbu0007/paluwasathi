import { useRef } from 'react';
import { Upload, X, Camera } from 'lucide-react';

export default function StepPhotos({ photos, onChange }) {
  const inputRef = useRef();

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    const combined = [...photos, ...files].slice(0, 5);
    onChange(combined);
  };

  const removePhoto = (index) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2 className="text-xl font-black text-ink mb-2">Add photos of the animal</h2>
      <p className="text-gray-500 text-sm mb-6">
        Clear photos help volunteers assess the situation. Up to 5 photos.
      </p>

      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-primary transition-colors"
      >
        <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
          <Upload size={24} className="text-primary" />
        </div>
        <p className="font-bold text-ink">Tap to upload photos</p>
        <p className="text-sm text-gray-400 mt-1">JPG, PNG or WEBP — max 10MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
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
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-6">
          {photos.map((file, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
              <img
                src={URL.createObjectURL(file)}
                alt={`Upload ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">{photos.length}/5 photos added</p>
    </div>
  );
}