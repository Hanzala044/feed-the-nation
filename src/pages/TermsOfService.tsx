import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f1e8] to-[#e8e0d3]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-700 hover:bg-white/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using FOOD 4 U, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Use License</h2>
              <p>Permission is granted to temporarily use FOOD 4 U for personal, non-commercial use only. This license shall automatically terminate if you violate any of these restrictions.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
              <p>When you create an account with us, you must provide accurate and complete information. You are responsible for:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Maintaining the security of your account</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Donor and Volunteer Responsibilities</h2>
              <p>As a user of FOOD 4 U, you agree to:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Provide accurate information about food donations</li>
                <li>Ensure food safety and quality standards</li>
                <li>Respect other users' privacy and safety</li>
                <li>Use the platform for its intended purpose only</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Prohibited Uses</h2>
              <p>You may not use our service:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>For any unlawful purpose</li>
                <li>To harass, abuse, or harm others</li>
                <li>To transmit any viruses or malicious code</li>
                <li>To collect or track personal information of others</li>
                <li>To spam or send unsolicited messages</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Limitation of Liability</h2>
              <p>
                FOOD 4 U shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any changes by updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Contact Information</h2>
              <p>If you have any questions about these Terms of Service, please contact us at:</p>
              <p className="font-semibold">support@food4u.com</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;



