import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { MapPin, Phone, Mail, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";
import { useApi } from "../hooks/useApi";
import { api } from "../lib/api";
import { mockContactInfo } from "../lib/mock-data";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch lab info for contact details
  const { data: labInfo, error: labInfoError } = useApi(
    () => api.getLabInfo(),
    {
      lab_name: "",
      tagline: "",
      description: "",
      email: mockContactInfo.email,
      phone: mockContactInfo.phone,
      address: mockContactInfo.address,
    },
    "lab-info" // Add cache key to prevent repeated requests
  );

  // Log data source
  console.log("📞 Contact Section Data:", {
    labInfo,
    fromAPI: !labInfoError,
    email: labInfo?.email,
    phone: labInfo?.phone,
    address: labInfo?.address
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.submitContactForm(formData);
      setIsSubmitted(true);
      toast.success("Message sent successfully! We'll get back to you soon.");

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({ name: "", email: "", subject: "", message: "" });
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (!labInfo) return null;

  const contactInfoItems = [
    {
      icon: MapPin,
      title: "Location",
      content: labInfo.address ? [labInfo.address] : ["Address not available"],
      color: "blue"
    },
    {
      icon: Phone,
      title: "Phone",
      content: labInfo.phone ? [labInfo.phone] : ["Phone not available"],
      color: "green"
    },
    {
      icon: Mail,
      title: "Email",
      content: labInfo.email ? [labInfo.email] : ["Email not available"],
      color: "purple"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-slate-50 via-violet-50/30 to-blue-50/20 dark:from-slate-950 dark:via-violet-950/20 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Decorative top element */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-blue-100 dark:from-violet-950/50 dark:to-blue-950/50 border border-violet-200 dark:border-violet-800 mb-6"
          >
            <Mail className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Let's Connect</span>
          </motion.div>

          <h2 className="mb-4 text-slate-900 dark:text-slate-50 bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent dark:from-violet-400 dark:via-blue-400 dark:to-violet-400">Get In Touch</h2>
          
          {/* Decorative line */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent max-w-xs mx-auto mb-6"
          />
          
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Interested in collaboration or joining our team? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-violet-900/20">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-50">Send us a message</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className={errors.name ? "border-red-500 dark:border-red-600" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"}
                        disabled={isSubmitting}
                        required
                        aria-required="true"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-error" : undefined}
                      />
                      <AnimatePresence>
                        {errors.name && (
                          <motion.p
                            id="name-error"
                            role="alert"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-sm text-red-500"
                          >
                            {errors.name}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className={errors.email ? "border-red-500 dark:border-red-600" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"}
                        disabled={isSubmitting}
                        required
                        aria-required="true"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                      />
                      <AnimatePresence>
                        {errors.email && (
                          <motion.p
                            id="email-error"
                            role="alert"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-sm text-red-500"
                          >
                            {errors.email}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-slate-700 dark:text-slate-300">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="What is this regarding?"
                      value={formData.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      className={errors.subject ? "border-red-500 dark:border-red-600" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"}
                      disabled={isSubmitting}
                      required
                      aria-required="true"
                      aria-invalid={!!errors.subject}
                      aria-describedby={errors.subject ? "subject-error" : undefined}
                    />
                    <AnimatePresence>
                      {errors.subject && (
                        <motion.p
                          id="subject-error"
                          role="alert"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-sm text-red-500"
                        >
                          {errors.subject}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-slate-700 dark:text-slate-300">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      className={errors.message ? "border-red-500 dark:border-red-600" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"}
                      disabled={isSubmitting}
                      required
                      aria-required="true"
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? "message-error" : undefined}
                    />
                    <AnimatePresence>
                      {errors.message && (
                        <motion.p
                          id="message-error"
                          role="alert"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-sm text-red-500"
                        >
                          {errors.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <Button
                    type="submit"
                    className="w-full gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-lg"
                    disabled={isSubmitting || isSubmitted}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Send className="h-4 w-4" />
                        </motion.div>
                        Sending...
                      </>
                    ) : isSubmitted ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Message Sent!
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-6">
            {contactInfoItems.map((info, index) => {
              const Icon = info.icon;
              const colorClasses = {
                blue: {
                  bg: 'bg-blue-50 dark:bg-blue-950/30',
                  text: 'text-blue-600 dark:text-blue-400'
                },
                green: {
                  bg: 'bg-emerald-50 dark:bg-emerald-950/30',
                  text: 'text-emerald-600 dark:text-emerald-400'
                },
                purple: {
                  bg: 'bg-violet-50 dark:bg-violet-950/30',
                  text: 'text-violet-600 dark:text-violet-400'
                }
              };
              
              const colors = colorClasses[info.color as keyof typeof colorClasses];
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl dark:hover:shadow-violet-900/20 transition-all bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={`p-2 ${colors.bg} rounded-lg`}
                        >
                          <Icon className={`h-5 w-5 ${colors.text}`} />
                        </motion.div>
                        <CardTitle className="text-lg text-slate-900 dark:text-slate-50">{info.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {info.content.map((line, idx) => (
                        <p key={idx} className="text-sm text-slate-600 dark:text-slate-400">
                          {line}
                          {idx < info.content.length - 1 && <br />}
                        </p>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}