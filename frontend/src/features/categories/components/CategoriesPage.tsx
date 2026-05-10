'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  PageHeader,
  Card,
  EmptyState,
  LoadingState,
  ErrorState,
  Button,
  FormField,
  Input,
} from '@/shared/components/ui';
import { getErrorMessage } from '@/shared/utils/errors';
import { useCategories } from '../hooks/useCategories';
import { useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from '../mutations/categories.mutations';
import type { Category } from '../types/Category.types';

const categorySchema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters'),
  slug:        z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug: lowercase letters, numbers, hyphens only'),
  description: z.string().optional(),
});
type CategoryFormData = z.infer<typeof categorySchema>;

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function CategoryForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
}: {
  defaultValues?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField id="cat-name" label="Name" required error={errors.name?.message}>
          <Input
            id="cat-name"
            placeholder="e.g. Software Engineering"
            error={!!errors.name}
            {...register('name', {
              onChange: (e) => {
                if (!defaultValues?.slug) setValue('slug', slugify(e.target.value));
              },
            })}
          />
        </FormField>
        <FormField id="cat-slug" label="Slug" required error={errors.slug?.message}>
          <Input
            id="cat-slug"
            placeholder="e.g. software-engineering"
            error={!!errors.slug}
            {...register('slug')}
          />
        </FormField>
      </div>
      <FormField id="cat-desc" label="Description" error={errors.description?.message}>
        <Input
          id="cat-desc"
          type="text"
          placeholder="Optional short description"
          error={!!errors.description}
          {...register('description')}
        />
      </FormField>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" size="sm" loading={isPending}>
          {defaultValues?.name ? 'Save Changes' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
}

function CategoryRow({ category, onDeleted }: { category: Category; onDeleted: () => void }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const update = useUpdateCategoryMutation();
  const remove = useDeleteCategoryMutation();

  const handleUpdate = (data: CategoryFormData) => {
    setError('');
    update.mutate({ id: category.id, ...data }, {
      onSuccess: () => setEditing(false),
      onError: (err) => setError(getErrorMessage(err)),
    });
  };

  const handleDelete = () => {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    remove.mutate(category.id, { onSuccess: onDeleted });
  };

  if (editing) {
    return (
      <li className="px-5 py-4 bg-muted/30">
        {error && (
          <div role="alert" className="mb-3 px-3 py-2 rounded bg-red-50 border border-red-200 text-sm text-danger">{error}</div>
        )}
        <CategoryForm
          defaultValues={{ name: category.name, slug: category.slug, description: category.description ?? undefined }}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          isPending={update.isPending}
        />
      </li>
    );
  }

  return (
    <li className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-muted/30 transition-colors">
      <div className="min-w-0">
        <p className="text-sm font-medium text-primary">{category.name}</p>
        <p className="text-xs text-muted font-mono mt-0.5">{category.slug}</p>
        {category.description && (
          <p className="text-xs text-secondary mt-1">{category.description}</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="p-1.5 rounded text-muted hover:text-secondary hover:bg-muted transition-colors"
          aria-label={`Edit ${category.name}`}
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={remove.isPending}
          className="p-1.5 rounded text-muted hover:text-danger hover:bg-red-50 transition-colors disabled:opacity-50"
          aria-label={`Delete ${category.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </li>
  );
}

export function CategoriesPage() {
  const { data: categories = [], isLoading, isError, refetch } = useCategories();
  const createCategory = useCreateCategoryMutation();
  const [showCreate, setShowCreate] = useState(false);
  const [createError, setCreateError] = useState('');

  const handleCreate = (data: CategoryFormData) => {
    setCreateError('');
    createCategory.mutate(data, {
      onSuccess: () => setShowCreate(false),
      onError: (err) => setCreateError(getErrorMessage(err)),
    });
  };

  return (
    <div className="w-full min-w-0">
      <PageHeader
        title="Categories"
        description="Manage article categories"
        action={
          !showCreate ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreate(true)}
            >
              Add Category
            </Button>
          ) : undefined
        }
      />

      {showCreate && (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-primary mb-3">New Category</h2>
          {createError && (
            <div role="alert" className="mb-3 px-3 py-2 rounded bg-red-50 border border-red-200 text-sm text-danger">{createError}</div>
          )}
          <CategoryForm
            onSubmit={handleCreate}
            onCancel={() => { setShowCreate(false); setCreateError(''); }}
            isPending={createCategory.isPending}
          />
        </Card>
      )}

      <Card padding="none">
        {isLoading && <LoadingState variant="list" rows={4} />}

        {isError && (
          <ErrorState message="Could not load categories." onRetry={() => refetch()} className="py-12" />
        )}

        {!isLoading && !isError && categories.length === 0 && (
          <EmptyState
            icon={<Plus className="w-6 h-6" />}
            title="No categories yet"
            description="Create categories to classify submitted articles."
            className="py-16"
          />
        )}

        {!isLoading && !isError && categories.length > 0 && (
          <ul className="divide-y divide-subtle">
            {categories.map((cat) => (
              <CategoryRow key={cat.id} category={cat} onDeleted={() => refetch()} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
