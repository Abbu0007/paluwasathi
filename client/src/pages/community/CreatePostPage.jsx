import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { POST_TYPES, SUGGESTED_TAGS } from '../../constants/community-options';
import { communityService } from '../../services/community.service';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const inputRef = useRef();

  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [customTag, setCustomTag] = useState('');

  const [form, setForm] = useState({
    type: '',
    title: '',
    content: '',
    tags: [],
  });

  const update = (field, value) => {
    setForm(function (prev) {
      return Object.assign({}, prev, { [field]: value });
    });
  };

  const toggleTag = (t) => {
    setForm(function (prev) {
      const next = prev.tags.includes(t)
        ? prev.tags.filter(function (x) { return x !== t; })
        : prev.tags.concat([t]).slice(0, 5);
      return Object.assign({}, prev, { tags: next });
    });
  };

  const addCustomTag = () => {
    const clean = customTag.trim().toLowerCase().replace(/\s+/g, '-');
    if (!clean || form.tags.includes(clean) || form.tags.length >= 5) return;
    update('tags', form.tags.concat([clean]));
    setCustomTag('');
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(photos.concat(files).slice(0, 4));
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter(function (_, i) { return i !== index; }));
  };

  const isValid = form.type && form.title.trim().length >= 5 && form.content.trim().length >= 20;

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('type', form.type);
      fd.append('title', form.title.trim());
      fd.append('content', form.content.trim());
      fd.append('tags', JSON.stringify(form.tags));
      photos.forEach(function (file) { fd.append('photos', file); });

      const res = await communityService.create(fd);
      navigate('/community/' + res.data.post._id);
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      setError(msg || 'Failed to publish post.');
      setSubmitting(false);
    }
  };

  const placeholders = {
    story: 'Tell us what happened. The details matter more than the polish.',
    tip: 'What have you learned that others should know? Be specific.',
    question: 'What are you trying to figure out? Include what you have already tried.',
    update: 'Share news, results, or progress from your organisation.',
  };

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/community" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 mb-6">
          <ArrowLeft size={16} /> Back to community
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-black text-ink">Write a Post</h1>
          <p className="text-gray-500 text-sm">
            Share a story, ask a question, or pass on something you have learned.
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3 mb-4">{error}</div>}

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <label className="block text-sm font-bold text-ink mb-3">What kind of post?</label>
          <div className="grid sm:grid-cols-2 gap-3">
            {POST_TYPES.map(function (t) {
              const active = form.type === t.value;
              return (
                <button
                  key={t.value}
                  onClick={function () { update('type', t.value); }}
                  className={active
                    ? 'text-left p-4 rounded-xl border-2 border-primary bg-primary-50'
                    : 'text-left p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300'}
                >
                  <p className="font-black text-ink text-sm">{t.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {form.type && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 space-y-5">
              <Input
                label="Title"
                value={form.title}
                onChange={function (e) { update('title', e.target.value); }}
                placeholder="A clear, specific headline"
                maxLength={150}
              />
              <p className="text-xs text-gray-400 -mt-3">{form.title.length}/150</p>

              <div>
                <label className="block text-sm font-bold text-ink mb-2">Your post</label>
                <textarea
                  rows={12}
                  maxLength={5000}
                  value={form.content}
                  onChange={function (e) { update('content', e.target.value); }}
                  placeholder={placeholders[form.type]}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-400">
                    {form.content.length < 20
                      ? 'At least 20 characters'
                      : 'Blank lines create paragraphs'}
                  </p>
                  <p className="text-xs text-gray-400">{form.content.length}/5000</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
              <h2 className="font-bold text-ink mb-4">Photos (optional)</h2>
              <div
                onClick={function () { inputRef.current.click(); }}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
              >
                <Upload size={20} className="text-primary mx-auto mb-2" />
                <p className="font-bold text-ink text-sm">Add photos</p>
                <p className="text-xs text-gray-400 mt-1">Up to 4</p>
                <input ref={inputRef} type="file" accept="image/*" multiple
                  onChange={handleFiles} className="hidden" />
              </div>

              {photos.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {photos.map(function (file, i) {
                    return (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={function () { removePhoto(i); }}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <h2 className="font-bold text-ink mb-1">Tags</h2>
              <p className="text-xs text-gray-400 mb-4">Up to 5. Helps people find your post.</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {SUGGESTED_TAGS.map(function (t) {
                  const active = form.tags.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={function () { toggleTag(t); }}
                      className={active
                        ? 'px-3 py-1.5 rounded-full text-xs font-bold border-2 border-primary bg-primary-50 text-primary-dark'
                        : 'px-3 py-1.5 rounded-full text-xs font-bold border-2 border-gray-200 text-gray-600'}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <input
                  value={customTag}
                  onChange={function (e) { setCustomTag(e.target.value); }}
                  onKeyDown={function (e) { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }}
                  placeholder="Add your own tag"
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink text-sm"
                />
                <button
                  onClick={addCustomTag}
                  disabled={!customTag.trim() || form.tags.length >= 5}
                  className="px-4 rounded-xl border-2 border-gray-200 text-gray-600 disabled:opacity-40"
                >
                  <Plus size={16} />
                </button>
              </div>

              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
                  {form.tags.map(function (t) {
                    return (
                      <span key={t} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold">
                        {t}
                        <button onClick={function () { toggleTag(t); }}>
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <Link to="/community" className="text-sm font-bold text-gray-400 hover:text-gray-600">
                Cancel
              </Link>
              <Button variant="primary" size="lg" loading={submitting} disabled={!isValid} onClick={handleSubmit}>
                Publish Post
              </Button>
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}