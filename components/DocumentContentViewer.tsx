

import React from 'react';
import { Document } from '../types';
import { generateDocumentContent } from '../services/geminiService';
import { PhotoIcon } from './Icon';

const DocumentContentViewer: React.FC<{ document: Document }> = ({ document }) => {
  const [content, setContent] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const generatedContent = await generateDocumentContent(document);
        setContent(generatedContent);
      } catch (e) {
        setError('Failed to load document content.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [document.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
        <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="font-semibold">Loading document content...</p>
        <p className="text-sm">AI is rendering the document, please wait.</p>
      </div>
    );
  }

  if (error) {
    return <div className="flex items-center justify-center h-full text-red-500 dark:text-red-400">{error}</div>;
  }
  
  const fileType = document.type.toLowerCase();
  
  if (['png', 'jpg', 'jpeg'].includes(fileType)) {
      return (
          <div className="w-full h-full bg-slate-200 dark:bg-slate-800 p-4 flex items-center justify-center">
              {document.thumbnailUrl ? (
                <img src={document.thumbnailUrl} alt={document.name} className="max-w-full max-h-full object-contain rounded-lg shadow-md" />
              ) : (
                <div className="text-center text-slate-500 dark:text-slate-400">
                    <PhotoIcon className="h-24 w-24 mx-auto" />
                    <p className="mt-2 font-semibold">Image Preview</p>
                    <p className="text-sm">No thumbnail available for this image.</p>
                </div>
              )}
          </div>
      );
  }

  return (
    <div className="w-full h-full bg-white dark:bg-slate-800 p-6 sm:p-8 overflow-y-auto">
        <pre className="whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-200">{content}</pre>
    </div>
  );
};

export default DocumentContentViewer;
