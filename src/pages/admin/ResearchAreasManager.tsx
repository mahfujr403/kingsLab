import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminLoadingSpinner } from '../../components/admin/AdminLoadingSpinner';
import { DraggableCard } from '../../components/admin/DraggableCard';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner@2.0.3';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Image as ImageIcon,
  Brain,
  Eye,
  MessageSquare,
  Cpu,
  Network,
  Sparkles,
  Zap,
  Target,
  Layers,
  CircuitBoard,
  Database,
  Globe,
  Microscope,
  ActivitySquare,
  Binary,
  Bot,
  Braces,
  GripVertical,
  Save
} from 'lucide-react';
import { fetchResearchAreas } from '../../lib/api';
import { createResearchArea, updateResearchArea, deleteResearchArea, reorderResearchAreas } from '../../lib/admin-api';
import { ResearchArea } from '../../lib/types';
import { mockResearchAreas } from '../../lib/mock-data';

// Icon mapping for Lucide React icons
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Brain,
  Eye,
  MessageSquare,
  Cpu,
  Network,
  Sparkles,
  Zap,
  Target,
  Layers,
  CircuitBoard,
  Database,
  Globe,
  Microscope,
  ActivitySquare,
  Binary,
  Bot,
  Braces,
};

// Helper function to get icon component
const getIconComponent = (iconName: string) => {
  const IconComponent = iconMap[iconName];
  return IconComponent || Brain; // Fallback to Brain icon
};

