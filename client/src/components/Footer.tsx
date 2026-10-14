import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 px-6 sm:px-8 lg:px-12 font-sans text-gray-500 mt-auto text-xs">
      <div className="max-w-7xl mx-auto flex flex-col items-center space-y-3 text-center">
        
        {/* Navigation Links with Vertical Separators */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-medium text-gray-600">
          <Link to="/contact" className="hover:text-gray-900 transition">
            Contact us
          </Link>
          <span className="text-gray-300">|</span>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition">
            Instagram
          </a>
          <span className="text-gray-300">|</span>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition">
            Facebook
          </a>
          <span className="text-gray-300">|</span>
          <Link to="/terms" className="hover:text-gray-900 transition">
            Terms & Policies
          </Link>
        </div>

        {/* Service Area */}
        <div className="text-gray-500">
          Service area: Reykjavík
        </div>

        {/* Brand Handle */}
        <div className="text-gray-500 font-medium pt-1">
          @LEIGUHUS
        </div>

      </div>
    </footer>
  );
}