// Server-side sanitizer for blog post HTML coming out of the Tiptap editor.
// NEVER trust editor output — a compromised admin session or a crafted paste
// could inject markup. We allow only the small set of tags the editor produces
// and force safe link/image attributes. Runs in server actions (Node runtime).

import "server-only";
import sanitizeHtml from "sanitize-html";

export function sanitizePostHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "p", "br", "strong", "em", "u", "s", "code", "pre",
      "h2", "h3", "h4",
      "ul", "ol", "li",
      "blockquote", "hr",
      "a", "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
    // Links and images may only point at http(s) (UploadThing images are https).
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      // Every link opens safely in a new tab and can't hijack the opener.
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer nofollow",
      }),
    },
    // Drop empty/dangerous attributes and disallowed tags entirely (no text kept
    // for <script>/<style>).
    disallowedTagsMode: "discard",
    nonTextTags: ["script", "style", "textarea", "option", "noscript"],
  });
}
