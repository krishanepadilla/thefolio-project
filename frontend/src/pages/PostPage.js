import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost]             = useState(null);
  const [comments, setComments]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [deleting, setDeleting]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    Promise.all([
      API.get(`/posts/${id}`),
      API.get(`/comments/${id}`),
    ])
      .then(([postRes, commentRes]) => {
        setPost(postRes.data);
        setComments(commentRes.data);
      })
      .catch(() => setError('Post not found or server error.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/posts/${id}`);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post.');
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  if (loading) return <div className="content"><p>Loading post...</p></div>;
  if (error)   return <div className="content"><p style={{ color: '#7a1a1a' }}>{error}</p></div>;

  const isOwner = user && post.author?._id === user._id;
  const isAdmin = user?.role === 'admin';
  const canModify = isOwner || isAdmin;

  return (
    <div className="content">

      {/* Cover image */}
      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          style={{
            width: '100%',
            maxHeight: '360px',
            objectFit: 'cover',
            borderRadius: '12px',
            marginBottom: '28px',
            display: 'block',
          }}
        />
      )}

      {/* Title + meta */}
      <h2 style={{ marginBottom: '6px' }}>{post.title}</h2>
      <p style={{ color: '#8C7E72', fontSize: '0.9rem', marginBottom: '20px' }}>
        By <strong>{post.author?.name}</strong> · {new Date(post.createdAt).toLocaleDateString()}
      </p>

      {/* ── Owner / Admin action bar ── */}
      {canModify && (
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '28px',
          padding: '14px 16px',
          background: 'rgba(71,85,34,0.06)',
          borderRadius: '10px',
          border: '1px solid rgba(71,85,34,0.15)',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.82rem', color: '#8C7E72', marginRight: 'auto' }}>
            {isAdmin && !isOwner ? '🛡️ Admin controls' : '✍️ Your post'}
          </span>

          {/* Edit button */}
          <Link
            to={`/posts/${id}/edit`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              background: '#475522',
              color: '#E2DCD6',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#354018'}
            onMouseLeave={e => e.currentTarget.style.background = '#475522'}
          >
            ✏️ Edit
          </Link>

          {/* Delete button */}
          <button
            onClick={() => setShowConfirm(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              background: 'transparent',
              color: '#b33030',
              border: '1.5px solid #b33030',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#b33030';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#b33030';
            }}
          >
            🗑️ Delete
          </button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: 'var(--content-bg, #fff)',
            borderRadius: '14px',
            padding: '32px 28px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '2rem', marginBottom: '10px' }}>🗑️</p>
            <h3 style={{ margin: '0 0 10px' }}>Delete this post?</h3>
            <p style={{ color: '#8C7E72', fontSize: '0.92rem', marginBottom: '24px' }}>
              This action cannot be undone. The post will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: '1.5px solid #ccc',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#b33030',
                  color: '#fff',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post body */}
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', marginBottom: '24px' }}>
        {post.body}
      </div>

      <div style={{ marginTop: '32px' }}>
        <Link to="/home" style={{ color: '#054349', fontWeight: 'bold' }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PostPage;