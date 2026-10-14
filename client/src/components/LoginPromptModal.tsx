import { useNavigate } from 'react-router-dom';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginPromptModal({ isOpen, onClose }: LoginPromptModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-gray-100 relative space-y-4">
        
        {/* Modal Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
        >
          ✕
        </button>

        {/* Lock Icon Banner */}
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          🔒
        </div>

        <h2 className="text-xl font-extrabold text-gray-900">Authentication Required</h2>
        
        <p className="text-xs text-gray-500 leading-relaxed px-2">
          You must be logged in with a verified tenant account to submit a rental application and document verification.
        </p>

        {/* Navigation CTAs */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              onClose();
              navigate('/login');
            }}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm transition"
          >
            Log In to Your Account
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/register');
            }}
            className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-200 transition"
          >
            Don't have an account? Register Now
          </button>
        </div>

      </div>
    </div>
  );
}