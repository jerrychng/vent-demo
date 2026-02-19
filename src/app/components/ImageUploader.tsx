import React, { useEffect, useState } from "react";
import Uppy from "@uppy/core";
import Compressor from "@uppy/compressor";
import { Dashboard } from "@uppy/react";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import { VALIDATION_LIMITS } from "../constants/validation";
import MessageBox from "./MessageBox";

interface ImageUploaderProps {
  onImagesSelected?: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
  className?: string;
  disabled?: boolean;
  height?: string; // Allow custom height
  currentImageCount?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesSelected,
  allowedFileTypes = ["image/*"],
  className = "min-h-7",
  currentImageCount = 0,
}) => {
  const [showDashboard, setShowDashboard] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxFileSize: VALIDATION_LIMITS.MAX_FILE_SIZE_BYTES,
        maxTotalFileSize:
          VALIDATION_LIMITS.MAX_TOTAL_FILES *
          VALIDATION_LIMITS.MAX_FILE_SIZE_BYTES,
        maxNumberOfFiles: VALIDATION_LIMITS.MAX_FILES_PER_UPLOAD,
        allowedFileTypes,
      },
      autoProceed: true,
      locale: {
        strings: {
          youCanOnlyUploadX:
            "You can upload up to %{smart_count} files at a time",
          dropPasteFiles: "Please %{browseFiles} showcasing your occurrence ",
          browseFiles: "upload images",
        },
        pluralize: (n: number) => (n === 1 ? 0 : 1),
      },
    }).use(Compressor, {
      quality: 0.7,
      maxWidth: 1920,
      maxHeight: 1920,
      mimeType: "image/jpeg",
      convertSize: VALIDATION_LIMITS.MAX_FILE_SIZE_BYTES / 2,
      locale: {
        strings: {
          compressedX: "Upload Sucessful",
        },
      },
    }),
  );

  useEffect(() => {
    uppy.setOptions({
      onBeforeUpload: (files) => {
        const fileCount = Object.keys(files).length;
        const totalFiles = currentImageCount + fileCount;

        if (totalFiles > VALIDATION_LIMITS.MAX_TOTAL_FILES) {
          const errorMessage = `You can upload up to ${VALIDATION_LIMITS.MAX_TOTAL_FILES} files in total. You have ${currentImageCount} file(s) already. Please select fewer files.`;

          // Set error message in React state
          setValidationError(errorMessage);

          // Clear all files and restore dashboard
          uppy.cancelAll();
          setShowDashboard(true);

          return false;
        }
        return true;
      },
    });
  }, [currentImageCount, uppy]);

  useEffect(() => {
    const originalSizes = new Map<string, number>();

    const handleFileAdded = (file: any) => {
      // Clear any previous validation errors
      setValidationError(null);

      // Hide dashboard when files are added (upload will start automatically)
      setShowDashboard(false);

      originalSizes.set(file.id, file.size);
      console.log(
        `📁 Original file: ${file.name}`,
        `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        `(${file.size.toLocaleString()} bytes)`,
      );
    };

    const handlePreprocessComplete = (file: any) => {
      const originalSize = originalSizes.get(file.id);
      const compressedSize = file.size;

      if (originalSize && originalSize !== compressedSize) {
        const savings = (
          ((originalSize - compressedSize) / originalSize) *
          100
        ).toFixed(1);
        console.log(
          `✅ Compressed: ${file.name}`,
          `\n   Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB (${originalSize.toLocaleString()} bytes)`,
          `\n   Compressed: ${(compressedSize / 1024 / 1024).toFixed(2)} MB (${compressedSize.toLocaleString()} bytes)`,
          `\n   💾 Saved: ${savings}% (${((originalSize - compressedSize) / 1024 / 1024).toFixed(2)} MB)`,
        );
      } else {
        console.log(`ℹ️ No compression needed for: ${file.name}`);
      }
    };

    const handleComplete = (result: any) => {
      const files = result.successful.map((file: any) => file.data);

      const totalOriginal = Array.from(originalSizes.values()).reduce(
        (a, b) => a + b,
        0,
      );
      const totalCompressed = files.reduce(
        (sum: number, f: File) => sum + f.size,
        0,
      );

      console.log(
        "\n📊 Compression Summary:",
        `\n   Total Original: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`,
        `\n   Total Compressed: ${(totalCompressed / 1024 / 1024).toFixed(2)} MB`,
        `\n   Total Saved: ${((totalOriginal - totalCompressed) / 1024 / 1024).toFixed(2)} MB (${(((totalOriginal - totalCompressed) / totalOriginal) * 100).toFixed(1)}%)`,
      );

      onImagesSelected?.(files);
      originalSizes.clear();

      // Reset uppy and show dashboard again for next upload
      setTimeout(() => {
        try {
          uppy.cancelAll();
          setShowDashboard(true);
        } catch (error) {
          console.error("Error resetting uppy:", error);
        }
      }, 100);
    };

    // Handle restriction failures (e.g., file too large, wrong type, etc.)
    const handleRestrictionFailed = (file: any, error: any) => {
      console.error("Restriction failed:", error);

      // Set a user-friendly error message
      const errorMsg = error?.message || "File does not meet requirements";
      setValidationError(errorMsg);

      // If all files have been rejected, restore the dashboard
      setTimeout(() => {
        const remainingFiles = uppy.getFiles();
        if (remainingFiles.length === 0) {
          setShowDashboard(true);
        }
      }, 100);
    };

    // Handle upload errors
    const handleUploadError = (file: any, error: any) => {
      console.error("Upload error:", error);
    };

    // Handle cancel-all event (when upload is cancelled)
    const handleCancelAll = () => {
      console.log("Upload cancelled");
      originalSizes.clear();
      setShowDashboard(true);
    };

    uppy.on("file-added", handleFileAdded);
    uppy.on("preprocess-complete", handlePreprocessComplete);
    uppy.on("complete", handleComplete);
    uppy.on("restriction-failed", handleRestrictionFailed);
    uppy.on("upload-error", handleUploadError);
    uppy.on("cancel-all", handleCancelAll);

    return () => {
      uppy.off("file-added", handleFileAdded);
      uppy.off("preprocess-complete", handlePreprocessComplete);
      uppy.off("complete", handleComplete);
      uppy.off("restriction-failed", handleRestrictionFailed);
      uppy.off("upload-error", handleUploadError);
      uppy.off("cancel-all", handleCancelAll);
      originalSizes.clear();
    };
  }, [uppy, onImagesSelected]);

  return (
    <div className={`w-full ${className} space-y-4`}>
      {showDashboard ? (
        <Dashboard
          uppy={uppy}
          plugins={[]}
          width="100%"
          proudlyDisplayPoweredByUppy={false}
          showProgressDetails={true}
          note={`Images will be automatically compressed. Maximum file size: ${VALIDATION_LIMITS.MAX_FILE_SIZE_MB} MB`}
        />
      ) : (
        <div className="text-center py-4 text-dark-primary">
          <p>Uploading images...</p>
        </div>
      )}
      {/* Display validation error message */}
      {validationError && (
        <MessageBox variant="error" title={validationError} />
      )}
    </div>
  );
};

export default ImageUploader;
