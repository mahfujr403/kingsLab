import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { ExternalLink, Search, TrendingUp, BookOpen, Award, Calendar, Building2, Users, FileText, Sparkles, Grid3x3, List, BarChart3, FilterX } from "lucide-react";
import { motion } from "motion/react";
import { useApi } from "../hooks/useApi";
import { api } from "../lib/api";
import { mockPublications, mockTeamMembers } from "../lib/mock-data";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ProfileModal } from "./ProfileModal";
import { PublicationDetailModal } from "./PublicationDetailModal";
import type { Publication, TeamMember } from "../lib/types";

type SortOption = "year-desc" | "year-asc" | "citations-desc" | "title-asc";
type ViewMode = "grid" | "list" | "timeline";

export function Publications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("year-desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [selectedAuthorProfile, setSelectedAuthorProfile] = useState<TeamMember | null>(null);

  const { data: allPublications } = useApi<Publication[]>(() => api.getPublications(), mockPublications);
  const { data: teamMembers } = useApi<TeamMember[]>(() => api.getTeamMembers(), mockTeamMembers);
  const publications = allPublications || [];
  const team = teamMembers || [];

  // Helpers
  const parseCategories = (value?: string | string[]) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(c => c.trim()).filter(Boolean);
    return value.split(',').map(c => c.trim()).filter(Boolean);
  };
  const getPublicationCategories = (pub: Publication | (Publication & { categories?: string[] })) => parseCategories((pub as any).categories ?? pub.category);

  const uniqueYears = useMemo(() => [...new Set(publications.map(p => p.year))].sort((a,b)=>b-a), [publications]);
  const uniqueAuthors = useMemo(() => {
    const set = new Set<string>();
    publications.forEach(p => p.authors?.split(/,\s*/).forEach(a => set.add(a.trim())));
    return Array.from(set).sort();
  }, [publications]);

  const filteredPublications = useMemo(() => {
    let result = publications.filter(p => {
      const matchesSearch = searchTerm === '' || (
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.publication_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getPublicationCategories(p).some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      const matchesType = selectedType === 'all' || p.publication_type.toLowerCase().includes(selectedType);
      const matchesYear = selectedYear === 'all' || p.year.toString() === selectedYear;
      const matchesAuthor = selectedAuthor === 'all' || p.authors.toLowerCase().includes(selectedAuthor.toLowerCase());
      return matchesSearch && matchesType && matchesYear && matchesAuthor;
    });
    switch (sortBy) {
      case 'year-desc': result.sort((a,b)=>b.year-a.year); break;
      case 'year-asc': result.sort((a,b)=>a.year-b.year); break;
      case 'citations-desc': result.sort((a,b)=>b.citations-a.citations); break;
      case 'title-asc': result.sort((a,b)=>a.title.localeCompare(b.title)); break;
    }
    return result;
  }, [publications, searchTerm, selectedType, selectedYear, selectedAuthor, sortBy]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedYear('all');
    setSelectedAuthor('all');
  };
  const activeFiltersCount = [selectedType!=='all', selectedYear!=='all', selectedAuthor!=='all', !!searchTerm].filter(Boolean).length;

  const journalCount = publications.filter(p => p.publication_type.toLowerCase().includes('journal')).length;
  const conferenceCount = publications.filter(p => p.publication_type.toLowerCase().includes('conference')).length;
  const bookCount = publications.filter(p => p.publication_type.toLowerCase().includes('book')).length;
  const totalPublications = publications.length;

  return (
    <section id="publications" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Publications</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">Explore our research output across journals, conferences, and books.</p>
        </div>

        {/* Filters */}
        <div className="mb-12 space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder="Search publications..."
                value={searchTerm}
                onChange={(e)=>setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="journal">Journal</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="book">Book Chapter</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {uniqueYears.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
              <SelectTrigger><SelectValue placeholder="Author" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                {uniqueAuthors.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {activeFiltersCount > 0 && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 px-2 text-xs gap-1">
                <FilterX className="h-3 w-3" /> Clear All
              </Button>
            </div>
          )}
          {/* Type toggle buttons */}
          <div className="flex flex-wrap gap-3 justify-center" role="group" aria-label="Filter by publication type">
            <Button variant={selectedType==='all'?"default":"outline"} onClick={()=>setSelectedType('all')} className={selectedType==='all'? 'bg-gradient-to-r from-blue-600 to-purple-600':''}><FileText className="h-4 w-4 mr-2"/>All ({totalPublications})</Button>
            <Button variant={selectedType==='journal'?"default":"outline"} onClick={()=>setSelectedType('journal')} className={selectedType==='journal'? 'bg-gradient-to-r from-blue-600 to-purple-600':''}><FileText className="h-4 w-4 mr-2"/>Journal ({journalCount})</Button>
            <Button variant={selectedType==='conference'?"default":"outline"} onClick={()=>setSelectedType('conference')} className={selectedType==='conference'? 'bg-gradient-to-r from-blue-600 to-purple-600':''}><Users className="h-4 w-4 mr-2"/>Conference ({conferenceCount})</Button>
            <Button variant={selectedType==='book'?"default":"outline"} onClick={()=>setSelectedType('book')} className={selectedType==='book'? 'bg-gradient-to-r from-blue-600 to-purple-600':''}><BookOpen className="h-4 w-4 mr-2"/>Book Chapter ({bookCount})</Button>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Showing <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredPublications.length}</span> of <span className="font-semibold">{totalPublications}</span> publications</p>
              <motion.div whileHover={{scale:1.05}} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"><FileText className="h-4 w-4"/><span className="font-semibold">{totalPublications}</span><span className="text-xs opacity-90">Total</span></motion.div>
            </div>
            <TooltipProvider>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <Tooltip><TooltipTrigger asChild><Button variant={viewMode==='grid'?"default":"ghost"} size="sm" onClick={()=>setViewMode('grid')} className={viewMode==='grid'?"bg-gradient-to-r from-blue-600 to-purple-600":""} aria-label="Grid view"><Grid3x3 className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Grid View</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant={viewMode==='list'?"default":"ghost"} size="sm" onClick={()=>setViewMode('list')} className={viewMode==='list'?"bg-gradient-to-r from-blue-600 to-purple-600":""} aria-label="List view"><List className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>List View</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant={viewMode==='timeline'?"default":"ghost"} size="sm" onClick={()=>setViewMode('timeline')} className={viewMode==='timeline'?"bg-gradient-to-r from-blue-600 to-purple-600":""} aria-label="Timeline view"><BarChart3 className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Timeline View</TooltipContent></Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>

        {/* Grid View */}
        {viewMode==='grid' && (
          <div className="flex flex-wrap gap-6 justify-center">
            {filteredPublications.map((pub,index)=>(
              <motion.div key={pub.id} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5,delay:index*0.05}} whileHover={{y:-8}} onClick={()=>setSelectedPublication(pub)} role="button" tabIndex={0} aria-label={`View details for ${pub.title}`} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelectedPublication(pub);}}} className="cursor-pointer w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-sm rounded-lg">
                <Card className="overflow-hidden h-full flex flex-col hover:shadow-2xl dark:hover:shadow-purple-900/20 transition-all duration-300 group bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                    {pub.event_photo ? <ImageWithFallback src={pub.event_photo} alt={pub.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/> : <div className="w-full h-full flex items-center justify-center"><BookOpen className="h-20 w-20 text-white/30"/></div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"/>
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      {pub.tag && <Badge variant={pub.tag==='Featured'?"default":"secondary"} className={pub.tag==='Featured'?"bg-yellow-500 text-yellow-950 border-0 shadow-lg":"bg-white/90 text-gray-900 border-0 shadow-lg"}>{pub.tag}</Badge>}
                      <Badge variant="outline" className="bg-white/90 border-0 text-gray-900 shadow-lg">{pub.publication_type}</Badge>
                    </div>
                    <div className="absolute top-3 right-3"><div className="bg-white/90 text-gray-900 px-3 py-1 rounded-full shadow-lg flex items-center gap-1"><Calendar className="h-3 w-3"/><span className="text-sm">{pub.year}</span></div></div>
                    {pub.certificate_url && <div className="absolute bottom-3 right-3"><motion.div whileHover={{scale:1.1,rotate:5}} className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-2 rounded-full shadow-lg"><Award className="h-4 w-4"/></motion.div></div>}
                  </div>
                  <CardHeader className="flex-1">
                    <CardTitle className="group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2 mb-2 text-slate-900 dark:text-slate-50">{pub.title}</CardTitle>
                    <CardDescription className="flex items-start gap-2 text-slate-600 dark:text-slate-400"><Users className="h-4 w-4 shrink-0 mt-0.5"/><span className="line-clamp-2 whitespace-pre-wrap">{pub.authors}</span></CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start justify-between gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-start gap-2 flex-1 min-w-0"><Building2 className="h-4 w-4 shrink-0 mt-0.5 text-violet-500 dark:text-violet-400"/><span className="italic line-clamp-1 flex-1">{pub.venue || 'Venue not provided'}</span></div>
                      {pub.publisher && <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 shrink-0 ml-2">{pub.publisher}</span>}
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {getPublicationCategories(pub).map(cat => <Badge key={cat} variant="outline" className="bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400">{cat}</Badge>)}
                      {getPublicationCategories(pub).length===0 && <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">Uncategorised</Badge>}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode==='list' && (
          <div className="space-y-4">
            {filteredPublications.map((pub,index)=>(
              <motion.div key={pub.id} initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.5,delay:index*0.03}} onClick={()=>setSelectedPublication(pub)} role="button" tabIndex={0} aria-label={`View details for ${pub.title}`} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelectedPublication(pub);}}} className="rounded-lg">
                <Card className="cursor-pointer hover:shadow-lg dark:hover:shadow-purple-900/20 transition-all duration-300 group bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative w-full md:w-48 h-48 md:h-auto overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
                      {pub.event_photo ? <ImageWithFallback src={pub.event_photo} alt="" role="presentation" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/> : <div className="w-full h-full flex items-center justify-center"><BookOpen className="h-16 w-16 text-white/30"/></div>}
                      <div className="absolute top-3 left-3"><Badge className="bg-white/90 text-gray-900 border-0 shadow-lg">{pub.year}</Badge></div>
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors mb-2 text-slate-900 dark:text-slate-50">{pub.title}</h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline" className="bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400">{pub.publication_type}</Badge>
                            {getPublicationCategories(pub).map(cat => <Badge key={cat} variant="outline" className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400">{cat}</Badge>)}
                            {getPublicationCategories(pub).length===0 && <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">Uncategorised</Badge>}
                            {pub.tag==='Featured' && <Badge className="bg-yellow-500 text-yellow-950 border-0"><Sparkles className="h-3 w-3 mr-1"/>Featured</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2"><Users className="h-4 w-4 shrink-0"/><span className="line-clamp-2 whitespace-pre-wrap">{pub.authors}</span></div>
                      <div className="flex items-start justify-between gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2"><div className="flex items-start gap-2 flex-1 min-w-0"><Building2 className="h-4 w-4 shrink-0 mt-0.5 text-violet-500 dark:text-violet-400"/><span className="italic line-clamp-1 flex-1">{pub.venue || 'Venue not provided'}</span></div>{pub.publisher && <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 shrink-0 ml-2">{pub.publisher}</span>}</div>
                      {pub.abstract && <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 line-clamp-2">{pub.abstract}</p>}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Timeline View */}
        {viewMode==='timeline' && (
          <div className="space-y-8">
            {uniqueYears.map((year, yearIndex) => {
              const yearPubs = filteredPublications.filter(p => p.year === year);
              if (!yearPubs.length) return null;
              return (
                <motion.div key={year} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5,delay:yearIndex*0.1}} className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div whileHover={{scale:1.05}} className="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 sticky top-20 z-10"><Calendar className="h-5 w-5"/><span className="text-xl">{year}</span><Badge className="bg-white/20 text-white border-0 ml-2">{yearPubs.length}</Badge></motion.div>
                    <div className="flex-1 h-px bg-gradient-to-r from-slate-300 dark:from-slate-700 to-transparent"/>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pl-4 border-l-2 border-violet-200 dark:border-violet-800">
                    {yearPubs.map((pub,index)=>(
                      <motion.div key={pub.id} initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.5,delay:index*0.05}} whileHover={{scale:1.03}} onClick={()=>setSelectedPublication(pub)} role="button" tabIndex={0} aria-label={`View details for ${pub.title}`} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelectedPublication(pub);}}} className="cursor-pointer rounded-lg">
                        <Card className="h-full hover:shadow-lg dark:hover:shadow-purple-900/20 transition-all duration-300 group bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <CardHeader className="pb-3"><CardTitle className="text-base group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2 text-slate-900 dark:text-slate-50">{pub.title}</CardTitle></CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400">{pub.publication_type}</Badge>
                              {getPublicationCategories(pub).map(cat => <Badge key={cat} variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400">{cat}</Badge>)}
                              {getPublicationCategories(pub).length===0 && <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">Uncategorised</Badge>}
                              {pub.tag==='Featured' && <Badge className="text-xs bg-yellow-500 text-yellow-950 border-0"><Sparkles className="h-3 w-3 mr-1"/>Featured</Badge>}
                            </div>
                            <div className="flex items-start justify-between gap-2 text-xs text-slate-600 dark:text-slate-400"><div className="flex items-start gap-2 flex-1 min-w-0"><Building2 className="h-3 w-3 shrink-0 mt-0.5 text-violet-500 dark:text-violet-400"/><span className="italic line-clamp-1 flex-1">{pub.venue || 'Venue not provided'}</span></div>{pub.publisher && <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 shrink-0 ml-1">{pub.publisher}</span>}</div>
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

        {filteredPublications.length===0 && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center py-12 text-gray-500 dark:text-gray-400" role="status" aria-live="polite">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"/>
            <p>No publications found matching your search criteria.</p>
            {activeFiltersCount>0 && <Button variant="link" onClick={clearAllFilters} className="mt-4">Clear all filters</Button>}
          </motion.div>
        )}
      </div>

      {/* Publication Detail Modal */}
      <PublicationDetailModal
        publication={selectedPublication}
        isOpen={!!selectedPublication}
        onClose={() => setSelectedPublication(null)}
        teamMembers={team}
        publications={publications}
        onAuthorClick={(author) => {
          setSelectedAuthorProfile(author);
          setSelectedPublication(null);
        }}
        onRelatedPublicationClick={(pub) => {
          setSelectedPublication(pub);
        }}
      />

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
