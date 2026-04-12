// frontend/src/pages/ProfilePage.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const ProfilePage = () => {
  const { user, setUser } = useAuth();

  const [name, setName]             = useState(user?.name || '');
  const [bio, setBio]               = useState(user?.bio  || '');
  const [picPreview, setPicPreview] = useState(null);

  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');

  const [profileMsg, setProfileMsg]         = useState('');
  const [profileError, setProfileError]     = useState('');
  const [passMsg, setPassMsg]               = useState('');
  const [passError, setPassError]           = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading]       = useState(false);

  const picSrc = picPreview || user?.profilePic || null;

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width  = img.width  * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setPicPreview(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    setProfileLoading(true);
    try {
      const payload = { name, bio };
      if (picPreview) payload.profilePic = picPreview;
      const { data } = await API.put('/auth/profile', payload);
      setUser(data);
      setPicPreview(null);
      setProfileMsg('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setPassMsg('');
    setPassError('');
    if (newPw.length < 8) {
      setPassError('New password must be at least 8 characters.');
      return;
    }
    setPassLoading(true);
    try {
      await API.put('/auth/change-password', { currentPassword: curPw, newPassword: newPw });
      setPassMsg('Password changed successfully!');
      setCurPw('');
      setNewPw('');
    } catch (err) {
      setPassError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPassLoading(false);
    }
  };

  const roleColor = {
    admin:  { bg: 'rgba(220,38,38,0.10)',  color: 'var(--danger)', label: 'Admin'  },
    member: { bg: 'rgba(29,78,216,0.10)',  color: 'var(--olive)',  label: 'Member' },
  };
  const badge = roleColor[user?.role] || roleColor.member;

  return (
    <div className="content" style={{ maxWidth: '680px' }}>

      {/* Hero card */}
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)',
        padding: '36px 28px 28px', textAlign: 'center',
        marginBottom: '24px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: 'linear-gradient(90deg, var(--olive), var(--olive-light))',
        }} />

        {picSrc ? (
          <img src={picSrc} alt="Profile" style={{
            width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover',
            border: '3px solid var(--olive)', boxShadow: 'var(--shadow-md)',
            margin: '0 auto 16px',
          }} />
        ) : (
          <div style={{
            width: '96px', height: '96px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--olive), var(--olive-light))',
            color: '#fff', fontSize: '2.4rem', fontFamily: "'Playfair Display', serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '3px solid var(--olive)', boxShadow: 'var(--shadow-md)',
            margin: '0 auto 16px',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        )}

        <h2 style={{ marginBottom: '4px' }}>{user?.name}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>{user?.email}</p>

        {user?.bio && (
          <p style={{
            color: 'var(--text-body)', fontSize: '0.92rem',
            maxWidth: '420px', margin: '0 auto 14px', lineHeight: '1.6',
          }}>{user.bio}</p>
        )}

        <span style={{
          display: 'inline-block', padding: '3px 14px', borderRadius: '999px',
          background: badge.bg, color: badge.color, fontSize: '0.78rem',
          fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase',
          border: `1px solid ${badge.color}`,
        }}>{badge.label}</span>
      </div>

      {/* Edit Profile */}
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)',
        padding: '28px', marginBottom: '20px',
      }}>
        <h3 style={{ marginBottom: '20px' }}>✏️ Edit Profile</h3>

        {profileMsg && (
          <div style={{ padding: '10px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', background: 'var(--success-pale)', border: '1px solid var(--success)', color: 'var(--success)', fontWeight: '600', fontSize: '0.9rem' }}>
            ✅ {profileMsg}
          </div>
        )}
        {profileError && (
          <div style={{ padding: '10px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', background: 'var(--danger-pale)', border: '1px solid var(--danger)', color: 'var(--danger)', fontWeight: '600', fontSize: '0.9rem' }}>
            ⚠️ {profileError}
          </div>
        )}

        <form onSubmit={handleProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label htmlFor="p-name" className="form-label">Display Name</label>
            <input id="p-name" className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your display name" />
          </div>

          <div className="form-group">
            <label htmlFor="p-bio" className="form-label">Short Bio</label>
            <textarea id="p-bio" className="form-input form-textarea" rows="3" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." />
          </div>

          <div className="form-group">
            <label className="form-label">Profile Picture</label>
            <label htmlFor="p-pic" style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 16px', border: '2px dashed var(--border-light)',
              borderRadius: 'var(--radius-md)', background: 'var(--cream-light)',
              cursor: 'pointer', transition: 'var(--transition)',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--olive)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
            >
              {picPreview ? (
                <img src={picPreview} alt="Preview" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>📷</div>
              )}
              <div>
                <p style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '0.9rem', margin: 0 }}>
                  {picPreview ? 'New picture selected — click to change' : 'Click to upload a photo'}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '2px 0 0' }}>JPG, PNG, WebP · Recommended 400×400px</p>
              </div>
              <input id="p-pic" type="file" accept="image/*" onChange={handlePicChange} style={{ display: 'none' }} />
            </label>
          </div>

          <div>
            <button type="submit" disabled={profileLoading} className="btn-publish" style={{ minWidth: '150px' }}>
              {profileLoading ? <><span className="btn-spinner" /> Saving…</> : '💾 Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)',
        padding: '28px',
      }}>
        <h3 style={{ marginBottom: '20px' }}>🔒 Change Password</h3>

        {passMsg && (
          <div style={{ padding: '10px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', background: 'var(--success-pale)', border: '1px solid var(--success)', color: 'var(--success)', fontWeight: '600', fontSize: '0.9rem' }}>
            ✅ {passMsg}
          </div>
        )}
        {passError && (
          <div style={{ padding: '10px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', background: 'var(--danger-pale)', border: '1px solid var(--danger)', color: 'var(--danger)', fontWeight: '600', fontSize: '0.9rem' }}>
            ⚠️ {passError}
          </div>
        )}

        <form onSubmit={handlePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label htmlFor="cur-pw" className="form-label">Current Password</label>
            <input id="cur-pw" type="password" className="form-input" placeholder="Enter your current password" value={curPw} onChange={e => setCurPw(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="new-pw" className="form-label">New Password</label>
            <input id="new-pw" type="password" className="form-input" placeholder="At least 8 characters" value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={8} />
            {newPw.length > 0 && (
              <span className="input-hint" style={{ color: newPw.length >= 8 ? 'var(--success)' : 'var(--danger)' }}>
                {newPw.length >= 8 ? '✓ Strong enough' : `${8 - newPw.length} more character${8 - newPw.length > 1 ? 's' : ''} needed`}
              </span>
            )}
          </div>

          <div>
            <button type="submit" disabled={passLoading} className="btn-publish" style={{ minWidth: '180px' }}>
              {passLoading ? <><span className="btn-spinner" /> Updating…</> : '🔑 Update Password'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default ProfilePage;