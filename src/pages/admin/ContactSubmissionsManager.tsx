import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminLoadingSpinner } from '../../components/admin/AdminLoadingSpinner';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner@2.0.3';
import { Mail, Trash2, Eye } from 'lucide-react';
import { getContactSubmissions, markSubmissionAsRead, deleteContactSubmission } from '../../lib/admin-api';

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const ContactSubmissionsManager: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const data = await getContactSubmissions();
      setSubmissions(data);
    } catch (error) {
      console.log('API failed, using empty submissions:', error);
      // Fallback to empty array if API is unavailable
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    if (!submission.is_read) {
      try {
        await markSubmissionAsRead(submission.id);
        loadSubmissions();
      } catch (error) {
        console.error('Failed to mark as read');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      await deleteContactSubmission(id);
      toast.success('Submission deleted successfully');
      loadSubmissions();
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(null);
      }
    } catch (error) {
      toast.error('Failed to delete submission');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <AdminLoadingSpinner message="Loading contact submissions..." />
      </AdminLayout>
    );
  }

  const unreadCount = submissions.filter(s => !s.is_read).length;

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-gray-900 text-xl md:text-2xl">Contact Submissions</h2>
            <p className="text-gray-600 text-sm md:text-base">
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All messages read'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            <span className="text-gray-900 text-sm md:text-base">{submissions.length}</span>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          {submissions.length === 0 ? (
            <Card className="p-8 md:p-12 text-center">
              <Mail className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-sm md:text-base">No contact submissions yet</p>
            </Card>
          ) : (
            submissions.map((submission) => (
              <Card key={submission.id} className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                      <h3 className="text-gray-900 text-sm md:text-base break-words">{submission.name}</h3>
                      {!submission.is_read && (
                        <Badge variant="default" className="text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs md:text-sm mb-1 break-all">{submission.email}</p>
                    <p className="text-gray-900 text-xs md:text-sm mb-2 break-words">{submission.subject}</p>
                    <p className="text-gray-600 text-xs md:text-sm line-clamp-2">{submission.message}</p>
                    <p className="text-gray-400 text-xs mt-2">
                      {new Date(submission.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(submission)}
                      className="flex-1 sm:flex-none"
                    >
                      <Eye className="w-4 h-4 sm:mr-2" />
                      <span className="ml-2 sm:ml-0">View</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(submission.id)}
                      className="flex-1 sm:flex-none"
                    >
                      <Trash2 className="w-4 h-4 sm:mr-0" />
                      <span className="ml-2 sm:hidden">Delete</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-2xl w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>Contact Submission</DialogTitle>
            </DialogHeader>
            {selectedSubmission && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Name</label>
                  <p className="text-gray-900">{selectedSubmission.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="text-gray-900">{selectedSubmission.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Subject</label>
                  <p className="text-gray-900">{selectedSubmission.subject}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Message</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Received</label>
                  <p className="text-gray-900">
                    {new Date(selectedSubmission.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};