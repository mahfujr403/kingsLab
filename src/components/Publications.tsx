import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { ExternalLink, Search, TrendingUp, BookOpen, Award, Calendar, Link as LinkIcon, Building2, Mail, Github, GraduationCap, Users, FileText, X, ArrowUpDown, Filter, FilterX, SlidersHorizontal, Download, Copy, Share2, BarChart3, Grid3x3, List, Eye, Quote, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";
import { useApi } from "../hooks/useApi";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { api } from "../lib/api";
import { mockPublications, mockTeamMembers } from "../lib/mock-data";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ProfileModal } from "./ProfileModal";
import type { Publication, TeamMember } from "../lib/types";

type SortOption = "year-desc" | "year-asc" | "citations-desc" | "title-asc";
type ViewMode = "grid" | "list" | "timeline";

export function Publications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("year-desc");
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [selectedAuthorProfile, setSelectedAuthorProfile] = useState<TeamMember | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Focus trap for modal
  useFocusTrap(modalRef, !!selectedPublication);
  
  const { data: allPublications, loading: pubLoading } = useApi<Publication[]>(
    () => api.getPublications(),
    mockPublications
  );
  const { data: teamMembers, loading: teamLoading } = useApi<TeamMember[]>(
    () => api.getTeamMembers(),
    mockTeamMembers
  );

  const publications = allPublications || [];
  const team = teamMembers || [];
  
  // Calculate publication counts by type
  const journalCount = publications.filter(p => p.publication_type.toLowerCase().includes('journal')).length;
  const conferenceCount = publications.filter(p => p.publication_type.toLowerCase().includes('conference')).length;
  const bookCount = publications.filter(p => p.publication_type.toLowerCase().includes('book')).length;
  const totalPublications = publications.length;

  // Get unique years and authors for filters
  const uniqueYears = useMemo(() => {
    const years = [...new Set(publications.map(p => p.year))].sort((a, b) => b - a);
    return years;
  }, [publications]);

  const uniqueAuthors = useMemo(() => {
    const authorSet = new Set<string>();
    publications.forEach(pub => {
      if (pub.author_ids && pub.author_ids.length > 0) {
        pub.author_ids.forEach(id => {
          const author = team.find(m => m.id === id);
          if (author) authorSet.add(`${author.id}|${author.name}`);
        });
      }
    });
    return Array.from(authorSet).sort((a, b) => a.split('|')[1].localeCompare(b.split('|')[1]));
  }, [publications, team]);

  // Advanced filtering and sorting
  const filteredPublications = useMemo(() => {
    let filtered = publications.filter(pub => {
      // Search filter
      const matchesSearch = pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pub.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (pub.abstract && pub.abstract.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Type filter
      const matchesType = selectedType === "all" || 
                         (selectedType === "journal" && pub.publication_type.toLowerCase().includes('journal')) ||
                         (selectedType === "conference" && pub.publication_type.toLowerCase().includes('conference')) ||
                         (selectedType === "book" && pub.publication_type.toLowerCase().includes('book'));
      
      // Year filter
      const matchesYear = selectedYear === "all" || pub.year === parseInt(selectedYear);
      
      // Author filter
      const matchesAuthor = selectedAuthor === "all" || 
                           (pub.author_ids && pub.author_ids.includes(parseInt(selectedAuthor.split('|')[0])));
      
      return matchesSearch && matchesType && matchesYear && matchesAuthor;
    });

    // Sort publications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "year-desc":
          return b.year - a.year;
        case "year-asc":
          return a.year - b.year;
        case "citations-desc":
          return b.citations - a.citations;
        case "title-asc":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [publications, searchTerm, selectedType, selectedYear, selectedAuthor, sortBy]);

  // Count active filters
  const activeFiltersCount = [
    searchTerm !== "",
    selectedType !== "all",
    selectedYear !== "all",
    selectedAuthor !== "all"
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedYear("all");
    setSelectedAuthor("all");
  };

  const handleAuthorClick = (authorId: number) => {
    const author = team.find(m => m.id === authorId);
    if (author) {
      setSelectedAuthorProfile(author);
      setSelectedPublication(null);
    }
  };

  // Citation generation functions
  const generateBibTeX = (pub: Publication) => {
    const type = pub.publication_type.toLowerCase().includes('journal') ? 'article' :
                 pub.publication_type.toLowerCase().includes('conference') ? 'inproceedings' : 'book';
    const key = `${pub.authors.split(',')[0].split(' ').pop()}${pub.year}`;
    
    let bibtex = `@${type}{${key},\n`;
    bibtex += `  title={${pub.title}},\n`;
    bibtex += `  author={${pub.authors}},\n`;
    bibtex += `  year={${pub.year}},\n`;
    if (pub.journal) bibtex += `  journal={${pub.journal}},\n`;
    if (pub.conference) bibtex += `  booktitle={${pub.conference}},\n`;
    if (pub.volume) bibtex += `  volume={${pub.volume}},\n`;
    if (pub.issue) bibtex += `  number={${pub.issue}},\n`;
    if (pub.pages) bibtex += `  pages={${pub.pages}},\n`;
    if (pub.publisher) bibtex += `  publisher={${pub.publisher}},\n`;
    if (pub.doi) bibtex += `  doi={${pub.doi}},\n`;
    bibtex += '}';
    return bibtex;
  };

  const generateAPA = (pub: Publication) => {
    const authors = pub.authors.replace(/, /g, ', & ');
    let citation = `${authors} (${pub.year}). ${pub.title}. `;
    if (pub.journal) {
      citation += `${pub.journal}`;
      if (pub.volume) citation += `, ${pub.volume}`;
      if (pub.issue) citation += `(${pub.issue})`;
      if (pub.pages) citation += `, ${pub.pages}`;
    } else if (pub.conference) {
      citation += `In ${pub.conference}`;
    }
    if (pub.doi) citation += `. https://doi.org/${pub.doi}`;
    return citation;
  };

  const generateMLA = (pub: Publication) => {
    const authors = pub.authors.split(',').map((a, i) => {
      const parts = a.trim().split(' ');
      if (i === 0 && parts.length >= 2) {
        return `${parts[parts.length - 1]}, ${parts.slice(0, -1).join(' ')}`;
      }
      return a.trim();
    }).join(', ');
    
    let citation = `${authors}. "${pub.title}." `;
    if (pub.journal) {
      citation += `${pub.journal}`;
      if (pub.volume) citation += ` ${pub.volume}`;
      if (pub.issue) citation += `.${pub.issue}`;
    } else if (pub.conference) {
      citation += pub.conference;
    }
    citation += ` (${pub.year})`;
    if (pub.pages) citation += `: ${pub.pages}`;
    citation += '.';
    return citation;
  };

  const copyCitation = (format: 'bibtex' | 'apa' | 'mla', pub: Publication) => {
    let citation = '';
    switch (format) {
      case 'bibtex':
        citation = generateBibTeX(pub);
        break;
      case 'apa':
        citation = generateAPA(pub);
        break;
      case 'mla':
        citation = generateMLA(pub);
        break;
    }
    navigator.clipboard.writeText(citation);
    toast.success(`${format.toUpperCase()} citation copied to clipboard!`);
  };

  const sharePaper = async (pub: Publication) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pub.title,
          text: `Check out this publication: ${pub.title}`,
          url: pub.url || window.location.href,
        });
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy URL
      navigator.clipboard.writeText(pub.url || window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  // Get related publications
  const getRelatedPublications = (pub: Publication) => {
    return publications
      .filter(p => p.id !== pub.id && (
        p.category === pub.category ||
        p.year === pub.year ||
        (p.author_ids && pub.author_ids && p.author_ids.some(id => pub.author_ids?.includes(id)))
      ))
      .slice(0, 3);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close modal with Escape
      if (e.key === 'Escape' && selectedPublication) {
        setSelectedPublication(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPublication]);

  if (pubLoading || teamLoading) {
    return (
      <section id="publications" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-6 justify-center">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-sm">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
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
      id="publications" 
      aria-label="Publications section"
      className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200/20 dark:bg-blue-900/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-200/20 dark:bg-purple-900/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl"></div>
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-200 dark:border-blue-800 mb-6"
          >
            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Research Excellence</span>
          </motion.div>

          <h2 className="mb-4 text-slate-900 dark:text-white bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-blue-400">
            Recent Publications
          </h2>
          
          {/* Decorative line */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent max-w-xs mx-auto mb-6"
          />
          
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Our research has been published in leading AI and ML conferences and cited by researchers worldwide.
          </p>
        </motion.div>

        {/* Advanced Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 space-y-6"
        >
          {/* Stats Badge and Search */}
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-6">
            {/* Total Publications - Eye-catching vertical badge */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(59, 130, 246, 0.5)",
                  "0 0 30px rgba(147, 51, 234, 0.6)",
                  "0 0 20px rgba(59, 130, 246, 0.5)",
                ]
              }}
              transition={{ 
                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_200%] animate-gradient text-white rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center gap-2 md:gap-3 shadow-2xl md:row-span-2 relative overflow-hidden min-w-[100px] md:min-w-[140px]"
            >
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-pulse"></div>
              
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-2 md:gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <FileText className="h-7 w-7 md:h-10 md:w-10 drop-shadow-lg" />
                </motion.div>
                <div className="text-center">
                  <motion.div 
                    className="text-3xl md:text-5xl mb-1 drop-shadow-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {totalPublications}
                  </motion.div>
                  <div className="text-[10px] md:text-xs opacity-90 tracking-wide uppercase">Total<br/>Publications</div>
                </div>
              </div>
            </motion.div>

            {/* Search and Filter Controls */}
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                <Input
                  type="search"
                  placeholder="Search by title, author, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search publications"
                  className="pl-10 bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-600 h-12"
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

              {/* Filter Controls Row */}
              <div className="flex flex-wrap gap-3 items-center">
                {/* Year Filter */}
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[140px] bg-white dark:bg-gray-800" aria-label="Filter by year">
                    <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {uniqueYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Author Filter */}
                <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                  <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800" aria-label="Filter by author">
                    <Users className="h-4 w-4 mr-2" aria-hidden="true" />
                    <SelectValue placeholder="Author" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Authors</SelectItem>
                    {uniqueAuthors.map(author => (
                      <SelectItem key={author} value={author}>
                        {author.split('|')[1]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort By */}
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="w-[160px] bg-white dark:bg-gray-800" aria-label="Sort publications">
                    <ArrowUpDown className="h-4 w-4 mr-2" aria-hidden="true" />
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="year-desc">Newest First</SelectItem>
                    <SelectItem value="year-asc">Oldest First</SelectItem>
                    <SelectItem value="citations-desc">Most Cited</SelectItem>
                    <SelectItem value="title-asc">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>

                {/* Active Filters Badge */}
                {activeFiltersCount > 0 && (
                  <div className="flex items-center gap-2 ml-auto">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      <Filter className="h-3 w-3 mr-1" />
                      {activeFiltersCount} Active
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-8 px-2 text-xs gap-1"
                    >
                      <FilterX className="h-3 w-3" />
                      Clear All
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category Toggle Buttons */}
          <div className="flex flex-wrap gap-3 justify-center" role="group" aria-label="Filter by publication type">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              onClick={() => setSelectedType("all")}
              aria-pressed={selectedType === "all"}
              className={selectedType === "all" ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}
            >
              <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
              All ({totalPublications})
            </Button>
            <Button
              variant={selectedType === "journal" ? "default" : "outline"}
              onClick={() => setSelectedType("journal")}
              aria-pressed={selectedType === "journal"}
              className={selectedType === "journal" ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}
            >
              <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
              Journal ({journalCount})
            </Button>
            <Button
              variant={selectedType === "conference" ? "default" : "outline"}
              onClick={() => setSelectedType("conference")}
              aria-pressed={selectedType === "conference"}
              className={selectedType === "conference" ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}
            >
              <Users className="h-4 w-4 mr-2" aria-hidden="true" />
              Conference ({conferenceCount})
            </Button>
            <Button
              variant={selectedType === "book" ? "default" : "outline"}
              onClick={() => setSelectedType("book")}
              aria-pressed={selectedType === "book"}
              className={selectedType === "book" ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}
            >
              <BookOpen className="h-4 w-4 mr-2" aria-hidden="true" />
              Book Chapter ({bookCount})
            </Button>
          </div>

          {/* Results Count and View Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredPublications.length}</span> of{" "}
              <span className="font-semibold">{totalPublications}</span> publications
            </p>
            
            {/* View Mode Toggle */}
            <TooltipProvider>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={viewMode === "grid" ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}
                      aria-label="Grid view"
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Grid View</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className={viewMode === "list" ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}
                      aria-label="List view"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>List View</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "timeline" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("timeline")}
                      className={viewMode === "timeline" ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}
                      aria-label="Timeline view"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Timeline View</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </motion.div>

        {/* Publications Display */}
        {viewMode === "grid" && (
          <div className="flex flex-wrap gap-6 justify-center">
            {filteredPublications.map((pub, index) => (
              <motion.div
                key={pub.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                onClick={() => setSelectedPublication(pub)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${pub.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedPublication(pub);
                  }
                }}
                className="cursor-pointer w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-sm rounded-lg"
              >
              <Card className="overflow-hidden h-full flex flex-col hover:shadow-2xl dark:hover:shadow-purple-900/20 transition-all duration-300 group bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {/* Image Header with Gradient Overlay */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                  {pub.event_photo ? (
                    <ImageWithFallback
                      src={pub.event_photo}
                      alt={pub.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-20 w-20 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Floating Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <Badge 
                      variant={pub.tag === "Featured" ? "default" : "secondary"}
                      className={pub.tag === "Featured" ? "bg-yellow-500 text-yellow-950 border-0 shadow-lg" : "bg-white/90 text-gray-900 border-0 shadow-lg"}
                    >
                      {pub.tag}
                    </Badge>
                    <Badge variant="outline" className="bg-white/90 border-0 text-gray-900 shadow-lg">
                      {pub.publication_type}
                    </Badge>
                  </div>

                  {/* Year Badge */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-white/90 text-gray-900 px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span className="text-sm">{pub.year}</span>
                    </div>
                  </div>

                  {/* Certificate Badge */}
                  {pub.certificate_url && (
                    <div className="absolute bottom-3 right-3">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-2 rounded-full shadow-lg"
                      >
                        <Award className="h-4 w-4" />
                      </motion.div>
                    </div>
                  )}
                </div>

                <CardHeader className="flex-1">
                  <CardTitle className="group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2 mb-2 text-slate-900 dark:text-slate-50">
                    {pub.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 flex items-start gap-2 text-slate-600 dark:text-slate-400">
                    <Users className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{pub.authors}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Venue */}
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Building2 className="h-4 w-4 shrink-0 text-violet-500 dark:text-violet-400" />
                    <span className="italic line-clamp-1">
                      {pub.conference || pub.journal || pub.book_chapter || "Unpublished"}
                    </span>
                  </div>

                  {/* Citations */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-br from-violet-500 to-blue-600 text-white p-1.5 rounded-lg">
                        <TrendingUp className="h-3 w-3" />
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{pub.citations} citations</span>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </motion.div>
                  </div>

                  {/* Category Badge */}
                  <Badge variant="outline" className="w-full justify-center bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400">
                    {pub.category}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-4">
            {filteredPublications.map((pub, index) => (
              <motion.div
                key={pub.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.03 }}
                onClick={() => setSelectedPublication(pub)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${pub.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedPublication(pub);
                  }
                }}
                className="rounded-lg"
              >
                <Card className="cursor-pointer hover:shadow-lg dark:hover:shadow-purple-900/20 transition-all duration-300 group bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col md:flex-row">
                    {/* Thumbnail */}
                    <div className="relative w-full md:w-48 h-48 md:h-auto overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
                      {pub.event_photo ? (
                        <ImageWithFallback
                          src={pub.event_photo}
                          alt=""
                          role="presentation"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-white/30" aria-hidden="true" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-white/90 text-gray-900 border-0 shadow-lg">
                          {pub.year}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors mb-2 text-slate-900 dark:text-slate-50">
                            {pub.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline" className="bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400">
                              {pub.publication_type}
                            </Badge>
                            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400">
                              {pub.category}
                            </Badge>
                            {pub.tag === "Featured" && (
                              <Badge className="bg-yellow-500 text-yellow-950 border-0">
                                <Sparkles className="h-3 w-3 mr-1" aria-hidden="true" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Citations Badge */}
                        <div className="flex flex-col items-center gap-1 bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/30 dark:to-blue-950/30 p-3 rounded-lg border border-violet-200 dark:border-violet-800">
                          <TrendingUp className="h-4 w-4 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                          <span className="text-lg font-semibold text-violet-700 dark:text-violet-400">{pub.citations}</span>
                          <span className="text-xs text-violet-600 dark:text-violet-500">citations</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                        <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="line-clamp-1">{pub.authors}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Building2 className="h-4 w-4 shrink-0 text-violet-500 dark:text-violet-400" aria-hidden="true" />
                        <span className="italic line-clamp-1">
                          {pub.conference || pub.journal || pub.book_chapter || "Unpublished"}
                        </span>
                      </div>
                      
                      {pub.abstract && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 line-clamp-2">
                          {pub.abstract}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Timeline View */}
        {viewMode === "timeline" && (
          <div className="space-y-8">
            {uniqueYears.map((year, yearIndex) => {
              const yearPubs = filteredPublications.filter(p => p.year === year);
              if (yearPubs.length === 0) return null;
              
              return (
                <motion.div
                  key={year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: yearIndex * 0.1 }}
                  className="relative"
                >
                  {/* Year Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 sticky top-20 z-10"
                    >
                      <Calendar className="h-5 w-5" aria-hidden="true" />
                      <span className="text-xl">{year}</span>
                      <Badge className="bg-white/20 text-white border-0 ml-2">
                        {yearPubs.length}
                      </Badge>
                    </motion.div>
                    <div className="flex-1 h-px bg-gradient-to-r from-slate-300 dark:from-slate-700 to-transparent"></div>
                  </div>
                  
                  {/* Publications for this year */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pl-4 border-l-2 border-violet-200 dark:border-violet-800">
                    {yearPubs.map((pub, index) => (
                      <motion.div
                        key={pub.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        whileHover={{ scale: 1.03 }}
                        onClick={() => setSelectedPublication(pub)}
                        role="button"
                        tabIndex={0}
                        aria-label={`View details for ${pub.title}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedPublication(pub);
                          }
                        }}
                        className="cursor-pointer rounded-lg"
                      >
                        <Card className="h-full hover:shadow-lg dark:hover:shadow-purple-900/20 transition-all duration-300 group bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2 text-slate-900 dark:text-slate-50">
                              {pub.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400">
                                {pub.publication_type}
                              </Badge>
                              {pub.tag === "Featured" && (
                                <Badge className="text-xs bg-yellow-500 text-yellow-950 border-0">
                                  <Sparkles className="h-3 w-3 mr-1" aria-hidden="true" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                              <TrendingUp className="h-3 w-3 text-violet-500 dark:text-violet-400" aria-hidden="true" />
                              <span>{pub.citations} citations</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredPublications.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-500 dark:text-gray-400"
            role="status"
            aria-live="polite"
          >
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" aria-hidden="true" />
            <p>No publications found matching your search criteria.</p>
            {activeFiltersCount > 0 && (
              <Button
                variant="link"
                onClick={clearAllFilters}
                className="mt-4"
              >
                Clear all filters
              </Button>
            )}
          </motion.div>
        )}
      </div>

      {/* Publication Detail Modal */}
      <Dialog open={!!selectedPublication} onOpenChange={() => setSelectedPublication(null)}>
        <DialogContent 
          ref={modalRef as any}
          className="max-w-[90%] md:max-w-[80vw] max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          aria-describedby="publication-description"
        >
          {selectedPublication && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl pr-8 text-slate-900 dark:text-slate-50">{selectedPublication.title}</DialogTitle>
                    <DialogDescription id="publication-description" className="mt-2 text-slate-600 dark:text-slate-400">
                      Published in {selectedPublication.year} · {selectedPublication.citations} citations
                    </DialogDescription>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Citation Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" aria-label="Export citation">
                          <Quote className="h-4 w-4 mr-2" aria-hidden="true" />
                          Cite
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.preventDefault();
                            copyCitation('bibtex', selectedPublication);
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" aria-hidden="true" />
                          Copy BibTeX
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.preventDefault();
                            copyCitation('apa', selectedPublication);
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" aria-hidden="true" />
                          Copy APA
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.preventDefault();
                            copyCitation('mla', selectedPublication);
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" aria-hidden="true" />
                          Copy MLA
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    {/* Share Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => sharePaper(selectedPublication)}
                            aria-label="Share publication"
                          >
                            <Share2 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Share</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Event Photo and Certificate */}
                {selectedPublication.event_photo && (
                  <div className="relative rounded-xl overflow-hidden shadow-lg">
                    <ImageWithFallback
                      src={selectedPublication.event_photo}
                      alt={`${selectedPublication.title} event`}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {selectedPublication.certificate_url && (
                  <div className="relative rounded-xl overflow-hidden shadow-lg border-4 border-yellow-300">
                    <div className="absolute top-4 left-4 z-10">
                      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        <span>Award Certificate</span>
                      </div>
                    </div>
                    <ImageWithFallback
                      src={selectedPublication.certificate_url}
                      alt={`${selectedPublication.title} certificate`}
                      className="w-full h-auto object-contain bg-white"
                    />
                  </div>
                )}

                <Separator />

                {/* Authors - Clickable */}
                <div>
                  <div className="flex items-center gap-2 text-slate-900 dark:text-slate-50 mb-3">
                    <Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    <span>Authors</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPublication.author_ids?.map((authorId) => {
                      const author = team.find(m => m.id === authorId);
                      return (
                        <motion.button
                          key={authorId}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAuthorClick(authorId);
                          }}
                          className="bg-violet-100 dark:bg-violet-950/30 hover:bg-violet-200 dark:hover:bg-violet-900/40 text-violet-800 dark:text-violet-300 px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                        >
                          <Users className="h-4 w-4" />
                          {author?.name || "Unknown"}
                        </motion.button>
                      );
                    })}
                  </div>
                  {!selectedPublication.author_ids && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">{selectedPublication.authors}</p>
                  )}
                </div>

                {/* Publication Details Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Publication Type */}
                  <div className="bg-violet-50 dark:bg-violet-950/30 rounded-lg p-4">
                    <div className="text-violet-900 dark:text-violet-300 mb-1">Publication Type</div>
                    <p className="text-sm text-violet-800 dark:text-violet-400">{selectedPublication.publication_type}</p>
                  </div>

                  {/* Year */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span>Year</span>
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-400">{selectedPublication.year}</p>
                  </div>

                  {/* Publisher */}
                  {selectedPublication.publisher && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-slate-300 mb-1">
                        <Building2 className="h-4 w-4" />
                        <span>Publisher</span>
                      </div>
                      <p className="text-sm text-slate-800 dark:text-slate-400">{selectedPublication.publisher}</p>
                    </div>
                  )}

                  {/* Conference/Journal/Book */}
                  {selectedPublication.conference && (
                    <div className="bg-violet-50 dark:bg-violet-950/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-violet-900 dark:text-violet-300 mb-1">
                        <Building2 className="h-4 w-4" />
                        <span>Conference</span>
                      </div>
                      <p className="text-sm text-violet-800 dark:text-violet-400">{selectedPublication.conference}</p>
                    </div>
                  )}

                  {selectedPublication.journal && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 mb-1">
                        <BookOpen className="h-4 w-4" />
                        <span>Journal</span>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-400">{selectedPublication.journal}</p>
                    </div>
                  )}

                  {selectedPublication.book_chapter && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-slate-300 mb-1">
                        <FileText className="h-4 w-4" />
                        <span>Book Chapter</span>
                      </div>
                      <p className="text-sm text-slate-800 dark:text-slate-400">{selectedPublication.book_chapter}</p>
                    </div>
                  )}

                  {/* Citations */}
                  <div className="bg-violet-50 dark:bg-violet-950/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-violet-900 dark:text-violet-300 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>Citations</span>
                    </div>
                    <p className="text-2xl text-violet-800 dark:text-violet-400">{selectedPublication.citations}</p>
                  </div>

                  {/* Category */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                    <div className="text-blue-900 dark:text-blue-300 mb-1">Category</div>
                    <Badge variant="outline" className="bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800">{selectedPublication.category}</Badge>
                  </div>
                </div>

                {/* Volume, Issue, Pages, DOI */}
                {(selectedPublication.volume || selectedPublication.issue || selectedPublication.pages || selectedPublication.doi) && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                    <div className="text-slate-900 dark:text-slate-50 mb-2">Publication Information</div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-300">
                      {selectedPublication.volume && <span>Volume: {selectedPublication.volume}</span>}
                      {selectedPublication.issue && <span>Issue: {selectedPublication.issue}</span>}
                      {selectedPublication.pages && <span>Pages: {selectedPublication.pages}</span>}
                      {selectedPublication.doi && (
                        <span className="flex items-center gap-1">
                          <LinkIcon className="h-3 w-3" />
                          DOI: <a 
                            href={`https://doi.org/${selectedPublication.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-600 dark:text-violet-400 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {selectedPublication.doi}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Abstract */}
                {selectedPublication.abstract && (
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-950/30 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-slate-50 mb-3">
                      <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      <span>Abstract</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{selectedPublication.abstract}</p>
                  </div>
                )}

                {/* View Publication Button */}
                {selectedPublication.url && (
                  <a
                    href={selectedPublication.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="block"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-6 py-4 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                      tabIndex={0}
                    >
                      <BookOpen className="h-5 w-5" aria-hidden="true" />
                      <span>View Publication</span>
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </motion.div>
                  </a>
                )}

                {/* Related Publications */}
                {(() => {
                  const related = getRelatedPublications(selectedPublication);
                  if (related.length === 0) return null;
                  
                  return (
                    <>
                      <Separator className="my-6" />
                      <div>
                        <h3 className="text-lg mb-4 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                          Related Publications
                        </h3>
                        <div className="grid gap-3">
                          {related.map((relPub) => (
                            <motion.div
                              key={relPub.id}
                              whileHover={{ x: 4 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPublication(relPub);
                              }}
                              role="button"
                              tabIndex={0}
                              aria-label={`View ${relPub.title}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedPublication(relPub);
                                }
                              }}
                              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all cursor-pointer group"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
                                    {relPub.title}
                                  </h4>
                                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-3 w-3" aria-hidden="true" />
                                    <span>{relPub.year}</span>
                                    <span>•</span>
                                    <TrendingUp className="h-3 w-3 text-green-500" aria-hidden="true" />
                                    <span>{relPub.citations} citations</span>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {relPub.category}
                                </Badge>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Author Profile Modal */}
      <ProfileModal
        member={selectedAuthorProfile}
        isOpen={!!selectedAuthorProfile}
        onClose={() => setSelectedAuthorProfile(null)}
        publications={publications}
        onPublicationClick={(pub) => {
          setSelectedPublication(pub);
          setSelectedAuthorProfile(null);
        }}
      />
    </section>
  );
}
