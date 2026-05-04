"use client";

import React from "react";
import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <section>
            <h2 className="text-xl font-bold text-black mb-2 uppercase tracking-widest">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you create an account, make a purchase, or contact customer support. This may include your name, email address, shipping address, and payment information.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-black mb-2 uppercase tracking-widest">2. How We Use Your Information</h2>
            <p>We use the information we collect to process your orders, communicate with you, and improve our services. We may also send you promotional emails if you have opted in to receive them.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-black mb-2 uppercase tracking-widest">3. Information Sharing</h2>
            <p>We do not sell your personal information. We may share your information with third-party service providers (such as Razorpay for payment processing and shipping partners) solely for the purpose of fulfilling your orders.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-black mb-2 uppercase tracking-widest">4. Security</h2>
            <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access. However, no security system is impenetrable, and we cannot guarantee the security of our databases.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-black mb-2 uppercase tracking-widest">5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at support@oursfit.com.</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
