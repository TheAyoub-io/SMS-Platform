import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import VariableInserter from './VariableInserter';
import TemplatePreview from './TemplatePreview';
import TemplateValidator from './TemplateValidator';

const SMS_LIMIT = 160;
const SMS_LIMIT_UNICODE = 70;

export interface TemplateEditorHandles {
  getTemplateData: () => { nom_modele: string, contenu_modele: string } | null;
}

const TemplateEditor = forwardRef<TemplateEditorHandles>((props, ref) => {
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    getTemplateData: () => {
      if (!name.trim()) {
        alert("Template name is required.");
        return null;
      }
      return { nom_modele: name, contenu_modele: content };
    }
  }));

  const handleInsertVariable = (variable: string) => {
    const { current: textArea } = textAreaRef;
    if (!textArea) return;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const newContent = content.substring(0, start) + variable + content.substring(end);

    setContent(newContent);
    // Focus and move cursor to after the inserted variable
    setTimeout(() => {
      textArea.focus();
      textArea.selectionStart = textArea.selectionEnd = start + variable.length;
    }, 0);
  };

  const charCount = content.length;
  const isUnicode = /[^\x00-\x7F]/.test(content);
  const limit = isUnicode ? SMS_LIMIT_UNICODE : SMS_LIMIT;
  const segments = Math.ceil(charCount / limit) || 1;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="template_name" className="block text-sm font-medium">Template Name</label>
        <input
          type="text"
          id="template_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mt-1 border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Message Content</label>
        <VariableInserter onInsert={handleInsertVariable} />
        <textarea
          ref={textAreaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full p-2 mt-1 border rounded-md font-mono"
          placeholder="Type your message here..."
        />
        <div className="text-right text-sm text-gray-500">
          {charCount} / {limit * segments} characters | {segments} SMS
        </div>
      </div>
      <TemplateValidator content={content} />
      <TemplatePreview templateContent={content} />
    </div>
  );
});

export default TemplateEditor;
