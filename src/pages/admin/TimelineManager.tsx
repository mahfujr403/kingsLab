import { useState, useEffect, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { Badge } from "../../components/ui/badge";
import { AdminLoadingSpinner } from "../../components/admin/AdminLoadingSpinner";
import { DraggableCard } from "../../components/admin/DraggableCard";
import { Plus, Edit, Trash2, Calendar, Milestone, Award, BookOpen, TrendingUp, GripVertical, Image as ImageIcon, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { createTimelineEvent, updateTimelineEvent, deleteTimelineEvent, reorderTimelineEvents } from "../../lib/admin-api";
import type { TimelineEvent } from "../../lib/types";

const categoryIcons = {
  milestone: Milestone,
  achievement: TrendingUp,
  publication: BookOpen,
  award: Award,
};

const categoryColors = {
  milestone: "from-blue-500 to-purple-500",
  achievement: "from-green-500 to-emerald-500",
  publication: "from-amber-500 to-orange-500",
  award: "from-pink-500 to-rose-500",
};

export function TimelineManager() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isDragMode, setIsDragMode] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);

  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    title: "",
    description: "",
    category: "milestone",
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getTimelineEvents();
      setEvents(data.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Failed to load timeline events:", error);
      toast.error("Failed to load timeline events");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (event?: TimelineEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        year: event.year,
        title: event.title,
        description: event.description,
        category: event.category,
      });
      setImagePreview(event.image || "");
    } else {
      setEditingEvent(null);
      setFormData({
        year: new Date().getFullYear(),
        title: "",
        description: "",
        category: "milestone",
      });
      setImagePreview("");
    }
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEvent(null);
    setImageFile(null);
    setImagePreview("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      
      const submitData = new FormData();
      submitData.append("year", formData.year.toString());
      submitData.append("month", "1"); // Default to January if month not specified
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("category", formData.category);
      
      if (imageFile) {
        submitData.append("image", imageFile);
      }

      if (editingEvent) {
        await updateTimelineEvent(editingEvent.id, submitData);
        toast.success("Timeline event updated successfully");
      } else {
        await createTimelineEvent(submitData);
        toast.success("Timeline event created successfully");
      }

      handleCloseDialog();
      await loadEvents();
    } catch (error) {
      console.error("Failed to save timeline event:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save timeline event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingEventId) return;

    try {
      await deleteTimelineEvent(deletingEventId);
      toast.success("Timeline event deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingEventId(null);
      await loadEvents();
    } catch (error) {
      console.error("Failed to delete timeline event:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete timeline event");
    }
  };

  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    setEvents(prevEvents => {
      const newEvents = [...prevEvents];
      const draggedEvent = newEvents[dragIndex];
      newEvents.splice(dragIndex, 1);
      newEvents.splice(hoverIndex, 0, draggedEvent);
      return newEvents;
    });
    setOrderChanged(true);
  }, []);

  const handleSaveOrder = async () => {
    try {
      setSaving(true);
      const orderedIds = events.map(event => event.id);
      await reorderTimelineEvents(orderedIds);
      toast.success("Timeline events reordered successfully");
      setOrderChanged(false);
      setIsDragMode(false);
      await loadEvents();
    } catch (error) {
      console.error("Failed to reorder timeline events:", error);
      toast.error(error instanceof Error ? error.message : "Failed to reorder timeline events");
      // Reload to restore original order
      await loadEvents();
      setOrderChanged(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelReorder = () => {
    setIsDragMode(false);
    setOrderChanged(false);
    loadEvents();
  };

  const openDeleteDialog = (id: number) => {
    setDeletingEventId(id);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <AdminLoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <DndProvider backend={HTML5Backend}>
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">Timeline Management</h1>
            <p className="text-gray-600 mt-2">
              Manage lab history, milestones, and achievements
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isDragMode ? "secondary" : "outline"}
              onClick={() => {
                if (isDragMode && orderChanged) {
                  handleCancelReorder();
                } else {
                  setIsDragMode(!isDragMode);
                }
              }}
            >
              <GripVertical className="h-4 w-4 mr-2" />
              {isDragMode ? "Cancel" : "Reorder"}
            </Button>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Milestone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Milestones</p>
                  <p className="text-gray-900">{events.filter(e => e.category === "milestone").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-pink-100 p-3 rounded-lg">
                  <Award className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Awards</p>
                  <p className="text-gray-900">{events.filter(e => e.category === "award").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <BookOpen className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Publications</p>
                  <p className="text-gray-900">{events.filter(e => e.category === "publication").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Achievements</p>
                  <p className="text-gray-900">{events.filter(e => e.category === "achievement").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Order Toolbar */}
        {isDragMode && orderChanged && (
          <Card>
            <CardContent className="pt-6 bg-green-50 border-green-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-green-800">
                  <GripVertical className="inline h-4 w-4 mr-2" />
                  Drag items to reorder, then save your changes
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelReorder}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveOrder}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Order"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Events List */}
        <Card>
          <CardContent className="pt-6">
            {events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">No Timeline Events</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Create your first timeline event to start building your lab's history
                </p>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Event
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event, index) => {
                  const Icon = categoryIcons[event.category as keyof typeof categoryIcons] || Calendar;
                  
                  return (
                    <DraggableCard
                      key={event.id}
                      id={event.id}
                      index={index}
                      onMove={moveCard}
                      isDragMode={isDragMode}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r ${categoryColors[event.category as keyof typeof categoryColors]} flex items-center justify-center shadow-md`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-gray-900 text-white border-0">
                              {event.year}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {event.category}
                            </Badge>
                            {event.image && (
                              <Badge variant="outline" className="gap-1">
                                <ImageIcon className="h-3 w-3" />
                                Has Image
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-gray-900 mb-1">{event.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(event)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(event.id)}
                            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </DraggableCard>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Edit Timeline Event" : "Create Timeline Event"}
            </DialogTitle>
            <DialogDescription>
              {editingEvent ? "Update timeline event details" : "Add a new event to your lab's timeline"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  min="1900"
                  max="2100"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: string) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="publication">Publication</SelectItem>
                    <SelectItem value="award">Award</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Lab Foundation"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the event..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="image">Event Image (Optional)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <p className="text-xs text-gray-500 mt-1">Upload an image to accompany this event</p>
              
              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingEvent ? "Update Event" : "Create Event"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Timeline Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this timeline event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
        </div>
      </DndProvider>
    </AdminLayout>
  );
}
