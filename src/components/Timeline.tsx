import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Award, Milestone, TrendingUp, BookOpen } from 'lucide-react';
import { api } from '../lib/api';
import type { TimelineEvent } from '../lib/types';
import { mockTimelineEvents } from '../lib/mock-data';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

const categoryIcons = {
  milestone: Milestone,
  achievement: TrendingUp,
  publication: BookOpen,
  award: Award,
};

const categoryColors = {
  milestone: 'from-blue-500 to-purple-500',
  achievement: 'from-green-500 to-emerald-500',
  publication: 'from-amber-500 to-orange-500',
  award: 'from-pink-500 to-rose-500',
};

export const Timeline: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await api.getTimelineEvents();
        setEvents(data);
      } catch (error) {
        console.warn('Failed to load timeline events from API, using mock data:', error);
        setEvents(mockTimelineEvents);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(e => e.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(events.map(e => e.category)))];

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
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
            <span className="text-sm text-slate-700 dark:text-slate-300">Our Story</span>
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
            Explore the milestones and achievements that have shaped King's Lab into a leading AI research institution.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200 hidden md:block"></div>

          <div className="space-y-12">
            {filteredEvents.map((event, index) => {
              const Icon = categoryIcons[event.category as keyof typeof categoryIcons] || Calendar;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative flex items-center ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex-col md:gap-8`}
                >
                  {/* Content */}
                  <div className={`w-full md:w-5/12 ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                    <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-white border-0 shadow-lg group">
                      <div className={`flex items-start gap-3 ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} flex-row`}>
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r ${categoryColors[event.category as keyof typeof categoryColors]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className={`flex items-center gap-2 mb-2 ${isEven ? 'md:justify-end' : 'md:justify-start'} justify-start`}>
                            <Badge className="bg-gray-900 text-white border-0">
                              {event.year}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {event.category}
                            </Badge>
                          </div>
                          
                          <h3 className="text-gray-900 mb-2">{event.title}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
                          
                          {event.image && (
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="mt-4 rounded-lg overflow-hidden shadow-md"
                            >
                              <img
                                src={event.image}
                                alt={event.title}
                                className="w-full h-48 object-cover"
                              />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Center dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${categoryColors[event.category as keyof typeof categoryColors]} ring-4 ring-white shadow-lg`}></div>
                  </div>

                  {/* Spacer */}
                  <div className="hidden md:block w-5/12"></div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {filteredEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-500">No events found in this category.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};
