import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminLoadingSpinner } from '../../components/admin/AdminLoadingSpinner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner@2.0.3';
import { Save } from 'lucide-react';
import { getLabInfo, updateLabInfo } from '../../lib/admin-api';
import { mockSiteSettings, mockContactInfo } from '../../lib/mock-data';

export const LabInfoManager: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    lab_name: '',
    tagline: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    twitter: '',
    linkedin: '',
    github: '',
  });

  useEffect(() => {
    loadLabInfo();
  }, []);

  const loadLabInfo = async () => {
    try {
      const data = await getLabInfo();
      setFormData({
        lab_name: data.lab_name || '',
        tagline: data.tagline || '',
        description: data.description || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        twitter: data.twitter || '',
        linkedin: data.linkedin || '',
        github: data.github || '',
      });
    } catch (error) {
      console.log('API failed, using mock data:', error);
      
      // Show specific error messages
      if (error instanceof Error) {
        if (error.message === 'ENDPOINT_NOT_FOUND') {
          toast.warning('Backend endpoint not configured. Using demo data.', {
            duration: 5000,
            description: 'See LAB_INFO_BACKEND_IMPLEMENTATION.md for setup instructions',
          });
        } else if (error.message === 'METHOD_NOT_ALLOWED') {
          toast.error('Laravel route configuration error', {
            duration: 8000,
            description: 'GET method not allowed. Check routes/api.php - see LARAVEL_ROUTE_DEBUG.md',
          });
        }
      }
      
      // Fallback to mock data if API is unavailable
      setFormData({
        lab_name: mockSiteSettings.lab_name || '',
        tagline: mockSiteSettings.tagline || '',
        description: mockSiteSettings.about || '',
        email: mockContactInfo.email || '',
        phone: mockContactInfo.phone || '',
        address: mockContactInfo.address || '',
        twitter: mockSiteSettings.social_links.twitter || '',
        linkedin: mockSiteSettings.social_links.linkedin || '',
        github: mockSiteSettings.social_links.github || '',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await updateLabInfo(formData);
      console.log('Update response:', response);
      toast.success('Lab information updated successfully');
      // Reload data to confirm changes were saved
      await loadLabInfo();
    } catch (error) {
      console.error('Update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update lab information';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <AdminLoadingSpinner message="Loading lab information..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h2 className="text-gray-900 text-xl md:text-2xl">Lab Information</h2>
          <p className="text-gray-600 text-sm md:text-base">Update your lab's contact and general information</p>
        </div>

        <Card className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-gray-900 text-base md:text-lg">General Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="lab_name">Lab Name</Label>
                <Input
                  id="lab_name"
                  value={formData.lab_name}
                  onChange={(e) => setFormData({ ...formData, lab_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Advancing Artificial Intelligence"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            <div className="border-t pt-4 md:pt-6 space-y-3 md:space-y-4">
              <h3 className="text-gray-900 text-base md:text-lg">Contact Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="border-t pt-4 md:pt-6 space-y-3 md:space-y-4">
              <h3 className="text-gray-900 text-base md:text-lg">Social Media</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="https://twitter.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
};