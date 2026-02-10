import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUploadPhoto } from '../../features/photos/api/photos.api';

interface PhotoUploaderProps {
  parentType: 'building' | 'element' | 'deficiency';
  parentId: string;
  onUploadComplete?: () => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function PhotoUploader({ parentType, parentId, onUploadComplete, disabled }: PhotoUploaderProps) {
  const uploadMutation = useUploadPhoto();
  const [uploading, setUploading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState('');

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setUploading(true);
      let successCount = 0;

      for (const file of acceptedFiles) {
        setUploadingFile(file.name);
        try {
          const data: Record<string, unknown> = { photo: file };
          if (parentType === 'building') data.buildingId = parentId;
          else if (parentType === 'element') data.assessmentElementId = parentId;
          else if (parentType === 'deficiency') data.deficiencyId = parentId;

          await uploadMutation.mutateAsync(data as any);
          successCount++;
        } catch (err: any) {
          toast.error(`Failed to upload ${file.name}: ${err?.message || 'Unknown error'}`);
        }
      }

      setUploading(false);
      setUploadingFile('');

      if (successCount > 0) {
        toast.success(
          successCount === 1
            ? 'Photo uploaded'
            : `${successCount} photos uploaded`,
        );
        onUploadComplete?.();
      }
    },
    [parentType, parentId, uploadMutation, onUploadComplete],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize: MAX_FILE_SIZE,
    disabled: uploading || disabled,
    onDropRejected: (rejections) => {
      for (const rejection of rejections) {
        for (const error of rejection.errors) {
          if (error.code === 'file-too-large') {
            toast.error(`${rejection.file.name} exceeds 10MB limit`);
          } else if (error.code === 'file-invalid-type') {
            toast.error(`${rejection.file.name} is not an image file`);
          } else {
            toast.error(error.message);
          }
        }
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-onyx-400 bg-onyx-50'
          : uploading
            ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
      }`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-onyx-500 animate-spin" />
          <p className="text-sm text-slate-600">Uploading {uploadingFile}...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-8 h-8 text-slate-400" />
          {isDragActive ? (
            <p className="text-sm text-onyx-600 font-medium">Drop images here</p>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                <span className="font-medium text-onyx-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-slate-400">Images only, max 10MB each</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
