import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Property } from '../types';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});

interface ApplicationItem {
  _id: string;
  applicantName: string;
  applicantEmail: string;
  nationalId: string;
  monthlyIncome: number;
  documentName: string;
  status: string;
  propertyId: {
    _id: string;
    title: string;
    location: string;
    rent: number;
  } | string | null;
  createdAt: string;
}

// Component for updating the map center when coordinates change (without resetting MapContainer)
function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (!isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

// Component for handling map coordinate selection clicks.
function LocationPicker({ setLat, setLng }: { setLat: (v: string) => void; setLng: (v: string) => void }) {
  useMapEvents({
    click(e) {
      setLat(e.latlng.lat.toFixed(6));
      setLng(e.latlng.lng.toFixed(6));
    },
  });
  return null;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Property Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [rent, setRent] = useState('');
  const [location, setLocation] = useState('Reykjavík');
  const [lat, setLat] = useState('64.1466');
  const [lng, setLng] = useState('-21.9426');
  const [rooms, setRooms] = useState('1');
  const [area, setArea] = useState('35');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showOnHome, setShowOnHome] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin-login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [propRes, appRes] = await Promise.all([
        fetch('http://localhost:5000/api/properties'),
        fetch('http://localhost:5000/api/applications')
      ]);

      if (propRes.ok) setProperties(await propRes.json());
      if (appRes.ok) {
        const appData = await appRes.json();
        if (Array.isArray(appData)) setApplications(appData);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load server data.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setEditingId(null);
    setTitle('');
    setRent('');
    setLocation('Reykjavík');
    setLat('64.1466');
    setLng('-21.9426');
    setRooms('1');
    setArea('35');
    setDescription('');
    setImageUrl('');
    setShowOnHome(true);
  };

  const handleEditClick = (prop: Property) => {
    const propId = prop._id || prop.id || '';
    setEditingId(propId);
    
    setTitle(prop.title || '');
    setRent(prop.rent !== undefined ? String(prop.rent) : '');
    setLocation(prop.location || 'Reykjavík');
    setLat(prop.lat !== undefined ? String(prop.lat) : '64.1466');
    setLng(prop.lng !== undefined ? String(prop.lng) : '-21.9426');
    setRooms(prop.rooms !== undefined ? String(prop.rooms) : '1');
    setArea(prop.area !== undefined ? String(prop.area) : '35');
    setDescription(prop.description || '');
    setImageUrl(prop.images?.[0] || '');
    setShowOnHome(prop.showOnHome !== false);
  };

  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const payload = {
      title,
      rent: Number(rent),
      location,
      lat: Number(lat),
      lng: Number(lng),
      rooms: Number(rooms),
      area: Number(area),
      description,
      images: imageUrl ? [imageUrl] : [],
      showOnHome
    };

    try {
      const url = editingId
        ? `http://localhost:5000/api/properties/${editingId}`
        : 'http://localhost:5000/api/properties';

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMessage(editingId ? 'Property updated successfully!' : 'Property added successfully!');
        handleResetForm();
        fetchData();
      } else {
        const data = await res.json();
        setError(data.message || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while saving property.');
    }
  };

  const handleDeleteProperty = async (propId?: string) => {
    if (!propId) return;
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/properties/${propId}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccessMessage('Property deleted successfully!');
        fetchData();
      } else {
        setError('Failed to delete property.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while deleting property.');
    }
  };

  const handleUpdateApplicationStatus = async (appId: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setSuccessMessage(`Application status updated to ${status}`);
        fetchData();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update status.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while updating status.');
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    if (!appId) return;
    if (!window.confirm('Are you sure you want to delete this application?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/applications/${appId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSuccessMessage('Application deleted successfully!');
        fetchData();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete application.');
      }
    } catch (err) {
      console.error('DELETE CATCH ERROR:', err);
      setError('An error occurred while deleting application.');
    }
  };

  const getAppPropertyInfo = (propertyId: ApplicationItem['propertyId']) => {
    if (propertyId && typeof propertyId === 'object') return propertyId;
    return properties.find(p => String(p._id || p.id) === String(propertyId));
  };

  const currentLat = parseFloat(lat) || 64.1466;
  const currentLng = parseFloat(lng) || -21.9426;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <main className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full space-y-10">

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-4 rounded-xl">{error}</div>}
        {successMessage && <div className="bg-green-50 border border-green-200 text-green-600 text-xs p-4 rounded-xl">{successMessage}</div>}

        {/* SECTION 1: Properties Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit space-y-4">
            <h2 className="text-base font-extrabold text-gray-900">
              {editingId ? 'Edit Property' : 'Add New Property'}
            </h2>

            <form onSubmit={handleSubmitProperty} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Bright studio"
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Rent (ISK/mo)</label>
                  <input
                    type="number"
                    min="0"
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    required
                    placeholder="150000"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder="Reykjavík"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Map Picker */}
              <div className="border border-gray-200 p-3 rounded-xl space-y-2 bg-gray-50/50">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase">Pin location</label>
                  <span className="text-[9px] text-indigo-600 font-bold">Interactive</span>
                </div>
                <div className="w-full h-44 rounded-lg overflow-hidden border border-gray-300 relative z-0">
                  <MapContainer
                    center={[currentLat, currentLng]}
                    zoom={13}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapUpdater lat={currentLat} lng={currentLng} />
                    <LocationPicker setLat={setLat} setLng={setLng} />
                    <Marker position={[currentLat, currentLng]} />
                  </MapContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude" required className="px-2.5 py-1.5 border rounded-lg text-xs bg-white" />
                  <input type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Longitude" required className="px-2.5 py-1.5 border rounded-lg text-xs bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Rooms</label>
                  <input type="number" min="1" value={rooms} onChange={(e) => setRooms(e.target.value)} required className="w-full px-3 py-2 border rounded-xl text-xs" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Area (m²)</label>
                  <input type="number" min="1" value={area} onChange={(e) => setArea(e.target.value)} required className="w-full px-3 py-2 border rounded-xl text-xs" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Image URL</label>
                <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border rounded-xl text-xs" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Cozy studio..." className="w-full px-3 py-2 border rounded-xl text-xs resize-none" />
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">Show on Home Page</span>
                <input type="checkbox" checked={showOnHome} onChange={(e) => setShowOnHome(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded cursor-pointer" />
              </div>

              <div className="flex gap-2 pt-2">
                {editingId && (
                  <button type="button" onClick={handleResetForm} className="w-1/3 bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-300">
                    Cancel
                  </button>
                )}
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-md">
                  {editingId ? 'Update Property' : 'Add Property'}
                </button>
              </div>
            </form>
          </div>

          {/* Property List */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-base font-extrabold text-gray-900 mb-4">Manage Properties ({properties.length})</h2>

            {loading ? (
              <div className="text-center py-20 text-xs text-gray-400">Loading properties...</div>
            ) : properties.length === 0 ? (
              <div className="text-center py-20 text-xs text-gray-400">No properties found.</div>
            ) : (
              <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
                {properties.map((prop) => {
                  const propId = prop._id || prop.id || '';
                  return (
                    <div key={propId} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition">
                      <div className="flex items-center space-x-3">
                        <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {prop.images?.[0] ? <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-900">{prop.title}</h3>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${prop.showOnHome !== false ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {prop.showOnHome !== false ? 'Home & All' : 'All Only'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{prop.location} • {prop.rent?.toLocaleString()} ISK/mo</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleEditClick(prop)} className="px-3 py-1.5 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-xs font-bold rounded-lg transition">Edit</button>
                        <button onClick={() => handleDeleteProperty(propId)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition">Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: Rental Applications Management */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-base font-extrabold text-gray-900 mb-4">📄 Rental Applications ({applications.length})</h2>

          {loading ? (
            <div className="text-center py-12 text-xs text-gray-400">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400">No rental applications submitted yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b text-[11px] uppercase text-gray-500 font-bold">
                    <th className="p-3">Property</th>
                    <th className="p-3">Applicant Info</th>
                    <th className="p-3">ID & Income</th>
                    <th className="p-3">Document</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {applications.map((app) => {
                    const prop = getAppPropertyInfo(app.propertyId);
                    return (
                      <tr key={app._id} className="hover:bg-gray-50/50 transition">
                        <td className="p-3">
                          {prop ? (
                            <div>
                              <p className="font-bold text-indigo-600">{prop.title}</p>
                              <p className="text-[10px] text-gray-500">{prop.location}</p>
                              <p className="text-[10px] font-semibold text-gray-700 mt-0.5">{prop.rent?.toLocaleString()} ISK/mo</p>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Property unavailable</span>
                          )}
                        </td>

                        <td className="p-3">
                          <p className="font-bold text-gray-900">{app.applicantName}</p>
                          <p className="text-[10px] text-gray-500">{app.applicantEmail}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Date: {new Date(app.createdAt).toLocaleDateString()}</p>
                        </td>

                        <td className="p-3">
                          <p className="text-gray-600">ID: <span className="font-mono">{app.nationalId}</span></p>
                          <p className="text-gray-600 mt-0.5">Income: <span className="font-bold text-green-600">{app.monthlyIncome?.toLocaleString()} ISK</span></p>
                        </td>

                        <td className="p-3">
                          {app.documentName ? (
                            <a href={`http://localhost:5000/uploads/${app.documentName}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition">
                              <span>📄 View</span>
                            </a>
                          ) : (
                            <span className="text-gray-400 italic">No document</span>
                          )}
                        </td>

                        <td className="p-3">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : app.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {app.status}
                          </span>
                        </td>

                        <td className="p-3 text-right space-x-1">
                          {app.status !== 'pending' && (
                            <button onClick={() => handleUpdateApplicationStatus(app._id, 'pending')} className="px-2.5 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-bold rounded-lg transition">Pending</button>
                          )}
                          <button onClick={() => handleUpdateApplicationStatus(app._id, 'approved')} className="px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-lg transition">Approve</button>
                          <button onClick={() => handleUpdateApplicationStatus(app._id, 'rejected')} className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg transition">Reject</button>
                          <button onClick={() => handleDeleteApplication(app._id)} className="px-2.5 py-1 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-bold rounded-lg transition">Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}