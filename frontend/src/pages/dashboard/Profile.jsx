import { useRef, useState } from 'react';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Icon from '../../components/common/Icon/Icon';
import { useAuth } from '../../context/AuthContext';
import { fileUrl } from '../../services/api';
import userService from '../../services/userService';
import '../../styles/dashboard/profile.css';

const MAX_IMAGE_MB = 2;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ROLE_BADGES = {
  admin: 'danger',
  manager: 'info',
  employee: 'success',
};

const ROLE_LABELS = {
  admin: 'Organization Admin',
  manager: 'Department Manager',
  employee: 'Employee',
};

const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

function Profile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', text }
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setForm({ fullName: user.fullName, phone: user.phone.replace('+91', '') });
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
    setFeedback(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
  };

  const handleImagePick = (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-picking the same file
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFeedback({ type: 'error', text: 'Only JPG, PNG or WEBP images are allowed.' });
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setFeedback({ type: 'error', text: `Image must be under ${MAX_IMAGE_MB} MB.` });
      return;
    }
    setFeedback(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const next = {};
    if (form.fullName.trim().length < 2) next.fullName = 'Enter your full name.';
    if (!/^[0-9]{10}$/.test(form.phone)) next.phone = 'Enter a 10-digit phone number.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setFeedback(null);
    try {
      let updated = await userService.updateProfile({
        fullName: form.fullName.trim(),
        phone: form.phone,
      });
      if (imageFile) {
        updated = await userService.uploadProfileImage(imageFile);
      }
      updateUser(updated);
      setEditing(false);
      setImageFile(null);
      setImagePreview(null);
      setFeedback({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const avatarSrc = imagePreview || fileUrl(user.profileImagePath);

  return (
    <div className="profile">
      <Card className="profile__card" padding="lg">
        <div className="profile__top">
          <div className="profile__avatar-wrap">
            {avatarSrc ? (
              <img className="profile__avatar" src={avatarSrc} alt="Profile" />
            ) : (
              <span className="profile__avatar profile__avatar--initials">
                {initialsOf(user.fullName)}
              </span>
            )}
            {editing && (
              <button
                type="button"
                className="profile__avatar-edit"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Change profile image"
              >
                <Icon name="camera" size={17} />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              className="u-visually-hidden"
              onChange={handleImagePick}
              tabIndex={-1}
            />
          </div>

          <div className="profile__identity">
            <h1 className="profile__name">{user.fullName}</h1>
            <p className="profile__email">{user.email}</p>
            <Badge variant={ROLE_BADGES[user.role]}>{ROLE_LABELS[user.role] || user.role}</Badge>
          </div>

          {!editing && (
            <Button
              variant="secondary"
              iconLeft={<Icon name="edit" size={16} />}
              onClick={startEditing}
            >
              Edit profile
            </Button>
          )}
        </div>

        {feedback && (
          <div className={`profile__alert profile__alert--${feedback.type}`}>{feedback.text}</div>
        )}

        {editing ? (
          <form className="profile__form" onSubmit={handleSave} noValidate>
            <div className="profile__grid">
              <Input
                label="Full name"
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                error={errors.fullName}
              />
              <Input
                label="Phone number"
                type="tel"
                prefix="+91"
                maxLength={10}
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value.replace(/\D/g, '') })
                }
                error={errors.phone}
              />
              <Input label="Email" value={user.email} disabled hint="Email can never be changed." />
              <Input label="Role" value={ROLE_LABELS[user.role] || user.role} disabled hint="Roles are managed by admins." />
            </div>
            <div className="profile__actions">
              <Button variant="secondary" type="button" onClick={cancelEditing} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </div>
          </form>
        ) : (
          <dl className="profile__details">
            <div className="profile__detail">
              <dt>Full name</dt>
              <dd>{user.fullName}</dd>
            </div>
            <div className="profile__detail">
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="profile__detail">
              <dt>Phone number</dt>
              <dd>{user.phone}</dd>
            </div>
            <div className="profile__detail">
              <dt>Role</dt>
              <dd className="profile__detail-role">{ROLE_LABELS[user.role] || user.role}</dd>
            </div>
            {user.organizationName && (
              <div className="profile__detail">
                <dt>Organization</dt>
                <dd>{user.organizationName}</dd>
              </div>
            )}
            {user.role === 'admin' && user.organizationCode && (
              <div className="profile__detail" style={{ background: 'rgba(0, 184, 255, 0.08)', borderRadius: 8, padding: '10px 14px', marginTop: 8 }}>
                <dt style={{ color: 'var(--color-secondary)', fontWeight: '700' }}>Organization Code (Share with team)</dt>
                <dd style={{ fontSize: 16, fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--color-secondary-dark)' }}>{user.organizationCode}</dd>
              </div>
            )}
          </dl>
        )}
      </Card>
    </div>
  );
}

export default Profile;
