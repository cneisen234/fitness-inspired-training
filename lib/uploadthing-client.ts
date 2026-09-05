// Typed UploadThing React helpers. Imported by client components only.
// `import type` keeps the server-side router code out of the client bundle.
//
//  - UploadDropzone / UploadButton : prebuilt widgets (cover image picker).
//  - useUploadThing / uploadFiles  : programmatic upload, for inserting an image
//    inline from the Tiptap editor (Step 2).

import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
