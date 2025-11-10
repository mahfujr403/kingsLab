import { Button } from "./ui/button";
import { ArrowRight, Play, Award, Users, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { useApi } from "../hooks/useApi";
import { api } from "../lib/api";
import { mockHeroData } from "../lib/mock-data";
import type { HeroData } from "../lib/types";

export function HeroSplit() {
  const { data: heroData } = useApi<HeroData>(
    () => api.getHeroData(),
    mockHeroData
  );

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  if (!heroData) return null;

  const highlights = [
    {
      icon: Award,
      title: "Award-Winning",
      description: "Recognition in AI research"
    },
    {
      icon: Users,
      title: "Collaborative",
      description: "Global research network"
    },
    {
      icon: TrendingUp,
      title: "Impactful",
      description: "Real-world applications"
    }
  ];

  return (
    <section 
      id="home" 
      aria-label="Hero section"
      className="relative min-h-screen overflow-hidden"
    >
      {/* Multi-layered Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-200/50 via-transparent to-blue-200/50 dark:from-blue-950/50 dark:via-transparent dark:to-purple-950/50" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-300/30 via-transparent to-transparent dark:from-blue-900/30" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-300/30 via-transparent to-transparent dark:from-purple-900/30" aria-hidden="true" />
      
      {/* Subtle noise texture for depth */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />
      
      {/* Animated Floating Gradient Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-400 to-cyan-400 dark:from-blue-600 dark:to-cyan-600 rounded-full blur-3xl opacity-30 dark:opacity-20"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 rounded-full blur-3xl opacity-30 dark:opacity-20"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-gradient-to-tr from-pink-400 to-rose-400 dark:from-pink-600 dark:to-rose-600 rounded-full blur-3xl opacity-25 dark:opacity-15"
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 30, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        aria-hidden="true"
      />
      
      {/* Animated gradient divider between sections */}
      <motion.div
        className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 hidden lg:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent dark:via-white/10" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 dark:from-blue-600 dark:via-purple-600 dark:to-pink-600"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      
      <div className="grid lg:grid-cols-2 min-h-screen relative z-10">
        {/* Left Side - Content */}
        <div className="flex items-center justify-center px-4 sm:px-6 lg:px-12 py-20 relative">
          {/* Glass effect overlay for left side */}
          <div className="absolute inset-0 bg-white/40 dark:bg-gray-950/40 backdrop-blur-sm" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/5 dark:from-blue-500/20 dark:to-purple-500/10" aria-hidden="true" />
          <div className="max-w-xl w-full relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Tag */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950/50 dark:to-purple-950/50 text-blue-700 dark:text-blue-300 rounded-full text-sm border border-blue-200 dark:border-blue-800 backdrop-blur-sm">
                  {heroData.subtitle}
                </span>
              </motion.div>

              {/* Heading */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl text-gray-900 dark:text-white mb-6 leading-tight">
                  {heroData.title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  {heroData.description}
                </p>
              </div>

              {/* Stats Inline */}
              <div className="flex flex-wrap gap-6 py-4 border-t border-b border-blue-200/50 dark:border-blue-800/50">
                <div>
                  <div className="text-3xl text-gray-900 dark:text-white mb-1">
                    {heroData.stats.projects}+
                  </div>
                  <div className="text-sm text-gray-500">Active Projects</div>
                </div>
                <div>
                  <div className="text-3xl text-gray-900 dark:text-white mb-1">
                    {heroData.stats.members}+
                  </div>
                  <div className="text-sm text-gray-500">Team Members</div>
                </div>
                <div>
                  <div className="text-3xl text-gray-900 dark:text-white mb-1">
                    {heroData.stats.publications}+
                  </div>
                  <div className="text-sm text-gray-500">Publications</div>
                </div>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {highlights.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                      className="text-center sm:text-left p-3 bg-white/50 dark:bg-white/5 rounded-lg backdrop-blur-sm border border-blue-100 dark:border-blue-900/30"
                    >
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2 mx-auto sm:mx-0" />
                      <div className="text-sm text-gray-900 dark:text-white mb-1">
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.description}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap gap-4"
              >
                <Button
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg shadow-blue-500/30"
                  onClick={() => scrollToSection("research")}
                >
                  Explore Research
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-blue-300 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 backdrop-blur-sm"
                  onClick={() => scrollToSection("team")}
                >
                  <Play className="h-4 w-4" />
                  Meet the Team
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Visual */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="relative"
        >
          {/* Layered gradient background for right side */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-pink-600/90 dark:from-blue-900/60 dark:via-purple-900/60 dark:to-pink-900/60" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-tl from-pink-500/50 via-transparent to-blue-500/50 dark:from-pink-800/50 dark:to-blue-800/50" aria-hidden="true" />
          
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <ImageWithFallback
              src={heroData.background_image}
              alt=""
              role="presentation"
              className="w-full h-full object-cover opacity-10"
            />
            {/* Gradient overlay to blend with left side */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-purple-600/30 to-blue-600/50 dark:via-purple-900/30 dark:to-blue-900/50" />
          </div>

          {/* Floating Elements */}
          <div className="relative h-full flex items-center justify-center p-12">
            <div className="relative w-full max-w-lg">
              {/* Central Circle */}
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-80 h-80 rounded-full border-2 border-dashed border-white/30" />
              </motion.div>

              {/* Orbiting Elements */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-4 h-4 bg-white rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    rotate: [0, 360],
                    x: [0, Math.cos((i / 8) * Math.PI * 2) * 150],
                    y: [0, Math.sin((i / 8) * Math.PI * 2) * 150],
                  }}
                  transition={{
                    duration: 10 + i,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ))}

              {/* Center Content */}
              <div className="relative z-10 text-center text-white space-y-4">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50"
                >
                  <div className="text-4xl">🧠</div>
                </motion.div>
                <h3 className="text-2xl">
                  Pioneering AI Research
                </h3>
                <p className="text-white/80 text-sm max-w-xs mx-auto">
                  Advancing the frontiers of artificial intelligence and machine learning
                </p>
              </div>
            </div>
          </div>

          {/* Decorative Mesh Pattern */}
          <div className="absolute inset-0 opacity-5" aria-hidden="true">
            <div 
              style={{
                backgroundImage: `
                  radial-gradient(circle, white 2px, transparent 2px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px, 60px 60px, 60px 60px'
              }}
              className="w-full h-full"
            />
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator - Centered Bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="cursor-pointer text-blue-400 dark:text-blue-500 text-center"
          onClick={() => scrollToSection("research")}
        >
          <div className="text-xs mb-2 uppercase tracking-wider">Scroll</div>
          <div className="w-6 h-10 border-2 border-current rounded-full mx-auto flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-current rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
