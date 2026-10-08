import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          idNumber,
          monthlyIncome: Number(monthlyIncome),
          isVerified: true 
        })
      });

      const data = await response.json();

      if (response.ok) {
        //Automatically log in after successful registration.
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
    console.error(err);
    setError('An error occurred during registration.');
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
            <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
            <p className="text-sm text-gray-500 mt-1">Join Heimili and verify your tenant profile</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Name</label>
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
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">Tenant Verification Info</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">National ID / Passport Number</label>
                  <input 
                    type="text" 
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 123456-7890"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Monthly Income (ISK)</label>
                  <input 
                    type="number" 
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 450000"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm transition disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Register & Verify'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}