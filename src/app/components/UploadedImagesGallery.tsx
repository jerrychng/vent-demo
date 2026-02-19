import React from "react";

export interface UploadedImagesGalleryProps {
  images: string[];
  onRemove?: (url: string) => void;
  className?: string;
}

const UploadedImagesGallery: React.FC<UploadedImagesGalleryProps> = ({
  images,
  onRemove,
  className = "",
}) => {
  if (!images || images.length === 0) return null;

  return (
    <div className={`mt-4 ${className}`}>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
        {images.map((url, i) => (
          <div key={url + i} className="relative group aspect-video">
            <img
              src={url}
              alt={`uploaded-${i}`}
              className="w-full h-full object-cover rounded-md border"
            />
            {onRemove && (
              <button
                onClick={() => onRemove(url)}
                className="absolute top-1 right-1 w-7 h-7 bg-primary text-white rounded-full"
                title="Remove image"
                type="button"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadedImagesGallery;
