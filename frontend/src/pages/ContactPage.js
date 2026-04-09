import { useState } from 'react';
import API from '../api/axios';

function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) newErrors.name = "Full name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email format.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        // '/contact' is correct if your axios baseURL already ends with '/api'
        // e.g. baseURL: 'http://localhost:5000/api'
        await API.post('/contact', formData);

        alert(`Thank you for the recommendation, ${formData.name}!`);
        setFormData({ name: '', email: '', message: '' });
      } catch (err) {
        console.error("Submission Error:", err.response?.data);
        alert("Failed: " + (err.response?.data?.message || "Server Error"));
      }
    }
  };

  return (
    <main className="content">
      <div className="container">
        <h1>Let's Connect</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {errors.name && <span className="error" style={{ color: 'red' }}>{errors.name}</span>}

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {errors.email && <span className="error" style={{ color: 'red' }}>{errors.email}</span>}

          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            rows="4"
            placeholder="Tell me about a cool local spot..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />

          <button type="submit" id="newcolor">Send Recommendation</button>
        </form>
      </div>

      <div className="container" style={{ marginTop: '20px' }}>
        <h2>Travel Resources</h2>
        <table>
          <tbody>
            <tr>
              <td><a href="https://share.google/pYQxPRUL83I1mjklM" target="_blank" rel="noreferrer">Provincial Government of La Union</a></td>
              <td>Official site for Provincial Government of La Union.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default ContactPage;