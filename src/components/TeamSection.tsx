import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Mail, Linkedin, GraduationCap, BookOpen, ExternalLink, Github, FileText, Users, Calendar, Building2, TrendingUp, Award, Search, X, Filter, SlidersHorizontal, Grid3x3, List, User, FlaskConical } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion, AnimatePresence } from "motion/react";
import { useApi } from "../hooks/useApi";
import { api } from "../lib/api";
import { mockTeamMembers, mockPublications } from "../lib/mock-data";
import { ProfileModal } from "./ProfileModal";
import type { TeamMember, Publication } from "../lib/types";

type SortOption = "name" | "role" | "publications";
type RoleFilter = "all" | "professor" | "researcher" | "phd" | "student";

export function TeamSection() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("role");
  const [showFilters, setShowFilters] = useState(false);
  
  const { data: teamMembers, loading: teamLoading } = useApi<TeamMember[]>(
    () => api.getTeamMembers(),
    mockTeamMembers
  );
  const { data: publications, loading: pubLoading } = useApi<Publication[]>(
    () => api.getPublications(),
    mockPublications
  );

  // Filter and sort team members
  const filteredAndSortedMembers = useMemo(() => {
    if (!teamMembers) return { current: [], alumni: [] };
    
    let filtered = teamMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (member.expertise && member.expertise.some(e => e.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesRole = roleFilter === "all" || 
                          member.role.toLowerCase().includes(roleFilter.toLowerCase());
      
      return matchesSearch && matchesRole;
    });

    // Sort members
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "publications":
          return b.publications_count - a.publications_count;
        case "role":
        default:
          // Role hierarchy: Professor > Researcher > PhD > Student
          const roleOrder: Record<string, number> = {
            'professor': 1,
            'researcher': 2,
            'phd': 3,
            'student': 4
          };
          const aOrder = Object.entries(roleOrder).find(([key]) => 
            a.role.toLowerCase().includes(key)
          )?.[1] || 5;
          const bOrder = Object.entries(roleOrder).find(([key]) => 
            b.role.toLowerCase().includes(key)
          )?.[1] || 5;
          return aOrder - bOrder;
      }
    });

    return {
      current: filtered.filter(m => !m.is_alumni),
      alumni: filtered.filter(m => m.is_alumni)
    };
  }, [teamMembers, searchTerm, roleFilter, sortBy]);

  if (teamLoading || !teamMembers) {
    return (
      <section id="team" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-6 justify-center">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] max-w-xs">
                <div className="h-64 bg-gray-200 animate-pulse" />
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

  const currentMembers = filteredAndSortedMembers.current;
  const alumniMembers = filteredAndSortedMembers.alumni;

  const renderMemberCard = (member: TeamMember, index: number, isAlumni: boolean = false) => (
    <motion.div
      key={member.id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] max-w-xs"
    >
      <Card
        role="button"
        tabIndex={0}
        aria-label={`View profile for ${member.name}, ${member.role}`}
        className="overflow-hidden hover:shadow-2xl dark:hover:shadow-purple-900/20 transition-all duration-300 cursor-pointer group h-full flex flex-col bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        onClick={() => {
          setSelectedMember(member);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedMember(member);
          }
        }}
      >
        {/* Image with Gradient Overlay */}
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
          <ImageWithFallback
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Alumni or Role Badge */}
          <div className="absolute top-4 right-4">
            {isAlumni ? (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                Alumni {member.alumni_year}
              </Badge>
            ) : (
              <Badge className="bg-white/90 text-gray-900 border-0 shadow-lg">
                {member.role.split(" ")[0]}
              </Badge>
            )}
          </div>

          {/* Publications Badge */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-purple-500 to-blue-600 text-white p-2 rounded-lg" aria-hidden="true">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Publications</div>
                  <div className="text-lg text-gray-900">{member.publications_count}</div>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="text-blue-600"
                aria-hidden="true"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </motion.div>
            </div>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-lg">View Profile</span>
          </div>
        </div>

        {/* Content */}
        <CardHeader className="flex-1 pb-1.5 pt-4">
          <CardTitle className="group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors text-xl font-bold mb-0.5 text-slate-900 dark:text-slate-50">
            {member.name}
          </CardTitle>
          <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
            {isAlumni && member.current_position ? member.current_position : member.role}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{member.bio}</p>
          
          {/* Expertise Tags */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {(member.expertise || []).map((skill, idx) => (
                <Badge key={idx} variant="outline" className="bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400 text-xs whitespace-nowrap">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-700 justify-center">
            <motion.button
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="text-slate-400 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `mailto:${member.email}`;
              }}
              aria-label={`Email ${member.name}`}
            >
              <Mail className="h-5 w-5" aria-hidden="true" />
            </motion.button>
            {member.linkedin_url && (
              <motion.a
                href={member.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="text-slate-400 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
                aria-label={`View ${member.name}'s LinkedIn profile`}
              >
                <Linkedin className="h-5 w-5" aria-hidden="true" />
              </motion.a>
            )}
            {member.github_url && (
              <motion.a
                href={member.github_url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
                onClick={(e) => e.stopPropagation()}
                aria-label={`View ${member.name}'s GitHub profile`}
              >
                <Github className="h-5 w-5" aria-hidden="true" />
              </motion.a>
            )}
            {member.google_scholar_url && (
              <motion.a
                href={member.google_scholar_url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="text-slate-400 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
                aria-label={`View ${member.name}'s Google Scholar profile`}
              >
                <GraduationCap className="h-5 w-5" aria-hidden="true" />
              </motion.a>
            )}
            {member.researchgate_url && (
              <motion.a
                href={member.researchgate_url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
                aria-label={`View ${member.name}'s ResearchGate profile`}
              >
                <BookOpen className="h-5 w-5" aria-hidden="true" />
              </motion.a>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <section 
      id="team" 
      aria-label="Team section"
      className="py-20 bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/20 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-200/30 dark:bg-purple-900/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-200/30 dark:bg-blue-900/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Current Team Section */}
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-950/50 dark:to-blue-950/50 border border-purple-200 dark:border-purple-800 mb-6"
          >
            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Meet Our Experts</span>
          </motion.div>

          <h2 className="mb-4 text-slate-900 dark:text-white bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-blue-400 dark:to-purple-400">
            Our Team
          </h2>
          
          {/* Decorative line */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent max-w-xs mx-auto mb-6"
          />
          
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Meet the brilliant minds driving AI innovation and discovery at King's Lab.
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
          {/* Search Bar and Filter Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md mx-auto sm:mx-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search team members"
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

            {/* Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 sm:ml-auto"
              aria-expanded={showFilters}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filters
              {(roleFilter !== "all" || sortBy !== "role") && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  Active
                </Badge>
              )}
            </Button>
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Role Filter */}
                    <div>
                      <label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">
                        Filter by Role
                      </label>
                      <Select value={roleFilter} onValueChange={(value: string) => setRoleFilter(value as RoleFilter)}>
                        <SelectTrigger aria-label="Filter by role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="professor">Professors</SelectItem>
                          <SelectItem value="researcher">Researchers</SelectItem>
                          <SelectItem value="phd">PhD Students</SelectItem>
                          <SelectItem value="student">Students</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">
                        Sort By
                      </label>
                      <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as SortOption)}>
                        <SelectTrigger aria-label="Sort by">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="role">Role</SelectItem>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="publications">Publications</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {(roleFilter !== "all" || sortBy !== "role") && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRoleFilter("all");
                          setSortBy("role");
                        }}
                        className="w-full sm:w-auto"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Count */}
          {searchTerm && (
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Found <strong className="text-purple-600 dark:text-purple-400">{currentMembers.length}</strong> team member{currentMembers.length !== 1 ? 's' : ''}
                {alumniMembers.length > 0 && (
                  <> and <strong className="text-amber-600 dark:text-amber-400">{alumniMembers.length}</strong> alumni</>
                )}
              </p>
            </div>
          )}
        </motion.div>

        {currentMembers.length === 0 && alumniMembers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-500 dark:text-gray-400"
            role="status"
            aria-live="polite"
          >
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" aria-hidden="true" />
            <p>No team members found matching your criteria.</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("all");
              }}
              className="mt-4"
            >
              Clear filters
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Current Team Members */}
            {currentMembers.length > 0 && (
              <div className="flex flex-wrap gap-6 justify-center mb-20">
                {currentMembers.map((member, index) => renderMemberCard(member, index, false))}
              </div>
            )}
          </>
        )}

        {/* Alumni Section */}
        {alumniMembers.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16 mt-20"
            >
              {/* Decorative top element */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950/50 dark:to-orange-950/50 border border-amber-200 dark:border-amber-800 mb-6"
              >
                <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Alumni Network</span>
              </motion.div>

              <h2 className="mb-4 text-slate-900 dark:text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 bg-clip-text text-transparent dark:from-amber-400 dark:via-orange-400 dark:to-amber-400">
                Alumni
              </h2>
              
              {/* Decorative line */}
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent max-w-xs mx-auto mb-6"
              />
              
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Celebrating our alumni who continue to make significant contributions to AI research and industry worldwide.
              </p>
            </motion.div>

            <div className="flex flex-wrap gap-6 justify-center">
              {alumniMembers.map((member, index) => (
                renderMemberCard(member, index, true)
              ))}
            </div>
          </>
        )}
      </div>

      {/* Team Member Profile Modal */}
      <ProfileModal
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        publications={publications || []}
        onPublicationClick={(pub) => {
          setSelectedPublication(pub);
          setSelectedMember(null);
        }}
      />

      {/* Publication Detail Modal */}
      <Dialog open={!!selectedPublication} onOpenChange={() => setSelectedPublication(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          {selectedPublication && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl pr-8 text-slate-900 dark:text-slate-50">{selectedPublication.title}</DialogTitle>
                <DialogDescription className="sr-only">
                  Publication details for {selectedPublication.title}
                </DialogDescription>
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
                  <a
                    href={selectedPublication.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6 flex items-center justify-center gap-3 cursor-pointer"
                    >
                      <Award className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                      <div>
                        <div className="text-amber-900 dark:text-amber-300">Award Certificate</div>
                        <div className="text-sm text-amber-700 dark:text-amber-400">Click to view certificate</div>
                      </div>
                      <ExternalLink className="h-5 w-5 text-amber-600 dark:text-amber-400 ml-auto" />
                    </motion.div>
                  </a>
                )}

                <Separator className="bg-slate-200 dark:bg-slate-700" />

                {/* Authors - Clickable */}
                <div>
                  <div className="flex items-center gap-2 text-slate-900 dark:text-slate-50 mb-3">
                    <Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    <span>Authors</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPublication.author_ids?.map((authorId) => {
                      const author = teamMembers?.find(m => m.id === authorId);
                      return (
                        <motion.button
                          key={authorId}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (author) {
                              setSelectedMember(author);
                              setSelectedPublication(null);
                            }
                          }}
                          className="bg-violet-100 dark:bg-violet-950/30 hover:bg-violet-200 dark:hover:bg-violet-950/50 text-violet-800 dark:text-violet-300 px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
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
                    <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-orange-900 dark:text-orange-300 mb-1">
                        <Building2 className="h-4 w-4" />
                        <span>Publisher</span>
                      </div>
                      <p className="text-sm text-orange-800 dark:text-orange-400">{selectedPublication.publisher}</p>
                    </div>
                  )}

                  {/* Conference/Journal/Book */}
                  {selectedPublication.conference && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 mb-1">
                        <Building2 className="h-4 w-4" />
                        <span>Conference</span>
                      </div>
                      <p className="text-sm text-emerald-800 dark:text-emerald-400">{selectedPublication.conference}</p>
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
                    <div className="bg-pink-50 dark:bg-pink-950/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-pink-900 dark:text-pink-300 mb-1">
                        <FileText className="h-4 w-4" />
                        <span>Book Chapter</span>
                      </div>
                      <p className="text-sm text-pink-800 dark:text-pink-400">{selectedPublication.book_chapter}</p>
                    </div>
                  )}

                  {/* Citations */}
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>Citations</span>
                    </div>
                    <p className="text-2xl text-emerald-800 dark:text-emerald-400">{selectedPublication.citations}</p>
                  </div>

                  {/* Category */}
                  <div className="bg-cyan-50 dark:bg-cyan-950/30 rounded-lg p-4">
                    <div className="text-cyan-900 dark:text-cyan-300 mb-1">Category</div>
                    <Badge variant="outline" className="bg-white dark:bg-slate-800 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400">{selectedPublication.category}</Badge>
                  </div>
                </div>

                {/* Volume, Issue, Pages */}
                {(selectedPublication.volume || selectedPublication.issue || selectedPublication.pages) && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                    <div className="text-slate-900 dark:text-slate-50 mb-2">Publication Information</div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-300">
                      {selectedPublication.volume && <span>Volume: {selectedPublication.volume}</span>}
                      {selectedPublication.issue && <span>Issue: {selectedPublication.issue}</span>}
                      {selectedPublication.pages && <span>Pages: {selectedPublication.pages}</span>}
                    </div>
                  </div>
                )}

                {/* Abstract */}
                {selectedPublication.abstract && (
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-950/30 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
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
                      className="bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-lg px-6 py-4 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <BookOpen className="h-5 w-5" />
                      <span>View Publication</span>
                      <ExternalLink className="h-4 w-4" />
                    </motion.div>
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
