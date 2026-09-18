// UploadThing file router — defines the upload endpoint the admin uses for blog
// images (both the featured cover and images inserted inline in the editor). Auth
// is enforced in the middleware (only a signed-in admin can upload); the route
// itself isn't behind the proxy matcher, so this middleware is the real gate.

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { isAuthenticated } from "@/lib/auth/session";

const f = createUploadthing();

export const ourFileRouter = {
  // One endpoint, reused for cover + inline images. Each upload is a single file.
  blogImage: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      if (!(await isAuthenticated())) {
        throw new UploadThingError("Unauthorized");
      }
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      // Returned to the client's onClientUploadComplete as `serverData`.
      // `key` is stored so the image can be deleted from UploadThing later.
      return { url: file.ufsUrl, key: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
