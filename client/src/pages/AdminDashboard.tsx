import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface Property {
  _id?: string;
  title: string;
  description: string;
  rent: number;
  utilities: number;
  address: string;
  neighborhood: string;
  size: number;
  bedrooms: number;
  lat: number;
  lng: number;
  images: string[];
}

// Component Sub-component for capturing click events on the map. Leaflet
function LocationPicker({ lat, lng, setLatLang }: { lat: number; lng: number; setLatLang: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      setLatLang(e.latlng.lat, e.latlng.lng);
    },
  });

  return lat && lng ? <Marker position={[lat, lng]} /> : null;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState<Property[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form for adding/editing data
  const [formData, setFormData] = useState<Property>({
    title: '',
    description: '',
    rent: 0,
    utilities: 0,
    address: '',
    neighborhood: '',
    size: 0,
    bedrooms: 0,
    lat: 64.1466, //  coordinates (Reykjavík)
    lng: -21.9426,
    images: ['']
  });

  // Load all home listings
  const fetchProperties = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/properties');
      const data = await res.json();
      setProperties(data);
    } catch (err) {
      console.error('Failed to fetch properties', err);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['rent', 'utilities', 'size', 'bedrooms', 'lat', 'lng'].includes(name) ? Number(value) : value
    }));
  };

  const handleImageChange = (value: string) => {
    setFormData(prev => ({ ...prev, images: [value] }));
  };

  // Function to update coordinates upon clicking the map.
  const setLatLang = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6))
    }));
  };

  // Save data (distinguishing between new creation and editing)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `http://localhost:5000/api/properties/${editingId}`
        : 'http://localhost:5000/api/properties';

      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert(editingId ? 'Property updated successfully!' : 'Property created successfully!');
        resetForm();
        fetchProperties();
      } else {
        alert('Failed to save property');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    }
  };

  // Load data into the form for editing.
  const handleEdit = (property: Property) => {
    setEditingId(property._id || null);
    setFormData({
      title: property.title,
      description: property.description,
      rent: property.rent,
      utilities: property.utilities,
      address: property.address,
      neighborhood: property.neighborhood,
      size: property.size,
      bedrooms: property.bedrooms,
      lat: property.lat,
      lng: property.lng,
      images: property.images || ['']
    });
  };

  // Delete rental property information
  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/properties/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('Property deleted successfully!');
        fetchProperties();
        if (editingId === id) resetForm();
      } else {
        alert('Failed to delete property');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      rent: 0,
      utilities: 0,
      address: '',
      neighborhood: '',
      size: 0,
      bedrooms: 0,
      lat: 64.1466,
      lng: -21.9426,
      images: ['']
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-indigo-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-lg font-bold">Heimili — Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-xs bg-indigo-800 px-3 py-1 rounded-full">Admin: {user?.name}</span>
          <button
            onClick={() => { logout(); navigate('/admin/login'); }}
            className="bg-red-600 hover:bg-red-700 text-xs px-3 py-1.5 rounded-lg transition"
          >
            Admin Logout
          </button>
        </div>
      </header>

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Add/Edit Form*/}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 lg:col-span-1 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-gray-900">
              {editingId ? 'Edit Rental Property' : 'Add New Rental Property'}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-xs text-indigo-600 hover:underline">Cancel Edit</button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 uppercase mb-1">Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 uppercase mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Rent (ISK)</label>
                <input type="number" name="rent" value={formData.rent} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Utilities (ISK)</label>
                <input type="number" name="utilities" value={formData.utilities} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 uppercase mb-1">Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 uppercase mb-1">Neighborhood</label>
              <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Size (m²)</label>
                <input type="number" name="size" value={formData.size} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Bedrooms</label>
                <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>

            {/*Map for selecting a location */}
            <div>
              <label className="block font-semibold text-gray-700 uppercase mb-1">
                Pin Location on Map (Click to select)
              </label>
              <div className="h-48 w-full rounded-lg overflow-hidden border mb-2 z-0">
                <MapContainer
                  center={[formData.lat, formData.lng]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker lat={formData.lat} lng={formData.lng} setLatLang={setLatLang} />
                </MapContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Latitude</label>
                <input type="number" step="any" name="lat" value={formData.lat} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg bg-gray-50" />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Longitude</label>
                <input type="number" step="any" name="lng" value={formData.lng} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg bg-gray-50" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 uppercase mb-1">Image URL</label>
              <input type="text" value={formData.images[0] || ''} onChange={(e) => handleImageChange(e.target.value)} required placeholder="https://..." className="w-full px-3 py-2 border rounded-lg" />
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 shadow-sm transition mt-3">
              {editingId ? 'Update Property' : 'Save Property'}
            </button>
          </form>
        </div>

        {/* (Existing Listings) Edit & Delete */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 lg:col-span-2">
          <h2 className="text-base font-bold text-gray-900 mb-4">Existing Listings ({properties.length})</h2>

          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-2">
            {properties.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No properties found.</p>
            ) : (
              properties.map((item) => (
                <div key={item._id} className="border rounded-xl p-4 flex items-center justify-between gap-4 bg-gray-50 hover:bg-white transition shadow-sm">
                  <div className="flex items-center gap-4">
                    {item.images && item.images[0] ? (
                      <img src={item.images[0]} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">No Image</div>
                    )}
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">{item.title}</h3>
                      <p className="text-xs text-gray-500">{item.neighborhood} · {item.rent.toLocaleString()} ISK/mo</p>
                      <span className="inline-block mt-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg shadow-sm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg shadow-sm transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}