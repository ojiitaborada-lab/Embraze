import { useState } from 'react';
import { HandRaisedIcon } from '@heroicons/react/24/solid';
import { Player } from '@lottiefiles/react-lottie-player';
import Toast from './Toast';
import { sendMagicLink } from '../supabase/auth';
import animationData from '../assets/TEHRAN.json';
import logoAnimation from '../assets/paperplane.json';

function LoginScreen({ onSignIn, showLogoutMessage }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleMagicLinkSignIn = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    const result = await sendMagicLink(email);
    setIsLoading(false);
    
    if (result.success) {
      setShowSuccessMessage(true);
      setEmail('');
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    } else {
      alert('Failed to send magic link: ' + result.error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900">
      <Toast 
        message="Logged out successfully"
        isVisible={showLogoutMessage}
        onClose={() => {}}
        type="success"
      />
      
      <Toast 
        message="Magic link sent! Check your email"
        isVisible={showSuccessMessage}
        onClose={() => setShowSuccessMessage(false)}
        type="success"
      />
      
      {/* Desktop Layout - Split Screen */}
      <div className="hidden lg:flex h-full">
        {/* Left Side - Hero Section */}
        <div className="lg:w-1/2 bg-gray-900 relative overflow-hidden">
          {/* Lottie Animation Background */}
          <div className="absolute inset-0 flex items-end justify-center opacity-40 translate-y-32">
            <Player
              autoplay
              loop={false}
              keepLastFrame
              src={animationData}
              style={{ height: '100%', width: '100%' }}
            />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 flex flex-col justify-start px-16 pt-16 w-full">
            <h2 className="text-5xl font-bold text-white leading-tight mb-4">
              Stay Connected,<br />Stay Safe
            </h2>
            <p className="text-white/80 text-lg">
              A simple way to reach out to your community when you need help.
            </p>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="w-full max-w-md space-y-8">
            {/* Title */}
            <div className="flex flex-col items-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Embraze</h1>
              <p className="text-gray-600 text-sm text-center">
                Connect with those who care about you
              </p>
            </div>

            {/* Email Sign In Form */}
            <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-5 py-3.5 bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 outline-none transition-all text-base"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className={`w-full py-3.5 rounded-full font-semibold transition-all text-base ${
                  isLoading || !email
                    ? 'bg-blue-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                }`}
              >
                {isLoading ? 'Sending magic link...' : 'Continue with Email'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-gray-50 to-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Sign In Buttons */}
            <div className="space-y-3">
              {/* Google Sign In */}
              <button
                onClick={onSignIn}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 px-5 py-3.5 rounded-full font-medium transition-all flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-gray-300 cursor-pointer text-base"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
            </div>

            {/* Footer */}
            <p className="text-gray-500 text-xs text-center mt-8">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Bottom Sheet */}
      <div className="lg:hidden h-full relative">
        {/* Background with Lottie Animation */}
        <div className="absolute inset-0 bg-gray-900 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <Player
              autoplay
              loop={false}
              keepLastFrame
              src={animationData}
              style={{ height: '100%', width: '100%' }}
            />
          </div>
          
          {/* Hero Text */}
          <div className="relative z-10 flex flex-col items-center justify-center h-1/2 px-6 text-center">
            <h2 className="text-4xl font-bold text-white leading-tight mb-3">
              Stay Connected,<br />Stay Safe
            </h2>
            <p className="text-white/70 text-sm">
              A simple way to reach your community when needed
            </p>
          </div>
        </div>

        {/* Bottom Sheet */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-5 pb-6 max-h-[70vh] overflow-y-auto">
          {/* Handle Bar */}
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>

          {/* Title */}
          <div className="text-center mb-4">
            <h1 className="text-lg font-bold text-gray-900 mb-0.5">Welcome to Embraze</h1>
            <p className="text-gray-500 text-[10px]">
              Connect with those who care
            </p>
          </div>

          {/* Email Sign In Form */}
          <form onSubmit={handleMagicLinkSignIn} className="space-y-2.5 mb-3">
            <div>
              <label htmlFor="email-mobile" className="block text-[10px] font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email-mobile"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 outline-none transition-all text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className={`w-full py-2.5 rounded-full font-semibold transition-all text-xs ${
                isLoading || !email
                  ? 'bg-blue-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
              }`}
            >
              {isLoading ? 'Sending...' : 'Continue with Email'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Sign In Buttons */}
          <div className="space-y-2">
            {/* Google Sign In */}
            <button
              onClick={onSignIn}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 px-3 py-2.5 rounded-full font-medium transition-all flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-gray-300 cursor-pointer text-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Footer */}
          <p className="text-gray-400 text-[9px] text-center mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
