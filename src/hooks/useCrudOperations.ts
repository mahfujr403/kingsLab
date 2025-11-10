import { useState, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';

interface CrudOperations<T> {
  items: T[];
  isLoading: boolean;
  isDialogOpen: boolean;
  editingItem: T | null;
  setItems: (items: T[]) => void;
  setIsLoading: (loading: boolean) => void;
  openCreateDialog: () => void;
  openEditDialog: (item: T) => void;
  closeDialog: () => void;
  handleDelete: (id: number, deleteFunc: (id: number) => Promise<any>) => Promise<void>;
}

/**
 * Reusable hook for CRUD operations in admin managers
 * Reduces redundancy across admin pages
 */
export function useCrudOperations<T extends { id: number }>(
  loadFunction: () => Promise<void>
): CrudOperations<T> {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  const openCreateDialog = useCallback(() => {
    setEditingItem(null);
    setIsDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((item: T) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingItem(null);
  }, []);

  const handleDelete = useCallback(async (
    id: number, 
    deleteFunc: (id: number) => Promise<any>
  ) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await deleteFunc(id);
      toast.success('Item deleted successfully');
      await loadFunction();
    } catch (error) {
      toast.error('Failed to delete item');
      console.error(error);
    }
  }, [loadFunction]);

  return {
    items,
    isLoading,
    isDialogOpen,
    editingItem,
    setItems,
    setIsLoading,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleDelete,
  };
}
