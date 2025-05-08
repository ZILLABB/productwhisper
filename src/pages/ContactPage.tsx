import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend,
  FiMessageCircle,
  FiHelpCircle,
  FiCheckCircle,
  FiAlertCircle,
  FiClock
} from 'react-icons/fi';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Reset form and show success message
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitSuccess(true);

      // Hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (_) {
      setSubmitError('There was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        {/* Hero Section */}
        <div className="relative mb-16 bg-gradient-primary rounded-premium overflow-hidden shadow-premium">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-secondary/30 blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-accent/20 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full bg-white/20 blur-2xl"></div>
            <div className="absolute bottom-1/3 right-1/3 w-32 h-32 rounded-full bg-primary-light/20 blur-2xl"></div>
          </div>

          <motion.div
            className="relative z-10 px-6 py-16 sm:px-12 sm:py-20 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">Get in Touch</h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Have questions about ProductWhisper? We're here to help and would love to hear from you.
            </p>
            <motion.div
              className="w-24 h-1 bg-secondary mx-auto mt-8"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 96, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </motion.div>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 -mt-24">
          <motion.div
            className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center"
            whileHover={{ y: -5, boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div className="bg-primary/10 p-4 rounded-full mb-6 text-primary">
              <FiMail size={28} />
            </div>
            <h3 className="text-xl font-display font-semibold mb-3 text-gray-900">Email Us</h3>
            <p className="text-gray-600 mb-6">Our friendly team is here to help with any questions.</p>
            <a
              href="mailto:hello@productwhisper.com"
              className="text-primary font-medium hover:text-primary-dark transition-colors inline-flex items-center"
            >
              hello@productwhisper.com
            </a>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center"
            whileHover={{ y: -5, boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div className="bg-secondary/10 p-4 rounded-full mb-6 text-secondary">
              <FiPhone size={28} />
            </div>
            <h3 className="text-xl font-display font-semibold mb-3 text-gray-900">Call Us</h3>
            <p className="text-gray-600 mb-6">Mon-Fri from 8am to 5pm PST. We'd love to hear from you.</p>
            <a
              href="tel:+1234567890"
              className="text-secondary font-medium hover:text-secondary-dark transition-colors inline-flex items-center"
            >
              +1 (234) 567-890
            </a>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center"
            whileHover={{ y: -5, boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div className="bg-accent/10 p-4 rounded-full mb-6 text-accent">
              <FiMapPin size={28} />
            </div>
            <h3 className="text-xl font-display font-semibold mb-3 text-gray-900">Visit Us</h3>
            <p className="text-gray-600 mb-6">Come say hello at our headquarters in Tech City.</p>
            <p className="text-accent font-medium">
              123 Innovation Way<br />
              Tech City, CA 94043
            </p>
          </motion.div>
        </div>

        {/* Contact Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
          {/* Left Column - Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
              <div className="flex items-center mb-8">
                <div className="bg-primary/10 p-3 rounded-full text-primary mr-4">
                  <FiMessageCircle size={24} />
                </div>
                <h2 className="text-2xl font-display font-semibold text-gray-900">Send Us a Message</h2>
              </div>

              <AnimatePresence>
                {submitSuccess && (
                  <motion.div
                    className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg mb-8 flex items-start"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <FiCheckCircle className="mr-3 mt-0.5 flex-shrink-0" size={18} />
                    <p>Thank you for your message! We'll get back to you soon.</p>
                  </motion.div>
                )}

                {submitError && (
                  <motion.div
                    className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8 flex items-start"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <FiAlertCircle className="mr-3 mt-0.5 flex-shrink-0" size={18} />
                    <p>{submitError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-colors"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-colors"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-colors"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="feedback">Product Feedback</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-colors"
                    placeholder="How can we help you?"
                    required
                  ></textarea>
                </div>

                <div>
                  <motion.button
                    type="submit"
                    className="px-6 py-3 bg-primary text-white font-medium rounded-lg shadow-sm hover:bg-primary-dark transition-colors flex items-center justify-center"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FiSend className="mr-2" size={18} />
                        Send Message
                      </span>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - FAQ and Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 mb-8">
              <div className="flex items-center mb-6">
                <div className="bg-secondary/10 p-3 rounded-full text-secondary mr-4">
                  <FiHelpCircle size={24} />
                </div>
                <h2 className="text-xl font-display font-semibold text-gray-900">Frequently Asked</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">How does ProductWhisper work?</h3>
                  <p className="text-gray-600 text-sm">ProductWhisper uses advanced sentiment analysis to analyze product reviews and provide insights into what people really think.</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Is there a free trial available?</h3>
                  <p className="text-gray-600 text-sm">Yes, we offer a 14-day free trial with full access to all features. No credit card required.</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">How accurate is the sentiment analysis?</h3>
                  <p className="text-gray-600 text-sm">Our sentiment analysis has been trained on millions of reviews and achieves over 90% accuracy in most product categories.</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <div className="bg-white/80 p-3 rounded-full text-primary mr-4">
                  <FiClock size={24} />
                </div>
                <h2 className="text-xl font-display font-semibold text-gray-900">Business Hours</h2>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Monday - Friday</span>
                  <span className="font-medium text-gray-900">8:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Saturday</span>
                  <span className="font-medium text-gray-900">10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Sunday</span>
                  <span className="font-medium text-gray-900">Closed</span>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-200">
                  <p className="text-gray-600 text-sm">
                    All times are in Pacific Standard Time (PST).
                    Our support team typically responds within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactPage;
