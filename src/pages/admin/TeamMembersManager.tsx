import React, { useState, useEffect, useCallback } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminLoadingSpinner } from "../../components/admin/AdminLoadingSpinner";
import { DraggableCard } from '../../components/admin/DraggableCard';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Card } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Switch } from "../../components/ui/switch";
import { Checkbox } from "../../components/ui/checkbox";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Mail,
  Linkedin,
  Github,
  GraduationCap,
  Building,
  BookOpen,
  ExternalLink,
  Users,
  FileText,
  Award,
  TrendingUp,
  CheckSquare,
  Square,
  Trash,
  GripVertical,
  Save,
} from "lucide-react";
import {
  fetchTeamMembers,
  fetchPublications,
} from "../../lib/api";
import {
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  reorderTeamMembers,
} from "../../lib/admin-api";
import { TeamMember, Publication } from "../../lib/types";
import {
  mockTeamMembers,
  mockPublications,
} from "../../lib/mock-data";

export const TeamMembersManager: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(
    [],
  );
  const [publications, setPublications] = useState<
    Publication[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] =
    useState<TeamMember | null>(null);
  const [filterView, setFilterView] = useState<"all" | "current" | "alumni">("all");
  const [isDragMode, setIsDragMode] = useState(false);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    expertise: "",
    bio: "",
    education: "",
    affiliation: "",
    email: "",
    image: "",
    linkedin_url: "",
    researchgate_url: "",
    github_url: "",
    google_scholar_url: "",
    is_alumni: false,
    alumni_info: "",
    alumni_year: "",
    current_position: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [membersData, publicationsData] = await Promise.all(
        [fetchTeamMembers(), fetchPublications()],
      );
      setTeamMembers(membersData);
      setPublications(publicationsData);
    } catch (error) {
      console.log("API failed, using mock data:", error);
      // Fallback to mock data if API is unavailable
      setTeamMembers(mockTeamMembers);
      setPublications(mockPublications);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate publications count for a member
  const getPublicationsCount = (memberId: number): number => {
    return publications.filter((pub) =>
      pub.author_ids?.includes(memberId),
    ).length;
  };

  const handleOpenDialog = (item?: TeamMember) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        role: item.role,
        expertise: Array.isArray(item.expertise)
          ? item.expertise.join(", ")
          : item.expertise || "",
        bio: item.bio,
        education: Array.isArray(item.education)
          ? item.education.join(", ")
          : (item.education as unknown as string) || "",
        affiliation: (item as any).affiliation || "",
        email: item.email || "",
        image: item.image,
        linkedin_url: (item as any).linkedin_url || (item as any).linkedin || "",
        researchgate_url: (item as any).researchgate_url || (item as any).researchgate || "",
        github_url: (item as any).github_url || (item as any).github || "",
        google_scholar_url: (item as any).google_scholar_url || (item as any).google_scholar || "",
        is_alumni: (item as any).is_alumni || false,
        alumni_info: (item as any).alumni_info || "",
        alumni_year: (item as any).alumni_year ? String((item as any).alumni_year) : "",
        current_position: (item as any).current_position || "",
      });
      setImagePreview(item.image || '');
      setImageFile(null);
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        role: "",
        expertise: "",
        bio: "",
        education: "",
        affiliation: "",
        email: "",
        image: "",
        linkedin_url: "",
        researchgate_url: "",
        github_url: "",
        google_scholar_url: "",
        is_alumni: false,
        alumni_info: "",
        alumni_year: "",
        current_position: "",
      });
      setImagePreview('');
      setImageFile(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({
      name: "",
      role: "",
      expertise: "",
      bio: "",
      education: "",
      affiliation: "",
      email: "",
      image: "",
      linkedin_url: "",
      researchgate_url: "",
      github_url: "",
      google_scholar_url: "",
      is_alumni: false,
      alumni_info: "",
      alumni_year: "",
      current_position: "",
    });
    setImageFile(null);
    setImagePreview('');
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

    const formDataObj = new FormData();
    formDataObj.append("name", formData.name);
    formDataObj.append("role", formData.role);
    // Map expertise (comma-separated) to array expected by backend
    const expArr = formData.expertise
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    expArr.forEach((val) => formDataObj.append("expertise[]", val));
    // Biography
    formDataObj.append("bio", formData.bio);
    // Map education (comma-separated) to array
    const eduArr = formData.education
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    eduArr.forEach((val) => formDataObj.append("education[]", val));
    // Basic fields
    if (formData.email) formDataObj.append("email", formData.email);
    // Social links: map to backend field names
    if (formData.linkedin_url) formDataObj.append("linkedin", formData.linkedin_url);
    if (formData.github_url) formDataObj.append("github", formData.github_url);
    if (formData.google_scholar_url) formDataObj.append("google_scholar", formData.google_scholar_url);
    if (formData.researchgate_url) formDataObj.append("researchgate", formData.researchgate_url);
    if (formData.affiliation) formDataObj.append("affiliation", formData.affiliation);
    if (formData.alumni_info) formDataObj.append("alumni_info", formData.alumni_info);
    if (formData.alumni_year) formDataObj.append("alumni_year", formData.alumni_year);
    if (formData.current_position) formDataObj.append("current_position", formData.current_position);
    // Alumni flag (only boolean is supported on backend)
    formDataObj.append("is_alumni", String(formData.is_alumni));
    
    // Append image file if selected
    if (imageFile) {
      formDataObj.append("image", imageFile);
    }

    try {
      if (editingItem) {
        await updateTeamMember(editingItem.id, formDataObj);
        toast.success("Team member updated successfully");
      } else {
        await createTeamMember(formDataObj);
        toast.success("Team member created successfully");
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      toast.error(
        error.message || "Failed to save team member",
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this team member?",
      )
    )
      return;

    try {
      await deleteTeamMember(id);
      toast.success("Team member deleted successfully");
      loadData();
    } catch (error: any) {
      toast.error(
        error.message || "Failed to delete team member",
      );
    }
  };

  // Bulk Operations
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMembers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMembers.map(m => m.id));
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

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} team member(s)?`)) return;

    try {
      await Promise.all(selectedIds.map(id => deleteTeamMember(id)));
      toast.success(`${selectedIds.length} team member(s) deleted successfully`);
      setSelectedIds([]);
      setIsSelectMode(false);
      loadData();
    } catch (error) {
      toast.error('Failed to delete some team members');
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setIsSelectMode(false);
  };

  // Drag and Drop handlers
  const moveTeamMember = useCallback((dragIndex: number, hoverIndex: number) => {
    setTeamMembers(prevMembers => {
      const newMembers = [...prevMembers];
      const draggedItem = newMembers[dragIndex];
      newMembers.splice(dragIndex, 1);
      newMembers.splice(hoverIndex, 0, draggedItem);
      return newMembers;
    });
    setHasOrderChanged(true);
  }, []);

  const handleSaveOrder = async () => {
    try {
      const orderedIds = teamMembers.map(member => member.id);
      await reorderTeamMembers(orderedIds);
      toast.success('Team members order saved successfully');
      setHasOrderChanged(false);
      setIsDragMode(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save order');
    }
  };

  const handleCancelReorder = () => {
    setIsDragMode(false);
    setHasOrderChanged(false);
    loadData(); // Reload original order
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <AdminLoadingSpinner message="Loading team members..." />
      </AdminLayout>
    );
  }

  // Filter team members based on selected view
  const filteredMembers = teamMembers.filter((member) => {
    if (filterView === "current") return !member.is_alumni;
    if (filterView === "alumni") return member.is_alumni;
    return true; // "all"
  });

  const currentMembersCount = teamMembers.filter(m => !m.is_alumni).length;
  const alumniCount = teamMembers.filter(m => m.is_alumni).length;

  return (
    <AdminLayout>
      <DndProvider backend={HTML5Backend}>
        <div className="space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-gray-900 text-xl md:text-2xl">Team Members</h2>
              <p className="text-gray-600 text-sm md:text-base">
                Manage your research team
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant={isDragMode ? "secondary" : "outline"}
                onClick={() => {
                  if (isDragMode && hasOrderChanged) {
                    handleCancelReorder();
                  } else {
                    setIsDragMode(!isDragMode);
                    setIsSelectMode(false);
                    setSelectedIds([]);
                  }
                }} 
                className="flex-1 sm:flex-none"
              >
                <GripVertical className="w-4 h-4 mr-2" />
                {isDragMode ? "Cancel" : "Reorder"}
              </Button>
              <Button 
                variant={isSelectMode ? "secondary" : "outline"}
                onClick={() => {
                  setIsSelectMode(!isSelectMode);
                  setIsDragMode(false);
                  setSelectedIds([]);
                }} 
                className="flex-1 sm:flex-none"
              >
                {isSelectMode ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                {isSelectMode ? "Cancel" : "Select"}
              </Button>
              <Button onClick={() => handleOpenDialog()} className="flex-1 sm:flex-none">
                <Plus className="w-4 h-4 mr-2" />
                Add
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

        {/* Bulk Actions Toolbar */}
        {isSelectMode && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedIds.length === filteredMembers.length && filteredMembers.length > 0}
                  onCheckedChange={toggleSelectAll}
                  id="select-all"
                />
                <Label htmlFor="select-all" className="cursor-pointer">
                  Select All ({filteredMembers.length})
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

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterView === "all" ? "default" : "outline"}
            onClick={() => setFilterView("all")}
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            All Members
            <Badge variant="secondary" className="ml-1">
              {teamMembers.length}
            </Badge>
          </Button>
          <Button
            variant={filterView === "current" ? "default" : "outline"}
            onClick={() => setFilterView("current")}
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            Current Team
            <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">
              {currentMembersCount}
            </Badge>
          </Button>
          <Button
            variant={filterView === "alumni" ? "default" : "outline"}
            onClick={() => setFilterView("alumni")}
            className="gap-2"
          >
            <Award className="w-4 h-4" />
            Alumni
            <Badge variant="secondary" className="ml-1 bg-amber-100 text-amber-800">
              {alumniCount}
            </Badge>
          </Button>
        </div>

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              {filterView === "alumni" ? (
                <>
                  <Award className="w-12 h-12 text-amber-400" />
                  <h3 className="text-gray-900">No Alumni Yet</h3>
                  <p className="text-sm text-gray-600">
                    Alumni members will appear here when team members are marked as alumni.
                  </p>
                </>
              ) : (
                <>
                  <Users className="w-12 h-12 text-gray-400" />
                  <h3 className="text-gray-900">No Team Members</h3>
                  <p className="text-sm text-gray-600">
                    Get started by adding your first team member.
                  </p>
                </>
              )}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredMembers.map((member, index) => {
            const expertise = Array.isArray(member.expertise)
              ? member.expertise
              : [];
            const publicationsCount = getPublicationsCount(
              member.id,
            );

            return (
              <DraggableCard
                key={member.id}
                id={member.id}
                index={index}
                onMove={moveTeamMember}
                isDragMode={isDragMode}
              >
                <Card
                  className={`group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 relative backdrop-blur ${
                    selectedIds.includes(member.id) ? 'ring-2 ring-blue-500' : ''
                  } ${
                    member.is_alumni
                      ? "bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 hover:from-amber-50/50 hover:via-orange-50/40 hover:to-amber-50/50"
                      : "bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 hover:from-blue-50/50 hover:via-purple-50/40 hover:to-blue-50/50"
                  }`}
                >
                {/* Decorative gradient top bar */}
                <div className={`h-1 w-full bg-[length:200%_100%] group-hover:animate-[shimmer_3s_linear_infinite] ${
                  member.is_alumni
                    ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500"
                    : "bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
                }`} />
                
                {/* Checkbox for Bulk Selection - Top Left */}
                {isSelectMode && (
                  <div className="absolute top-3 left-3 z-10">
                    <Checkbox
                      checked={selectedIds.includes(member.id)}
                      onCheckedChange={() => toggleSelectItem(member.id)}
                      className="bg-white/90 backdrop-blur border-2"
                    />
                  </div>
                )}

                {/* Alumni Badge - Top Left (when not in select mode) */}
                {!isSelectMode && member.is_alumni && (
                  <div className="absolute top-3 left-3 z-10">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg gap-1">
                      <Award className="w-3 h-3" />
                      Alumni {member.alumni_year}
                    </Badge>
                  </div>
                )}

                {/* Action Buttons - Top Right - Hidden in Select Mode */}
                {!isSelectMode && (
                  <div className={`absolute top-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 ${
                    member.is_alumni ? "right-3" : "right-3"
                  }`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenDialog(member)}
                      className="bg-white/90 backdrop-blur hover:bg-white shadow-lg border-blue-200 h-8 w-8 p-0 hover:scale-110 transition-transform"
                    >
                      <Pencil className="w-3.5 h-3.5 text-blue-600" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDelete(member.id)}
                      className="bg-white/90 backdrop-blur hover:bg-white shadow-lg border-red-200 text-red-600 hover:text-red-700 h-8 w-8 p-0 hover:scale-110 transition-transform"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  {/* Profile Section */}
                  <div className="flex flex-col items-center text-center mb-4">
                    {/* Profile Image with Animated Ring */}
                    <div className="relative mb-3 group/avatar">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md opacity-0 group-hover/avatar:opacity-50 transition-opacity duration-500" />
                      <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-xl ring-4 ring-white group-hover/avatar:ring-blue-200 transition-all duration-300">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-500"
                        />
                      </div>
                      {/* Role Badge with gradient */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10">
                        <Badge className={`bg-[length:200%_100%] text-white border-0 shadow-xl whitespace-nowrap px-3 py-1 text-xs animate-[shimmer_3s_linear_infinite] ${
                          member.is_alumni
                            ? "bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600"
                            : "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"
                        }`}>
                          {member.is_alumni && member.current_position 
                            ? member.current_position.split(",")[0] 
                            : member.role.split(" ")[0]
                          }
                        </Badge>
                      </div>
                    </div>

                    {/* Name with hover effect */}
                    <h3 className="text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                      {member.name}
                    </h3>
                    
                    {/* ID Badge */}
                    <Badge
                      variant="outline"
                      className="text-xs border-blue-200 text-blue-600 bg-blue-50/50"
                    >
                      ID: {member.id}
                    </Badge>
                  </div>

                  {/* Research Areas with modern styling */}
                  {expertise.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {expertise
                          .slice(0, 3)
                          .map((exp, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 text-blue-700 hover:border-purple-400 hover:shadow-sm transition-all duration-200"
                            >
                              {exp}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Alumni Information */}
                  {member.is_alumni && member.alumni_info && (
                    <div className="bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-200/50 rounded-xl p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        <div className="text-xs text-amber-900 leading-relaxed">
                          {member.alumni_info}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Publications Count */}
                  <div className={`border-2 rounded-xl p-3 mb-3 group-hover:shadow-md transition-all duration-300 ${
                    member.is_alumni
                      ? "bg-gradient-to-br from-amber-100 to-orange-100 border-amber-200/50"
                      : "bg-gradient-to-br from-purple-100 to-blue-100 border-purple-200/50"
                  }`}>
                    <div className="flex items-center justify-center gap-3">
                      <div className={`text-white p-2 rounded-lg shadow-md ${
                        member.is_alumni
                          ? "bg-gradient-to-br from-amber-600 to-orange-600"
                          : "bg-gradient-to-br from-purple-600 to-blue-600"
                      }`}>
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className={`text-2xl ${
                          member.is_alumni ? "text-amber-900" : "text-purple-900"
                        }`}>
                          {publicationsCount}
                        </div>
                        <div className={`text-sm ${
                          member.is_alumni ? "text-amber-700" : "text-purple-700"
                        }`}>
                          Publications
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Academic Info with modern cards */}
                  <div className="space-y-1.5 text-xs mb-3">
                    {member.education && (
                      <div className="flex items-start gap-2 bg-white/80 backdrop-blur rounded-lg p-2 border border-blue-100 hover:border-blue-300 transition-colors duration-200">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-1.5 rounded-md">
                          <GraduationCap className="w-3 h-3" />
                        </div>
                        <span className="line-clamp-2 text-gray-700 leading-relaxed">
                          {member.education}
                        </span>
                      </div>
                    )}
                    {member.affiliation && (
                      <div className="flex items-start gap-2 bg-white/80 backdrop-blur rounded-lg p-2 border border-purple-100 hover:border-purple-300 transition-colors duration-200">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-1.5 rounded-md">
                          <Users className="w-3 h-3" />
                        </div>
                        <span className="line-clamp-2 text-gray-700 leading-relaxed">
                          {member.affiliation}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Social Links with enhanced styling */}
                  <div className="pt-3 border-t border-gray-200/50">
                    <p className="text-xs text-gray-500 text-center mb-2">Connect</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {/* Email */}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="group/link flex items-center justify-center w-9 h-9 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-blue-500 hover:to-blue-600 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-110"
                          title={member.email}
                        >
                          <Mail className="w-4 h-4 text-gray-600 group-hover/link:text-white transition-colors" />
                        </a>
                      )}

                      {/* Google Scholar */}
                      {member.google_scholar_url && (
                        <a
                          href={member.google_scholar_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link flex items-center justify-center w-9 h-9 bg-gradient-to-br from-red-100 to-red-200 hover:from-red-500 hover:to-red-600 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-110"
                          title="Google Scholar"
                        >
                          <GraduationCap className="w-4 h-4 text-red-600 group-hover/link:text-white transition-colors" />
                        </a>
                      )}

                      {/* ResearchGate */}
                      {member.researchgate_url && (
                        <a
                          href={member.researchgate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link flex items-center justify-center w-9 h-9 bg-gradient-to-br from-green-100 to-green-200 hover:from-green-500 hover:to-green-600 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-110"
                          title="ResearchGate"
                        >
                          <FileText className="w-4 h-4 text-green-600 group-hover/link:text-white transition-colors" />
                        </a>
                      )}

                      {/* GitHub */}
                      {member.github_url && (
                        <a
                          href={member.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link flex items-center justify-center w-9 h-9 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-800 hover:to-gray-900 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-110"
                          title="GitHub"
                        >
                          <Github className="w-4 h-4 text-gray-600 group-hover/link:text-white transition-colors" />
                        </a>
                      )}

                      {/* LinkedIn */}
                      {member.linkedin_url && (
                        <a
                          href={member.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-110"
                          title="LinkedIn"
                        >
                          <Linkedin className="w-4 h-4 text-blue-600 group-hover/link:text-white transition-colors" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
              </DraggableCard>
            );
          })}
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>
                {editingItem
                  ? "Edit Team Member"
                  : "Add Team Member"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <div className="h-1 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded" />
                  <h3 className="text-sm text-gray-900">
                    Basic Information
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                      placeholder="Dr. Jane Smith"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">
                      Role/Position *
                    </Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value,
                        })
                      }
                      placeholder="Principal Investigator, Postdoctoral Fellow, etc."
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expertise">
                    Expertise/Research Areas *
                  </Label>
                  <Input
                    id="expertise"
                    value={formData.expertise}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expertise: e.target.value,
                      })
                    }
                    placeholder="Deep Learning, Computer Vision (comma-separated)"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Separate multiple areas with commas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biography *</Label>
                  <RichTextEditor
                    content={formData.bio}
                    onChange={(content) =>
                      setFormData({
                        ...formData,
                        bio: content,
                      })
                    }
                    placeholder="Brief professional biography..."
                    minHeight="200px"
                  />
                  <p className="text-xs text-gray-500">
                    Use formatting tools to create a rich biography with headings, lists, and links.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">
                    Profile Image Upload *
                  </Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500">
                    Professional headshot (recommended: 400x400px or square ratio, max 2MB)
                  </p>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-3 relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-full border-2 border-gray-200 mx-auto"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-0 right-0"
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
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <div className="h-1 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded" />
                  <h3 className="text-sm text-gray-900">
                    Academic Information
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="education">Education</Label>
                    <Input
                      id="education"
                      value={formData.education}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          education: e.target.value,
                        })
                      }
                      placeholder="PhD in Computer Science, Stanford University"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="affiliation">
                      Affiliation
                    </Label>
                    <Input
                      id="affiliation"
                      value={formData.affiliation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          affiliation: e.target.value,
                        })
                      }
                      placeholder="King's Lab, Department of Computer Science"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value,
                        })
                      }
                      placeholder="researcher@kingslab.ai"
                    />
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-purple-900 mb-1">
                        Publications Count
                      </p>
                      <p className="text-xs text-purple-700">
                        Publications count is calculated
                        automatically based on the team member's
                        contributions to publications. Make sure
                        to assign this team member to their
                        publications in the Publications
                        Manager.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social & Research Profiles */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <div className="h-1 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded" />
                  <h3 className="text-sm text-gray-900">
                    Research & Social Profiles
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url">
                      <div className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4" />
                        LinkedIn URL
                      </div>
                    </Label>
                    <Input
                      id="linkedin_url"
                      type="url"
                      value={formData.linkedin_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          linkedin_url: e.target.value,
                        })
                      }
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="github_url">
                      <div className="flex items-center gap-2">
                        <Github className="w-4 h-4" />
                        GitHub URL
                      </div>
                    </Label>
                    <Input
                      id="github_url"
                      type="url"
                      value={formData.github_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          github_url: e.target.value,
                        })
                      }
                      placeholder="https://github.com/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="google_scholar_url">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Google Scholar URL
                      </div>
                    </Label>
                    <Input
                      id="google_scholar_url"
                      type="url"
                      value={formData.google_scholar_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          google_scholar_url: e.target.value,
                        })
                      }
                      placeholder="https://scholar.google.com/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="researchgate_url">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        ResearchGate URL
                      </div>
                    </Label>
                    <Input
                      id="researchgate_url"
                      type="url"
                      value={formData.researchgate_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          researchgate_url: e.target.value,
                        })
                      }
                      placeholder="https://researchgate.net/profile/..."
                    />
                  </div>
                </div>
              </div>

              {/* Alumni Status */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <div className="h-1 w-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded" />
                  <h3 className="text-sm text-gray-900">
                    Alumni Status
                  </h3>
                </div>

                <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-amber-600" />
                    <div>
                      <Label htmlFor="is_alumni" className="cursor-pointer">
                        Mark as Alumni
                      </Label>
                      <p className="text-xs text-amber-700">
                        Enable if this member has left the lab
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="is_alumni"
                    checked={formData.is_alumni}
                    onCheckedChange={(checked: boolean) =>
                      setFormData({
                        ...formData,
                        is_alumni: checked,
                      })
                    }
                  />
                </div>

                {formData.is_alumni && (
                  <div className="space-y-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="alumni_year">
                        Alumni Year
                      </Label>
                      <Input
                        id="alumni_year"
                        type="number"
                        value={formData.alumni_year}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            alumni_year: e.target.value,
                          })
                        }
                        placeholder="2024"
                        min="2000"
                        max="2100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="current_position">
                        Current Position
                      </Label>
                      <Input
                        id="current_position"
                        value={formData.current_position}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            current_position: e.target.value,
                          })
                        }
                        placeholder="e.g., Research Scientist at Google DeepMind"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alumni_info">
                        Reason for Leaving / Achievement
                      </Label>
                      <Textarea
                        id="alumni_info"
                        value={formData.alumni_info}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            alumni_info: e.target.value,
                          })
                        }
                        rows={3}
                        placeholder="e.g., Accepted position at Google DeepMind, Received prestigious scholarship, Started faculty position at MIT..."
                      />
                      <p className="text-xs text-amber-700">
                        Describe why they left or their achievement
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem
                    ? "Update Team Member"
                    : "Create Team Member"}
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