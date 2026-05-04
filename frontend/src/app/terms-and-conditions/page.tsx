"use client";

import React from "react";
import { motion } from "framer-motion";

export default function TermsAndConditions() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-8">Terms & Conditions</h1>
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <section>
            <h2 className="text-xl font-bold text-black mb-2 uppercase tracking-widest">1. Introduction</h2>
            <p>Welcome to OursFit. By accessing our website, you agree to these Terms and Conditions. Please read them carefully.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-black mb-2 uppercase tracking-widest">2. Products and Pricing</h2>
            <p>All products listed on the website are subject to availability. We reserve the right to modify prices without prior notice. The price displayed at checkout is the final price.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-black mb-2 uppercase tracking-widest">3. Payments</h2>
            <p>We use Razorpay as our secure payment gateway. By completing a transaction, you agree to their processing terms. We do not store your credit/debit card information on our servers.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-black mb-2 uppercase tracking-widest">4. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. OursFit is not liable for unauthorized access to your account.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-black mb-2 uppercase tracking-widest">5. Governing Law</h2>
            <p>These terms shall be governed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts.</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
