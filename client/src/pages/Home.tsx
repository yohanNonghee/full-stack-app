import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Navbar from '../components/Navbar';
import RentalRequestModal from '../components/RentalRequestModal';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  
  // For the comment system prototype on the details screen.
  const [comments, setComments] = useState<{ [key: string]: string[] }>({});
  const [commentInput, setCommentInput] = useState('');

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/properties')
      .then((res) => res.json())
      .then((data) => {
        setProperties(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch properties:', err);
        setLoading(false);
      });
  }, []);

  //Function triggered when the user presses the house booking button.
  const handleBookingClick = (prop: Property) => {
    if (!isAuthenticated) {
      const confirmRegister = window.confirm('Please log in first to request a rental. If you don\'t have an account, click OK to sign up.');
      if (confirmRegister) {
        navigate('/register');
      }
      return;
    }
    setSelectedProperty(prop);
    setShowModal(true);
  };

  // Add comment function
  const handleAddComment = (propId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setComments(prev => ({
      ...prev,
      [propId]: [...(prev[propId] || []), commentInput]
    }));
    setCommentInput('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-500 font-medium">
          Loading rentals in Reykjavík...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Property Listings */}
        <div className="w-full lg:w-7/12 p-6 overflow-y-auto h-[calc(100vh-65px)]">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-gray-900">Available Rentals in Reykjavík</h1>
            <span className="text-xs text-gray-500 font-medium">{properties.length} properties found</span>
          </div>

          <div className="space-y-4">
            {properties.map((prop) => {
              const propId = prop._id || prop.title;
              return (
                <div 
                  key={propId} 
                  onDoubleClick={() => setSelectedProperty(prop)}
                  className="bg-white border border-indigo-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col md:flex-row gap-4 relative cursor-pointer group"
                >
                  {/* Property Image */}
                  {prop.images && prop.images.length > 0 ? (
                    <img 
                      src={prop.images[0]} 
                      alt={prop.title} 
                      className="w-full md:w-48 h-32 object-cover rounded-xl border"
                    />
                  ) : (
                    <div className="w-full md:w-48 h-32 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}

                  {/* Info Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase mb-1 inline-block">
                          {prop.neighborhood}
                        </span>
                        <span className="text-indigo-600 font-extrabold text-base">
                          {prop.rent.toLocaleString()} ISK / mo
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition">
                        {prop.title}
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {prop.address} · {prop.size} m² · 🛏️ {prop.bedrooms} Bed
                      </p>
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">{prop.description}</p>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-3">
                      <span className="text-[11px] text-gray-400 italic">Double-click card to open details</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleBookingClick(prop); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition"
                      >
                        Request to Rent
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Leaflet Map */}
        <div className="hidden lg:block lg:w-5/12 h-[calc(100vh-65px)] z-0">
          <MapContainer 
            center={[64.1466, -21.9426]} 
            zoom={13} 
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {properties.map((prop) => (
              <Marker key={prop._id || prop.title} position={[prop.lat, prop.lng]}>
                <Popup>
                  <div className="p-1">
                    <p className="font-bold text-xs">{prop.title}</p>
                    <p className="text-indigo-600 font-semibold text-xs">{prop.rent.toLocaleString()} ISK / mo</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Property Detail & Comment Modal (Triggered on Double-Click) */}
      {selectedProperty && !showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedProperty(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProperty.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{selectedProperty.address}, {selectedProperty.neighborhood}</p>

            {selectedProperty.images && selectedProperty.images.length > 0 && (
              <img src={selectedProperty.images[0]} alt="" className="w-full h-64 object-cover rounded-xl mb-4 border" />
            )}

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm bg-gray-50 p-4 rounded-xl">
              <div><span className="font-semibold">Rent:</span> {selectedProperty.rent.toLocaleString()} ISK / mo</div>
              <div><span className="font-semibold">Utilities:</span> {selectedProperty.utilities.toLocaleString()} ISK</div>
              <div><span className="font-semibold">Bedrooms:</span> {selectedProperty.bedrooms}</div>
              <div><span className="font-semibold">Size:</span> {selectedProperty.size} m²</div>
            </div>

            <p className="text-gray-700 text-sm mb-6">{selectedProperty.description}</p>

            {/* Comments Section */}
            <div className="border-t pt-4 mb-6">
              <h3 className="font-bold text-sm text-gray-900 mb-2">Comments & Reviews</h3>
              <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                {(comments[selectedProperty._id || ''] || []).length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No comments yet. Be the first to leave one!</p>
                ) : (
                  (comments[selectedProperty._id || '']).map((c, idx) => (
                    <div key={idx} className="bg-gray-100 p-2 rounded-lg text-xs text-gray-700">{c}</div>
                  ))
                )}
              </div>
              <form onSubmit={(e) => handleAddComment(selectedProperty._id || '', e)} className="flex gap-2">
                <input 
                  type="text" 
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Write a comment..." 
                  className="flex-1 border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" className="bg-indigo-600 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-indigo-700">Post</button>
              </form>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setSelectedProperty(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  const prop = selectedProperty;
                  setSelectedProperty(null);
                  handleBookingClick(prop);
                }}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 shadow-sm"
              >
                Request to Rent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal with File Upload */}
      {showModal && selectedProperty && (
        <RentalRequestModal 
          property={selectedProperty} 
          onClose={() => { setShowModal(false); setSelectedProperty(null); }} 
        />
      )}
    </div>
  );
}