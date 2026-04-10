import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost]         = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

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

  if (loading) return <div className="content"><p>Loading post...</p></div>;
  if (error)   return <div className="content"><p style={{ color: '#7a1a1a' }}>{error}</p></div>;

  const isOwner = user && post.author?._id === user._id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="content">
      {/* Post Image with error logging */}
      {post.image && (
        <img
          src={`http://localhost:5000/uploads/${post.image}`}
          alt={post.title}
          onError={(e) => {
            console.error("Failed to load image from:", e.target.src);
            e.target.style.border = '2px solid red'; // Visual cue for debugging
          }}
          style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', marginBottom: '24px' }}
        />
      )}

      <h2>{post.title}</h2>
      <p style={{ color: '#8C7E72', fontSize: '0.9rem', marginBottom: '20px' }}>
        By <strong>{post.author?.name}</strong> · {new Date(post.createdAt).toLocaleDateString()}
      </p>

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