"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/lib/uploadthing-client";
import { setCoverImage, removeCoverImage } from "../actions";
import ConfirmDelete from "../../confirm-delete";
import { TrashIcon } from "../../icons";

export default function CoverImage({
  postId,
  coverImageUrl,
}: {
  postId: string;
  coverImageUrl: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  if (coverImageUrl) {
    return (
      <div className="admin-image-grid">
        <div className="admin-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverImageUrl} alt="Cover" />
          <span className="admin-image-primary">Cover</span>
          <div className="admin-image-actions">
            <ConfirmDelete
              action={removeCoverImage}
              fields={{ postId }}
              title="Remove the cover image?"
              message="The image will be deleted from storage. You can upload a new one after."
              triggerLabel={
                <>
                  <TrashIcon /> Remove
                </>
              }
              triggerAriaLabel="Remove cover image"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <UploadDropzone
        endpoint="blogImage"
        onClientUploadComplete={async (res) => {
          setError(null);
          const f = res?.[0]?.serverData;
          if (f?.url) {
            await setCoverImage({ postId, url: f.url, key: f.key });
            router.refresh();
          }
        }}
        onUploadError={(e) => setError(e.message)}
      />
      {error && <p className="admin-login-error">{error}</p>}
    </div>
  );
}
