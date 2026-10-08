import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Property } from '../types';

interface RentalRequestModalProps {
  property: Property;
  onClose: () => void;
}

export default function RentalRequestModal({ property, onClose }: RentalRequestModalProps) {
  const { user, token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please upload a verification document.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('listingId', property._id || '');
      formData.append('userId', user?.id || (user as any)?._id || '');
      formData.append('totalAmount', property.rent.toString());
      formData.append('document', file);

      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

  if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        alert(`Failed: ${errorData.message} | Detail: ${errorData.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while submitting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-fadeIn">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
        >
          ✕
        </button>
        
        <h2 className="text-xl font-bold text-gray-900 mb-1">Request to Rent</h2>
        <p className="text-sm text-gray-600 mb-4">
          {property.title} — <span className="font-semibold text-indigo-600">{property.rent.toLocaleString()} ISK/mo</span>
        </p>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-center font-medium">
            🎉 Rental request submitted successfully!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Verification Document / ID (PDF or Image)
              </label>
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition"
              >
                {loading ? 'Submitting...' : 'Confirm & Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}