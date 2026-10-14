import React, { useState } from 'react';
import { Property } from '../types';

interface PropertyDetailModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onRentClick: (property: Property) => void;
}

export default function PropertyDetailModal({
  property,
  isOpen,
  onClose,
  onRentClick,
}: PropertyDetailModalProps) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<string[]>([
    'Frábær staðsetning og mjög hreint!',
    'Spacious apartment with amazing views.',
  ]);

  if (!isOpen || !property) return null;

 // Starting coordinates (if none are provided, use the coordinates for the center of Reykjavík)
const lat = property.lat !== undefined ? Number(property.lat) : 64.1466;
const lng = property.lng !== undefined ? Number(property.lng) : -21.9426;
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      setComments([...comments, commentText.trim()]);
      setCommentText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 md:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition"
        >
          ✕
        </button>

        {/* Property Header */}
        <div className="space-y-1 pr-8">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-lg">
            📍 {property.location || 'Reykjavík'}
          </span>
          <h2 className="text-2xl font-black text-gray-900 mt-2">{property.title}</h2>
          <p className="text-xl font-extrabold text-indigo-600">
            {property.rent?.toLocaleString()} ISK <span className="text-xs font-normal text-gray-500">/ night</span>
          </p>
        </div>

        {/* Property Images */}
        <div className="mt-6 h-72 w-full bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
          <img
            src={property.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Description Section */}
        <div className="mt-6 space-y-2 border-t border-gray-100 pt-6">
          <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
            DESCRIPTION
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {property.description || 'Björt og falleg stúdíóíbúð í hjarta borgarinnar.'}
          </p>
        </div>

        {/* REAL INTERACTIVE LOCATION MAP (Interactive Google Map Embed with Exact Lat/Lng) */}
        <div className="mt-6 border-t border-gray-100 pt-6">
          <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span>📍</span> REAL INTERACTIVE LOCATION MAP
          </h4>
          
          <div className="w-full h-64 rounded-2xl overflow-hidden border border-gray-200/80 relative shadow-inner">
            {/* Direct Open in Google Maps Link */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md text-blue-600 hover:text-blue-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-1 hover:shadow transition"
            >
              Open in Maps ↗
            </a>

            {/* Embedded Interactive Map using precise coordinates */}
            <iframe
              title="Interactive Property Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
            />
          </div>
        </div>

        {/* Reviews & Comments Section */}
        <div className="mt-6 border-t border-gray-100 pt-6 space-y-4">
          <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
            REVIEWS & COMMENTS
          </h4>
          
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {comments.map((c, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-700">
                💬 {c}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a review..."
              className="flex-1 text-xs px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
            />
            <button
              type="submit"
              className="bg-gray-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-indigo-600 transition"
            >
              Post
            </button>
          </form>
        </div>

        {/* Action Button */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
          >
            Close
          </button>
          <button
            onClick={() => onRentClick(property)}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] shadow-md transition"
          >
            Apply Now
          </button>
        </div>

      </div>
    </div>
  );
}