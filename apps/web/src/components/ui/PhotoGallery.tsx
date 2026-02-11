import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Trash2, Image } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import type { Photo } from '../../types';

interface PhotoGalleryProps {
  photos: Photo[];
  onDelete?: (photoId: string) => void;
  onUpdateCaption?: (photoId: string, caption: string) => void;
  canEdit?: boolean;
  isDeleting?: boolean;
}

export default function PhotoGallery({
  photos,
  onDelete,
  canEdit = false,
  isDeleting = false,
}: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Photo | null>(null);

  if (photos.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Image className="w-10 h-10 mx-auto mb-2 text-slate-300" />
        <p className="text-sm">No photos yet</p>
      </div>
    );
  }

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % photos.length);
    }
  };

  const goPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') goNext();
    else if (e.key === 'ArrowLeft') goPrev();
    else if (e.key === 'Escape') closeLightbox();
  };

  const handleDelete = () => {
    if (deleteTarget && onDelete) {
      onDelete(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="group relative aspect-square rounded-lg overflow-hidden bg-slate-100 cursor-pointer"
            onClick={() => openLightbox(index)}
          >
            <img
              src={photo.url}
              alt={photo.caption || photo.originalFilename || 'Photo'}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
              <div className="w-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {photo.caption && (
                  <p className="text-xs text-white truncate">{photo.caption}</p>
                )}
                {!photo.caption && photo.originalFilename && (
                  <p className="text-xs text-white/70 truncate">{photo.originalFilename}</p>
                )}
              </div>
              {canEdit && onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(photo);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Delete photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 text-sm text-white/70">
            {lightboxIndex + 1} / {photos.length}
          </div>

          {/* Navigation */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image */}
          <div className="max-w-4xl max-h-[85vh] px-16" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[lightboxIndex].url}
              alt={photos[lightboxIndex].caption || photos[lightboxIndex].originalFilename || 'Photo'}
              className="max-w-full max-h-[80vh] object-contain rounded"
            />
            {photos[lightboxIndex].caption && (
              <p className="text-center text-sm text-white/80 mt-3">
                {photos[lightboxIndex].caption}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Photo"
        message="Are you sure you want to delete this photo? This cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </>
  );
}
