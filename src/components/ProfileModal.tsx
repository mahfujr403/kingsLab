import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Mail, Linkedin, GraduationCap, BookOpen, ExternalLink, Github, FileText, Users, TrendingUp, Download, Award } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import type { TeamMember, Publication } from "../lib/types";

interface ProfileModalProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  publications: Publication[];
  onPublicationClick?: (publication: Publication) => void;
}

export function ProfileModal({ 
  member, 
  isOpen, 
  onClose, 
  publications,
  onPublicationClick 
}: ProfileModalProps) {
  const [showPublications, setShowPublications] = useState(false);

  const getMemberPublications = () => {
    if (!member) return [];
    return publications.filter(pub => pub.author_ids?.includes(member.id));
  };

  if (!member) return null;

  const memberPublications = getMemberPublications();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90%] md:max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-2xl text-slate-900 dark:text-slate-50">{member.name}</DialogTitle>
          <DialogDescription className="sr-only">
            Profile for {member.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Profile Image and Basic Info */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg shrink-0 ring-4 ring-violet-100 dark:ring-violet-900/30">
                <ImageWithFallback
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Role or Alumni Badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                {member.is_alumni ? (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg whitespace-nowrap">
                    Alumni {member.alumni_year}
                  </Badge>
                ) : (
                  <Badge className="bg-gradient-to-r from-violet-600 to-blue-600 text-white border-0 shadow-lg whitespace-nowrap">
                    {member.role.split(" ")[0]}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl mb-2 text-slate-900 dark:text-slate-50">{member.role}</h3>
              {member.affiliation && (
                <p className="text-slate-600 dark:text-slate-400 mb-3 flex items-start gap-2">
                  <Users className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{member.affiliation}</span>
                </p>
              )}
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">{member.bio}</p>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <GraduationCap className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <span>{member.education}</span>
              </div>
            </div>
          </div>

          {/* Alumni Information */}
          {member.is_alumni && (member.alumni_info || member.current_position) && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-amber-500 dark:bg-amber-600 text-white p-2 rounded-lg shadow-md">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-amber-900 dark:text-amber-300 mb-1">Alumni Status</h4>
                  {member.alumni_info && (
                    <p className="text-sm text-amber-800 dark:text-amber-400 mb-2">{member.alumni_info}</p>
                  )}
                  {member.current_position && (
                    <p className="text-sm text-amber-900 dark:text-amber-300">
                      <strong>Current Position:</strong> {member.current_position}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <Separator className="bg-slate-200 dark:bg-slate-700" />

          {/* Expertise/Research Areas */}
          <div>
            <div className="text-slate-900 dark:text-slate-50 mb-3 flex items-center gap-2">
              <div className="h-1 w-8 bg-gradient-to-r from-violet-600 to-blue-600 rounded" />
              <span>Research Areas</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(member.expertise || []).map((skill, idx) => (
                <Badge key={idx} variant="outline" className="bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Publications Count - Clickable */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPublications(!showPublications)}
              className="bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/30 dark:to-blue-950/30 border-2 border-violet-200 dark:border-violet-800 rounded-xl p-6 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-violet-600 to-blue-600 text-white p-3 rounded-lg shadow-lg">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-3xl text-violet-900 dark:text-violet-300">{member.publications_count}</div>
                    <div className="text-sm text-violet-700 dark:text-violet-400">Publications</div>
                  </div>
                </div>
                <div className="text-violet-600 dark:text-violet-400">
                  <motion.div
                    animate={{ rotate: showPublications ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ExternalLink className="h-5 w-5" />
                  </motion.div>
                </div>
              </div>
              <p className="text-xs text-violet-600 dark:text-violet-400">Click to view publications</p>
            </motion.div>

            {/* Total Citations */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-3 rounded-lg shadow-lg">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-3xl text-emerald-900 dark:text-emerald-300">
                    {memberPublications.reduce((sum, pub) => sum + pub.citations, 0)}
                  </div>
                  <div className="text-sm text-emerald-700 dark:text-emerald-400">Total Citations</div>
                </div>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">Across all publications</p>
            </div>
          </div>

          {/* CV Download Button */}
          {member.cv_url && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                asChild
                className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-lg"
                size="lg"
              >
                <a
                  href={member.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download CV/Resume
                </a>
              </Button>
            </motion.div>
          )}

          {/* Member Publications List */}
          {showPublications && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-50 mb-3">
                <div className="h-1 w-8 bg-gradient-to-r from-violet-600 to-blue-600 rounded" />
                <span>Publications by {member.name}</span>
              </div>
              {memberPublications.length > 0 ? (
                memberPublications.map((pub) => (
                  <motion.div
                    key={pub.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onPublicationClick) {
                        onPublicationClick(pub);
                      }
                    }}
                    className="bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-600 rounded-lg p-4 cursor-pointer hover:shadow-md dark:hover:shadow-violet-900/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="text-sm mb-2 line-clamp-2 text-slate-900 dark:text-slate-50">{pub.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {pub.year}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {pub.citations} citations
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0 bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400">
                        {pub.category}
                      </Badge>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No publications found</p>
              )}
            </motion.div>
          )}

          <Separator className="bg-slate-200 dark:bg-slate-700" />

          {/* Contact Information */}
          <div>
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-50 mb-4">
              <div className="h-1 w-8 bg-gradient-to-r from-violet-600 to-blue-600 rounded" />
              <span>Contact Information</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Email */}
              <a
                href={`mailto:${member.email}`}
                className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-3 transition-colors group"
              >
                <div className="bg-slate-200 dark:bg-slate-700 group-hover:bg-violet-600 dark:group-hover:bg-violet-600 text-slate-600 dark:text-slate-400 group-hover:text-white p-2 rounded-lg transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Email</div>
                  <div className="text-sm text-slate-900 dark:text-slate-50 truncate">{member.email}</div>
                </div>
              </a>

              {/* Google Scholar */}
              {member.google_scholar_url && (
                <a
                  href={member.google_scholar_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg p-3 transition-colors group"
                >
                  <div className="bg-red-200 dark:bg-red-900/50 group-hover:bg-red-600 text-red-600 dark:text-red-400 group-hover:text-white p-2 rounded-lg transition-colors">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-red-600 dark:text-red-400">Google Scholar</div>
                    <div className="text-sm text-red-900 dark:text-red-300">View Profile</div>
                  </div>
                </a>
              )}

              {/* ResearchGate */}
              {member.researchgate_url && (
                <a
                  href={member.researchgate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 rounded-lg p-3 transition-colors group"
                >
                  <div className="bg-emerald-200 dark:bg-emerald-900/50 group-hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 group-hover:text-white p-2 rounded-lg transition-colors">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400">ResearchGate</div>
                    <div className="text-sm text-emerald-900 dark:text-emerald-300">View Profile</div>
                  </div>
                </a>
              )}

              {/* GitHub */}
              {member.github_url && (
                <a
                  href={member.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-3 transition-colors group"
                >
                  <div className="bg-slate-200 dark:bg-slate-700 group-hover:bg-slate-900 dark:group-hover:bg-slate-100 text-slate-600 dark:text-slate-400 group-hover:text-white dark:group-hover:text-slate-900 p-2 rounded-lg transition-colors">
                    <Github className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">GitHub</div>
                    <div className="text-sm text-slate-900 dark:text-slate-50">View Profile</div>
                  </div>
                </a>
              )}

              {/* LinkedIn */}
              {member.linkedin_url && (
                <a
                  href={member.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 rounded-lg p-3 transition-colors group"
                >
                  <div className="bg-blue-200 dark:bg-blue-900/50 group-hover:bg-blue-600 text-blue-600 dark:text-blue-400 group-hover:text-white p-2 rounded-lg transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">LinkedIn</div>
                    <div className="text-sm text-blue-900 dark:text-blue-300">View Profile</div>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
