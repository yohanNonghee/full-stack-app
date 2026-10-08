import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
  
      
      // Add a slight delay to the simulation to make it look natural.
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
            <p className="text-sm text-gray-500 mt-1">Have questions? We'd love to hear from you.</p>
          </div>

          {submitted ? (
            /* Displays a message upon successful data submission, along with a button to return to the home page. */
            <div className="text-center py-6 space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Message Sent Successfully!</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Thank you for reaching out. We will get back to you shortly.
                </p>
              </div>

              <Link 
                to="/" 
                className="w-full inline-block bg-indigo-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition transform hover:-translate-y-0.5"
              >
                🏠 Back to Home
              </Link>
            </div>
          ) : (
            /*  contact form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Your Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Yohan Nonghee"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="yohan@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Message</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Write your message here..."
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm transition disabled:opacity-50 mt-2"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}