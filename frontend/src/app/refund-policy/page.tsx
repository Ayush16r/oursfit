"use client";

import React from "react";
import { motion } from "framer-motion";

export default function RefundPolicy() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-8">Refund & Cancellation Policy</h1>
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <section>
            <h2 className="text-xl font-bold text-black mb-2 uppercase tracking-widest">1. Returns</h2>
            <p>We offer a 7-day return policy for unused and unwashed items with tags attached. If 7 days have gone by since your purchase was delivered, unfortunately, we cannot offer you a refund or exchange.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-black mb-2 uppercase tracking-widest">2. Refunds</h2>
            <p>Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed via your original method of payment (e.g., Razorpay) within 5-7 business days.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-black mb-2 uppercase tracking-widest">3. Exchanges</h2>
            <p>We only replace items if they are defective or damaged upon arrival. If you need to exchange it for the same item, send us an email at support@oursfit.com.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-black mb-2 uppercase tracking-widest">4. Cancellations</h2>
            <p>Orders can only be cancelled before they are dispatched. Once an order is shipped, the standard return policy applies.</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
