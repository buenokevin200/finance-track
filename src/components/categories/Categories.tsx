import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { fireflyService, Category } from '@/services/firefly';
import { Button } from '@/components/common/Button';
import { CategoryModal } from './CategoryModal';

export const Categories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await fireflyService.getCategories();
            // Firefly API returns { data: [...] }
            setCategories(data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = () => {
        setModalMode('create');
        setSelectedCategory(null);
        setIsModalOpen(true);
    };

    const handleEdit = (category: Category) => {
        setModalMode('edit');
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await fireflyService.deleteCategory(id);
            await fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category');
        }
    };

    const handleModalSubmit = async (name: string, icon: string) => {
        try {
            // We store the icon name in the 'notes' field as Firefly III categories don't have an icon field
            if (modalMode === 'create') {
                await fireflyService.createCategory(name, icon);
            } else if (selectedCategory) {
                await fireflyService.updateCategory(selectedCategory.id, name, icon);
            }
            await fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category');
            throw error;
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
                    <p className="text-gray-500 dark:text-gray-400">Organize your transactions with categories</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Category
                </Button>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {categories.map((category) => {
                        // Retrieve icon from notes, fallback to Tag or HelpCircle if invalid
                        const iconName = category.attributes.notes;
                        const validIconName = iconName && (LucideIcons as any)[iconName] ? iconName : 'Tag';
                        const Icon = (LucideIcons as any)[validIconName] || Tag;

                        return (
                            <div
                                key={category.id}
                                className="group relative flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {category.attributes.name}
                                    </h3>
                                </div>
                                <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700"
                                        title="Edit"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {categories.length === 0 && (
                        <div className="col-span-full py-12 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                <Tag className="h-6 w-6 text-gray-400" />
                            </div>
                            <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">No categories found</h3>
                            <p className="text-gray-500 dark:text-gray-400">Create categories to better track your spending.</p>
                        </div>
                    )}
                </div>
            )}

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={selectedCategory ? {
                    name: selectedCategory.attributes.name,
                    icon: selectedCategory.attributes.notes || ''
                } : undefined}
                mode={modalMode}
            />
        </div>
    );
};
