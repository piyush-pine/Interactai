"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { storage } from "@/firebase/client";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { FileUp, FileText, X, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface ResumeUploadProps {
  userId: string;
  currentResumeName?: string;
  onUploadComplete: (url: string, name: string) => void;
}

export default function ResumeUpload({
  userId,
  currentResumeName,
  onUploadComplete,
}: ResumeUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState(currentResumeName || "");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file.");
        return;
      }

      setIsUploading(true);
      setFileName(file.name);

      const storageRef = ref(storage, `resumes/${userId}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          toast.error("Upload failed. Please try again.");
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          onUploadComplete(downloadURL, file.name);
          toast.success("Resume uploaded successfully!");
          setIsUploading(false);
        }
      );
    },
    [userId, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    disabled: isUploading,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
          isDragActive
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        } ${isUploading ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium">Uploading... {Math.round(progress)}%</p>
            <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 rounded-full bg-primary/10">
              <FileUp className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">
                {isDragActive ? "Drop your resume here" : "Upload your resume"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Drag and drop or click to select (PDF only)
              </p>
            </div>
          </>
        )}
      </div>

      {fileName && !isUploading && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-xs px-2">
              {fileName}
            </span>
            <CheckCircle className="h-4 w-4 text-success-100" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setFileName("");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
