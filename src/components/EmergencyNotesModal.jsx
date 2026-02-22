import { useState, useRef } from 'react';
import { XMarkIcon, CameraIcon, PhotoIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

function EmergencyNotesModal({ isOpen, onClose, onSubmit, emergencyType }) {
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const getEmergencyColor = () => {
    switch(emergencyType) {
      case 'fire':
        return {
          accent: 'text-orange-600',
          button: 'bg-orange-600 hover:bg-orange-700',
          ring: 'focus:ring-2 focus:ring-orange-500/20'
        };
      case 'accident':
        return {
          accent: 'text-yellow-600',
          button: 'bg-yellow-600 hover:bg-yellow-700',
          ring: 'focus:ring-2 focus:ring-yellow-500/20'
        };
      case 'life-threat':
        return {
          accent: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700',
          ring: 'focus:ring-2 focus:ring-red-500/20'
        };
      default:
        return {
          accent: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700',
          ring: 'focus:ring-2 focus:ring-blue-500/20'
        };
    }
  };

  const colors = getEmergencyColor();

  // Image compression and resizing function
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 1200x1200, maintain aspect ratio)
          let width = img.width;
          let height = img.height;
          const maxSize = 1200;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to JPEG with 85% quality
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              
              // Convert to base64 for storage
              const compressedReader = new FileReader();
              compressedReader.readAsDataURL(compressedFile);
              compressedReader.onload = (e) => {
                resolve({
                  url: e.target.result,
                  size: compressedFile.size
                });
              };
            },
            'image/jpeg',
            0.85
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 3) {
      alert('Maximum 3 photos allowed');
      return;
    }

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Photo size must be less than 10MB');
        continue;
      }

      try {
        const compressed = await compressImage(file);
        
        // Check compressed size (should be under 500KB typically)
        if (compressed.size > 2 * 1024 * 1024) {
          console.warn('Compressed image still large:', compressed.size);
        }
        
        setPhotos(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: compressed.url,
          file: file
        }]);
      } catch (error) {
        console.error('Error compressing image:', error);
        alert('Failed to process image');
      }
    }
  };

  const handleRemovePhoto = (photoId) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Only send photo URLs (base64), not File objects
    const photoUrls = photos.map(photo => ({
      id: photo.id,
      url: photo.url
    }));
    await onSubmit({ notes, photos: photoUrls });
    setIsSubmitting(false);
    handleClose();
  };

  const handleSkip = () => {
    onSubmit({ notes: '', photos: [] });
    handleClose();
  };

  const handleClose = () => {
    setNotes('');
    setPhotos([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[320px] sm:max-w-[360px] max-h-[85vh] flex flex-col animate-slideUp overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="font-bold text-sm text-gray-900">Incident Details</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Optional</p>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all"
          >
            <XMarkIcon className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="px-4 pb-2.5 space-y-2.5 overflow-y-auto flex-1 min-h-0 transition-all duration-300 ease-in-out">
          {/* Notes Input */}
          <div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what's happening..."
              maxLength={200}
              rows={2}
              className={`w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none ${colors.ring} focus:border-gray-300 resize-none placeholder:text-gray-400 transition-all`}
            />
            <p className="text-[9px] text-gray-400 mt-1 text-right tabular-nums">
              {notes.length}/200
            </p>
          </div>

          {/* Photo Upload */}
          <div>
            {/* Photo Grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5 mb-2 animate-fadeIn">
                {photos.map(photo => (
                  <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 group border border-gray-100 animate-slideUp">
                    <img 
                      src={photo.url} 
                      alt="Emergency"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                        <XMarkIcon className="w-3 h-3 text-gray-700" />
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Buttons */}
            {photos.length < 3 && (
              <div className="grid grid-cols-2 gap-1.5 transition-all duration-300">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-1 px-2 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-100"
                >
                  <CameraIcon className="w-4 h-4 text-gray-600" />
                  <span className="text-[10px] font-semibold text-gray-700">Camera</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-1 px-2 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-100"
                >
                  <PhotoIcon className="w-4 h-4 text-gray-600" />
                  <span className="text-[10px] font-semibold text-gray-700">Gallery</span>
                </button>
              </div>
            )}

            {/* Hidden File Inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-3 flex gap-2 flex-shrink-0">
          <button
            onClick={handleSkip}
            disabled={isSubmitting}
            className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-xs transition-all disabled:opacity-50 active:scale-95"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 px-3 py-2 ${colors.button} text-white rounded-full font-bold text-xs transition-all disabled:opacity-50 active:scale-95 shadow-sm flex items-center justify-center gap-1.5`}
          >
            <PaperAirplaneIcon className="w-3.5 h-3.5" />
            {isSubmitting ? 'Sending...' : 'Send Alert'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmergencyNotesModal;
