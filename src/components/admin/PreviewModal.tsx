import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X, ExternalLink, Mail, GraduationCap, Award, Github, Linkedin } from 'lucide-react';
import { Publication, TeamMember, ResearchArea, TimelineEvent } from '../../lib/types';

interface PublicationPreviewProps {
  publication: Publication;
  isOpen: boolean;
  onClose: () => void;
}

export const PublicationPreview: React.FC<PublicationPreviewProps> = ({ publication, isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Preview: Publication</DialogTitle>
            <Badge variant={publication.status === 'published' ? 'default' : 'secondary'}>
              {publication.status === 'published' ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg p-6 space-y-4">
          {/* Preview Label */}
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
            <p className="text-sm text-yellow-800">
              📋 <strong>Preview Mode:</strong> This is how the publication will appear on the public website.
            </p>
          </div>

          {/* Publication Card Preview */}
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-gray-900 mb-2">{publication.title}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  {Array.isArray(publication.authors) ? publication.authors.join(', ') : publication.authors}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">
                  {publication.publication_type}
                </Badge>
                {publication.tag && (
                  <Badge className={
                    publication.tag === 'Featured' 
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' 
                      : publication.tag === 'Best Paper'
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-100'
                      : 'bg-green-100 text-green-700 hover:bg-green-100'
                  }>
                    {publication.tag}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>{publication.journal || publication.conference || publication.book_chapter}</span>
              <span>•</span>
              <span>{publication.year}</span>
              {publication.citations !== undefined && (
                <>
                  <span>•</span>
                  <span>📊 {publication.citations} citations</span>
                </>
              )}
            </div>

            {publication.category && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">{publication.category}</Badge>
              </div>
            )}

            {publication.abstract && (
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">{publication.abstract}</p>
              </div>
            )}

            {publication.url && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  View Paper
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface TeamMemberPreviewProps {
  member: TeamMember;
  isOpen: boolean;
  onClose: () => void;
}

export const TeamMemberPreview: React.FC<TeamMemberPreviewProps> = ({ member, isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Preview: Team Member</DialogTitle>
            <Badge variant={member.status === 'published' ? 'default' : 'secondary'}>
              {member.status === 'published' ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg p-6 space-y-4">
          {/* Preview Label */}
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
            <p className="text-sm text-yellow-800">
              📋 <strong>Preview Mode:</strong> This is how the team member will appear on the public website.
            </p>
          </div>

          {/* Team Member Card Preview */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-48 bg-gradient-to-br from-violet-600 to-blue-600">
              {member.image && (
                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
              )}
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-center -mt-20 mb-6">
                <div className="inline-block">
                  <img
                    src={member.image || 'https://via.placeholder.com/150'}
                    alt={member.name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-gray-900 mb-1">{member.name}</h3>
                <p className="text-violet-600 mb-2">{member.role}</p>
                {member.affiliation && (
                  <p className="text-sm text-gray-600 mb-2">{member.affiliation}</p>
                )}
              </div>

              {member.is_alumni && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    <strong>Alumni</strong> {member.alumni_year && `(${member.alumni_year})`}
                  </p>
                  {member.current_position && (
                    <p className="text-sm text-amber-700 mt-1">
                      Now: {member.current_position}
                    </p>
                  )}
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">{member.bio}</p>
              </div>

              {member.education && (
                <div className="flex items-start gap-2">
                  <GraduationCap className="w-4 h-4 text-violet-600 mt-1 shrink-0" />
                  <p className="text-sm text-gray-600">{member.education}</p>
                </div>
              )}

              {member.expertise && member.expertise.length > 0 && (
                <div>
                  <p className="text-sm text-gray-700 mb-2">Expertise:</p>
                  <div className="flex flex-wrap gap-2">
                    {(member.expertise || []).map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {member.email && (
                  <Button variant="outline" size="sm" className="gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                )}
                {member.linkedin_url && (
                  <Button variant="outline" size="sm" className="gap-2">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Button>
                )}
                {member.github_url && (
                  <Button variant="outline" size="sm" className="gap-2">
                    <Github className="w-4 h-4" />
                    GitHub
                  </Button>
                )}
              </div>

              {member.publications_count > 0 && (
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    <strong className="text-violet-600">{member.publications_count}</strong> Publications
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ResearchAreaPreviewProps {
  area: ResearchArea;
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchAreaPreview: React.FC<ResearchAreaPreviewProps> = ({ area, isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Preview: Research Area</DialogTitle>
            <Badge variant={area.status === 'published' ? 'default' : 'secondary'}>
              {area.status === 'published' ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg p-6 space-y-4">
          {/* Preview Label */}
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
            <p className="text-sm text-yellow-800">
              📋 <strong>Preview Mode:</strong> This is how the research area will appear on the public website.
            </p>
          </div>

          {/* Research Area Card Preview */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-48 bg-gradient-to-br from-violet-600 to-blue-600">
              {area.image && (
                <img src={area.image} alt={area.title} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{area.icon}</span>
                  <h3 className="text-white">{area.title}</h3>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600">{area.description}</p>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 whitespace-pre-line">{area.details}</p>
              </div>

              <Button className="w-full gap-2">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface TimelineEventPreviewProps {
  event: TimelineEvent;
  isOpen: boolean;
  onClose: () => void;
}

export const TimelineEventPreview: React.FC<TimelineEventPreviewProps> = ({ event, isOpen, onClose }) => {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'milestone':
        return 'bg-blue-100 text-blue-700';
      case 'achievement':
        return 'bg-purple-100 text-purple-700';
      case 'publication':
        return 'bg-green-100 text-green-700';
      case 'award':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Preview: Timeline Event</DialogTitle>
            <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
              {event.status === 'published' ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg p-6 space-y-4">
          {/* Preview Label */}
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
            <p className="text-sm text-yellow-800">
              📋 <strong>Preview Mode:</strong> This is how the timeline event will appear on the public website.
            </p>
          </div>

          {/* Timeline Event Preview */}
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white shadow-lg">
                  <span className="text-xl">{event.year}</span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-gray-900">{event.title}</h3>
                  <Badge className={getCategoryColor(event.category)}>
                    {event.category}
                  </Badge>
                </div>

                <p className="text-gray-600">{event.description}</p>

                {event.image && (
                  <div className="rounded-lg overflow-hidden mt-4">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
