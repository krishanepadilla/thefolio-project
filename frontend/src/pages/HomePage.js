// frontend/src/pages/HomePage.js
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    API.get('/posts')
      .then(res => setPosts(res.data))
      .catch(() => setError('Failed to load posts. Is the server running?'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="content" style={{ maxWidth: '900px' }}>

      {/* ── Hero ── */}
      <div className="container" style={{ textAlign: 'center', padding: '52px 32px 40px', position: 'relative', overflow: 'hidden' }}>
        {/* Accent stripe */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: 'linear-gradient(90deg, var(--olive), var(--olive-light))',
        }} />

        <p style={{ fontSize: '2.8rem', marginBottom: '12px', lineHeight: 1 }}>✈️</p>
        <h1 style={{ marginBottom: '12px' }}>Travel Journal</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '540px', margin: '0 auto 28px', fontSize: '1.05rem', lineHeight: '1.7' }}>
          The world is a book, and those who do not travel read only one page.
          Explore local gems, share your adventures, and discover stories from fellow travelers.
        </p>

        {user ? (
          <Link to="/create-post" className="btn-publish" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            ✏️ Write a Post
          </Link>
        ) : (
          <Link to="/register" className="btn-publish" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            🌍 Join the Community
          </Link>
        )}
      </div>

      {/* ── Why Travel section ── */}
      <div className="container" style={{ padding: '36px 32px' }}>
        <h2 style={{ marginBottom: '8px' }}>🌏 Why Travel?</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '28px' }}>
          A few reasons to pack your bags today
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '36px',
        }}>
          {[
            { icon: '🧠', title: 'Broadens Your Mind',     desc: 'Stepping outside your comfort zone opens you to new perspectives, cultures, and ways of thinking you never imagined.' },
            { icon: '🤝', title: 'Builds Connections',     desc: 'Every destination brings strangers who become lifelong friends. Shared experiences create bonds that transcend borders.' },
            { icon: '🌄', title: 'Creates Memories',       desc: 'No souvenir lasts longer than a vivid memory. Adventures become stories you tell for the rest of your life.' },
            { icon: '💪', title: 'Builds Resilience',      desc: 'Navigating the unexpected — missed trains, language barriers, wrong turns — teaches you to adapt and stay calm under pressure.' },
            { icon: '🍜', title: 'Discover New Flavors',   desc: 'Food is the fastest way into a culture. Every meal abroad is a tiny adventure for your taste buds.' },
            { icon: '✨', title: 'Reignites Curiosity',    desc: 'Travel reminds you that the world is endlessly interesting. It turns ordinary days into extraordinary ones.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: 'var(--cream-light)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '20px 18px',
              transition: 'var(--transition)',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <p style={{ fontSize: '1.8rem', marginBottom: '10px' }}>{icon}</p>
              <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>{title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: '1.6', margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Quote */}
        <blockquote style={{
          borderLeft: '4px solid var(--olive)',
          margin: '0',
          padding: '18px 24px',
          background: 'var(--olive-pale)',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
        }}>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.15rem',
            fontStyle: 'italic',
            color: 'var(--text-main)',
            lineHeight: '1.7',
            margin: '0 0 10px',
          }}>
            "Twenty years from now you will be more disappointed by the things you didn't do
            than by the ones you did do. So throw off the bowlines, sail away from the safe harbor,
            catch the trade winds in your sails. Explore. Dream. Discover."
          </p>
          <footer style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            — Mark Twain
          </footer>
        </blockquote>
      </div>

      {/* ── Recent Stories ── */}
      <div className="container">
        <h2 style={{ marginBottom: '6px' }}>📝 Recent Stories</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
          Written by travelers like you
        </p>

        {loading && (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Loading posts…</p>
        )}

        {error && (
          <p style={{
            color: 'var(--danger)', background: 'var(--danger-pale)',
            padding: '12px 16px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--danger)',
          }}>
            {error}
          </p>
        )}

        {!loading && !error && posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '2rem', marginBottom: '8px' }}>🗺️</p>
            <p style={{ marginBottom: '12px' }}>No stories yet. Be the first to share one!</p>
            {user && (
              <Link to="/create-post" style={{ color: 'var(--olive)', fontWeight: 'bold' }}>
                Write the first post →
              </Link>
            )}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {posts.map(post => (
            <Link
              key={post._id}
              to={`/posts/${post._id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <article style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'var(--card-bg)',
                transition: 'box-shadow 0.2s, transform 0.2s',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100px',
                    background: 'linear-gradient(135deg, var(--olive), var(--olive-light))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem',
                  }}>
                    🌏
                  </div>
                )}

                <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{
                    margin: '0 0 8px', fontSize: '1.05rem', lineHeight: '1.4',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {post.title}
                  </h3>
                  <p style={{
                    margin: '0 0 12px', color: 'var(--text-muted)', fontSize: '0.88rem',
                    display: '-webkit-box', WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.6', flex: 1,
                  }}>
                    {post.body}
                  </p>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: '0.82rem', color: 'var(--text-muted)',
                    borderTop: '1px solid var(--border-light)', paddingTop: '10px',
                  }}>
                    <span>✍️ {post.author?.name || 'Unknown'}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

    </main>
  );
}

export default HomePage;