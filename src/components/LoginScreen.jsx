import { useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import Toast from './Toast';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import HelpPanel from './HelpPanel';
import { sendMagicLink } from '../supabase/auth';
import cityAnimation from '../assets/City City pixel.json';

function LoginScreen({ onSignIn, showLogoutMessage }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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
    <div className="fixed inset-0 bg-white">
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
        <div className="lg:w-1/2 bg-white relative overflow-hidden">
          {/* Lottie Animation Background - Full Cover */}
          <div className="absolute inset-0">
            <Player
              autoplay
              loop
              src={cityAnimation}
              style={{ height: '100%', width: '100%', objectFit: 'cover' }}
            />
          </div>
          
          {/* Hero Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-12 bg-black/40">
            {/* Main Content - Centered */}
            <div className="flex-1 flex items-center justify-center">
              <div className="max-w-lg space-y-8">
                <div className="space-y-4">
                  <h1 className="text-5xl font-bold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-tight">
                    Help each other while help is on the way
                  </h1>
                  <p className="text-lg text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    Community-driven emergency response system
                  </p>
                </div>
                
                {/* Feature Checklist */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        Alert nearby community members
                      </h3>
                      <p className="text-sm text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] mt-1">
                        Notify your family and neighbors instantly during emergencies
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        Real-time location sharing
                      </h3>
                      <p className="text-sm text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] mt-1">
                        Share your exact location so help can find you quickly
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        Free and open source
                      </h3>
                      <p className="text-sm text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] mt-1">
                        Built for communities, by communities. Always free to use
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer Links */}
            <div className="flex items-center justify-between text-white/80 text-sm drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
              <div className="flex items-center gap-4">
                <button onClick={() => setShowPrivacyPolicy(true)} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
                <span className="text-white/40">•</span>
                <button onClick={() => setShowTermsOfService(true)} className="hover:text-white transition-colors cursor-pointer">Terms of Service</button>
                <span className="text-white/40">•</span>
                <button onClick={() => setShowHelp(true)} className="hover:text-white transition-colors cursor-pointer">Help</button>
              </div>
              <a href="mailto:support@embraze.app" className="hover:text-white transition-colors">
                support@embraze.app
              </a>
            </div>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 bg-white">
          <div className="w-full max-w-md">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Sign in to Embraze</h1>
              <p className="text-sm text-gray-500">
                Join your community support network
              </p>
            </div>

            {/* Email Sign In Form */}
            <form onSubmit={handleMagicLinkSignIn} className="space-y-4 mb-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className={`w-full py-3 rounded-full font-medium transition-all text-sm ${
                  isLoading || !email
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98]'
                }`}
              >
                {isLoading ? 'Sending magic link...' : 'Continue with Email'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-gray-400">or</span>
              </div>
            </div>

            {/* Social Sign In Buttons */}
            <div className="mb-6">
              {/* Google Sign In */}
              <button
                onClick={onSignIn}
                className="w-full bg-white hover:bg-slate-50 text-gray-700 px-4 py-3 rounded-full font-medium transition-all flex items-center justify-center gap-3 border border-slate-200 hover:border-slate-300 cursor-pointer text-sm shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </div>

            {/* Footer */}
            <p className="text-gray-400 text-xs text-center">
              By signing in, you agree to our <button onClick={() => setShowTermsOfService(true)} className="text-gray-600 hover:text-gray-900 cursor-pointer underline">Terms</button> and <button onClick={() => setShowPrivacyPolicy(true)} className="text-gray-600 hover:text-gray-900 cursor-pointer underline">Privacy Policy</button>
            </p>

            {/* Open Source Notice */}
            <p className="text-gray-400 text-xs text-center mt-4">
              Open source emergency alert system
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Bottom Sheet */}
      <div className="lg:hidden h-full relative bg-white overflow-y-auto">
        {/* Lottie Animation Background - Full Cover */}
        <div className="absolute inset-0">
          <Player
            autoplay
            loop
            src={cityAnimation}
            style={{ height: '100%', width: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Hero Content - Top Section */}
        <div className="relative min-h-[40vh] flex items-end pb-6 px-6 bg-gradient-to-b from-black/30 to-black/50">
          <div className="space-y-4 w-full">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-tight">
                Help each other while help is on the way
              </h1>
              <p className="text-sm text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                Community-driven emergency response
              </p>
            </div>
            
            {/* Compact Feature List */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  Alert nearby community members
                </p>
              </div>
              
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  Real-time location sharing
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sheet */}
        <div className="relative bg-white rounded-t-3xl shadow-2xl p-6 pb-8">
          {/* Handle Bar */}
          <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-6"></div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-1">Sign in to Embraze</h1>
            <p className="text-xs text-gray-500">
              Join your community support network
            </p>
          </div>

          {/* Email Sign In Form */}
          <form onSubmit={handleMagicLinkSignIn} className="space-y-3 mb-4">
            <div>
              <label htmlFor="email-mobile" className="block text-xs font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email-mobile"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className={`w-full py-2.5 rounded-full font-medium transition-all text-sm ${
                isLoading || !email
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm active:scale-[0.98]'
              }`}
            >
              {isLoading ? 'Sending...' : 'Continue with Email'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400">or</span>
            </div>
          </div>

          {/* Social Sign In Buttons */}
          <div className="mb-4">
            {/* Google Sign In */}
            <button
              onClick={onSignIn}
              className="w-full bg-white hover:bg-slate-50 text-gray-700 px-3 py-2.5 rounded-full font-medium transition-all flex items-center justify-center gap-2.5 border border-slate-200 hover:border-slate-300 cursor-pointer text-sm shadow-sm active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          {/* Footer */}
          <p className="text-gray-400 text-[10px] text-center">
            By signing in, you agree to our <button onClick={() => setShowTermsOfService(true)} className="text-gray-600 hover:text-gray-900 cursor-pointer underline">Terms</button> and <button onClick={() => setShowPrivacyPolicy(true)} className="text-gray-600 hover:text-gray-900 cursor-pointer underline">Privacy Policy</button>
          </p>

          {/* Footer Links */}
          <div className="flex items-center justify-center gap-2 text-gray-400 text-[10px] mt-4">
            <button onClick={() => setShowHelp(true)} className="hover:text-gray-900 cursor-pointer">Help</button>
            <span className="text-gray-300">•</span>
            <a href="mailto:support@embraze.app" className="hover:text-gray-900">Support</a>
          </div>

          {/* Open Source Notice */}
          <p className="text-gray-400 text-[10px] text-center mt-2">
            Open source emergency alert system
          </p>
        </div>
      </div>

      {/* Modals */}
      {showPrivacyPolicy && <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />}
      {showTermsOfService && <TermsOfService onClose={() => setShowTermsOfService(false)} />}
      {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}
    </div>
  );
}

export default LoginScreen;
