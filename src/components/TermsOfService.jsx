import { XMarkIcon } from '@heroicons/react/24/solid';

function TermsOfService({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-3">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <h2 className="text-base font-bold text-gray-900 tracking-tight">Terms of Service</h2>
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
            <p className="mb-3 text-[10px]">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">1. Acceptance of Terms</h3>
              <p>By accessing and using Embraze, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">2. Service Description</h3>
              <p>Embraze is an emergency alert platform that allows you to share your real-time location and emergency details with your family circle during emergencies. Features include:</p>
              <ul className="list-disc pl-4 space-y-1 mt-2">
                <li>Emergency alerts with location sharing</li>
                <li>Three emergency types: Fire, Accident, Life Threat</li>
                <li>Photo and note attachments</li>
                <li>Real-time navigation to family members</li>
                <li>Alert history and notifications</li>
                <li>Family circle management (up to 6 members)</li>
              </ul>
              <p className="mt-2">The service is provided "as is" and is intended to supplement, not replace, traditional emergency services.</p>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">3. User Responsibilities</h3>
              <p className="mb-2">You agree to:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Provide accurate and current information</li>
                <li>Use the service responsibly and not abuse the emergency alert feature</li>
                <li>Contact local emergency services (911 or equivalent) for actual emergencies</li>
                <li>Maintain the confidentiality of your account</li>
                <li>Not use the service for any illegal purposes</li>
                <li>Respect the 25-minute cooldown period between alerts</li>
                <li>Not send false or misleading emergency alerts</li>
                <li>Only upload appropriate photos related to emergencies</li>
              </ul>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">4. Emergency Services Disclaimer</h3>
              <p className="font-semibold text-red-600 mb-1.5 text-xs">CRITICAL NOTICE:</p>
              <p className="mb-2">Embraze is NOT a replacement for emergency services. In case of a real emergency:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Always call your local emergency number FIRST (911 in the US, 112 in Europe, etc.)</li>
                <li>Use Embraze to notify your family members as a secondary measure</li>
                <li>Do not rely solely on Embraze for emergency response</li>
              </ul>
              <p className="mt-2">Our service is designed to notify your family members, not emergency responders.</p>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">5. Alert Cooldown Period</h3>
              <p>To prevent abuse, users are limited to one emergency alert every 25 minutes. This cooldown period begins when you send an alert and cannot be bypassed.</p>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">6. Family Circles</h3>
              <p className="mb-2">Family circle features:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Maximum 6 members per family circle</li>
                <li>Invite codes expire after 25 seconds</li>
                <li>Only the creator can remove members</li>
                <li>All members can see each other's emergency alerts</li>
                <li>Members can leave at any time</li>
              </ul>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">7. Content Guidelines</h3>
              <p className="mb-2">When uploading photos or notes:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Photos are automatically compressed to max 1200x1200px</li>
                <li>Maximum 3 photos per alert</li>
                <li>Notes limited to 200 characters</li>
                <li>Content must be relevant to the emergency</li>
                <li>No inappropriate, offensive, or illegal content</li>
              </ul>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">8. Limitation of Liability</h3>
              <p className="mb-2">Embraze and its operators shall not be liable for any damages arising from:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Use or inability to use the service</li>
                <li>Delayed notifications or location inaccuracies</li>
                <li>Service interruptions or technical issues</li>
                <li>Failure to receive emergency alerts</li>
                <li>Navigation errors or route inaccuracies</li>
                <li>Loss of data or alert history</li>
              </ul>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">9. Service Availability</h3>
              <p>We strive to maintain service availability but do not guarantee uninterrupted access. The service may be temporarily unavailable due to maintenance, updates, or technical issues. We are not responsible for issues caused by third-party services (Google Maps, Firebase, etc.).</p>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">10. Account Termination</h3>
              <p className="mb-2">We reserve the right to suspend or terminate accounts that:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Violate these terms</li>
                <li>Send false or abusive emergency alerts</li>
                <li>Harass other users</li>
                <li>Attempt to circumvent cooldown periods</li>
                <li>Upload inappropriate content</li>
              </ul>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">11. Data and Privacy</h3>
              <p>Your use of Embraze is also governed by our Privacy Policy. Please review it to understand how we collect, use, and protect your information.</p>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">12. Changes to Terms</h3>
              <p>We may update these Terms of Service from time to time. Continued use of the service after changes constitutes acceptance of the new terms. We will notify users of significant changes.</p>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">13. Contact Information</h3>
              <p>For questions about these Terms of Service, contact us at:</p>
              <p className="mt-1.5 font-semibold text-blue-600">support@embraze.app</p>
            </section>
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
      </div>
    </div>
  );
}

export default TermsOfService;
