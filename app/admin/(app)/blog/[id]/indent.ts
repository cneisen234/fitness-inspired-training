// Tab-to-indent for the blog editor.
//
// By default Tab moves focus out of the editor (and only sinks list items when
// the cursor is inside a list). Ashley wants Tab to indent the current block
// instead. This extension:
//   • binds Tab / Shift-Tab (at high priority so it wins over the list keymap),
//   • sinks/lifts list items when the cursor is in a list (native nesting),
//   • otherwise bumps a bounded `indent` level on the paragraph/heading, stored
//     as a `data-indent` attribute so it survives serialization and renders on
//     the published post (see the matching CSS in globals.css + admin.css and
//     the sanitizer allow-list in lib/sanitize.ts).
//
// Tab is always swallowed (returns true) so it never tabs out of the editor.

import { Extension } from "@tiptap/core";

export const MAX_INDENT = 8;
const INDENTABLE = ["paragraph", "heading"];

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
    };
  }
}

export const Indent = Extension.create({
  name: "indent",
  // Higher than StarterKit's list keymap so our Tab handler runs first.
  priority: 1000,

  addOptions() {
    return { types: INDENTABLE, max: MAX_INDENT };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => {
              const v = parseInt(element.getAttribute("data-indent") || "0", 10);
              if (Number.isNaN(v) || v <= 0) return 0;
              return Math.min(v, this.options.max);
            },
            renderHTML: (attributes) => {
              const v = attributes.indent as number;
              return v > 0 ? { "data-indent": String(v) } : {};
            },
          },
        },
      },
    ];
  },

  addCommands() {
    const shift =
      (delta: number) =>
      ({ state, dispatch }: { state: any; dispatch: any }) => {
        const { from, to } = state.selection;
        let tr = state.tr;
        let changed = false;
        state.doc.nodesBetween(from, to, (node: any, pos: number) => {
          if (!this.options.types.includes(node.type.name)) return;
          const cur = (node.attrs.indent as number) || 0;
          const next = Math.min(Math.max(cur + delta, 0), this.options.max);
          if (next !== cur) {
            tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: next });
            changed = true;
          }
        });
        if (changed && dispatch) dispatch(tr);
        return changed;
      };

    return {
      indent: () => shift(1),
      outdent: () => shift(-1),
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        // In a list, Tab nests the item natively.
        if (this.editor.commands.sinkListItem("listItem")) return true;
        this.editor.commands.indent();
        return true; // always swallow Tab so focus never leaves the editor
      },
      "Shift-Tab": () => {
        if (this.editor.commands.liftListItem("listItem")) return true;
        this.editor.commands.outdent();
        return true;
      },
    };
  },
});
