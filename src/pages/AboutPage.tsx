import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiBarChart2, FiUsers, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import AnimatedCircles from '../components/ui/AnimatedCircles';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <AnimatedCircles variant="mixed" count={10} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        {/* Hero Section */}
        <div className="relative mb-16 bg-gradient-primary rounded-2xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-secondary/30 blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-accent/20 blur-3xl"></div>
          </div>

          <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-20 text-center">
            <motion.h1
              className="text-3xl md:text-5xl font-display font-bold text-white mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              About ProductWhisper
            </motion.h1>
            <motion.p
              className="text-white/80 text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Transforming how people discover and choose products through advanced sentiment analysis
            </motion.p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 -mt-24">
          {[
            { icon: FiUsers, value: "50K+", label: "Active Users", color: "primary" },
            { icon: FiBarChart2, value: "1M+", label: "Reviews Analyzed", color: "secondary" },
            { icon: FiAward, value: "95%", label: "Accuracy Rate", color: "accent" },
            { icon: FiTrendingUp, value: "3K+", label: "Products Tracked", color: "primary" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
              whileHover={{ y: -5, boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
              <div className={`bg-${stat.color}/10 p-4 rounded-full mb-4 text-${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Mission and Values Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <motion.div
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 relative overflow-hidden"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-tr-full"></div>

            <div className="flex items-center mb-6">
              <div className="bg-primary/10 p-3 rounded-full text-primary mr-4">
                <FiCheckCircle size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 font-display">Our Mission</h2>
            </div>

            <div className="space-y-4 relative z-10">
              <p className="text-gray-700">
                At ProductWhisper, our mission is to help consumers make informed purchasing decisions by providing
                unbiased, data-driven insights into products across various categories. We believe in the power of
                authentic user experiences and leverage advanced sentiment analysis to cut through marketing hype.
              </p>
              <p className="text-gray-700">
                We're committed to transparency, accuracy, and continuously improving our platform to better serve
                our community of discerning shoppers.
              </p>

              <div className="pt-4 mt-4 border-t border-gray-100">
                <h3 className="font-medium text-gray-900 mb-3">Our Core Values</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Data-Driven Insights",
                    "User Privacy",
                    "Continuous Innovation",
                    "Transparency"
                  ].map((value, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      <span className="text-gray-700 text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 relative overflow-hidden"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-secondary/5 rounded-br-full"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-secondary/5 rounded-tl-full"></div>

            <div className="flex items-center mb-6">
              <div className="bg-secondary/10 p-3 rounded-full text-secondary mr-4">
                <FiUsers size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 font-display">Our Story</h2>
            </div>

            <div className="space-y-4 relative z-10">
              <p className="text-gray-700">
                ProductWhisper was founded in 2023 by a team of technology enthusiasts and consumer advocates who
                were frustrated with the lack of reliable product information online. We noticed that traditional
                review platforms were often filled with fake reviews, biased opinions, or simply lacked the depth
                needed to make confident purchasing decisions.
              </p>
              <p className="text-gray-700">
                We set out to build a platform that uses advanced natural language processing and machine learning
                to analyze thousands of authentic user reviews and comments from across the web. Our technology
                identifies patterns, sentiment, and specific product attributes that matter most to consumers.
              </p>

              <div className="pt-4 mt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">2023</div>
                    <div className="text-xs text-gray-500">Founded</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">15+</div>
                    <div className="text-xs text-gray-500">Team Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">3</div>
                    <div className="text-xs text-gray-500">Global Offices</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Technology Section */}
        <div className="relative mb-16">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl"></div>

          <motion.div
            className="relative bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              <div className="md:w-1/3">
                <div className="sticky top-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-primary/10 p-3 rounded-full text-primary mr-4">
                      <FiBarChart2 size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 font-display">Our Technology</h2>
                  </div>

                  <p className="text-gray-700 mb-6">
                    At the heart of ProductWhisper is our proprietary sentiment analysis engine that processes millions of reviews to extract meaningful insights.
                  </p>

                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <h3 className="font-medium text-primary mb-2">Why It Matters</h3>
                    <p className="text-gray-600 text-sm">
                      Our technology provides a comprehensive, nuanced understanding of products that goes far beyond simple star ratings, helping consumers make truly informed decisions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="md:w-2/3">
                <div className="space-y-6">
                  {[
                    {
                      title: "Data Collection",
                      description: "We collect and analyze thousands of authentic user reviews from across the internet",
                      details: "Our crawlers scan hundreds of e-commerce sites, forums, and social media platforms to gather diverse opinions."
                    },
                    {
                      title: "Feature Extraction",
                      description: "Our natural language processing algorithms identify key product attributes and features",
                      details: "We use advanced NLP techniques to identify what aspects of products matter most to consumers."
                    },
                    {
                      title: "Sentiment Analysis",
                      description: "We measure sentiment around each attribute to understand what users truly love or dislike",
                      details: "Our sentiment engine can detect subtle nuances in language, including sarcasm and context-dependent opinions."
                    },
                    {
                      title: "Entity Recognition",
                      description: "Our entity recognition system distinguishes between different product models and versions",
                      details: "We can accurately differentiate between similar products and track sentiment for specific model variations."
                    },
                    {
                      title: "Trend Tracking",
                      description: "We track sentiment trends over time to identify quality changes or emerging issues",
                      details: "Our temporal analysis can detect when product quality changes after firmware updates or new releases."
                    }
                  ].map((step, index) => (
                    <motion.div
                      key={index}
                      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 + (index * 0.1) }}
                    >
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium mr-4">
                          {index + 1}
                        </div>
                        <h3 className="font-display font-semibold text-lg text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-700 mb-3">{step.description}</p>
                      <p className="text-gray-500 text-sm italic">{step.details}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Team Section */}
        <div className="relative mb-16">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-transparent rounded-2xl"></div>

          <motion.div
            className="relative bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="text-center mb-12">
              <motion.div
                className="inline-block bg-secondary/10 p-3 rounded-full text-secondary mb-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <FiUsers size={28} />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 font-display mb-4">Meet Our Team</h2>
              <p className="text-gray-700 max-w-2xl mx-auto">
                ProductWhisper is built by a diverse team of technologists, data scientists, product experts, and
                consumer advocates who are passionate about helping people make better purchasing decisions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Alex Johnson",
                  role: "Founder & CEO",
                  bio: "Former product lead at Amazon with a passion for consumer advocacy.",
                  image: "https://randomuser.me/api/portraits/men/32.jpg"
                },
                {
                  name: "Samantha Chen",
                  role: "Chief Data Scientist",
                  bio: "PhD in Machine Learning with expertise in natural language processing.",
                  image: "https://randomuser.me/api/portraits/women/44.jpg"
                },
                {
                  name: "Marcus Williams",
                  role: "Head of Product",
                  bio: "Consumer tech expert with 10+ years experience in product management.",
                  image: "https://randomuser.me/api/portraits/men/68.jpg"
                },
                {
                  name: "Priya Patel",
                  role: "Lead Engineer",
                  bio: "Full-stack developer specializing in scalable data processing systems.",
                  image: "https://randomuser.me/api/portraits/women/65.jpg"
                },
                {
                  name: "David Kim",
                  role: "UX Director",
                  bio: "Award-winning designer focused on creating intuitive user experiences.",
                  image: "https://randomuser.me/api/portraits/men/75.jpg"
                },
                {
                  name: "Olivia Rodriguez",
                  role: "Content Director",
                  bio: "Former tech journalist with a keen eye for product trends and insights.",
                  image: "https://randomuser.me/api/portraits/women/90.jpg"
                }
              ].map((member, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + (index * 0.1) }}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-secondary/20">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-lg text-gray-900">{member.name}</h3>
                      <p className="text-secondary text-sm font-medium">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <motion.button
                className="px-6 py-3 bg-secondary/10 text-secondary font-medium rounded-lg hover:bg-secondary/20 transition-colors inline-flex items-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiUsers className="mr-2" />
                Join Our Team
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutPage;
