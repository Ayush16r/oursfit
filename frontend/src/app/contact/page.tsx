"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-8">Contact Us</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xl font-bold text-black mb-4 uppercase tracking-widest">Get in Touch</h2>
            <p className="text-gray-700 mb-6">Have questions about an order, our products, or just want to say hi? We'd love to hear from you.</p>
            <div className="space-y-4">
              <div>
                <p className="font-bold uppercase tracking-widest text-sm">Email</p>
                <p className="text-gray-600">support@oursfit.com</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-widest text-sm">Phone</p>
                <p className="text-gray-600">+91 98765 43210</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-widest text-sm">Address</p>
                <p className="text-gray-600">OursFit HQ, 123 Fashion Street, Mumbai, MH 400001, India</p>
              </div>
            </div>
          </div>
          <div>
            {submitted ? (
              <div className="bg-green-100 text-green-800 p-6 rounded text-center">
                <p className="font-bold">Message Sent!</p>
                <p className="text-sm mt-2">We will get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-transparent border border-border focus:border-foreground focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 bg-transparent border border-border focus:border-foreground focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Message</label>
                  <textarea required rows={4} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full p-3 bg-transparent border border-border focus:border-foreground focus:outline-none transition-colors"></textarea>
                </div>
                <button type="submit" className="w-full btn-primary">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
