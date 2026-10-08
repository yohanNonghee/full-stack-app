import React from 'react';
import Navbar from '../components/Navbar';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            About Heimili
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-4 mb-6">
            Your Trusted Long-Term Rental Marketplace in Reykjavík
          </h1>
          
          <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
            <p>
              **Heimili** is designed to simplify the long-term housing search in Reykjavík, Iceland. We connect reliable tenants with verified landlords, ensuring a transparent, secure, and seamless rental experience.
            </p>
            <p>
              Whether you are looking for a cozy modern apartment in Miðborg or a spacious family home with a mountain view in Vesturbær, our platform integrates real-time interactive maps and verified tenant profiles to make renting straightforward and stress-free.
            </p>
            <h2 className="text-lg font-bold text-gray-900 pt-4">Why Choose Us?</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Verified property listings across key neighborhoods in Reykjavík.</li>
              <li>Secure booking requests with digital document verification.</li>
              <li>Interactive map integration for precise location viewing.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}