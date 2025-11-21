import { useRef } from "react";
import type { MouseEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { ExternalLink, TrendingUp, BookOpen, Award, Calendar, Link as LinkIcon, Building2, Users, FileText, Quote, Sparkles, Copy, Share2, Edit, Search, CheckCircle, Mic, CheckCheck } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { Publication, TeamMember } from "../lib/types";

interface PublicationDetailModalProps {
  publication: Publication | null;
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
  publications: Publication[];
  onAuthorClick?: (author: TeamMember) => void;
  onRelatedPublicationClick?: (publication: Publication) => void;
}

export function PublicationDetailModal({
  publication,
  isOpen,
  onClose,
  teamMembers,
  publications,
  onAuthorClick,
  onRelatedPublicationClick,
}: PublicationDetailModalProps) {
  const modalRef = useRef<HTMLElement>(null);

  const parseCategories = (value?: string | string[]) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(c => c.trim()).filter(Boolean);
    return value.split(',').map(c => c.trim()).filter(Boolean);
  };

  const getPublicationCategories = (pub: Publication | (Publication & { categories?: string[] })) => {
    return parseCategories((pub as any).categories ?? pub.category);
  };

  const copyCitation = (format: 'bibtex' | 'apa' | 'mla', pub: Publication) => {
    const base = `${pub.authors}. ${pub.title}. ${pub.year}.`;
    let citation = base;
    if (format === 'bibtex') citation = `@article{${pub.id}, title={${pub.title}}, author={${pub.authors}}, year={${pub.year}}}`;
    if (format === 'apa') citation = `${pub.authors} (${pub.year}). ${pub.title}.`;
    if (format === 'mla') citation = `${pub.authors}. "${pub.title}." ${pub.year}.`;
    navigator.clipboard?.writeText(citation);
    toast.success(`${format.toUpperCase()} citation copied`);
  };

  const sharePaper = (pub: Publication) => {
    const url = pub.url || window.location.href;
    navigator.clipboard?.writeText(url);
    toast.success('Link copied');
  };

  const handleAuthorClick = (id: string) => {
    const author = teamMembers.find(m => m.id === id);
    if (author && onAuthorClick) {
      onAuthorClick(author);
    }
  };

  const getRelatedPublications = (pub: Publication) => {
    const cats = getPublicationCategories(pub);
    return publications.filter(p => p.id !== pub.id && (
      getPublicationCategories(p).some(c => cats.includes(c)) || p.year === pub.year
    )).slice(0, 3);
  };

  useFocusTrap(modalRef as any, isOpen);

  if (!publication) return null;

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="h-4 w-4" />;
      case 'on_review':
        return <Search className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'presented':
        return <Mic className="h-4 w-4" />;
      case 'published':
      default:
        return <CheckCheck className="h-4 w-4" />;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'on_review':
        return 'On Review';
      case 'accepted':
        return 'Accepted';
      case 'presented':
        return 'Presented';
      case 'published':
      default:
        return 'Published';
    }
  };

  const relatedPublications = getRelatedPublications(publication);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        ref={modalRef as any} 
        className="max-w-[90%] md:max-w-[80vw] max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" 
        aria-describedby="publication-description"
      >
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl pr-8 text-slate-900 dark:text-slate-50">
                {publication.title}
              </DialogTitle>
              <DialogDescription id="publication-description" className="mt-2 text-slate-600 dark:text-slate-400">
                Published in {publication.year} · {publication.citations} citations · 
                <span className="inline-flex items-center gap-1 ml-1">
                  {getStatusIcon(publication.status)}
                  {getStatusText(publication.status)}
                </span>
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Quote className="h-4 w-4 mr-2"/>
                    Cite
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={(e: MouseEvent) => { e.preventDefault(); copyCitation('bibtex', publication); }}>
                    <Copy className="h-4 w-4 mr-2"/>
                    Copy BibTeX
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e: MouseEvent) => { e.preventDefault(); copyCitation('apa', publication); }}>
                    <Copy className="h-4 w-4 mr-2"/>
                    Copy APA
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e: MouseEvent) => { e.preventDefault(); copyCitation('mla', publication); }}>
                    <Copy className="h-4 w-4 mr-2"/>
                    Copy MLA
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => sharePaper(publication)}>
                      <Share2 className="h-4 w-4"/>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {publication.event_photo && (
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <ImageWithFallback 
                src={publication.event_photo} 
                alt={`${publication.title} event`} 
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {publication.certificate_url && (
            <div className="relative rounded-xl overflow-hidden shadow-lg border-4 border-yellow-300">
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                  <Award className="h-5 w-5"/>
                  <span>Award Certificate</span>
                </div>
              </div>
              <ImageWithFallback 
                src={publication.certificate_url} 
                alt={`${publication.title} certificate`} 
                className="w-full h-auto object-contain bg-white"
              />
            </div>
          )}

          <Separator />

          {/* Authors */}
          <div>
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-50 mb-3">
              <Users className="h-5 w-5 text-violet-600 dark:text-violet-400"/>
              <span>Authors</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {publication.author_ids?.map((entry: any) => {
                const rawId: string | null = (() => {
                  if (typeof entry === 'number') return entry.toString();
                  if (typeof entry === 'string') return entry;
                  if (entry && (entry as any).id != null) return (entry as any).id.toString();
                  if (entry && (entry as any)._id != null) return (entry as any)._id.toString();
                  return null;
                })();
                const authorObj = rawId ? teamMembers.find(m => m.id === rawId) : undefined;
                const displayName = authorObj?.name || entry?.name || (typeof entry === 'string' ? entry : 'Unknown');
                
                return (
                  <motion.button
                    key={(rawId ?? displayName) as any}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (rawId) handleAuthorClick(rawId);
                    }}
                    className="bg-violet-100 dark:bg-violet-950/30 hover:bg-violet-200 dark:hover:bg-violet-900/40 text-violet-800 dark:text-violet-300 px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Users className="h-4 w-4"/>
                    {displayName}
                  </motion.button>
                );
              })}
            </div>
            {!publication.author_ids && (
              <p className="text-sm text-slate-600 dark:text-slate-400">{publication.authors}</p>
            )}
          </div>

          {/* Publication Details Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-violet-50 dark:bg-violet-950/30 rounded-lg p-4">
              <div className="text-violet-900 dark:text-violet-300 mb-1">Publication Type</div>
              <p className="text-sm text-violet-800 dark:text-violet-400">{publication.publication_type}</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 mb-1">
                <Calendar className="h-4 w-4"/>
                <span>Year</span>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-400">{publication.year}</p>
            </div>

            {publication.publisher && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-300 mb-1">
                  <Building2 className="h-4 w-4"/>
                  <span>Publisher</span>
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-400">{publication.publisher}</p>
              </div>
            )}

            {publication.conference && (
              <div className="bg-violet-50 dark:bg-violet-950/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-violet-900 dark:text-violet-300 mb-1">
                  <Building2 className="h-4 w-4"/>
                  <span>Conference</span>
                </div>
                <p className="text-sm text-violet-800 dark:text-violet-400">{publication.conference}</p>
              </div>
            )}

            {publication.journal && (
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 mb-1">
                  <BookOpen className="h-4 w-4"/>
                  <span>Journal</span>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-400">{publication.journal}</p>
              </div>
            )}

            {publication.book_chapter && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-300 mb-1">
                  <FileText className="h-4 w-4"/>
                  <span>Book Chapter</span>
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-400">{publication.book_chapter}</p>
              </div>
            )}

            <div className="bg-violet-50 dark:bg-violet-950/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-violet-900 dark:text-violet-300 mb-1">
                <TrendingUp className="h-4 w-4"/>
                <span>Citations</span>
              </div>
              <p className="text-2xl text-violet-800 dark:text-violet-400">{publication.citations}</p>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
            <div className="text-blue-900 dark:text-blue-300 mb-1">Categories</div>
            <div className="flex flex-wrap gap-2">
              {getPublicationCategories(publication).map(cat => (
                <Badge key={cat} variant="outline" className="bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800">
                  {cat}
                </Badge>
              ))}
              {getPublicationCategories(publication).length === 0 && (
                <Badge variant="outline" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  Uncategorised
                </Badge>
              )}
            </div>
          </div>

          {/* Publication Information */}
          {(publication.volume || publication.issue || publication.pages || publication.doi) && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="text-slate-900 dark:text-slate-50 mb-2">Publication Information</div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-300">
                {publication.volume && <span>Volume: {publication.volume}</span>}
                {publication.issue && <span>Issue: {publication.issue}</span>}
                {publication.pages && <span>Pages: {publication.pages}</span>}
                {publication.doi && (
                  <span className="flex items-center gap-1">
                    <LinkIcon className="h-3 w-3"/>
                    DOI: <a 
                      href={`https://doi.org/${publication.doi}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-violet-600 dark:text-violet-400 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {publication.doi}
                    </a>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Abstract */}
          {publication.abstract && (
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-950/30 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-50 mb-3">
                <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400"/>
                <span>Abstract</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{publication.abstract}</p>
            </div>
          )}

          {/* View Publication Button */}
          {publication.url && (
            <a 
              href={publication.url} 
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
                <BookOpen className="h-5 w-5"/>
                <span>View Publication</span>
                <ExternalLink className="h-4 w-4"/>
              </motion.div>
            </a>
          )}

          {/* Related Publications */}
          {relatedPublications.length > 0 && (
            <>
              <Separator className="my-6"/>
              <div>
                <h3 className="text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400"/>
                  Related Publications
                </h3>
                <div className="grid gap-3">
                  {relatedPublications.map(relPub => (
                    <motion.div
                      key={relPub.id}
                      whileHover={{ x: 4 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onRelatedPublicationClick) {
                          onRelatedPublicationClick(relPub);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`View ${relPub.title}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          if (onRelatedPublicationClick) {
                            onRelatedPublicationClick(relPub);
                          }
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
                            <Calendar className="h-3 w-3"/>
                            <span>{relPub.year}</span>
                            <span>•</span>
                            <TrendingUp className="h-3 w-3 text-green-500"/>
                            <span>{relPub.citations} citations</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 shrink-0">
                          {getPublicationCategories(relPub).map(cat => (
                            <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                          ))}
                          {getPublicationCategories(relPub).length === 0 && (
                            <Badge variant="outline" className="text-xs text-slate-500">None</Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
