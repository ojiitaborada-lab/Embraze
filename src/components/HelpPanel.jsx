import { 
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/solid';

function HelpPanel() {
  const faqs = [
    {
      question: "How do I send an alert?",
      answer: "Tap the orange button to share your location with your family circle."
    },
    {
      question: "Location not updating?",
      answer: "Check your browser's location permissions and refresh the page."
    },
    {
      question: "How to join a family?",
      answer: "Go to Family tab and enter the invite code shared with you."
    },
    {
      question: "View past alerts?",
      answer: "Check the History tab to see alerts from the last 30 days."
    }
  ];

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900">Help & Support</h3>
      </div>
      
      <div className="overflow-y-auto flex-1 px-6 py-8 space-y-8">
        {/* FAQs */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">Common Questions</h4>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                <p className="text-sm font-medium text-gray-900 mb-2">{faq.question}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">Get in Touch</h4>
          <div className="space-y-3">
            <a 
              href="mailto:support@embraze.app" 
              className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-400" />
              <span>support@embraze.app</span>
            </a>
            <a 
              href="mailto:bugs@embraze.app" 
              className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400" />
              <span>Report an issue</span>
            </a>
          </div>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">Legal</h4>
          <div className="space-y-3">
            <a href="#" className="block text-sm text-gray-700 hover:text-gray-900 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="block text-sm text-gray-700 hover:text-gray-900 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>

        {/* Version */}
        <div className="pt-8 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">Embraze v1.0.0</p>
        </div>
      </div>
    </div>
  );
}

export default HelpPanel;
