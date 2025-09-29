
import React from 'react';
import { Document } from '../types';
import DummyPreview from './DummyPreview';
import { XMarkIcon } from './Icon';

interface PreviewModalProps {
  document: Document;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ document, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] m-4 flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{document.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{document.owner} &middot; {document.size}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden bg-slate-100 dark:bg-slate-800 rounded-b-2xl">
          <DummyPreview document={document} />
        </div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PreviewModal;
