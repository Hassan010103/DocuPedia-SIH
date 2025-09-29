import React, { useState, useRef, useCallback } from 'react';
import { ArrowUpTrayIcon } from './Icon';
import { useTranslation } from '../contexts/LanguageContext';

interface DocumentUploadProps {
  onFileUpload: (files: File[]) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);
  
  const handleDragOut = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  }, [onFileUpload]);
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(Array.from(e.target.files));
    }
  };

  return (
    <div
      className={`relative p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300 ease-in-out bg-white dark:bg-slate-800/50
      ${isDragging ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 scale-105' : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'}`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-4 rounded-full transition-all duration-300 ${isDragging ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
          <ArrowUpTrayIcon className={`h-10 w-10 transition-all duration-300 ${isDragging ? 'text-blue-500 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
        </div>
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          {t('docUpload.dragAndDrop')}
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {t('docUpload.or')} <span className="text-blue-600 dark:text-blue-400 font-medium">{t('docUpload.clickToBrowse')}</span>
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">{t('docUpload.supports')}</p>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.docx,.png,.jpg,.jpeg"
        multiple
      />
    </div>
  );
};

export default DocumentUpload;