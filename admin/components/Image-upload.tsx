"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Cloud, X } from "lucide-react";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  maxImages?: number;
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  maxImages = 4,
}: ImageUploadProps) {
  const [files, setFiles] = useState<File[]>([]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (value.length + acceptedFiles.length > maxImages) {
        alert(`You can only upload up to ${maxImages} images`);
        return;
      }

      try {
        const base64Files = await Promise.all(
          acceptedFiles.map((file) => convertToBase64(file))
        );
        setFiles([...files, ...acceptedFiles]);
        onChange([...value, ...base64Files]);
      } catch (error) {
        console.error("Error converting files to base64:", error);
        alert("Error uploading images. Please try again.");
      }
    },
    [onChange, value, maxImages, files]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    maxSize: 2 * 1024 * 1024, // 2MB
    disabled: value.length >= maxImages,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/10"
            : value.length >= maxImages
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : "border-gray-200 hover:border-primary"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Cloud className="h-10 w-10 text-muted-foreground" />
          <div className="text-sm">
            {value.length >= maxImages ? (
              <span className="text-muted-foreground">
                Maximum number of images reached
              </span>
            ) : (
              <>
                <span className="font-semibold text-primary">
                  Upload an image
                </span>{" "}
                or drag and drop
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Max size: 2MB | Types: PNG, JPG
          </p>
        </div>
      </div>
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {value.map((base64String, index) => (
            <div key={index} className="relative aspect-square group">
              <Image
                src={base64String || "/placeholder.svg"}
                alt={`Uploaded image ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => onRemove(base64String)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
