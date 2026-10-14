import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentLang?: 'IS' | 'EN';
  onLanguageChange?: (lang: 'IS' | 'EN') => void;
}

export default function Navbar({ currentLang = 'EN', onLanguageChange }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-[#F0F4FD] border-b border-gray-200/60 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between h-20 items-center">
          
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-black text-gray-900 tracking-tight hover:opacity-80 transition">
              LEIGUHUS
            </Link>
          </div>

          {/* Desktop Right Navigation */}
          <div className="hidden md:flex items-center space-x-6 text-sm">
            
            {/* Language Switcher */}
            <div className="flex items-center space-x-2 text-gray-500 font-medium">
              <span className="text-base">🌐</span>
              <button
                onClick={() => onLanguageChange && onLanguageChange('IS')}
                className={`transition font-semibold ${
                  currentLang === 'IS' ? 'text-gray-900 underline underline-offset-4' : 'hover:text-gray-900'
                }`}
              >
                Íslenska
              </button>
              <span className="text-gray-300">/</span>
              <button
                onClick={() => onLanguageChange && onLanguageChange('EN')}
                className={`transition font-semibold ${
                  currentLang === 'EN' ? 'text-gray-900 underline underline-offset-4' : 'hover:text-gray-900'
                }`}
              >
                English
              </button>
            </div>

            <div className="h-4 w-[1px] bg-gray-300"></div>

            {/* Auth State */}
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'admin' && (
                  <Link
                    to="/admin-dashboard"
                    className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-bold hover:bg-purple-200 transition"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <span className="text-xs font-semibold text-gray-700">
                  {user.name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-red-600 hover:text-red-800 transition"
                >
                  {currentLang === 'IS' ? 'Útskrá' : 'Log Out'}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="font-semibold text-gray-800 hover:text-indigo-600 transition"
              >
                {currentLang === 'IS' ? 'Innskrá' : 'Sign in'}
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 hover:bg-gray-200/50 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#f8f9fc] border-b border-gray-200 px-6 py-4 space-y-4 shadow-lg">
          <div className="flex items-center space-x-3 text-sm font-semibold text-gray-700">
            <button
              onClick={() => onLanguageChange && onLanguageChange('IS')}
              className={`${currentLang === 'IS' ? 'text-gray-900 underline' : 'text-gray-400'}`}
            >
              Íslenska
            </button>
            <span>/</span>
            <button
              onClick={() => onLanguageChange && onLanguageChange('EN')}
              className={`${currentLang === 'EN' ? 'text-gray-900 underline' : 'text-gray-400'}`}
            >
              English
            </button>
          </div>

          <div className="pt-2 border-t border-gray-200">
            {user ? (
              <div className="space-y-3">
                <p className="text-xs text-gray-600 font-medium">{user.name || user.email}</p>
                {user.role === 'admin' && (
                  <Link to="/admin-dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block text-xs font-bold text-purple-700">
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-xs font-bold text-red-600">
                  Log Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center bg-gray-900 text-white py-2.5 rounded-xl text-xs font-bold"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}