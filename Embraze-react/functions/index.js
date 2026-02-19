const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const {Resend} = require("resend");
const {defineSecret} = require("firebase-functions/params");

admin.initializeApp();

// Define secret for Resend API key
const resendApiKey = defineSecret("RESEND_API_KEY");

// Send emergency email when a new alert is created
exports.sendEmergencyEmail = onDocumentCreated({
  document: "emergencyAlerts/{alertId}",
  secrets: [resendApiKey],
}, async (event) => {
  const alert = event.data.data();
  const alertId = event.params.alertId;

  try {
    // Initialize Resend with API key
    const resend = new Resend(resendApiKey.value());

    // Get user profile to get emergency contacts
    const userDoc = await admin.firestore()
        .collection("users")
        .doc(alert.userId)
        .get();

    if (!userDoc.exists) {
      console.log("User not found:", alert.userId);
      return null;
    }

    const user = userDoc.data();
    const contacts = user.emergencyContacts || [];

    if (contacts.length === 0) {
      console.log("No emergency contacts found for user:", alert.userId);
      return null;
    }

    // Send email to each contact
    const emailPromises = contacts.map((contact) => {
      return resend.emails.send({
        from: "Embraze Alert <onboarding@resend.dev>",
        to: contact.email,
        subject: `🚨 Emergency Alert from ${alert.userName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🚨 Emergency Alert</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #1f2937; margin-top: 0;">${alert.userName} needs help!</h2>
                
                <div style="margin: 20px 0; padding: 15px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 5px;">
                  <p style="margin: 0; color: #991b1b; font-weight: bold;">This is an emergency alert. Please respond immediately.</p>
                </div>
                
                <div style="margin: 20px 0;">
                  <p style="margin: 10px 0; color: #4b5563;"><strong>📍 Location:</strong> ${alert.address}</p>
                  <p style="margin: 10px 0; color: #4b5563;"><strong>📞 Phone:</strong> ${alert.phone || "Not provided"}</p>
                  <p style="margin: 10px 0; color: #4b5563;"><strong>🕐 Time:</strong> ${new Date().toLocaleString()}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://www.google.com/maps?q=${alert.latitude},${alert.longitude}" 
                     style="display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                    📍 View Location on Map
                  </a>
                </div>
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Coordinates: ${alert.latitude}, ${alert.longitude}</p>
                  <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">You are receiving this because you are listed as an emergency contact.</p>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
                <p>Embraze Emergency Alert System</p>
                <p>Stay safe, stay connected.</p>
              </div>
            </div>
          </div>
        `,
      });
    });

    const results = await Promise.all(emailPromises);
    console.log(`✅ Sent ${contacts.length} emergency emails for alert ${alertId}`);
    console.log("Resend results:", results);

    return null;
  } catch (error) {
    console.error("Error sending emergency emails:", error);
    return null;
  }
});
