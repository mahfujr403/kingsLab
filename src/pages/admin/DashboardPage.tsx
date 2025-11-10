import React, { useEffect, useState, useMemo } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminLoadingSpinner } from '../../components/admin/AdminLoadingSpinner';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  FileText, 
  Users, 
  BookOpen, 
  Mail, 
  TrendingUp, 
  Award,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  Star,
  Clock,
  Plus
} from 'lucide-react';
import { fetchResearchAreas, fetchTeamMembers, fetchPublications, fetchTimelineEvents } from '../../lib/api';
import { getContactSubmissions } from '../../lib/admin-api';
import { mockResearchAreas, mockTeamMembers, mockPublications, mockTimelineEvents } from '../../lib/mock-data';
import { Publication, TeamMember, ResearchArea } from '../../lib/types';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    researchAreas: 0,
    teamMembers: 0,
    publications: 0,
    contactSubmissions: 0,
    timelineEvents: 0,
  });

  const [publications, setPublications] = useState<Publication[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [researchAreas, setResearchAreas] = useState<ResearchArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [researchAreasData, teamMembersData, publicationsData, submissions, timelineData] = await Promise.all([
          fetchResearchAreas().catch(() => mockResearchAreas),
          fetchTeamMembers().catch(() => mockTeamMembers),
          fetchPublications().catch(() => mockPublications),
          getContactSubmissions().catch(() => []),
          fetchTimelineEvents().catch(() => mockTimelineEvents),
        ]);

        setResearchAreas(researchAreasData);
        setTeamMembers(teamMembersData);
        setPublications(publicationsData);

        setStats({
          researchAreas: researchAreasData.length,
          teamMembers: teamMembersData.length,
          publications: publicationsData.length,
          contactSubmissions: Array.isArray(submissions) ? submissions.length : 0,
          timelineEvents: timelineData.length,
        });
      } catch (error) {
        console.error('Failed to load stats, using mock data:', error);
        setResearchAreas(mockResearchAreas);
        setTeamMembers(mockTeamMembers);
        setPublications(mockPublications);
        setStats({
          researchAreas: mockResearchAreas.length,
          teamMembers: mockTeamMembers.length,
          publications: mockPublications.length,
          contactSubmissions: 0,
          timelineEvents: mockTimelineEvents.length,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  // Analytics calculations
  const analytics = useMemo(() => {
    // Total citations
    const totalCitations = publications.reduce((sum, pub) => sum + (pub.citations || 0), 0);

    // Publications by type
    const publicationsByType: Record<string, number> = {};
    publications.forEach(pub => {
      publicationsByType[pub.publication_type] = (publicationsByType[pub.publication_type] || 0) + 1;
    });

    // Publications by year (last 5 years)
    const currentYear = new Date().getFullYear();
    const publicationsByYear: Record<number, number> = {};
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      publicationsByYear[year] = publications.filter(pub => pub.year === year).length;
    }

    // Publications by category
    const publicationsByCategory: Record<string, number> = {};
    publications.forEach(pub => {
      if (pub.category) {
        publicationsByCategory[pub.category] = (publicationsByCategory[pub.category] || 0) + 1;
      }
    });

    // Top cited publications
    const topCited = [...publications]
      .sort((a, b) => (b.citations || 0) - (a.citations || 0))
      .slice(0, 5);

    // Recent publications
    const recentPubs = [...publications]
      .sort((a, b) => b.year - a.year)
      .slice(0, 5);

    // Featured publications
    const featuredPubs = publications.filter(pub => pub.tag === 'Featured' || pub.tag === 'Best Paper');

    // Average citations per publication
    const avgCitations = publications.length > 0 
      ? Math.round(totalCitations / publications.length) 
      : 0;

    return {
      totalCitations,
      publicationsByType,
      publicationsByYear,
      publicationsByCategory,
      topCited,
      recentPubs,
      featuredPubs,
      avgCitations,
    };
  }, [publications]);

  const publicationYearData = Object.entries(analytics.publicationsByYear)
    .map(([year, count]) => ({
      year: year,
      publications: count,
    }))
    .reverse();

  const mainCards = [
    {
      title: 'Research Areas',
      value: stats.researchAreas,
      icon: FileText,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      link: '/admin/research-areas',
      trend: '+2 this month',
    },
    {
      title: 'Team Members',
      value: stats.teamMembers,
      icon: Users,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      link: '/admin/team-members',
      trend: '+1 this month',
    },
    {
      title: 'Publications',
      value: stats.publications,
      icon: BookOpen,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      link: '/admin/publications',
      trend: `+${analytics.recentPubs.filter(p => p.year === new Date().getFullYear()).length} this year`,
    },
    {
      title: 'Timeline Events',
      value: stats.timelineEvents,
      icon: Calendar,
      color: 'bg-gradient-to-br from-pink-500 to-pink-600',
      link: '/admin/timeline',
      trend: 'View all',
    },
  ];

  const insightCards = [
    {
      title: 'Total Citations',
      value: analytics.totalCitations.toLocaleString(),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Avg Citations/Paper',
      value: analytics.avgCitations.toLocaleString(),
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Featured Publications',
      value: analytics.featuredPubs.length,
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Active Categories',
      value: Object.keys(analytics.publicationsByCategory).length,
      icon: PieChart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <AdminLoadingSpinner message="Loading dashboard analytics..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-gray-900 mb-2 text-2xl md:text-3xl">Dashboard</h2>
          <p className="text-gray-600">Welcome to King's Lab admin panel - Overview of your research lab</p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {mainCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link to={card.link}>
                  <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-gray-600 text-sm mb-2">{card.title}</p>
                        <p className="text-gray-900 text-3xl md:text-4xl mb-2">{card.value}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {card.trend}
                        </p>
                      </div>
                      <div className={`${card.color} w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center text-blue-600 text-sm group-hover:translate-x-1 transition-transform">
                      <span>View all</span>
                      <ArrowUpRight className="h-4 w-4 ml-1" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Insight Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {insightCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
              >
                <Card className="p-4 md:p-5">
                  <div className={`${card.bgColor} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <p className="text-gray-600 text-xs mb-1">{card.title}</p>
                  <p className={`text-2xl md:text-3xl ${card.color}`}>{card.value}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Publication Stats Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Publications by Year - Simple Table View */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-gray-900 text-lg">Publications by Year</h3>
                <p className="text-gray-600 text-sm">Last 5 years trend</p>
              </div>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {publicationYearData.map((item) => {
                const maxCount = Math.max(...publicationYearData.map(d => d.publications));
                const percentage = maxCount > 0 ? (item.publications / maxCount) * 100 : 0;
                return (
                  <div key={item.year} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{item.year}</span>
                      <span className="text-gray-900">{item.publications} publications</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Publications by Type */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-gray-900 text-lg">Publications by Type</h3>
                <p className="text-gray-600 text-sm">Distribution overview</p>
              </div>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {Object.entries(analytics.publicationsByType).map(([type, count], index) => {
                const colors = ['bg-blue-600', 'bg-green-600', 'bg-orange-600', 'bg-red-600', 'bg-purple-600'];
                const total = Object.values(analytics.publicationsByType).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} flex-shrink-0`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{type}</span>
                        <span className="text-gray-900">{count} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`${colors[index % colors.length]} h-1.5 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Publications by Category */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-gray-900 text-lg">Research Categories</h3>
                <p className="text-gray-600 text-sm">Publications by field</p>
              </div>
              <BookOpen className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-2">
              {Object.entries(analytics.publicationsByCategory).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm text-gray-700">{category}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{count}</span>
                </div>
              ))}
              {Object.keys(analytics.publicationsByCategory).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No categories yet</p>
              )}
            </div>
          </Card>

          {/* Top Cited Publications */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-900 text-lg">Top Cited Publications</h3>
                <p className="text-gray-600 text-sm">Most impactful research</p>
              </div>
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="space-y-3">
              {analytics.topCited.map((pub, index) => (
                <div key={pub.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 line-clamp-2 mb-1">{pub.title}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {pub.citations} citations
                      </span>
                      <span>{pub.year}</span>
                    </div>
                  </div>
                </div>
              ))}
              {analytics.topCited.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No publications yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-900 text-lg">Recent Publications</h3>
              <p className="text-gray-600 text-sm">Latest research output</p>
            </div>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analytics.recentPubs.map((pub) => (
              <div key={pub.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm text-gray-900 line-clamp-1">{pub.title}</h4>
                    <span className="flex-shrink-0 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {pub.year}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{pub.authors}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                      {pub.publication_type}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {pub.category}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {pub.citations} citations
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {analytics.recentPubs.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No publications yet</p>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4 text-lg">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/publications">
              <Button variant="outline" className="w-full justify-start h-auto py-4 px-4 hover:bg-purple-50 hover:border-purple-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-900">Add Publication</p>
                    <p className="text-xs text-gray-500">Create new research entry</p>
                  </div>
                </div>
              </Button>
            </Link>
            <Link to="/admin/team-members">
              <Button variant="outline" className="w-full justify-start h-auto py-4 px-4 hover:bg-green-50 hover:border-green-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-900">Manage Team</p>
                    <p className="text-xs text-gray-500">Update team members</p>
                  </div>
                </div>
              </Button>
            </Link>
            <Link to="/admin/contact-submissions">
              <Button variant="outline" className="w-full justify-start h-auto py-4 px-4 hover:bg-orange-50 hover:border-orange-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-900">View Messages</p>
                    <p className="text-xs text-gray-500">Check contact submissions</p>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};