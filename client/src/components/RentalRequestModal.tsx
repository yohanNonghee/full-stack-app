import React, { useState,useEffect } from 'react';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
interface RentalRequestModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export default function RentalRequestModal({ property, isOpen, onClose }: RentalRequestModalProps) {
  const auth = useAuth();
  const user = auth?.user || null;

  const [applicantName, setApplicantName] = useState<string>(user?.name || '');
  const [applicantEmail, setApplicantEmail] = useState<string>(user?.email || '');
  const [nationalId, setNationalId] = useState<string>('');
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError('');
      setDocumentFile(null);
    }
  }, [isOpen, property]);

  if (!isOpen) return null;
  if (!isOpen) return null;

  // Function to convert a file to Base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const targetPropertyId = property._id || (property as any).id || '';
      if (!targetPropertyId) {
        setError('Property ID is missing. Please re-select the property.');
        setSubmitting(false);
        return;
      }

      // Convert file to Base64 (if a file is selected)
      let documentBase64 = '';
      let documentName = '';
      if (documentFile) {
        documentName = documentFile.name;
        documentBase64 = await convertFileToBase64(documentFile);
      }

      // Prepare the data as a JSON object, including the files.
      const requestData = {
        propertyId: targetPropertyId,
        userId: user?.id || (user as any)?._id || '',
        applicantName: applicantName.trim(),
        applicantEmail: applicantEmail.trim(),
        nationalId: nationalId.trim(),
        monthlyIncome: Number(monthlyIncome) || 0,
        documentName,
        documentBase64,
      };

   const res = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || `Server error: ${res.status}`);
      }
    } catch (err: any) {
      setError('An error occurred while connecting to the server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg font-bold"
        >
          ✕
        </button>

        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Rental Application</h2>
        <p className="text-xs text-gray-500 mb-6">
          Applying for: <span className="font-bold text-indigo-600">{property.title}</span> ({property.rent.toLocaleString()} ISK/mo)
        </p>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-6 rounded-2xl text-center space-y-3">
            <p className="font-bold text-base">🎉 Application Submitted Successfully!</p>
            <button
              type="button"
              onClick={onClose}
              className="bg-green-600 text-white text-xs font-bold px-5 py-2 rounded-xl hover:bg-green-700 transition"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email Address</label>
              <input
                type="email"
                value={applicantEmail}
                onChange={(e) => setApplicantEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">National ID / Passport</label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Monthly Income (ISK)</label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Document upload field*/}
            <div className="border-t pt-4">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                📄 Verification Document (PDF / JPG)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setDocumentFile(file);
                }}
                required
                className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}