import { useState, useEffect } from "react";
import { Github, Linkedin, Twitter, Crown, ArrowUp } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner@2.0.3";
import { config } from "../lib/config";
import { AdminLinkButton } from "./AdminLinkButton";

interface LabInfo {
  lab_name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [labInfo, setLabInfo] = useState<LabInfo>({
    lab_name: "King's Lab",
    tagline: "Advancing Artificial Intelligence",
    description: "King's Lab is a world-leading artificial intelligence research laboratory focused on deep learning, computer vision, natural language processing, and reinforcement learning.",
    email: "info@kingslab.ai",
    phone: "+1 (617) 555-0123",
    address: "123 AI Research Park Drive",
    twitter: "https://twitter.com/kingslab",
    linkedin: "https://linkedin.com/company/kingslab",
    github: "https://github.com/kingslab"
  });

  // Fetch lab info from API
  useEffect(() => {
    const fetchLabInfo = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/lab-info`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          const data = result.data || result;
          setLabInfo({
            lab_name: data.lab_name || "King's Lab",
            tagline: data.tagline || "Advancing Artificial Intelligence",
            description: data.description || data.about || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            twitter: data.twitter || data.social_links?.twitter,
            linkedin: data.linkedin || data.social_links?.linkedin,
            github: data.github || data.social_links?.github,
          });
        }
      } catch (error) {
        console.log('Using default lab info');
      }
    };
    fetchLabInfo();
  }, []);

  // Removed aggressive admin page preloading - only load when user clicks admin link

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubscribing(true);
    try {
      // Mock subscription for now (API endpoint not implemented)
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Successfully subscribed to our newsletter!");
      setEmail("");
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const footerLinks = {
    quickLinks: [
      { label: "About Us", href: "#" },
      { label: "Research Areas", href: "#research" },
      { label: "Publications", href: "#publications" },
      { label: "News", href: "#" }
    ],
    resources: [
      { label: "AI Models", href: "#" },
      { label: "Datasets", href: "#" },
      { label: "Code Repository", href: labInfo.github || "#" },
      { label: "Career Opportunities", href: "#contact" }
    ]
  };

  return (
    <footer 
      role="contentinfo" 
      aria-label="Site footer"
      className="bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400 py-12 relative"
    >
      {/* Scroll to Top Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.9 }}
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 dark:bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
      >
        <ArrowUp className="h-5 w-5" aria-hidden="true" />
      </motion.button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <span className="text-white dark:text-gray-100 text-xl">{labInfo.lab_name}</span>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {labInfo.description}
            </p>
          </motion.div>

          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            aria-label="Quick links"
          >
            <h3 className="text-white dark:text-gray-100 mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.quickLinks.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <a 
                    href={link.href} 
                    className="hover:text-white transition-colors inline-block focus:outline-none focus:text-white focus:underline"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.nav>

          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            aria-label="Resources"
          >
            <h3 className="text-white dark:text-gray-100 mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.resources.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <a 
                    href={link.href} 
                    className="hover:text-white transition-colors inline-block focus:outline-none focus:text-white focus:underline"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-white dark:text-gray-100 mb-4">Follow Us</h3>
            <div className="flex gap-4 mb-6">
              {[
                { icon: Twitter, label: "Twitter", url: labInfo.twitter },
                { icon: Linkedin, label: "LinkedIn", url: labInfo.linkedin },
                { icon: Github, label: "GitHub", url: labInfo.github }
              ].map((social, index) => {
                const Icon = social.icon;
                if (!social.url) return null;
                return (
                  <motion.a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.2, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    className="hover:text-white transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                );
              })}
            </div>
            <div>
              <h4 className="text-white dark:text-gray-100 mb-2 text-sm">Newsletter</h4>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                Stay updated with our latest AI research
              </p>
              <form 
                onSubmit={handleSubscribe} 
                className="flex gap-2"
                aria-label="Newsletter subscription"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address for newsletter
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  name="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={subscribing}
                  required
                  aria-required="true"
                  className="flex-1 px-3 py-2 bg-gray-800 dark:bg-gray-950 border border-gray-700 dark:border-gray-800 rounded text-sm focus:border-violet-500 transition-colors"
                />
                <motion.button
                  type="submit"
                  disabled={subscribing}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={subscribing ? "Subscribing..." : "Subscribe to newsletter"}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {subscribing ? "..." : "Subscribe"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-gray-800 dark:border-gray-900 pt-8 text-center text-sm text-gray-400 dark:text-gray-500"
        >
          <div className="flex items-center justify-center gap-4">
            <p>&copy; 2025 {labInfo.lab_name}. All rights reserved.</p>
            <span className="text-gray-600 dark:text-gray-700">•</span>
            <AdminLinkButton variant="footer" showText={true} />
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
