import { XMarkIcon } from '@heroicons/react/24/solid';

function PrivacyPolicy({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-3">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <h2 className="text-base font-bold text-gray-900 tracking-tight">Privacy Policy</h2>
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
              <h3 className="text-sm font-bold text-gray-900 mb-2">1. Information We Collect</h3>
              <p className="mb-2">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Name and email address (via Google Sign-In)</li>
                <li>Profile photo (via Google Sign-In)</li>
                <li>Phone number (optional)</li>
                <li>Real-time location data when you activate emergency alerts</li>
                <li>Emergency alert details (type, notes, photos)</li>
                <li>Family circle information and member relationships</li>
                <li>Alert history and timestamps</li>
              </ul>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">2. How We Use Your Information</h3>
              <p className="mb-2">We use the information we collect to:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Provide emergency alert services to you and your family circle</li>
                <li>Display your real-time location on the map during active emergencies</li>
                <li>Enable navigation and communication between family members</li>
                <li>Store and display alert history for reference</li>
                <li>Process and optimize emergency photos for faster delivery</li>
                <li>Improve and maintain our services</li>
                <li>Send notifications about emergency alerts</li>
              </ul>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">3. Information Sharing</h3>
              <p className="mb-2">We share your information only with:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Members of your family circle when you activate an emergency alert</li>
                <li>Your family circle members can see your location, emergency type, notes, and photos</li>
                <li>Service providers (Firebase, Google Maps) who help us operate the platform</li>
              </ul>
              <p className="mt-2 font-semibold">We do not sell your personal information to third parties.</p>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">4. Location Data</h3>
              <p className="mb-2">Your location is collected and shared in the following ways:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Only when you actively trigger an emergency alert</li>
                <li>Continuously updated while your alert is active</li>
                <li>Visible to all members of your family circle</li>
                <li>Stored in alert history for 30 days</li>
              </ul>
              <p className="mt-2">We do not track your location when you're not in an active emergency.</p>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">5. Photo Processing</h3>
              <p>Emergency photos you upload are automatically compressed and resized (max 1200x1200px) to ensure fast delivery during emergencies. Original photos are not stored separately.</p>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">6. Data Security</h3>
              <p className="mb-2">We implement appropriate security measures including:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Secure authentication via Google Sign-In</li>
                <li>Encrypted data transmission (HTTPS)</li>
                <li>Firebase security rules to protect your data</li>
                <li>Regular security updates and monitoring</li>
              </ul>
              <p className="mt-2">However, no method of transmission over the internet is 100% secure.</p>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">7. Data Retention</h3>
              <p className="mb-2">We retain your data as follows:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Active alerts: Until you stop them</li>
                <li>Alert history: 30 days from creation</li>
                <li>Account information: Until you delete your account</li>
                <li>Family circle data: Until you leave or delete the circle</li>
              </ul>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">8. Your Rights</h3>
              <p className="mb-2">You have the right to:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Access your personal information</li>
                <li>Update or correct your information</li>
                <li>Delete your account and associated data</li>
                <li>Stop emergency alerts at any time</li>
                <li>Leave family circles</li>
                <li>Clear your alert history</li>
                <li>Control location sharing permissions</li>
              </ul>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">9. Children's Privacy</h3>
              <p>Embraze is not intended for users under 13 years of age. We do not knowingly collect information from children under 13.</p>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">10. Contact Us</h3>
              <p>If you have questions about this Privacy Policy, please contact us at:</p>
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

export default PrivacyPolicy;
