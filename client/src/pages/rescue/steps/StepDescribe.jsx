import { ANIMAL_TYPES, CONDITIONS, URGENCY_LEVELS } from '../../../constants/rescue-options';

export default function StepDescribe({ data, onChange }) {
  const toggleCondition = (condition) => {
    const next = data.conditions.includes(condition)
      ? data.conditions.filter((c) => c !== condition)
      : [...data.conditions, condition];
    onChange({ conditions: next });
  };

  return (
    <div>
      <h2 className="text-xl font-black text-ink mb-2">Describe the situation</h2>
      <p className="text-gray-500 text-sm mb-6">
        Help volunteers understand what they're responding to.
      </p>

      {/* Animal type */}
      <label className="block text-sm font-bold text-ink mb-2">Animal type</label>
      <div className="grid grid-cols-3 gap-2 mb-6">
        {ANIMAL_TYPES.map((a) => (
          <button
            key={a.value}
            onClick={() => onChange({ animalType: a.value })}
            className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
              data.animalType === a.value
                ? 'border-primary bg-primary-50 text-primary-dark'
                : 'border-gray-200 text-gray-600'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Conditions */}
      <label className="block text-sm font-bold text-ink mb-2">Condition (select all that apply)</label>
      <div className="flex flex-wrap gap-2 mb-6">
        {CONDITIONS.map((c) => (
          <button
            key={c}
            onClick={() => toggleCondition(c)}
            className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${
              data.conditions.includes(c)
                ? 'border-primary bg-primary-50 text-primary-dark'
                : 'border-gray-200 text-gray-600'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Urgency */}
      <label className="block text-sm font-bold text-ink mb-2">Urgency level</label>
      <div className="space-y-2 mb-6">
        {URGENCY_LEVELS.map((u) => (
          <button
            key={u.value}
            onClick={() => onChange({ urgency: u.value })}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              data.urgency === u.value
                ? 'border-primary bg-primary-50'
                : 'border-gray-200'
            }`}
          >
            <p className="font-bold text-ink">{u.label}</p>
            <p className="text-sm text-gray-500">{u.desc}</p>
          </button>
        ))}
      </div>

      {/* Description */}
      <label className="block text-sm font-bold text-ink mb-2">Additional details</label>
      <textarea
        value={data.description}
        onChange={(e) => onChange({ description: e.target.value })}
        maxLength={500}
        rows={4}
        placeholder="Describe what you see, how the animal is behaving, any landmarks nearby..."
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink resize-none"
      />
      <p className="text-xs text-gray-400 mt-1">{data.description.length}/500</p>

      {/* Contact */}
      <label className="block text-sm font-bold text-ink mb-2 mt-4">Your contact number</label>
      <input
        value={data.contactPhone}
        onChange={(e) => onChange({ contactPhone: e.target.value })}
        placeholder="98XXXXXXXX"
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink"
      />
    </div>
  );
}