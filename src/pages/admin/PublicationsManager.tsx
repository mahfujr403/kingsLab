import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminLoadingSpinner } from '../../components/admin/AdminLoadingSpinner';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { toast } from 'sonner@2.0.3';
import { Plus, Pencil, Trash2, Search, ArrowUpDown, Filter, FileText, CheckSquare, Square, Trash, Eye, ChevronDown, X, ChevronUp } from 'lucide-react';
import { fetchPublications, fetchTeamMembers } from '../../lib/api';
import { createPublication, updatePublication, deletePublication } from '../../lib/admin-api';
import { Publication, TeamMember } from '../../lib/types';
import { mockPublications, mockTeamMembers } from '../../lib/mock-data';
import { PublicationPreview } from '../../components/admin/PreviewModal';

export const PublicationsManager: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Publication | null>(null);
  
  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  
  // Preview State
  const [previewItem, setPreviewItem] = useState<Publication | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Search, Filter, Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'year' | 'citations' | 'title'>('year');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Authors multi-select state
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [isAuthorPopoverOpen, setIsAuthorPopoverOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    journal: '',
    conference: '',
    book_chapter: '',
    publication_type: 'Conference',
    year: new Date().getFullYear().toString(),
    citations: '0',
    tag: 'Recent',
    category: 'Deep Learning',
    abstract: '',
    url: '',
    certificate_url: '',
    event_photo: '',
    doi: '',
    pages: '',
    volume: '',
    issue: '',
    publisher: '',
    status: 'draft' as 'draft' | 'published',
  });
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificatePreview, setCertificatePreview] = useState<string>('');
  const [eventPhotoFile, setEventPhotoFile] = useState<File | null>(null);
  const [eventPhotoPreview, setEventPhotoPreview] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pubsData, membersData] = await Promise.all([
        fetchPublications(),
        fetchTeamMembers()
      ]);
      setPublications(pubsData);
      setTeamMembers(membersData);
    } catch (error) {
      console.log('API failed, using mock data:', error);
      setPublications(mockPublications);
      setTeamMembers(mockTeamMembers);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPublications = async () => {
    try {
      const data = await fetchPublications();
      setPublications(data);
    } catch (error) {
      console.log('API failed, using mock data:', error);
      setPublications(mockPublications);
    }
  };

  const handleOpenDialog = (item?: Publication) => {
    if (item) {
      setEditingItem(item);
      // Parse authors string to array
      const authorsArray = Array.isArray(item.authors) ? item.authors : item.authors.split(',').map(a => a.trim());
      setSelectedAuthors(authorsArray);
      
      setFormData({
        title: item.title,
        authors: Array.isArray(item.authors) ? item.authors.join(', ') : item.authors,
        journal: item.journal || '',
        conference: item.conference || '',
        book_chapter: item.book_chapter || '',
        publication_type: item.publication_type || 'Conference',
        year: item.year.toString(),
        citations: item.citations?.toString() || '0',
        tag: item.tag || 'Recent',
        category: item.category || 'Deep Learning',
        abstract: item.abstract || '',
        url: item.url || '',
        certificate_url: item.certificate_url || '',
        event_photo: item.event_photo || '',
        doi: item.doi || '',
        pages: item.pages || '',
        volume: item.volume || '',
        issue: item.issue || '',
        publisher: item.publisher || '',
        status: item.status || 'draft',
      });
      setCertificatePreview(item.certificate_url || '');
      setCertificateFile(null);
      setEventPhotoPreview(item.event_photo || '');
      setEventPhotoFile(null);
    } else {
      setEditingItem(null);
      setSelectedAuthors([]);
      setFormData({
        title: '',
        authors: '',
        journal: '',
        conference: '',
        book_chapter: '',
        publication_type: 'Conference',
        year: new Date().getFullYear().toString(),
        citations: '0',
        tag: 'Recent',
        category: 'Deep Learning',
        abstract: '',
        url: '',
        certificate_url: '',
        event_photo: '',
        doi: '',
        pages: '',
        volume: '',
        issue: '',
        publisher: '',
        status: 'draft',
      });
      setCertificatePreview('');
      setCertificateFile(null);
      setEventPhotoPreview('');
      setEventPhotoFile(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setSelectedAuthors([]);
    setCertificateFile(null);
    setCertificatePreview('');
    setEventPhotoFile(null);
    setEventPhotoPreview('');
  };

  const toggleAuthor = (authorName: string) => {
    setSelectedAuthors(prev => {
      const newAuthors = prev.includes(authorName)
        ? prev.filter(a => a !== authorName)
        : [...prev, authorName];
      
      // Update formData.authors
      setFormData(fd => ({ ...fd, authors: newAuthors.join(', ') }));
      return newAuthors;
    });
  };

  const removeAuthor = (authorName: string) => {
    setSelectedAuthors(prev => {
      const newAuthors = prev.filter(a => a !== authorName);
      setFormData(fd => ({ ...fd, authors: newAuthors.join(', ') }));
      return newAuthors;
    });
  };

  const addCustomAuthor = (authorName: string) => {
    if (authorName.trim() && !selectedAuthors.includes(authorName.trim())) {
      setSelectedAuthors(prev => {
        const newAuthors = [...prev, authorName.trim()];
        setFormData(fd => ({ ...fd, authors: newAuthors.join(', ') }));
        return newAuthors;
      });
    }
  };

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Certificate file size must be less than 5MB');
        return;
      }
      setCertificateFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCertificatePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEventPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file size must be less than 5MB');
        return;
      }
      setEventPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataObj = new FormData();
    formDataObj.append('title', formData.title);
    formDataObj.append('authors', formData.authors);
    if (formData.journal) formDataObj.append('journal', formData.journal);
    if (formData.conference) formDataObj.append('conference', formData.conference);
    if (formData.book_chapter) formDataObj.append('book_chapter', formData.book_chapter);
    formDataObj.append('publication_type', formData.publication_type);
    formDataObj.append('year', formData.year);
    formDataObj.append('citations', formData.citations);
    formDataObj.append('tag', formData.tag);
    formDataObj.append('category', formData.category);
    formDataObj.append('status', formData.status);
    if (formData.abstract) formDataObj.append('abstract', formData.abstract);
    if (formData.url) formDataObj.append('url', formData.url);
    if (formData.event_photo) formDataObj.append('event_photo', formData.event_photo);
    if (formData.doi) formDataObj.append('doi', formData.doi);
    if (formData.pages) formDataObj.append('pages', formData.pages);
    if (formData.volume) formDataObj.append('volume', formData.volume);
    if (formData.issue) formDataObj.append('issue', formData.issue);
    if (formData.publisher) formDataObj.append('publisher', formData.publisher);
    
    // Append file uploads
    if (certificateFile) {
      formDataObj.append('certificate', certificateFile);
    }
    if (eventPhotoFile) {
      formDataObj.append('event_photo_file', eventPhotoFile);
    }

    try {
      if (editingItem) {
        await updatePublication(editingItem.id, formDataObj);
        toast.success('Publication updated successfully');
      } else {
        await createPublication(formDataObj);
        toast.success('Publication created successfully');
      }
      handleCloseDialog();
      loadPublications();
    } catch (error) {
      toast.error('Failed to save publication');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this publication?')) return;

    try {
      await deletePublication(id);
      toast.success('Publication deleted successfully');
      loadPublications();
    } catch (error) {
      toast.error('Failed to delete publication');
    }
  };

  // Bulk Operations
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAndSortedPublications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSortedPublications.map(p => p.id));
    }
  };

  const toggleSelectItem = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('No items selected');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} publication(s)?`)) return;

    try {
      await Promise.all(selectedIds.map(id => deletePublication(id)));
      toast.success(`${selectedIds.length} publication(s) deleted successfully`);
      setSelectedIds([]);
      setIsSelectMode(false);
      loadPublications();
    } catch (error) {
      toast.error('Failed to delete some publications');
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setIsSelectMode(false);
  };

  // Preview functions
  const handlePreview = (item: Publication) => {
    // Convert formData to Publication format for preview
    const previewData: Publication = {
      id: item.id || 0,
      title: item.title,
      authors: item.authors,
      journal: item.journal,
      conference: item.conference,
      book_chapter: item.book_chapter,
      publication_type: item.publication_type,
      year: item.year,
      citations: item.citations,
      tag: item.tag,
      category: item.category,
      abstract: item.abstract,
      url: item.url,
      certificate_url: item.certificate_url,
      event_photo: item.event_photo,
      doi: item.doi,
      pages: item.pages,
      volume: item.volume,
      issue: item.issue,
      publisher: item.publisher,
      status: item.status,
    };
    setPreviewItem(previewData);
    setIsPreviewOpen(true);
  };

  const handlePreviewFromForm = () => {
    // Create preview from current form data
    const previewData: Publication = {
      id: editingItem?.id || 0,
      title: formData.title,
      authors: formData.authors,
      journal: formData.journal,
      conference: formData.conference,
      book_chapter: formData.book_chapter,
      publication_type: formData.publication_type,
      year: parseInt(formData.year),
      citations: parseInt(formData.citations),
      tag: formData.tag,
      category: formData.category,
      abstract: formData.abstract,
      url: formData.url,
      certificate_url: certificatePreview || formData.certificate_url,
      event_photo: formData.event_photo,
      doi: formData.doi,
      pages: formData.pages,
      volume: formData.volume,
      issue: formData.issue,
      publisher: formData.publisher,
      status: formData.status,
    };
    setPreviewItem(previewData);
    setIsPreviewOpen(true);
  };

  // Filter, Search and Sort Logic
  const filteredAndSortedPublications = useMemo(() => {
    let filtered = [...publications];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(pub => 
        pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.conference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.journal?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(pub => 
        pub.publication_type.toLowerCase() === selectedType.toLowerCase()
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(pub => 
        (pub.status || 'published') === selectedStatus
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'year':
          comparison = a.year - b.year;
          break;
        case 'citations':
          comparison = (a.citations || 0) - (b.citations || 0);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [publications, searchTerm, selectedType, selectedStatus, sortBy, sortOrder]);

  // Get unique publication types from data
  const publicationTypes = useMemo(() => {
    const types = new Set(publications.map(p => p.publication_type));
    return Array.from(types);
  }, [publications]);

  // Count by type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: publications.length };
    publications.forEach(pub => {
      const type = pub.publication_type;
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [publications]);

  // Count by status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { 
      all: publications.length,
      draft: 0,
      published: 0,
    };
    publications.forEach(pub => {
      const status = pub.status || 'published';
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [publications]);

  if (isLoading) {
    return (
      <AdminLayout>
        <AdminLoadingSpinner message="Loading publications..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-gray-900 text-xl md:text-2xl">Publications</h2>
            <p className="text-gray-600 text-sm md:text-base">
              Manage research publications ({filteredAndSortedPublications.length} of {publications.length})
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant={isSelectMode ? "secondary" : "outline"}
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                setSelectedIds([]);
              }} 
              className="flex-1 sm:flex-none"
            >
              {isSelectMode ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
              {isSelectMode ? "Cancel Select" : "Select Multiple"}
            </Button>
            <Button onClick={() => handleOpenDialog()} className="flex-1 sm:flex-none">
              <Plus className="w-4 h-4 mr-2" />
              Add Publication
            </Button>
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        {isSelectMode && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedIds.length === filteredAndSortedPublications.length && filteredAndSortedPublications.length > 0}
                  onCheckedChange={toggleSelectAll}
                  id="select-all"
                />
                <Label htmlFor="select-all" className="cursor-pointer">
                  Select All ({filteredAndSortedPublications.length})
                </Label>
              </div>
              {selectedIds.length > 0 && (
                <>
                  <Badge variant="secondary" className="bg-blue-600 text-white">
                    {selectedIds.length} Selected
                  </Badge>
                  <div className="flex gap-2 ml-auto">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="gap-2"
                    >
                      <Trash className="w-4 h-4" />
                      Delete {selectedIds.length}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                    >
                      Clear
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        )}

        {/* Search and Filter Toggle */}
        <Card className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Search Bar - Always Visible */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title, authors, category, venue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters & Sort' : 'Show Filters & Sort'}
              </span>
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {/* Collapsible Filter Section */}
            {showFilters && (
              <div className="space-y-4 pt-2 border-t">
                {/* Filter by Status */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Filter className="h-4 w-4" />
                    <Label>Filter by Status</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedStatus === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedStatus('all')}
                      className="text-xs"
                    >
                      All ({statusCounts.all})
                    </Button>
                    <Button
                      variant={selectedStatus === 'published' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedStatus('published')}
                      className="text-xs"
                    >
                      Published ({statusCounts.published})
                    </Button>
                    <Button
                      variant={selectedStatus === 'draft' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedStatus('draft')}
                      className="text-xs"
                    >
                      Drafts ({statusCounts.draft})
                    </Button>
                  </div>
                </div>

                {/* Filter by Type */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Filter className="h-4 w-4" />
                    <Label>Filter by Publication Type</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedType === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedType('all')}
                      className="text-xs"
                    >
                      All ({typeCounts.all})
                    </Button>
                    {publicationTypes.map(type => (
                      <Button
                        key={type}
                        variant={selectedType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedType(type)}
                        className="text-xs"
                      >
                        {type} ({typeCounts[type] || 0})
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Sort Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <ArrowUpDown className="h-4 w-4" />
                      <Label>Sort By</Label>
                    </div>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="year">Year</SelectItem>
                        <SelectItem value="citations">Citations</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Descending</SelectItem>
                        <SelectItem value="asc">Ascending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Publications List */}
        {filteredAndSortedPublications.length === 0 ? (
          <Card className="p-8">
            <div className="text-center text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No publications found matching your criteria.</p>
              {searchTerm || selectedType !== 'all' ? (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('all');
                  }}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              ) : null}
            </div>
          </Card>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {filteredAndSortedPublications.map((pub) => (
              <Card key={pub.id} className={`p-4 md:p-6 hover:shadow-lg transition-all ${
                selectedIds.includes(pub.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}>
                <div className="flex gap-3 sm:gap-4">
                  {/* Checkbox in Select Mode */}
                  {isSelectMode && (
                    <div className="flex items-start pt-1">
                      <Checkbox
                        checked={selectedIds.includes(pub.id)}
                        onCheckedChange={() => toggleSelectItem(pub.id)}
                        id={`select-${pub.id}`}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="text-gray-900 text-sm md:text-base break-words">{pub.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={(pub.status || 'published') === 'published' ? 'default' : 'secondary'}>
                          {(pub.status || 'published') === 'published' ? '✓ Published' : '📝 Draft'}
                        </Badge>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs w-fit">
                          {pub.publication_type}
                        </span>
                        {pub.tag && (
                          <span className={`px-2 py-1 rounded text-xs w-fit ${
                            pub.tag === 'Featured' 
                              ? 'bg-yellow-100 text-yellow-700' 
                              : pub.tag === 'Best Paper'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {pub.tag}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs md:text-sm mb-2 break-words">
                      {Array.isArray(pub.authors) ? pub.authors.join(', ') : pub.authors}
                    </p>
                    <p className="text-gray-600 text-xs md:text-sm mb-2">
                      {pub.journal || pub.conference || pub.book_chapter} • {pub.year}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
                      {pub.citations !== undefined && (
                        <span className="flex items-center gap-1">
                          📊 {pub.citations} citations
                        </span>
                      )}
                      {pub.category && (
                        <span className="flex items-center gap-1">
                          🏷️ {pub.category}
                        </span>
                      )}
                    </div>
                    {pub.abstract && (
                      <p className="text-gray-600 text-xs md:text-sm line-clamp-2">{pub.abstract}</p>
                    )}
                  </div>
                  
                  {/* Action Buttons - Hidden in Select Mode */}
                  {!isSelectMode && (
                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(pub)} className="flex-1 sm:flex-none">
                        <Pencil className="w-4 h-4 sm:mr-0" />
                        <span className="ml-2 sm:hidden">Edit</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(pub.id)} className="flex-1 sm:flex-none">
                        <Trash2 className="w-4 h-4 sm:mr-0" />
                        <span className="ml-2 sm:hidden">Delete</span>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Publication' : 'Add Publication'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authors">Authors *</Label>
                  <div className="space-y-2">
                    {/* Selected Authors Display */}
                    {selectedAuthors.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-gray-50">
                        {selectedAuthors.map((author) => (
                          <Badge key={author} variant="secondary" className="gap-1">
                            {author}
                            <X 
                              className="w-3 h-3 cursor-pointer hover:text-red-600" 
                              onClick={() => removeAuthor(author)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Author Selector Popover */}
                    <Popover open={isAuthorPopoverOpen} onOpenChange={setIsAuthorPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full justify-between"
                          type="button"
                        >
                          <span className="text-gray-600">
                            {selectedAuthors.length > 0 
                              ? `${selectedAuthors.length} author(s) selected` 
                              : 'Select authors from team'}
                          </span>
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="start">
                        <div className="max-h-[300px] overflow-y-auto">
                          <div className="p-2 border-b bg-gray-50">
                            <p className="text-xs text-gray-600">Select team members as authors</p>
                          </div>
                          <div className="p-2">
                            {teamMembers.length > 0 ? (
                              teamMembers
                                .filter(member => !member.is_alumni)
                                .map((member) => (
                                  <div
                                    key={member.id}
                                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                                    onClick={() => toggleAuthor(member.name)}
                                  >
                                    <Checkbox
                                      checked={selectedAuthors.includes(member.name)}
                                      onCheckedChange={() => toggleAuthor(member.name)}
                                    />
                                    <div className="flex-1">
                                      <p className="text-sm">{member.name}</p>
                                      <p className="text-xs text-gray-500">{member.role}</p>
                                    </div>
                                  </div>
                                ))
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-4">No team members found</p>
                            )}
                          </div>
                          <div className="p-2 border-t bg-gray-50">
                            <Input
                              placeholder="Add external author (press Enter)"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.currentTarget;
                                  addCustomAuthor(input.value);
                                  input.value = '';
                                }
                              }}
                              className="text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">Type name and press Enter for external authors</p>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="hidden"
                      value={formData.authors}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="publication_type">Publication Type *</Label>
                    <Select 
                      value={formData.publication_type} 
                      onValueChange={(value) => setFormData({ ...formData, publication_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Conference">Conference</SelectItem>
                        <SelectItem value="Journal">Journal</SelectItem>
                        <SelectItem value="Book Chapter">Book Chapter</SelectItem>
                        <SelectItem value="Workshop">Workshop</SelectItem>
                        <SelectItem value="Preprint">Preprint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Deep Learning">Deep Learning</SelectItem>
                        <SelectItem value="Computer Vision">Computer Vision</SelectItem>
                        <SelectItem value="NLP">NLP</SelectItem>
                        <SelectItem value="Reinforcement Learning">Reinforcement Learning</SelectItem>
                        <SelectItem value="Robotics">Robotics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="citations">Citations</Label>
                    <Input
                      id="citations"
                      type="number"
                      value={formData.citations}
                      onChange={(e) => setFormData({ ...formData, citations: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tag">Tag</Label>
                    <Select 
                      value={formData.tag} 
                      onValueChange={(value) => setFormData({ ...formData, tag: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Recent">Recent</SelectItem>
                        <SelectItem value="Featured">Featured</SelectItem>
                        <SelectItem value="Best Paper">Best Paper</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Venue Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Venue Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="conference">Conference</Label>
                  <Input
                    id="conference"
                    value={formData.conference}
                    onChange={(e) => setFormData({ ...formData, conference: e.target.value })}
                    placeholder="e.g., NeurIPS 2024"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="journal">Journal</Label>
                  <Input
                    id="journal"
                    value={formData.journal}
                    onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                    placeholder="e.g., IEEE Transactions on Robotics"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="book_chapter">Book Chapter</Label>
                  <Input
                    id="book_chapter"
                    value={formData.book_chapter}
                    onChange={(e) => setFormData({ ...formData, book_chapter: e.target.value })}
                    placeholder="e.g., The Handbook of Natural Language Processing"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publisher">Publisher</Label>
                  <Input
                    id="publisher"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    placeholder="e.g., IEEE, MIT Press"
                  />
                </div>
              </div>

              {/* Publication Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Publication Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="volume">Volume</Label>
                    <Input
                      id="volume"
                      value={formData.volume}
                      onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                      placeholder="e.g., 39"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issue">Issue</Label>
                    <Input
                      id="issue"
                      value={formData.issue}
                      onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                      placeholder="e.g., 4"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pages">Pages</Label>
                    <Input
                      id="pages"
                      value={formData.pages}
                      onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                      placeholder="e.g., 2891-2907"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doi">DOI (Recommended)</Label>
                  <Input
                    id="doi"
                    value={formData.doi}
                    onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                    placeholder="e.g., 10.1109/TRO.2023.3287654"
                  />
                  <p className="text-xs text-gray-500">Digital Object Identifier for permanent publication link</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">Publication URL (Optional)</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-gray-500">External link to publication (arXiv, IEEE Xplore, etc.)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abstract">Abstract</Label>
                  <RichTextEditor
                    content={formData.abstract}
                    onChange={(content) => setFormData({ ...formData, abstract: content })}
                    placeholder="Brief description of the publication..."
                    minHeight="200px"
                  />
                  <p className="text-xs text-gray-500">
                    Use formatting tools to create a structured abstract with proper formatting.
                  </p>
                </div>
              </div>

              {/* Media & Certificates */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Media & Certificates</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="certificate">Certificate Upload (From Computer)</Label>
                  <Input
                    id="certificate"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleCertificateChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500">Upload acceptance/award certificate (PDF or image, max 5MB)</p>
                  
                  {certificatePreview && (
                    <div className="mt-3 relative">
                      <img 
                        src={certificatePreview} 
                        alt="Certificate Preview" 
                        className="w-full h-48 object-contain rounded-lg border-2 border-gray-200 bg-gray-50"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setCertificateFile(null);
                          setCertificatePreview('');
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_photo_file">Event Photo Upload (From Computer)</Label>
                  <Input
                    id="event_photo_file"
                    type="file"
                    accept="image/*"
                    onChange={handleEventPhotoChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500">Upload event/conference photo (recommended: 1200x800px, max 5MB)</p>
                  
                  {eventPhotoPreview && (
                    <div className="mt-3 relative">
                      <img 
                        src={eventPhotoPreview} 
                        alt="Event Photo Preview" 
                        className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setEventPhotoFile(null);
                          setEventPhotoPreview('');
                          setFormData({ ...formData, event_photo: '' });
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_photo">Event Photo URL (Alternative)</Label>
                  <Input
                    id="event_photo"
                    value={formData.event_photo}
                    onChange={(e) => setFormData({ ...formData, event_photo: e.target.value })}
                    placeholder="https://..."
                    disabled={!!eventPhotoFile}
                  />
                  <p className="text-xs text-gray-500">
                    {eventPhotoFile ? 'URL disabled - using uploaded file' : 'Or provide an external photo URL'}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};