export const ResearchAreasManager: React.FC = () => {
  const [researchAreas, setResearchAreas] = useState<ResearchArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ResearchArea | null>(null);
  const [isDragMode, setIsDragMode] = useState(false);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    details: '',
    icon: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    loadResearchAreas();
  }, []);

  const loadResearchAreas = async () => {
    try {
      const data = await fetchResearchAreas();
      setResearchAreas(data);
    } catch (error) {
      console.log('API failed, using mock data:', error);
      // Fallback to mock data if API is unavailable
      setResearchAreas(mockResearchAreas);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (item?: ResearchArea) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description,
        details: item.details || '',
        icon: item.icon,
        image: item.image || '',
      });
      setImagePreview(item.image || '');
      setImageFile(null);
    } else {
      setEditingItem(null);
      setFormData({ title: '', description: '', details: '', icon: '', image: '' });
      setImagePreview('');
      setImageFile(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({ title: '', description: '', details: '', icon: '', image: '' });
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataObj = new FormData();
    formDataObj.append('title', formData.title);
    formDataObj.append('description', formData.description);
    formDataObj.append('details', formData.details);
    formDataObj.append('icon', formData.icon);
    formDataObj.append('order', '1'); // Default order
    
    // Append image file if selected
    if (imageFile) {
      formDataObj.append('image', imageFile);
    }

    try {
      if (editingItem) {
        await updateResearchArea(editingItem.id, formDataObj);
        toast.success('Research area updated successfully');
      } else {
        await createResearchArea(formDataObj);
        toast.success('Research area created successfully');
      }
      handleCloseDialog();
      loadResearchAreas();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save research area');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this research area?')) return;

    try {
      await deleteResearchArea(id);
      toast.success('Research area deleted successfully');
      loadResearchAreas();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete research area');
    }
  };

  // Drag and Drop handlers
  const moveResearchArea = useCallback((dragIndex: number, hoverIndex: number) => {
    setResearchAreas(prevAreas => {
      const newAreas = [...prevAreas];
      const draggedItem = newAreas[dragIndex];
      newAreas.splice(dragIndex, 1);
      newAreas.splice(hoverIndex, 0, draggedItem);
      return newAreas;
    });
    setHasOrderChanged(true);
  }, []);

  const handleSaveOrder = async () => {
    try {
      const orderedIds = researchAreas.map(area => area.id);
      await reorderResearchAreas(orderedIds);
      toast.success('Research areas order saved successfully');
      setHasOrderChanged(false);
      setIsDragMode(false);
      loadResearchAreas();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save order');
    }
  };

  const handleCancelReorder = () => {
    setIsDragMode(false);
    setHasOrderChanged(false);
    loadResearchAreas(); // Reload original order
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <AdminLoadingSpinner message="Loading research areas..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <DndProvider backend={HTML5Backend}>
        <div className="space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-gray-900 text-xl md:text-2xl">Research Areas</h2>
              <p className="text-gray-600 text-sm md:text-base">Manage your research focus areas</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant={isDragMode ? "secondary" : "outline"}
                onClick={() => {
                  if (isDragMode && hasOrderChanged) {
                    handleCancelReorder();
                  } else {
                    setIsDragMode(!isDragMode);
                  }
                }} 
                className="flex-1 sm:flex-none"
              >
                <GripVertical className="w-4 h-4 mr-2" />
                {isDragMode ? "Cancel" : "Reorder"}
              </Button>
              <Button onClick={() => handleOpenDialog()} className="flex-1 sm:flex-none">
                <Plus className="w-4 h-4 mr-2" />
                Add Area
              </Button>
            </div>
          </div>

          {/* Save Order Toolbar */}
          {isDragMode && hasOrderChanged && (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm text-green-800">
                  <GripVertical className="inline w-4 h-4 mr-2" />
                  Drag items to reorder, then save your changes
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelReorder}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveOrder}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4" />
                    Save Order
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {researchAreas.map((area, index) => {
            const IconComponent = getIconComponent(area.icon);
            
            return (
              <DraggableCard
                key={area.id}
                id={area.id}
                index={index}
                onMove={moveResearchArea}
                isDragMode={isDragMode}
              >
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
                {/* Image Header */}
                {area.image ? (
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                    <img 
                      src={area.image} 
                      alt={area.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Action Buttons - Overlaid on Image */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handleOpenDialog(area)}
                        className="bg-white/90 hover:bg-white shadow-lg"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handleDelete(area.id)}
                        className="bg-white/90 hover:bg-white shadow-lg text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Icon Badge - Bottom Left */}
                    <div className="absolute bottom-3 left-3">
                      <div className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center">
                        <IconComponent className="w-7 h-7 text-blue-600" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-300" />
                    
                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleOpenDialog(area)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(area.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Icon Badge */}
                    <div className="absolute bottom-3 left-3">
                      <div className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center">
                        <IconComponent className="w-7 h-7 text-blue-600" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Content Section */}
                <div className="p-6">
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        ID: {area.id}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {area.icon}
                      </Badge>
                    </div>
                    <h3 className="text-gray-900 group-hover:text-blue-600 transition-colors">
                      {area.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {area.description}
                  </p>

                  {area.details && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {area.details}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
              </DraggableCard>
            );
          })}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Research Area' : 'Add Research Area'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Deep Learning, Computer Vision"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Brief overview of the research area"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Detailed Description</Label>
                <RichTextEditor
                  content={formData.details}
                  onChange={(content) => setFormData({ ...formData, details: content })}
                  placeholder="Detailed information about the research area, projects, and focus..."
                  minHeight="250px"
                />
                <p className="text-xs text-gray-500">
                  Use the toolbar above to format your text with headings, lists, links, and more.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon Name (Lucide React)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Brain, Eye, MessageSquare, Cpu, etc."
                  required
                />
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Available icons:</p>
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                    {Object.keys(iconMap).map((iconName) => {
                      const Icon = iconMap[iconName];
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: iconName })}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all hover:bg-white hover:shadow-sm ${
                            formData.icon === iconName ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                          }`}
                          title={iconName}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-xs">{iconName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image Upload</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500">
                  Upload an image for the research area (recommended: 1080x720px, max 2MB)
                </p>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-3 relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
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
      </DndProvider>
    </AdminLayout>
  );
};