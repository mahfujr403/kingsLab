import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Brain, Eye, MessageSquare, Cpu, Search, X, Grid3x3, LayoutGrid, ChevronDown, ChevronUp, Sparkles, BookOpen, Users, TrendingUp, Lightbulb, Zap, ArrowRight, Network, Target, Layers, CircuitBoard, Database, Globe, Microscope, ActivitySquare, Binary, Bot, Braces } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion, AnimatePresence } from "motion/react";
import { useApi } from "../hooks/useApi";
import { api } from "../lib/api";
import { mockResearchAreas } from "../lib/mock-data";
import type { ResearchArea } from "../lib/types";

const iconMap: Record<string, any> = {
  Brain,
  Eye,
  MessageSquare,
  Cpu,
  Network,
  Sparkles,
  Zap,
  Target,
  Layers,
  CircuitBoard,
  Database,
  Globe,
  Microscope,
  ActivitySquare,
  Binary,
  Bot,
  Braces,
};

type ViewMode = "grid" | "compact";

export function ResearchAreas() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [expandAll, setExpandAll] = useState(false);
  
  const { data: researchAreas, loading } = useApi<ResearchArea[]>(
    () => api.getResearchAreas(),
    mockResearchAreas
  );

  // Filter and search
  const filteredAreas = useMemo(() => {
    if (!researchAreas) return [];
    
    return researchAreas.filter(area => {
      const matchesSearch = area.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           area.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           area.details.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || area.title.toLowerCase().includes(selectedCategory.toLowerCase());
      
      return matchesSearch && matchesCategory;
    });
  }, [researchAreas, searchTerm, selectedCategory]);

  // Get unique categories from areas
  const categories = useMemo(() => {
    if (!researchAreas) return [];
    const cats = new Set<string>();
    researchAreas.forEach(area => {
      // Extract main category from title (e.g., "Deep Learning", "Computer Vision")
      cats.add(area.title);
    });
    return Array.from(cats);
  }, [researchAreas]);

  // Handle expand all
  const toggleExpandAll = () => {
    setExpandAll(!expandAll);
    if (!expandAll && filteredAreas.length > 0) {
      setExpandedCard(null); // Reset individual expansion
    }
  };

  if (loading || !researchAreas) {
    return (
      <section id="research" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-8 justify-center">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden w-full md:w-[calc(50%-1rem)] max-w-2xl">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="research" 
      aria-label="Research areas section"
      className="py-20 bg-gray-50 dark:bg-gray-900 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-violet-200/30 dark:bg-violet-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-blue-200/30 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
            <Brain className="h-4 w-4 text-violet-600 dark:text-violet-400" aria-hidden="true" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Cutting-Edge Innovation</span>
          </motion.div>

          <h2 className="mb-4 text-slate-900 dark:text-white bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent dark:from-violet-400 dark:via-blue-400 dark:to-violet-400">
            Research Areas
          </h2>
          
          {/* Decorative line */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent max-w-xs mx-auto mb-6"
            aria-hidden="true"
          />
          
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Our interdisciplinary approach combines cutting-edge AI techniques with innovative thinking 
            to tackle the most challenging problems in artificial intelligence.
          </p>
        </motion.div>

        {/* Search and Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Search research areas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search research areas"
                className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  aria-pressed={viewMode === "grid"}
                  className={viewMode === "grid" ? "bg-gradient-to-r from-violet-600 to-blue-600" : ""}
                >
                  <Grid3x3 className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  variant={viewMode === "compact" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("compact")}
                  aria-label="Compact view"
                  aria-pressed={viewMode === "compact"}
                  className={viewMode === "compact" ? "bg-gradient-to-r from-violet-600 to-blue-600" : ""}
                >
                  <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>

              {/* Expand All Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleExpandAll}
                className="gap-2"
              >
                {expandAll ? (
                  <>
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                    Collapse All
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    Expand All
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-3 justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950/50 dark:to-purple-950/50 px-4 py-2 rounded-full border border-violet-200 dark:border-violet-800 flex items-center gap-2"
            >
              <Lightbulb className="h-4 w-4 text-violet-600 dark:text-violet-400" aria-hidden="true" />
              <span className="text-sm text-violet-900 dark:text-violet-300">
                <strong>{researchAreas?.length || 0}</strong> Active Areas
              </span>
            </motion.div>
            
            {searchTerm && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-950/50 dark:to-cyan-950/50 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-2"
              >
                <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <span className="text-sm text-blue-900 dark:text-blue-300">
                  <strong>{filteredAreas.length}</strong> Results
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Research Areas Display */}
        {filteredAreas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-500 dark:text-gray-400"
            role="status"
            aria-live="polite"
          >
            <Brain className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" aria-hidden="true" />
            <p>No research areas found matching your search.</p>
            {searchTerm && (
              <Button
                variant="link"
                onClick={() => setSearchTerm("")}
                className="mt-4"
              >
                Clear search
              </Button>
            )}
          </motion.div>
        ) : (
          <div className={viewMode === "grid" ? "flex flex-wrap gap-8 justify-center" : "space-y-4"}>
            {filteredAreas.map((area, index) => {
              const Icon = iconMap[area.icon] || Brain;
              const isExpanded = expandAll || expandedCard === area.id;
              
              return viewMode === "grid" ? (
                <motion.div
                  key={area.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="w-full md:w-[calc(50%-1rem)] max-w-2xl"
                >
                  <Card
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    aria-label={`${area.title} - Click to ${isExpanded ? 'collapse' : 'expand'} details`}
                    className="overflow-hidden hover:shadow-xl dark:hover:shadow-purple-900/20 transition-all duration-300 cursor-pointer h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 group"
                    onClick={() => !expandAll && setExpandedCard(isExpanded ? null : area.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        !expandAll && setExpandedCard(isExpanded ? null : area.id);
                      }
                    }}
                  >
                    <motion.div
                      className="h-48 overflow-hidden relative"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      aria-hidden="true"
                    >
                      <ImageWithFallback
                        src={area.image}
                        alt=""
                        role="presentation"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Floating Icon */}
                      <motion.div
                        className="absolute top-4 right-4 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="h-6 w-6 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                      </motion.div>
                    </motion.div>
                    
                    <CardHeader className={!isExpanded ? "pb-6" : ""}>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                          {area.title}
                        </CardTitle>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </motion.div>
                      </div>
                      <CardDescription className="mt-2">{area.description}</CardDescription>
                    </CardHeader>
                    
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <CardContent className="pt-0 space-y-4">
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              {area.details}
                            </p>
                            
                            {/* Key Highlights */}
                            <div className="flex flex-wrap gap-2 pt-2">
                              <Badge variant="outline" className="bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400">
                                <Zap className="h-3 w-3 mr-1" aria-hidden="true" />
                                Active Research
                              </Badge>
                              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400">
                                <Sparkles className="h-3 w-3 mr-1" aria-hidden="true" />
                                Cutting-Edge
                              </Badge>
                            </div>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ) : (
                // Compact View
                <motion.div
                  key={area.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    aria-label={`${area.title} - Click to ${isExpanded ? 'collapse' : 'expand'} details`}
                    className="cursor-pointer hover:shadow-lg dark:hover:shadow-purple-900/20 transition-all duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 group"
                    onClick={() => !expandAll && setExpandedCard(isExpanded ? null : area.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        !expandAll && setExpandedCard(isExpanded ? null : area.id);
                      }
                    }}
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Thumbnail */}
                      <div className="relative w-full sm:w-40 h-40 overflow-hidden flex-shrink-0" aria-hidden="true">
                        <ImageWithFallback
                          src={area.image}
                          alt=""
                          role="presentation"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                        <div className="absolute top-3 left-3 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg">
                          <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className={`flex-1 p-6 ${!isExpanded ? 'pb-8' : ''}`}>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-xl group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {area.title}
                          </h3>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex-shrink-0"
                          >
                            <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </motion.div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {area.description}
                        </p>
                        
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                  {area.details}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline" className="bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400 text-xs">
                                    <Zap className="h-3 w-3 mr-1" aria-hidden="true" />
                                    Active Research
                                  </Badge>
                                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs">
                                    <Sparkles className="h-3 w-3 mr-1" aria-hidden="true" />
                                    Cutting-Edge
                                  </Badge>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
