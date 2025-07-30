import { useState } from 'react'
import { PhotoData } from '@/lib/types'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X, Camera } from '@phosphor-icons/react'

interface PhotoGalleryProps {
  photos: PhotoData[]
  className?: string
}

/**
 * Photo gallery component with thumbnail grid and lightbox modal
 * Provides an immersive way to explore destination imagery
 */
export function PhotoGallery({ photos, className = '' }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({})

  if (!photos || photos.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Camera size={16} className="text-muted-foreground" />
          Photo Gallery
        </div>
        <div className="text-xs text-muted-foreground italic">
          Photos not available for this activity
        </div>
      </div>
    )
  }

  const openLightbox = (index: number) => {
    setSelectedPhoto(index)
  }

  const closeLightbox = () => {
    setSelectedPhoto(null)
  }

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (selectedPhoto === null) return
    
    const newIndex = direction === 'prev' 
      ? (selectedPhoto - 1 + photos.length) % photos.length
      : (selectedPhoto + 1) % photos.length
    
    setSelectedPhoto(newIndex)
  }

  const handleImageLoad = (index: number) => {
    setImageLoaded(prev => ({ ...prev, [index]: true }))
  }

  return (
    <>
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Camera size={16} className="text-accent" />
          Photo Gallery
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted group"
              onClick={() => openLightbox(index)}
            >
              {!imageLoaded[index] && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}
              <img
                src={photo.url}
                alt={photo.alt}
                className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
                  imageLoaded[index] ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => handleImageLoad(index)}
                onError={(e) => {
                  // Fallback to a placeholder if image fails to load
                  const target = e.target as HTMLImageElement
                  if (!target.src.includes('via.placeholder.com')) {
                    target.src = `https://via.placeholder.com/400x300/e2e8f0/64748b?text=${encodeURIComponent(photo.alt)}`
                    handleImageLoad(index)
                  }
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-white/90 rounded-full p-2">
                  <Camera size={16} className="text-primary" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <Dialog open={selectedPhoto !== null} onOpenChange={() => closeLightbox()}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={closeLightbox}
            >
              <X size={20} />
            </Button>

            {/* Navigation Buttons */}
            {photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 z-10 bg-black/50 text-white hover:bg-black/70"
                  onClick={() => navigatePhoto('prev')}
                >
                  <ChevronLeft size={24} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-16 z-10 bg-black/50 text-white hover:bg-black/70"
                  onClick={() => navigatePhoto('next')}
                >
                  <ChevronRight size={24} />
                </Button>
              </>
            )}

            {/* Main Image */}
            {selectedPhoto !== null && (
              <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
                <img
                  src={photos[selectedPhoto].url}
                  alt={photos[selectedPhoto].alt}
                  className="max-w-full max-h-[calc(100%-80px)] object-contain rounded-lg"
                  onError={(e) => {
                    // Fallback for lightbox images too
                    const target = e.target as HTMLImageElement
                    if (!target.src.includes('via.placeholder.com')) {
                      target.src = `https://via.placeholder.com/800x600/e2e8f0/64748b?text=${encodeURIComponent(photos[selectedPhoto].alt)}`
                    }
                  }}
                />
                
                {/* Caption */}
                {photos[selectedPhoto].caption && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm text-center max-w-md">
                    {photos[selectedPhoto].caption}
                  </div>
                )}

                {/* Photo Counter */}
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                  {selectedPhoto + 1} / {photos.length}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}