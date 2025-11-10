import { Button } from "./ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { useApi } from "../hooks/useApi";
import { api } from "../lib/api";
import { mockHeroData } from "../lib/mock-data";
import type { HeroData } from "../lib/types";

export function HeroMinimal() {
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

  return (
    <section 
      id="home" 
      aria-label="Hero section"
      className="relative min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 overflow-hidden"
    >
      {/* Minimal Geometric Background */}
      <div className="absolute inset-0" aria-hidden="true">
        {/* Subtle gradient circles */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50 dark:bg-blue-950/20 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-50 dark:bg-purple-950/20 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2" />
        
        {/* Grid lines */}
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          {/* Minimal Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 border border-gray-200 dark:border-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-400"
          >
            {heroData.subtitle}
          </motion.div>

          {/* Main Heading - Ultra Clean */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-gray-900 dark:text-white tracking-tight">
              {heroData.title.split(' ').map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="inline-block mr-4"
                >
                  {word}
                </motion.span>
              ))}
            </h1>
          </motion.div>

          {/* Description - Minimalist */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed"
          >
            {heroData.description}
          </motion.p>

          {/* Stats - Clean Line */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex justify-center items-center gap-12 py-8"
          >
            <div className="text-center">
              <div className="text-4xl md:text-5xl text-gray-900 dark:text-white mb-1">
                {heroData.stats.projects}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500">Projects</div>
            </div>
            <div className="w-px h-12 bg-gray-200 dark:bg-gray-800" />
            <div className="text-center">
              <div className="text-4xl md:text-5xl text-gray-900 dark:text-white mb-1">
                {heroData.stats.members}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500">Researchers</div>
            </div>
            <div className="w-px h-12 bg-gray-200 dark:bg-gray-800" />
            <div className="text-center">
              <div className="text-4xl md:text-5xl text-gray-900 dark:text-white mb-1">
                {heroData.stats.publications}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500">Publications</div>
            </div>
          </motion.div>

          {/* CTA - Minimal Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="pt-4"
          >
            <Button
              size="lg"
              onClick={() => scrollToSection("research")}
              className="gap-2 px-8 rounded-full"
            >
              Explore Research
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Minimal Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        onClick={() => scrollToSection("research")}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="cursor-pointer"
        >
          <ChevronDown className="w-6 h-6 text-gray-400 dark:text-gray-600" />
        </motion.div>
      </motion.div>
    </section>
  );
}
