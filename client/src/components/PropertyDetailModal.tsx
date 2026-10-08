import React, { useState } from 'react';
import { Property } from '../types';

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
  onOpenBooking: (property: Property) => void;
}

export default function PropertyDetailModal({ property, onClose, onOpenBooking }: PropertyDetailModalProps) {
  const [comments, setComments] = useState<string[]>([]);
  const [commentInput, setCommentInput] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setComments(prev => [...prev, commentInput]);
    setCommentInput('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">{property.title}</h2>
        <p className="text-sm text-gray-500 mb-4">{property.address}, {property.neighborhood}</p>

        {property.images && property.images.length > 0 && (
          <img src={property.images[0]} alt="" className="w-full h-64 object-cover rounded-xl mb-4 border" />
        )}

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm bg-gray-50 p-4 rounded-xl">
          <div><span className="font-semibold">Rent:</span> {property.rent.toLocaleString()} ISK / mo</div>
          <div><span className="font-semibold">Utilities:</span> {property.utilities.toLocaleString()} ISK</div>
          <div><span className="font-semibold">Bedrooms:</span> {property.bedrooms}</div>
          <div><span className="font-semibold">Size:</span> {property.size} m²</div>
        </div>

        <p className="text-gray-700 text-sm mb-6">{property.description}</p>

        {/* Comments Section */}
        <div className="border-t pt-4 mb-6">
          <h3 className="font-bold text-sm text-gray-900 mb-2">Comments & Reviews</h3>
          <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No comments yet. Be the first to leave one!</p>
            ) : (
              comments.map((c, idx) => (
                <div key={idx} className="bg-gray-100 p-2 rounded-lg text-xs text-gray-700">{c}</div>
              ))
            )}
          </div>
          <form onSubmit={handleAddComment} className="flex gap-2">
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
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
          <button 
            onClick={() => {
              onClose();
              onOpenBooking(property);
            }}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 shadow-sm"
          >
            Request to Rent
          </button>
        </div>
      </div>
    </div>
  );
}