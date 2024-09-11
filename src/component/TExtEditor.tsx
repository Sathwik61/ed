import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import html2pdf from 'html2pdf.js';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { jsPDF } from 'jspdf';

pdfMake.vfs = pdfFonts.pdfMake.vfs; 

const modules = {
  toolbar: [
    [{ 'font': [] }, { 'size': [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    ['blockquote', 'code-block'],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'align': [] }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    ['link', 'image', 'video'],
    ['clean'],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  ]
};

const formats = [
  'font', 'size', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'script', 'blockquote', 'code-block',
  'header', 'list', 'bullet', 'align', 'indent', 'direction',
  'link', 'image', 'video'
];

const TextEditor: React.FC = () => {
  const [editorContent, setEditorContent] = useState<string>(''); 
  const quillRef = useRef<ReactQuill | null>(null); 

  const exportAsPDF = () => {
    if (!quillRef.current) return;

    const content = quillRef.current.getEditor().root.innerHTML;

    const tempElement = document.createElement('div');
    tempElement.innerHTML = content;
    tempElement.style.whiteSpace = 'pre-wrap';
    tempElement.style.width = '180mm';
    tempElement.style.margin = '10mm';

    html2pdf()
      .from(tempElement)
      .set({
        margin: [20, 20, 20, 20],
        filename: 'document.pdf',
        html2canvas: { scale: 1, allowTaint: true, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .save();
  };
  const exportAsWord = () => {
    if (!quillRef.current) return;

    const content = quillRef.current.getEditor().root.innerHTML;
    const tempElement = document.createElement('div');
    tempElement.innerHTML = content;

    const paragraphs = Array.from(tempElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6')).map((element) => {
      const textAlign = window.getComputedStyle(element).textAlign;

      return new Paragraph({
        children: [
          new TextRun({
            text: element.textContent || '',
            bold: element.tagName.startsWith('H'),
            break: 1,
          }),
        ],
        alignment: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'end' : 'start',
      });
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, 'document.docx');
    });
  };

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };

  return (
    <div className="text-editor-container">
      <ReactQuill 
        ref={quillRef}
        value={editorContent} 
        onChange={handleEditorChange}
        modules={modules}
        formats={formats}
        placeholder="Start typing your document..."
        theme="snow"
      />
      <div style={{ marginTop: '20px' }}>
        <button onClick={exportAsPDF} style={{ marginRight: '10px' }}>
          Export as PDF
        </button>
        <button onClick={exportAsWord}>
          Export as Word
        </button>
      </div>
    </div>
  );
};

export default TextEditor;
