import { Button } from "./ui/button";
import { ArrowRight, Award, Users, BrainCircuit } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { useApi } from "../hooks/useApi";
import { api } from "../lib/api";
import { mockHeroData, mockSiteSettings } from "../lib/mock-data";
import type { HeroData } from "../lib/types";

export function Hero() {
  // Fetch lab info for title and tagline
  const { data: labInfo, error: labInfoError } = useApi(
    () => api.getLabInfo(),
    {
      lab_name: mockSiteSettings.lab_name,
      tagline: mockSiteSettings.tagline,
      description: mockSiteSettings.about,
      email: "",
      phone: "",
      address: "",
    },
    "lab-info" // Add cache key to prevent repeated requests
  );

  // Fetch hero data for background image & static fallback stats
  const { data: heroData, loading, error: heroError } = useApi<HeroData>(
    () => api.getHeroData(),
    mockHeroData,
    "hero-data"
  );

  // Fetch dynamic counts for publications, team members, projects
  const { data: heroStats } = useApi(
    () => api.getHeroStats(),
    { publications: mockHeroData.stats.publications, team_members: mockHeroData.stats.members, projects: mockHeroData.stats.projects },
    'hero-stats'
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

  if (!heroData || !labInfo) return null;

  // Log which data source is being used
  console.log("🎯 Hero Component Data Sources:", {
    labInfo: labInfo,
    labInfoFromAPI: !labInfoError,
    heroData: heroData,
    heroDataFromAPI: !heroError
  });

  // Use lab info for title and description, hero data for background and stats
  const displayTitle = labInfo.lab_name || heroData.title;
  const displaySubtitle = labInfo.tagline || heroData.subtitle;
  const displayDescription = labInfo.description || heroData.description;

  // Thresholds for marketing style display (50+, 15+, 10+)
  const thresholds = heroStats?.thresholds || { publications: 50, team: 15, projects: 10 };

  const formatCount = (count: number, threshold: number) => {
    if (count >= threshold) return `${threshold}+`;
    return count.toString();
  };

  const stats = [
    { icon: BrainCircuit, value: formatCount(heroStats.projects, thresholds.projects), label: "Active Projects" },
    { icon: Users, value: formatCount(heroStats.team_members, thresholds.team), label: "Team Members" },
    { icon: Award, value: formatCount(heroStats.publications, thresholds.publications), label: "Research Papers" }
  ];

  return (
    <section 
      id="home" 
      aria-label="Hero section"
      className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-900"
    >
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <ImageWithFallback
          src={heroData.background_image}
          alt=""
          role="presentation"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60 dark:from-black/90 dark:to-black/70" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white w-full flex justify-center">
        <div className="max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
            >
              <span className="text-sm">Welcome to {displayTitle}</span>
            </motion.div>
            <h1 className="mb-6">{displaySubtitle}</h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 text-lg text-gray-200"
          >
            {displayDescription}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap gap-4 mb-16 justify-center"
          >
            <Button
              size="lg"
              className="gap-2 hover:scale-105 transition-transform"
              onClick={() => scrollToSection("research")}
            >
              Explore Our Research
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => scrollToSection("contact")}
            >
              Contact Us
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-3 gap-6"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
                >
                  <Icon className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                  <div className="text-2xl mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}