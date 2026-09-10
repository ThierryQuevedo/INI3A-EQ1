import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

export const UploadDropzone = generateUploadDropzone({
  url: typeof window !== "undefined" 
    ? `${window.location.origin}/26-marcaai/api/uploadthing/`
    : "/26-marcaai/api/uploadthing/",
});