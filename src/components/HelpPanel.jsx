import { 
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';
import { useState } from 'react';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';

function HelpPanel({ onClose }) {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);

  const faqs = [
    {
      question: "How do I send an emergency alert?",
      answer: "Long press (3 seconds) on an emergency type (Fire, Accident, or Life Threat) from the Request Help menu. You can optionally add photos and notes before sending."
    },
    {
      question: "Why is there a 25-minute cooldown?",
      answer: "The cooldown prevents alert abuse and ensures the system remains reliable for genuine emergencies. Plan accordingly and use the service responsibly."
    },
    {
      question: "How do I stop an active alert?",
      answer: "Tap the 'Stop Alert' button in the banner at the top of the screen. Your family will be notified that the emergency has ended."
    },
    {
      question: "Can I see where my family members are?",
      answer: "Yes, family members' locations appear as profile markers on the map. Tap a marker to see details and navigate to them."
    },
    {
      question: "How do I create a family circle?",
      answer: "Go to the Family tab, tap 'Create Family Circle', enter a name, and share the 6-character invite code with family members. Codes expire after 25 seconds."
    },
    {
      question: "How many people can join my family?",
      answer: "Up to 6 members total (creator + 5 additional members). Only the creator can remove members."
    },
    {
      question: "Location not updating?",
      answer: "Check your browser's location permissions in settings. Make sure location services are enabled and refresh the page."
    },
    {
      question: "How do I navigate to someone?",
      answer: "Tap their marker on the map or use the Navigate button in notifications. The route will display with distance and estimated time."
    },
    {
      question: "Can I add photos to alerts?",
      answer: "Yes, up to 3 photos per alert. Photos are automatically compressed to ensure fast delivery. Use your camera or select from gallery."
    },
    {
      question: "Where can I see past alerts?",
      answer: "Check the History tab to see all alerts from the last 30 days. You can filter by 'Mine', 'Family', or 'All'."
    },
    {
      question: "What happens to my data?",
      answer: "Alert history is kept for 30 days. You can clear individual alerts or all history anytime. Account data is deleted when you delete your account."
    },
    {
      question: "Is this a replacement for 911?",
      answer: "NO. Always call emergency services (911, 112, etc.) first for real emergencies. Embraze notifies your family, not emergency responders."
    }
  ];

  // If used as a modal (has onClose prop), render as modal
  if (onClose) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-3">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
            <div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight">Help & Support</h2>
              <p className="text-[9px] text-gray-600 font-medium mt-0.5">We're here to help</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all cursor-pointer"
            >
              <XMarkIcon className="w-4 h-4 text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <div className="text-xs text-gray-600 leading-relaxed">
              {/* FAQs */}
              <div>
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Common Questions</h4>
                <div className="space-y-2">
                  {faqs.map((faq, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100/50 hover:shadow-md hover:border-blue-100 transition-all">
                      <p className="text-xs font-bold text-gray-900 mb-1.5 tracking-tight">{faq.question}</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="mt-4">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Get in Touch</h4>
                <div className="space-y-2">
                  <a 
                    href="mailto:support@embraze.app" 
                    className="flex items-center gap-3 text-xs text-gray-700 hover:text-blue-600 transition-all bg-white rounded-lg p-3 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-100 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <ChatBubbleLeftRightIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-xs">Email Support</p>
                      <p className="text-[10px] text-gray-600">support@embraze.app</p>
                    </div>
                  </a>
                  <a 
                    href="mailto:bugs@embraze.app" 
                    className="flex items-center gap-3 text-xs text-gray-700 hover:text-blue-600 transition-all bg-white rounded-lg p-3 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-100 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <QuestionMarkCircleIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-xs">Report an Issue</p>
                      <p className="text-[10px] text-gray-600">bugs@embraze.app</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Legal */}
              <div className="mt-4">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Legal</h4>
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100/50 space-y-2">
                  <button 
                    onClick={() => setShowPrivacyPolicy(true)}
                    className="flex items-center justify-between text-xs text-gray-700 hover:text-blue-600 transition-colors py-2 cursor-pointer w-full"
                  >
                    <span className="font-medium">Privacy Policy</span>
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div className="border-t border-gray-100" />
                  <button 
                    onClick={() => setShowTermsOfService(true)}
                    className="flex items-center justify-between text-xs text-gray-700 hover:text-blue-600 transition-colors py-2 cursor-pointer w-full"
                  >
                    <span className="font-medium">Terms of Service</span>
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Version */}
              <div className="mt-4">
                <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
                  <p className="text-[10px] text-gray-600 font-semibold">Embraze v1.0.0</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Your safety network</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-full font-bold transition-all text-xs cursor-pointer shadow-sm active:scale-95"
            >
              Close
            </button>
          </div>

          {/* Nested Modals */}
          {showPrivacyPolicy && <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />}
          {showTermsOfService && <TermsOfService onClose={() => setShowTermsOfService(false)} />}
        </div>
      </div>
    );
  }

  // Otherwise, render as a panel (original behavior)
  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-slate-200 bg-slate-50">
        <h3 className="text-sm font-bold text-gray-900 tracking-tight">Help & Support</h3>
        <p className="text-[9px] text-gray-600 font-medium mt-0.5">We're here to help</p>
      </div>
      
      <div className="overflow-y-auto flex-1 px-3 py-2.5 space-y-3">
        {/* FAQs */}
        <div>
          <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2">Common Questions</h4>
          <div className="space-y-1.5">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100/50 hover:shadow-md hover:border-blue-100 transition-all">
                <p className="text-[10px] font-bold text-gray-900 mb-1 tracking-tight">{faq.question}</p>
                <p className="text-[10px] text-gray-600 leading-snug">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2">Get in Touch</h4>
          <div className="space-y-1.5">
            <a 
              href="mailto:support@embraze.app" 
              className="flex items-center gap-2 text-xs text-gray-700 hover:text-blue-600 transition-all bg-white rounded-lg p-2.5 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-100 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <ChatBubbleLeftRightIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-[10px]">Email Support</p>
                <p className="text-[9px] text-gray-600">support@embraze.app</p>
              </div>
            </a>
            <a 
              href="mailto:bugs@embraze.app" 
              className="flex items-center gap-2 text-xs text-gray-700 hover:text-blue-600 transition-all bg-white rounded-lg p-2.5 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-100 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-[10px]">Report an Issue</p>
                <p className="text-[9px] text-gray-600">bugs@embraze.app</p>
              </div>
            </a>
          </div>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2">Legal</h4>
          <div className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100/50 space-y-1.5">
            <button 
              onClick={() => setShowPrivacyPolicy(true)}
              className="flex items-center justify-between text-[10px] text-gray-700 hover:text-blue-600 transition-colors py-1.5 cursor-pointer w-full"
            >
              <span className="font-medium">Privacy Policy</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="border-t border-gray-100" />
            <button 
              onClick={() => setShowTermsOfService(true)}
              className="flex items-center justify-between text-[10px] text-gray-700 hover:text-blue-600 transition-colors py-1.5 cursor-pointer w-full"
            >
              <span className="font-medium">Terms of Service</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Version */}
        <div className="pt-1.5">
          <div className="bg-slate-50 rounded-lg p-2.5 text-center border border-slate-200">
            <p className="text-[9px] text-gray-600 font-semibold">Embraze v1.0.0</p>
            <p className="text-[8px] text-gray-500 mt-0.5">Your safety network</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPrivacyPolicy && <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />}
      {showTermsOfService && <TermsOfService onClose={() => setShowTermsOfService(false)} />}
    </div>
  );
}

export default HelpPanel;
