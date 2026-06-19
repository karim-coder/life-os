"use client";

import { MDXEditor, type MDXEditorMethods } from "@mdxeditor/editor";
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  ListsToggle,
  UndoRedo,
  BlockTypeSelect,
  linkPlugin,
  codeBlockPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { useRef, forwardRef } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor = forwardRef<MDXEditorMethods, RichTextEditorProps>(
  function RichTextEditor({ value, onChange, placeholder, className }, ref) {
    const innerRef = useRef<MDXEditorMethods>(null);

    return (
      <div className="rich-text-editor-wrapper">
        <MDXEditor
          ref={ref || innerRef}
          markdown={value}
          onChange={onChange}
          placeholder={placeholder || "Start writing…"}
          className={className || "dark-theme"}
          contentEditableClassName="prose prose-sm max-w-none dark:prose-invert min-h-[300px] focus:outline-none"
          plugins={[
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <UndoRedo />
                  <BlockTypeSelect />
                  <BoldItalicUnderlineToggles />
                  <ListsToggle />
                </>
              ),
            }),
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            linkPlugin(),
            codeBlockPlugin(),
            markdownShortcutPlugin(),
          ]}
        />
      </div>
    );
  }
);
