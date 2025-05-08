import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiMail,
  FiPhone,
  
  FiHeart,
  FiTwitter,
  FiInstagram,
  FiFacebook,
  FiLinkedin,
  
  FiSend,
  FiChevronRight
} from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <footer className="bg-gradient-to-br from-primary-dark to-primary py-10 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-secondary/30 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-accent/20 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="flex flex-wrap -mx-4"
          variants={footerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="w-full md:w-5/12 lg:w-4/12 px-4 mb-8 md:mb-0">
            <Link to="/" className="flex items-center font-display text-xl font-bold mb-4">
              <img
                src="/ProductWhisper Logo Design.png"
                alt="ProductWhisper Logo"
                className="h-10 w-10 rounded-full mr-3 object-cover shadow-lg border border-white/20"
              />
              <div className="flex flex-col leading-none">
                <span className="text-white font-bold">Product<span className="text-secondary">Whisper</span></span>
                <span className="text-xs text-white/70 font-normal mt-0.5">Sentiment Analysis</span>
              </div>
            </Link>
            <p className="text-white/80 mb-4 text-sm leading-relaxed pr-4">
              Discover what people really think about products with our advanced sentiment analysis platform.
            </p>
            <div className="flex space-x-3">
              {[FiTwitter, FiFacebook, FiInstagram, FiLinkedin].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white hover:bg-secondary hover:text-white transition-all duration-300"
                  whileHover={{ y: -2, scale: 1.05 }}
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links Section - Using flexbox for a more compact layout */}
          <motion.div variants={itemVariants} className="w-full md:w-7/12 lg:w-8/12 px-4">
            <div className="flex flex-wrap -mx-4">
              {/* Quick Links */}
              <div className="w-1/2 sm:w-1/3 px-4 mb-8">
                <h3 className="text-base font-display font-semibold mb-4 text-white">Quick Links</h3>
                <ul className="space-y-2">
                  {['Home', 'Search', 'Trends', 'Compare'].map((item, index) => (
                    <li key={index}>
                      <Link
                        to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                        className="text-white/70 hover:text-secondary transition-colors flex items-center group text-sm"
                      >
                        <FiChevronRight className="mr-1.5 text-secondary transition-transform duration-300 group-hover:translate-x-1" size={12} />
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company Links */}
              <div className="w-1/2 sm:w-1/3 px-4 mb-8">
                <h3 className="text-base font-display font-semibold mb-4 text-white">Company</h3>
                <ul className="space-y-2">
                  {['About', 'Contact', 'Privacy', 'Terms'].map((item, index) => (
                    <li key={index}>
                      <Link
                        to={index < 2 ? `/${item.toLowerCase()}` : '#'}
                        className="text-white/70 hover:text-secondary transition-colors flex items-center group text-sm"
                      >
                        <FiChevronRight className="mr-1.5 text-secondary transition-transform duration-300 group-hover:translate-x-1" size={12} />
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact & Newsletter - Combined for space efficiency */}
              <div className="w-full sm:w-1/3 px-4 mb-8">
                <h3 className="text-base font-display font-semibold mb-4 text-white">Contact Us</h3>
                <div className="space-y-2 mb-4">
                  <a href="mailto:info@productwhisper.com" className="text-white/70 hover:text-secondary transition-colors flex items-center text-sm">
                    <FiMail className="text-secondary mr-2" size={14} />
                    info@productwhisper.com
                  </a>
                  <a href="tel:+11234567890" className="text-white/70 hover:text-secondary transition-colors flex items-center text-sm">
                    <FiPhone className="text-secondary mr-2" size={14} />
                    (123) 456-7890
                  </a>
                </div>

                {/* Compact Newsletter */}
                <form className="relative mt-4">
                  <div className="flex">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="w-full bg-white/10 text-white px-3 py-2 rounded-l-md focus:outline-none focus:ring-1 focus:ring-secondary border border-white/10 placeholder:text-white/50 text-sm"
                    />
                    <button
                      type="submit"
                      className="bg-secondary hover:bg-secondary-light text-white px-3 py-2 rounded-r-md transition-colors"
                      aria-label="Subscribe"
                    >
                      <FiSend size={16} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Divider with gradient */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4"></div>

        {/* Copyright - More compact */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-white/60 text-xs">
          <p>&copy; {currentYear} ProductWhisper. All rights reserved.</p>
          <div className="mt-2 sm:mt-0 flex items-center space-x-4">
            <Link to="/privacy" className="hover:text-secondary transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-secondary transition-colors">Terms</Link>
            <p className="flex items-center">
              <FiHeart className="text-secondary mx-1" size={12} /> ProductWhisper
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
