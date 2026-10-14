import React, { useState, useEffect } from 'react';
import PropertyDetailModal from '../components/PropertyDetailModal';
import RentalRequestModal from '../components/RentalRequestModal';
import LoginPromptModal from '../components/LoginPromptModal';
import Footer from '../components/Footer';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';

export default function Apartments() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; 

  // Modals State
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/properties');
      if (res.ok) {
        const data: Property[] = await res.json();
    
        setProperties(data);
      }
    } catch (err) {
      console.error('Failed to load apartments:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenDetail = (prop: Property) => {
    setSelectedProperty(prop);
    setIsDetailOpen(true);
  };

  const handleRentClick = (prop: Property) => {
    setSelectedProperty(prop);
    setIsDetailOpen(false);
    if (!user) {
      setIsLoginPromptOpen(true);
    } else {
      setIsRequestOpen(true);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(properties.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProperties = properties.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <main className="max-w-6xl mx-auto px-6 sm:px-8 py-10 flex-1 w-full">
        
        {/* Header Title & Subtitle */}
        <div className="mb-8 space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            All apartmens
          </h1>
          <p className="text-base text-gray-500 font-normal">
            Brows apartments and find your next home
          </p>
          <p className="text-xs font-bold text-gray-900 pt-3">
            {properties.length} apartments
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-sm text-gray-400">Loading apartments...</div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-500 text-sm">No apartments available at the moment.</p>
          </div>
        ) : (
          /* Grid 2 Columns */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentProperties.map((prop) => {
              const propId = prop._id || prop.title;
              const isFav = favorites[propId];

              return (
                <div
                  key={propId}
                  onClick={() => handleOpenDetail(prop)}
                  className="bg-white border border-gray-300 rounded-none overflow-hidden cursor-pointer group flex flex-col hover:border-gray-500 transition"
                >
                  {/* Image Placeholder */}
                  <div className="h-72 w-full bg-[#e5e7eb] relative">
                    {prop.images?.[0] ? (
                      <img
                        src={prop.images[0]}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#e5e7eb]" />
                    )}

                    {/* Heart Favorite Icon */}
                    <button
                      onClick={(e) => toggleFavorite(propId, e)}
                      className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-gray-900 hover:scale-110 transition shadow-sm"
                    >
                      <svg
                        className="w-5 h-5"
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

                  {/* Info Container */}
                  <div className="p-6 border-t border-gray-300 space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">{prop.title}</h3>
                    
                    <div className="flex items-center gap-1 text-gray-500 text-sm font-medium">
                      <span>📍</span>
                      <span>{prop.location || 'Reykjavík'}</span>
                    </div>

                    <div className="text-sm text-gray-500">
                      {prop.rooms || 1} room • {prop.area || 35} m2
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-lg font-black text-gray-900">
                        {prop.rent?.toLocaleString()} ISK<span className="text-sm font-normal text-gray-600">/month</span>
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(prop);
                        }}
                        className="text-sm font-bold text-gray-900 hover:text-indigo-600 flex items-center gap-1"
                      >
                        View details →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Control */}
        {!loading && totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center text-sm font-bold disabled:opacity-30 hover:bg-gray-100 transition"
            >
              &lt;
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 border rounded-lg text-sm font-bold transition ${
                    currentPage === pageNum
                      ? 'bg-[#1e40af] text-white border-[#1e40af]'
                      : 'border-gray-300 text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center text-sm font-bold disabled:opacity-30 hover:bg-gray-100 transition"
            >
              &gt;
            </button>
          </div>
        )}

      </main>

      {/* Modals */}
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