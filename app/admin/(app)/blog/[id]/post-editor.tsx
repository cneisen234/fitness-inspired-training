"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import { updatePost } from "../actions";
import { useAutosave, SaveStatus } from "../../autosave";
import { useUploadThing } from "@/lib/uploadthing-client";

type Post = {
  id: string;
  title: string;
  excerpt: string | null;
  contentHtml: string;
};

export default function PostEditor({ post }: { post: Post }) {
  const { status, schedule } = useAutosave();
  const titleRef = useRef(post.title);
  const excerptRef = useRef(post.excerpt ?? "");
  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Branded link modal (replaces window.prompt).
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [editingLink, setEditingLink] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Build the FormData snapshot and hand it to the debounced autosave.
  const save = useCallback(
    (html: string) => {
      const fd = new FormData();
      fd.set("id", post.id);
      fd.set("title", titleRef.current);
      fd.set("excerpt", excerptRef.current);
      fd.set("contentHtml", html);
      schedule(() => updatePost(fd));
    },
    [post.id, schedule],
  );

  const editor = useEditor({
    immediatelyRender: false, // avoid SSR hydration mismatch in Next
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
        },
      }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: "Write the post…" }),
    ],
    content: post.contentHtml || "<p></p>",
    editorProps: { attributes: { "aria-label": "Post body" } },
    onUpdate: ({ editor }) => save(editor.getHTML()),
  });

  const { startUpload, isUploading } = useUploadThing("blogImage", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.serverData?.url;
      if (url && editor) editor.chain().focus().setImage({ src: url }).run();
      setUploadError(null);
    },
    onUploadError: (e) => setUploadError(e.message),
  });

  // Reactive toolbar state (Tiptap v3 doesn't re-render on every transaction).
  const s = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null;
      return {
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        strike: editor.isActive("strike"),
        h2: editor.isActive("heading", { level: 2 }),
        h3: editor.isActive("heading", { level: 3 }),
        bullet: editor.isActive("bulletList"),
        ordered: editor.isActive("orderedList"),
        quote: editor.isActive("blockquote"),
        link: editor.isActive("link"),
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
      };
    },
  });

  function onTitle(v: string) {
    setTitle(v);
    titleRef.current = v;
    save(editor?.getHTML() ?? post.contentHtml);
  }
  function onExcerpt(v: string) {
    setExcerpt(v);
    excerptRef.current = v;
    save(editor?.getHTML() ?? post.contentHtml);
  }

  function openLinkModal() {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    setEditingLink(!!prev);
    setLinkUrl(prev ?? "https://");
    setLinkOpen(true);
  }

  function applyLink() {
    if (!editor) return;
    const url = linkUrl.trim();
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
    setLinkOpen(false);
  }

  function removeLink() {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkOpen(false);
  }

  // Focus the URL field when the modal opens; Escape closes it.
  useEffect(() => {
    if (!linkOpen) return;
    linkInputRef.current?.focus();
    linkInputRef.current?.select();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLinkOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [linkOpen]);

  function pickImage() {
    fileInputRef.current?.click();
  }

  return (
    <>
      <div className="admin-card">
        <div className="admin-row-between" style={{ alignItems: "center" }}>
          <h2 className="admin-h2" style={{ margin: 0 }}>
            Content
          </h2>
          <SaveStatus status={status} />
        </div>

        <label className="admin-field" style={{ marginTop: 12 }}>
          <span>Title</span>
          <input
            className="admin-input"
            value={title}
            onChange={(e) => onTitle(e.target.value)}
            placeholder="Post title"
          />
        </label>

        <label className="admin-field" style={{ marginTop: 12 }}>
          <span>Excerpt</span>
          <textarea
            className="admin-input"
            rows={2}
            value={excerpt}
            onChange={(e) => onExcerpt(e.target.value)}
            placeholder="A one- or two-sentence summary for the blog index and previews."
          />
        </label>
      </div>

      <div className="admin-card">
        <h2 className="admin-h2">Body</h2>
        <div className="admin-editor">
          <div className="admin-editor-toolbar">
            <button type="button" className={`admin-editor-tool ${s?.bold ? "active" : ""}`} onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold" aria-label="Bold"><b>B</b></button>
            <button type="button" className={`admin-editor-tool ${s?.italic ? "active" : ""}`} onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic" aria-label="Italic"><i>I</i></button>
            <button type="button" className={`admin-editor-tool ${s?.underline ? "active" : ""}`} onClick={() => editor?.chain().focus().toggleUnderline().run()} title="Underline" aria-label="Underline"><u>U</u></button>
            <button type="button" className={`admin-editor-tool ${s?.strike ? "active" : ""}`} onClick={() => editor?.chain().focus().toggleStrike().run()} title="Strikethrough" aria-label="Strikethrough"><s>S</s></button>
            <span className="admin-editor-sep" />
            <button type="button" className={`admin-editor-tool ${s?.h2 ? "active" : ""}`} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">H2</button>
            <button type="button" className={`admin-editor-tool ${s?.h3 ? "active" : ""}`} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">H3</button>
            <span className="admin-editor-sep" />
            <button type="button" className={`admin-editor-tool ${s?.bullet ? "active" : ""}`} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Bullet list">• List</button>
            <button type="button" className={`admin-editor-tool ${s?.ordered ? "active" : ""}`} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Numbered list">1. List</button>
            <button type="button" className={`admin-editor-tool ${s?.quote ? "active" : ""}`} onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="Quote">❝</button>
            <span className="admin-editor-sep" />
            <button type="button" className={`admin-editor-tool ${s?.link ? "active" : ""}`} onClick={openLinkModal} title="Link">🔗</button>
            <button type="button" className="admin-editor-tool" onClick={pickImage} disabled={isUploading} title="Insert image">
              {isUploading ? "…" : "🖼"}
            </button>
            <span className="admin-editor-sep" />
            <button type="button" className="admin-editor-tool" onClick={() => editor?.chain().focus().undo().run()} disabled={!s?.canUndo} title="Undo">↶</button>
            <button type="button" className="admin-editor-tool" onClick={() => editor?.chain().focus().redo().run()} disabled={!s?.canRedo} title="Redo">↷</button>
          </div>
          <EditorContent editor={editor} />
        </div>
        {uploadError && (
          <p className="admin-login-error" style={{ marginTop: 10 }}>
            Image upload failed: {uploadError}
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) startUpload([file]);
            e.target.value = ""; // allow re-selecting the same file
          }}
        />
      </div>

      {/* Branded link modal */}
      {linkOpen && (
        <div className="admin-modal-backdrop">
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-label={editingLink ? "Edit link" : "Add link"}
          >
            <h3 className="admin-modal-title">{editingLink ? "Edit link" : "Add link"}</h3>
            <label className="admin-field">
              <span>Link URL</span>
              <input
                ref={linkInputRef}
                className="admin-input"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyLink();
                  }
                }}
                placeholder="https://example.com"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <div className="admin-modal-actions" style={{ marginTop: 22 }}>
              {editingLink && (
                <button
                  type="button"
                  className="admin-btn danger"
                  onClick={removeLink}
                  style={{ marginRight: "auto" }}
                >
                  Remove
                </button>
              )}
              <button type="button" className="admin-btn ghost" onClick={() => setLinkOpen(false)}>
                Cancel
              </button>
              <button type="button" className="admin-btn" onClick={applyLink}>
                {editingLink ? "Update" : "Add link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
