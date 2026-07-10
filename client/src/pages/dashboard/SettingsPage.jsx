import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Phone, Shield, Camera, Lock,
  Trash2, Check, AlertTriangle, X, Globe,
} from 'lucide-react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { NEPAL_DISTRICTS } from '../../constants/nepal-districts';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/user.service';

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [tab, setTab] = useState('profile');

  const [photo, setPhoto] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  const [form, setForm] = useState({ name: '', district: '', bio: '', website: '' });

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');

  const [del, setDel] = useState({ password: '', confirmation: '' });
  const [deleting, setDeleting] = useState(false);
  const [delErr, setDelErr] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  const isNGO = user && user.role === 'ngo';

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        district: user.district || '',
        bio: user.bio || '',
        website: user.website || '',
      });
    }
  }, [user]);

  const update = (field, value) => {
    setForm(function (prev) {
      return Object.assign({}, prev, { [field]: value });
    });
  };

  const initials = user && user.name
    ? user.name.split(' ').map(function (n) { return n[0]; }).slice(0, 2).join('').toUpperCase()
    : 'U';

  const currentPhoto = user && user.profilePhoto ? user.profilePhoto.url : null;
  const previewUrl = photo ? URL.createObjectURL(photo) : currentPhoto;

  const hasChanges = user && (
    form.name !== (user.name || '') ||
    form.district !== (user.district || '') ||
    form.bio !== (user.bio || '') ||
    form.website !== (user.website || '') ||
    photo !== null
  );

  const handleSaveProfile = async () => {
    setProfileErr('');
    setProfileMsg('');
    setSavingProfile(true);

    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('district', form.district);
      fd.append('bio', form.bio);
      if (isNGO) fd.append('website', form.website);
      if (photo) fd.append('photos', photo);

      const res = await userService.updateProfile(fd);
      updateUser(res.data.user);
      setPhoto(null);
      setProfileMsg('Profile updated.');
      setTimeout(function () { setProfileMsg(''); }, 3000);
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      setProfileErr(msg || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRemovePhoto = async () => {
    const confirmed = window.confirm('Remove your profile photo?');
    if (!confirmed) return;

    try {
      const res = await userService.removePhoto();
      updateUser(res.data.user);
      setPhoto(null);
    } catch {
      setProfileErr('Failed to remove photo.');
    }
  };

  const handleChangePassword = async () => {
    setPwErr('');
    setPwMsg('');

    if (pw.next !== pw.confirm) {
      setPwErr('New passwords do not match.');
      return;
    }

    setSavingPw(true);
    try {
      await userService.changePassword(pw.current, pw.next);
      setPw({ current: '', next: '', confirm: '' });
      setPwMsg('Password changed successfully.');
      setTimeout(function () { setPwMsg(''); }, 4000);
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      setPwErr(msg || 'Failed to change password.');
    } finally {
      setSavingPw(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDelErr('');
    setDeleting(true);

    try {
      await userService.deleteAccount(del.password, del.confirmation);
      logout();
      navigate('/');
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      setDelErr(msg || 'Failed to delete account.');
      setDeleting(false);
    }
  };

  const pwValid = pw.current && pw.next.length >= 8 && pw.confirm;
  const delValid = del.password && del.confirmation === 'DELETE';

  const lockedFields = [
    { label: 'Email', value: user && user.email, Icon: Mail },
    { label: 'Phone', value: user && user.phone, Icon: Phone },
  ];

  const TABS = [
    { value: 'profile', label: 'Profile' },
    { value: 'security', label: 'Security' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-black text-ink mb-1">Settings</h1>
          <p className="text-gray-500 text-sm mb-6">
            Manage your account details and security.
          </p>

          <div className="flex gap-1 bg-white p-1 rounded-2xl border border-gray-100 mb-6 w-fit">
            {TABS.map(function (t) {
              const active = tab === t.value;
              return (
                <button
                  key={t.value}
                  onClick={function () { setTab(t.value); }}
                  className={active
                    ? 'px-6 py-2.5 rounded-xl text-sm font-bold bg-primary-50 text-primary-dark'
                    : 'px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50'}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {tab === 'profile' && (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <h2 className="font-bold text-ink mb-5">Profile photo</h2>

                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt=""
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                      />
                    ) : (
                      <span className="w-20 h-20 rounded-full bg-primary text-white text-2xl font-black flex items-center justify-center">
                        {initials}
                      </span>
                    )}
                    <button
                      onClick={function () { fileRef.current.click(); }}
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center border-2 border-white hover:bg-gray-800"
                      aria-label="Change photo"
                    >
                      <Camera size={14} />
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={function (e) { setPhoto(e.target.files[0]); }}
                      className="hidden"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-ink">{user && user.name}</p>
                    <p className="text-sm text-gray-500 capitalize mb-3">{user && user.role}</p>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={function () { fileRef.current.click(); }}
                        className="px-3 py-1.5 rounded-full border-2 border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                      >
                        {currentPhoto || photo ? 'Change photo' : 'Upload photo'}
                      </button>

                      {photo && (
                        <button
                          onClick={function () { setPhoto(null); }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full border-2 border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50"
                        >
                          <X size={12} /> Undo
                        </button>
                      )}

                      {currentPhoto && !photo && (
                        <button
                          onClick={handleRemovePhoto}
                          className="px-3 py-1.5 rounded-full border-2 border-gray-200 text-xs font-bold text-danger hover:bg-red-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {photo && (
                  <p className="text-xs text-accent font-bold mt-4">
                    Photo selected. Save changes below to apply.
                  </p>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 space-y-5">
                <h2 className="font-bold text-ink">Your details</h2>

                {profileErr && (
                  <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3">{profileErr}</div>
                )}
                {profileMsg && (
                  <div className="flex items-center gap-2 bg-primary-50 text-primary-dark text-sm rounded-xl p-3">
                    <Check size={16} /> {profileMsg}
                  </div>
                )}

                <Input
                  label={isNGO ? 'Organisation name' : 'Full name'}
                  value={form.name}
                  onChange={function (e) { update('name', e.target.value); }}
                />

                <div>
                  <label className="block text-sm font-bold text-ink mb-2">District</label>
                  <select
                    value={form.district}
                    onChange={function (e) { update('district', e.target.value); }}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary bg-white text-ink outline-none"
                  >
                    <option value="">Select district</option>
                    {NEPAL_DISTRICTS.map(function (d) {
                      return <option key={d} value={d}>{d}</option>;
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink mb-2">
                    {isNGO ? 'About your organisation' : 'Bio'}
                  </label>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={form.bio}
                    onChange={function (e) { update('bio', e.target.value); }}
                    placeholder={isNGO
                      ? 'What does your organisation do? This appears on your public profile.'
                      : 'A short introduction, shown alongside your community posts.'}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">{form.bio.length}/500</p>
                </div>

                {isNGO && (
                  <div>
                    <label className="block text-sm font-bold text-ink mb-2">Website</label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={form.website}
                        onChange={function (e) { update('website', e.target.value); }}
                        placeholder="https://example.org"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    loading={savingProfile}
                    disabled={!hasChanges}
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <h2 className="font-bold text-ink mb-1">Login details</h2>
                <p className="text-xs text-gray-500 mb-5">
                  These identify your account. Changing them requires re-verification,
                  which is not yet available.
                </p>

                <div className="space-y-3">
                  {lockedFields.map(function (f) {
                    const Icon = f.Icon;
                    return (
                      <div key={f.label} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                        <Icon size={18} className="text-gray-400 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-400 uppercase">{f.label}</p>
                          <p className="text-sm text-ink truncate">{f.value || '—'}</p>
                        </div>
                        <Lock size={14} className="text-gray-300 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-ink mb-4">Account status</h2>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-primary-50">
                  <Shield size={18} className="text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-primary-dark">
                      {user && user.isVerified ? 'Verified account' : 'Unverified'}
                    </p>
                    <p className="text-xs text-primary-dark/70">
                      {user && user.isVerified
                        ? 'Your phone number has been verified.'
                        : 'Please verify your phone number.'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'security' && (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 space-y-5">
                <div>
                  <h2 className="font-bold text-ink">Change password</h2>
                  <p className="text-xs text-gray-500">
                    You will stay logged in on this device.
                  </p>
                </div>

                {pwErr && (
                  <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3">{pwErr}</div>
                )}
                {pwMsg && (
                  <div className="flex items-center gap-2 bg-primary-50 text-primary-dark text-sm rounded-xl p-3">
                    <Check size={16} /> {pwMsg}
                  </div>
                )}

                <Input
                  label="Current password"
                  type="password"
                  value={pw.current}
                  onChange={function (e) { setPw(Object.assign({}, pw, { current: e.target.value })); }}
                />

                <div>
                  <Input
                    label="New password"
                    type="password"
                    value={pw.next}
                    onChange={function (e) { setPw(Object.assign({}, pw, { next: e.target.value })); }}
                  />
                  <p className="text-xs text-gray-400 mt-1">At least 8 characters</p>
                </div>

                <div>
                  <Input
                    label="Confirm new password"
                    type="password"
                    value={pw.confirm}
                    onChange={function (e) { setPw(Object.assign({}, pw, { confirm: e.target.value })); }}
                  />
                  {pw.confirm && pw.next !== pw.confirm && (
                    <p className="text-xs text-danger mt-1">Passwords do not match</p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    icon={Lock}
                    loading={savingPw}
                    disabled={!pwValid}
                    onClick={handleChangePassword}
                  >
                    Change Password
                  </Button>
                </div>
              </div>

              {!isNGO && (
                <div className="bg-white rounded-2xl border-2 border-danger p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle size={20} className="text-danger shrink-0 mt-0.5" />
                    <div>
                      <h2 className="font-bold text-ink">Delete account</h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        This permanently removes your account, saved pets, and posts.
                        Rescue cases and donations you have made remain, since they
                        belong to the record of what happened.
                      </p>
                    </div>
                  </div>

                  {!showDelete ? (
                    <button
                      onClick={function () { setShowDelete(true); }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-danger text-danger text-sm font-bold hover:bg-red-50"
                    >
                      <Trash2 size={15} /> Delete my account
                    </button>
                  ) : (
                    <div className="space-y-4 pt-2">
                      {delErr && (
                        <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3">{delErr}</div>
                      )}

                      <Input
                        label="Confirm your password"
                        type="password"
                        value={del.password}
                        onChange={function (e) { setDel(Object.assign({}, del, { password: e.target.value })); }}
                      />

                      <div>
                        <label className="block text-sm font-bold text-ink mb-2">
                          Type DELETE to confirm
                        </label>
                        <input
                          value={del.confirmation}
                          onChange={function (e) { setDel(Object.assign({}, del, { confirmation: e.target.value })); }}
                          placeholder="DELETE"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-danger outline-none text-ink"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={function () {
                            setShowDelete(false);
                            setDel({ password: '', confirmation: '' });
                            setDelErr('');
                          }}
                          className="text-sm font-bold text-gray-400 hover:text-gray-600"
                        >
                          Cancel
                        </button>
                        <Button
                          variant="danger"
                          icon={Trash2}
                          loading={deleting}
                          disabled={!delValid}
                          onClick={handleDeleteAccount}
                        >
                          Permanently Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isNGO && (
                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-start gap-3">
                    <Shield size={20} className="text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <h2 className="font-bold text-ink text-sm">Organisation account</h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Verified organisations cannot be self-deleted, because pets,
                        campaigns, and adoption records depend on them. Contact
                        support if you need to close this account.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}