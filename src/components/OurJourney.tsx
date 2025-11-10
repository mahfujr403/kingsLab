import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Milestone, BookOpen, TrendingUp, Award, ExternalLink, Users, Building2 } from 'lucide-react';
import { api } from '../lib/api';
import type { TimelineEvent, Publication } from '../lib/types';
import { mockTimelineEvents, mockPublications } from '../lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';

type JourneyItem = {
  id: number;
  year: number;
  type: 'milestone' | 'publication';
  data: TimelineEvent | Publication;
};

export const OurJourney: React.FC = () => {
  const [milestones, setMilestones] = useState<TimelineEvent[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<JourneyItem | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [timelineData, publicationData] = await Promise.all([
          api.getTimelineEvents(),
          api.getPublications()
        ]);
        
        // Filter only milestone events
        const milestoneEvents = timelineData.filter(e => e.category === 'milestone');
        setMilestones(milestoneEvents);
        setPublications(publicationData);
      } catch (error) {
        console.warn('Failed to load data from API, using mock data:', error);
        setMilestones(mockTimelineEvents.filter(e => e.category === 'milestone'));
        setPublications(mockPublications);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Combine milestones and publications into a single chronological list
  const journeyItems: JourneyItem[] = [
    ...milestones.map(m => ({
      id: m.id,
      year: m.year,
      type: 'milestone' as const,
      data: m
    })),
    ...publications.map(p => ({
      id: p.id,
      year: p.year,
      type: 'publication' as const,
      data: p
    }))
  ].sort((a, b) => b.year - a.year);

  const filteredItems = selectedCategory === 'all' 
    ? journeyItems 
    : journeyItems.filter(item => item.type === selectedCategory);

  const categories = ['all', 'milestone', 'publication'];

  if (loading) {
    return (
      <section id="our-journey" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="our-journey" className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
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
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Timeline & Achievements</span>
          </motion.div>

          <h2 className="text-slate-900 dark:text-white bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 mb-4">Our Journey</h2>
          
          {/* Decorative line */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent max-w-xs mx-auto mb-6"
          />
          
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Explore the milestones and publications that have shaped King's Lab into a leading AI research institution.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow dark:shadow-gray-900/30'
              }`}
            >
              {category === 'all' ? 'All' : category === 'milestone' ? 'Milestones' : 'Publications'}
              {category === 'all' && ` (${journeyItems.length})`}
              {category === 'milestone' && ` (${milestones.length})`}
              {category === 'publication' && ` (${publications.length})`}
            </button>
          ))}
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200 hidden md:block"></div>

          <div className="space-y-12">
            {filteredItems.map((item, index) => {
              const isEven = index % 2 === 0;
              const isMilestone = item.type === 'milestone';

              return (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className={`relative flex items-center ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex-col md:gap-8`}
                >
                  {/* Content */}
                  <div className={`w-full md:w-5/12 ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                    <Card 
                      className="p-6 hover:shadow-xl dark:hover:shadow-purple-900/20 transition-all duration-300 bg-white dark:bg-gray-800 border-0 shadow-lg dark:shadow-gray-900/30 group cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    >
                      {isMilestone ? (
                        // Milestone card
                        <div className={`flex items-start gap-3 ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} flex-row`}>
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Milestone className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className={`flex items-center gap-2 mb-2 ${isEven ? 'md:justify-end' : 'md:justify-start'} justify-start`}>
                              <Badge className="bg-gray-900 text-white border-0">
                                {item.year}
                              </Badge>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Milestone
                              </Badge>
                            </div>
                            
                            <h3 className="text-gray-900 dark:text-white mb-2">{(item.data as TimelineEvent).title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{(item.data as TimelineEvent).description}</p>
                          </div>
                        </div>
                      ) : (
                        // Publication card
                        <div className="space-y-3">
                          <div className={`flex items-center gap-2 mb-3 ${isEven ? 'md:justify-end' : 'md:justify-start'} justify-start`}>
                            <Badge className="bg-gray-900 text-white border-0">
                              {item.year}
                            </Badge>
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                              Publication
                            </Badge>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {(item.data as Publication).publication_type}
                            </Badge>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="text-gray-900 dark:text-white mb-2 line-clamp-2">{(item.data as Publication).title}</h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span className="line-clamp-1">{(item.data as Publication).authors}</span>
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <TrendingUp className="h-3 w-3 text-green-600" />
                                <span>{(item.data as Publication).citations} citations</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* Center dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
                    <div className={`w-6 h-6 rounded-full ${
                      isMilestone 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                    } ring-4 ring-white shadow-lg`}></div>
                  </div>

                  {/* Spacer */}
                  <div className="hidden md:block w-5/12"></div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-500 dark:text-gray-400">No items found in this category.</p>
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-[90%] md:max-w-[80vw] max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          {selectedItem && (
            <>
              {selectedItem.type === 'milestone' ? (
                // Milestone Detail
                <>
                  <DialogHeader>
                    <DialogTitle className="text-2xl pr-8 text-slate-900 dark:text-slate-50">{(selectedItem.data as TimelineEvent).title}</DialogTitle>
                    <DialogDescription className="sr-only">
                      Milestone details for {(selectedItem.data as TimelineEvent).title}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 mt-6">
                    {(selectedItem.data as TimelineEvent).image && (
                      <div className="relative rounded-xl overflow-hidden shadow-lg">
                        <ImageWithFallback
                          src={(selectedItem.data as TimelineEvent).image!}
                          alt={(selectedItem.data as TimelineEvent).title}
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span>Year</span>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-400">{selectedItem.year}</p>
                      </div>

                      <div className="bg-violet-50 dark:bg-violet-950/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-violet-900 dark:text-violet-300 mb-1">
                          <Milestone className="h-4 w-4" />
                          <span>Type</span>
                        </div>
                        <p className="text-sm text-violet-800 dark:text-violet-400 capitalize">{(selectedItem.data as TimelineEvent).category}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                      <h3 className="text-slate-900 dark:text-slate-50 mb-2">Description</h3>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{(selectedItem.data as TimelineEvent).description}</p>
                    </div>
                  </div>
                </>
              ) : (
                // Publication Detail
                <>
                  <DialogHeader>
                    <DialogTitle className="text-2xl pr-8 text-slate-900 dark:text-slate-50">{(selectedItem.data as Publication).title}</DialogTitle>
                    <DialogDescription className="sr-only">
                      Publication details for {(selectedItem.data as Publication).title}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 mt-6">
                    {(selectedItem.data as Publication).event_photo && (
                      <div className="relative rounded-xl overflow-hidden shadow-lg">
                        <ImageWithFallback
                          src={(selectedItem.data as Publication).event_photo}
                          alt={`${(selectedItem.data as Publication).title} event`}
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    )}

                    {(selectedItem.data as Publication).certificate_url && (
                      <div className="relative rounded-xl overflow-hidden shadow-lg border-4 border-amber-300 dark:border-amber-700">
                        <div className="absolute top-4 left-4 z-10">
                          <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            <span>Award Certificate</span>
                          </div>
                        </div>
                        <ImageWithFallback
                          src={(selectedItem.data as Publication).certificate_url}
                          alt={`${(selectedItem.data as Publication).title} certificate`}
                          className="w-full h-auto object-contain bg-white dark:bg-slate-100"
                        />
                      </div>
                    )}

                    <Separator className="bg-slate-200 dark:bg-slate-700" />

                    <div>
                      <div className="flex items-center gap-2 text-slate-900 dark:text-slate-50 mb-3">
                        <Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        <span>Authors</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{(selectedItem.data as Publication).authors}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-violet-50 dark:bg-violet-950/30 rounded-lg p-4">
                        <div className="text-violet-900 dark:text-violet-300 mb-1">Publication Type</div>
                        <p className="text-sm text-violet-800 dark:text-violet-400">{(selectedItem.data as Publication).publication_type}</p>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span>Year</span>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-400">{(selectedItem.data as Publication).year}</p>
                      </div>

                      {(selectedItem.data as Publication).conference && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 mb-1">
                            <Building2 className="h-4 w-4" />
                            <span>Conference</span>
                          </div>
                          <p className="text-sm text-emerald-800 dark:text-emerald-400">{(selectedItem.data as Publication).conference}</p>
                        </div>
                      )}

                      {(selectedItem.data as Publication).journal && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 mb-1">
                            <BookOpen className="h-4 w-4" />
                            <span>Journal</span>
                          </div>
                          <p className="text-sm text-blue-800 dark:text-blue-400">{(selectedItem.data as Publication).journal}</p>
                        </div>
                      )}

                      <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 mb-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>Citations</span>
                        </div>
                        <p className="text-sm text-emerald-800 dark:text-emerald-400">{(selectedItem.data as Publication).citations}</p>
                      </div>
                    </div>

                    {(selectedItem.data as Publication).abstract && (
                      <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-950/30 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-slate-900 dark:text-slate-50 mb-2">Abstract</h3>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{(selectedItem.data as Publication).abstract}</p>
                      </div>
                    )}

                    {(selectedItem.data as Publication).url && (
                      <a
                        href={(selectedItem.data as Publication).url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Publication
                      </a>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
