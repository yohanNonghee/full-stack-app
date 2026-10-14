import React, { useState, useEffect } from 'react';
import PropertyDetailModal from '../components/PropertyDetailModal';
import RentalRequestModal from '../components/RentalRequestModal';
import LoginPromptModal from '../components/LoginPromptModal';
import Footer from '../components/Footer';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Favorites state for heart icons
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});

  // Search filter states
  const [locationQuery, setLocationQuery] = useState('');
  const [roomsQuery, setRoomsQuery] = useState('');
  const [maxPriceQuery, setMaxPriceQuery] = useState('');

  // Modal Control States
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

 const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/properties');
      if (res.ok) {
        const data: Property[] = await res.json();
        
      // Filter for rooms where showOnHome is not false (i.e., selected to be displayed on the home page).
        const homeProperties = data.filter(p => p.showOnHome !== false);
        
        setProperties(homeProperties);
        setFilteredProperties(homeProperties);
      }
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
    }
  };
  // Toggle favorite status
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal on heart click
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Handle Search Filtering
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let result = properties;

    if (locationQuery.trim()) {
      const query = locationQuery.trim().toLowerCase();

      if (query.includes(',')) {
        const [inputLat, inputLng] = query.split(',').map(v => parseFloat(v.trim()));
        if (!isNaN(inputLat) && !isNaN(inputLng)) {
          result = result.filter(p =>
            p.lat && p.lng &&
            Math.abs(p.lat - inputLat) < 0.05 &&
            Math.abs(p.lng - inputLng) < 0.05
          );
        }
      } else {
        result = result.filter(p => p.location?.toLowerCase().includes(query));
      }
    }

    if (roomsQuery) {
      result = result.filter(p => p.rooms === Number(roomsQuery));
    }
    if (maxPriceQuery) {
      result = result.filter(p => p.rent <= Number(maxPriceQuery));
    }

    setFilteredProperties(result);
  };

  // Double-click handler to open detailed modal
  const handleDoubleClickProperty = (prop: Property) => {
    setSelectedProperty(prop);
    setIsDetailOpen(true);
  };

  // Guarded rental request action: check if user is logged in
  const handleRentClick = (prop: Property) => {
    setSelectedProperty(prop);
    setIsDetailOpen(false);

    if (!user) {
      setIsLoginPromptOpen(true);
    } else {
      setIsRequestOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">

      {/* 1. Hero Section */}
      <section className="bg-[#f8f9fc] border-b border-gray-200/60 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight">
            Find your next apartment
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-normal">
            Comfortable apartments. Flexible rentals.
          </p>

          {/* Search Bar Box Container (Original Minimal Style) */}
          <form
            onSubmit={handleSearch}
            className="mt-10 bg-white p-4 rounded-2xl shadow-lg border border-gray-200/80 grid grid-cols-1 md:grid-cols-4 gap-4 items-center text-left"
          >
            {/* Location Input */}
            <div className="p-2 border border-gray-200 rounded-xl hover:border-gray-400 transition">
              <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1">
                Location
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-lg">📍</span>
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Choose an area"
                  className="w-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Rooms Select */}
            <div className="p-2 border border-gray-200 rounded-xl hover:border-gray-400 transition">
              <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1">
                Rooms
              </label>
              <select
                value={roomsQuery}
                onChange={(e) => setRoomsQuery(e.target.value)}
                className="w-full text-sm text-gray-800 focus:outline-none bg-transparent cursor-pointer"
              >
                <option value="">All rooms</option>
                <option value="1">1 room</option>
                <option value="2">2 rooms</option>
                <option value="3">3 rooms</option>
                <option value="4">4+ rooms</option>
              </select>
            </div>

            {/* Max Price Input */}
            <div className="p-2 border border-gray-200 rounded-xl hover:border-gray-400 transition">
              <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1">
                Max price
              </label>
              <input
                type="number"
                value={maxPriceQuery}
                onChange={(e) => setMaxPriceQuery(e.target.value)}
                placeholder="Price in ISK"
                className="w-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full h-full bg-[#1e40af] text-white py-3.5 px-6 rounded-xl text-sm font-bold hover:bg-[#1e3a8a] shadow-md transition"
              >
                Search apartments
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 2. Main Listing Section */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 flex-1 w-full">

        {/* Header Link */}
        <div className="flex justify-end items-center mb-6">
          <Link
            to="/apartments"
            className="text-xs font-semibold text-gray-900 hover:text-indigo-600 transition flex items-center gap-1"
          >
            View apartments →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-sm text-gray-500 font-semibold">
            Loading properties...
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200 p-8">
            <p className="text-gray-600 text-sm font-medium">No apartments match your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((prop) => {
              const propId = prop._id || prop.title;
              const isFav = favorites[propId];

              return (
                <div
                  key={propId}
                  onDoubleClick={() => handleDoubleClickProperty(prop)}
                  className="bg-white border border-gray-300 rounded-none overflow-hidden cursor-pointer group flex flex-col hover:border-gray-500 transition-all duration-200"
                >
                  {/* Property Image / Area Placeholder */}
                  <div className="h-64 w-full bg-[#e5e7eb] relative overflow-hidden">
                    {prop.images?.[0] ? (
                      <img
                        src={prop.images[0]}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>

                  {/* Property Info Container */}
                  <div className="p-5 border-t border-gray-300 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Location Badge & Lat/Lng Coordinates */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                          📍 {prop.location || 'Reykjavík'}
                        </span>
                        {prop.lat !== undefined && prop.lng !== undefined && (
                          <span className="text-[10px] font-mono text-gray-400">
                            {prop.lat.toFixed(4)}, {prop.lng.toFixed(4)}
                          </span>
                        )}
                      </div>

                      {/* Price & Favorite Heart Icon */}
                      <div className="flex justify-between items-start">
                        <p className="text-lg font-extrabold text-gray-900">
                          {prop.rent?.toLocaleString()} ISK<span className="text-sm font-normal text-gray-600">/month</span>
                        </p>
                        <button
                          onClick={(e) => toggleFavorite(propId, e)}
                          className="text-gray-900 hover:scale-110 transition p-1"
                          aria-label="Save apartment"
                        >
                          <svg
                            className="w-6 h-6"
                            fill={isFav ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="1.8"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-base font-bold text-gray-900 mt-0.5">{prop.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 leading-snug line-clamp-2">
                        {prop.description || 'A cozy apartment in the heart of the city.'}
                      </p>
                    </div>

                    {/* Apply Button */}
                    <div className="pt-4 mt-2 flex items-center justify-between border-t border-gray-100">
                      <span className="text-xs text-gray-400">Double click for details</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRentClick(prop);
                        }}
                        className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-600 transition"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 3. Steps / Features Section */}
      <section className="border-t border-gray-200 py-20 px-6 sm:px-8 lg:px-12 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">

          {/* Step 1 */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#e5e7eb] flex items-center justify-center text-gray-900 shadow-sm mb-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Choose an apartment</h3>
            <p className="text-sm text-gray-500 font-normal max-w-xs leading-relaxed">
              Find an apartment that suits you.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#e5e7eb] flex items-center justify-center text-gray-900 shadow-sm mb-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Book</h3>
            <p className="text-sm text-gray-500 font-normal max-w-xs leading-relaxed">
              Select your dates and confirm.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#e5e7eb] flex items-center justify-center text-gray-900 shadow-sm mb-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Move in</h3>
            <p className="text-sm text-gray-500 font-normal max-w-xs leading-relaxed">
              Just bring your bags and settle in.
            </p>
          </div>

        </div>
      </section>

      {/* 4. Testimonials & Trust Section (Exact Match to Reference Image) */}
      <section className="py-20 px-6 sm:px-8 lg:px-12 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto space-y-12">

          {/* Reviews Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Review 1: Jón */}
            <div className="bg-[#f0f4fa] p-8 rounded-none flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <p className="text-lg font-extrabold text-gray-900">“Easy to find and book”</p>
                {/* 5 Stars Rating */}
                <div className="flex space-x-1 text-gray-900">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-base text-gray-500 font-medium">Jón</p>
            </div>

            {/* Review 2: Aníta */}
            <div className="bg-[#f0f4fa] p-8 rounded-none flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <p className="text-lg font-extrabold text-gray-900">“Great selection and service”</p>
                {/* 5 Stars Rating */}
                <div className="flex space-x-1 text-gray-900">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-base text-gray-500 font-medium">Aníta</p>
            </div>

          </div>

          {/* Trust Guarantee Statements */}
          <div className="text-center space-y-2 pt-4">
            <h3 className="text-xl font-extrabold text-gray-900">Good service.</h3>
            <p className="text-lg text-gray-500 font-normal leading-relaxed">
              Always fair. No hidden fees. <br />
              Rent with a peace of mind.
            </p>
          </div>

        </div>
      </section>

      {/* Modals Integration */}
      {selectedProperty && (
        <>
          <PropertyDetailModal
            property={selectedProperty}
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            onRentClick={handleRentClick}
          />

          <RentalRequestModal
            property={selectedProperty}
            isOpen={isRequestOpen}
            onClose={() => setIsRequestOpen(false)}
          />
        </>
      )}

      <LoginPromptModal
        isOpen={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)}
      />

      <Footer />
    </div>
  );
}