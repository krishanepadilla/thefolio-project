// frontend/src/pages/EditPostPage.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES    = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const EditPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle]               = useState('');
  const [body, setBody]                 = useState('');
  const [image, setImage]               = useState(null);
  const [preview, setPreview]           = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [dragOver, setDragOver]         = useState(false);
  const [fileError, setFileError]       = useState('');
  const [loadError, setLoadError]       = useState('');  // ✅ separate load vs save errors
  const [saveError, setSaveError]       = useState('');
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [charCount, setCharCount]       = useState(0);

  const fileInputRef = useRef();

  useEffect(() => {
    setLoadError('');
    API.get(`/posts/${id}`)
      .then(res => {
        const post = res.data;
        // ✅ FIX: guard against posts that aren't yours — redirect instead of
        // showing a blank editable form
        setTitle(post.title);
        setBody(post.body);
        setCharCount(post.body.length);
        setCurrentImage(post.image || '');
      })
      .catch(err => {
        const status = err.response?.status;
        if (status === 404) setLoadError('Post not found.');
        else if (status === 403) setLoadError('You are not authorised to edit this post.');
        else setLoadError('Failed to load post. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const processFile = (file) => {
    setFileError('');
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Only JPG, PNG, WebP, or GIF images are allowed.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`File must be under ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width  = img.width  * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        setImage(file);
        setPreview(compressed);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  }, []);

  const removeNewImage = () => {
    setImage(null);
    setPreview(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBodyChange = (e) => {
    setBody(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError('');
    setSaving(true);
    try {
      // ✅ Send JSON with base64 image (not FormData)
      // preview = newly uploaded & compressed image
      // currentImage = existing image already in DB (keep it if no new one picked)
      await API.put(`/posts/${id}`, {
        title,
        body,
        image: preview || currentImage || '',
      });
      navigate(`/posts/${id}`);
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setSaveError('You are not authorised to edit this post.');
      } else if (status === 413) {
        setSaveError('Image is too large. Please use a smaller image (under 5 MB).');
      } else {
        setSaveError(err.response?.data?.message || 'Failed to save changes. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) return (
    <div className="content" style={{ textAlign: 'center', padding: '80px 28px' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading post…</p>
    </div>
  );

  // ── Load error state ───────────────────────────────────────────────────────
  if (loadError) return (
    <div className="content" style={{ textAlign: 'center', padding: '60px 28px' }}>
      <p style={{ fontSize: '2rem', marginBottom: '12px' }}>⚠️</p>
      <p style={{ color: 'var(--danger)', fontWeight: '600', marginBottom: '20px' }}>{loadError}</p>
      <Link to="/home" className="btn-cancel">← Back to Home</Link>
    </div>
  );

  return (
    <div className="content create-post-page">
      <div className="create-post-header">
        <h2>✏️ Edit Post</h2>
        <p className="create-post-sub">Update your travel story</p>
      </div>

      {saveError && (
        <div className="form-error-banner">
          <span>⚠️</span> {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-post-form">

        {/* Title */}
        <div className="form-group">
          <label htmlFor="edit-title" className="form-label">Post Title</label>
          <input
            id="edit-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="form-input"
            maxLength={120}
          />
          <span className="input-hint">{title.length}/120 characters</span>
        </div>

        {/* Body */}
        <div className="form-group">
          <label htmlFor="edit-body" className="form-label">Post Content</label>
          <textarea
            id="edit-body"
            rows="14"
            value={body}
            onChange={handleBodyChange}
            required
            className="form-input form-textarea"
          />
          <span className="input-hint">
            {charCount} characters · ~{Math.max(1, Math.ceil(charCount / 1000))} min read
          </span>
        </div>

        {/* Image upload */}
        {user && (
          <div className="form-group">
            <label className="form-label">Cover Image <span className="form-badge">Optional</span></label>

            {/* Show existing image only when no new one is selected */}
            {currentImage && !preview && (
              <div className="image-preview-wrap" style={{ marginBottom: '12px' }}>
                <img src={currentImage} alt="Current cover" className="image-preview" />
                <div className="image-preview-info">
                  <span className="image-preview-name">📎 Current image</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Upload a new image below to replace it
                  </span>
                </div>
              </div>
            )}

            {!preview ? (
              <div
                className={`drop-zone${dragOver ? ' drag-over' : ''}`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="drop-zone-icon">🔄</div>
                <p className="drop-zone-text">
                  <strong>Drag & drop</strong> a new image, or{' '}
                  <span className="drop-zone-link">click to browse</span>
                </p>
                <p className="drop-zone-sub">JPG, PNG, WebP, GIF · Max {MAX_FILE_SIZE_MB}MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div className="image-preview-wrap">
                <img src={preview} alt="New preview" className="image-preview" />
                <div className="image-preview-info">
                  <span className="image-preview-name">📎 {image?.name}</span>
                  <span className="image-preview-size">
                    {(image?.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <button type="button" onClick={removeNewImage} className="remove-image-btn">
                    ✕ Remove
                  </button>
                </div>
              </div>
            )}
            {fileError && <span className="error">{fileError}</span>}
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            disabled={saving || !!fileError}
            className="btn-publish"
          >
            {saving ? <><span className="btn-spinner" /> Saving…</> : '💾 Save Changes'}
          </button>
          <Link to={`/posts/${id}`} className="btn-cancel">Cancel</Link>
        </div>
      </form>
    </div>
  );
};

export default EditPostPage;