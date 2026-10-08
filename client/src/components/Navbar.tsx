import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Desktop Nav */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold tracking-wide">
              <span>heimili</span>
            </Link>
            <nav className="hidden md:flex space-x-6 text-sm font-medium text-gray-600">
              <Link to="/" className="hover:text-indigo-600 transition">Rentals</Link>
              <Link to="/about" className="hover:text-indigo-600 transition">About</Link>
              <Link to="/contact" className="hover:text-indigo-600 transition">Contact</Link>
            </nav>
          </div>

          {/* Desktop Right Actions (Login / Sign Up or User Profile) */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">Hi, {user?.name || 'User'}</span>
                {user?.isVerified && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">Verified</span>
                )}
                <button 
                  onClick={logout}
                  className="text-sm font-medium text-red-600 hover:text-red-800 transition"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition">
                  Log In
                </Link>
                <Link to="/register" className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none p-2"
              aria-label="Toggle Menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-4 space-y-3">
          <Link 
            to="/" 
            onClick={() => setIsOpen(false)}
            className="block text-gray-700 hover:text-indigo-600 font-medium py-1"
          >
            Rentals
          </Link>
          <Link 
            to="/about" 
            onClick={() => setIsOpen(false)}
            className="block text-gray-700 hover:text-indigo-600 font-medium py-1"
          >
            About
          </Link>
          <Link 
            to="/contact" 
            onClick={() => setIsOpen(false)}
            className="block text-gray-700 hover:text-indigo-600 font-medium py-1"
          >
            Contact
          </Link>
          <hr className="my-2" />
          {isAuthenticated ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Signed in as {user?.name}</p>
              <button 
                onClick={() => { logout(); setIsOpen(false); }}
                className="w-full text-left text-sm font-medium text-red-600 py-1"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 pt-1">
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="text-center text-sm font-medium text-indigo-600 border border-indigo-600 py-2 rounded-lg"
              >
                Log In
              </Link>
              <Link 
                to="/register" 
                onClick={() => setIsOpen(false)}
                className="text-center text-sm font-medium text-white bg-indigo-600 py-2 rounded-lg shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}