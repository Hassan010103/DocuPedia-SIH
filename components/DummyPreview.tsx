
import React from 'react';
import { Document } from '../types';
import { DocumentTextIcon, PhotoIcon, ArchiveBoxIcon, CodeBracketIcon } from './Icon';

interface DummyPreviewProps {
  document: Document;
}

const DummyPreview: React.FC<DummyPreviewProps> = ({ document }) => {
    const fileType = document.type.toLowerCase();

    const renderTextPreview = (isPdf: boolean) => (
        <div className="w-full h-full bg-white dark:bg-slate-900 p-8 flex flex-col overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-between mb-8">
                <div className={`text-xl font-bold ${isPdf ? 'text-red-600' : 'text-blue-600'}`}>{isPdf ? 'PDF' : 'DOCX'}</div>
                <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="flex-1 overflow-y-auto pr-4">
                <div className="w-3/4 h-6 bg-slate-300 dark:bg-slate-600 rounded mb-6"></div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-11/12"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
                <div className="w-1/2 h-5 bg-slate-300 dark:bg-slate-600 rounded my-6"></div>
                 <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-11/12"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderSheetPreview = () => (
         <div className="w-full h-full bg-white dark:bg-slate-900 p-4 overflow-auto">
            <div className="grid grid-cols-6 gap-px bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 min-w-[400px]">
                {/* Header */}
                <div className="bg-slate-100 dark:bg-slate-800 text-center font-mono text-sm text-slate-500"></div>
                {['A', 'B', 'C', 'D', 'E'].map(col => <div key={col} className="bg-slate-200 dark:bg-slate-700 text-center font-mono text-sm font-bold text-slate-600 dark:text-slate-300 py-1">{col}</div>)}
                
                {/* Rows */}
                {[...Array(20)].map((_, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        <div className="bg-slate-200 dark:bg-slate-700 text-center font-mono text-sm font-bold text-slate-600 dark:text-slate-300 px-2 flex items-center justify-center">{rowIndex + 1}</div>
                        {[...Array(5)].map((_, colIndex) => (
                            <div key={colIndex} className="bg-white dark:bg-slate-800 p-1.5">
                                <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded" style={{ width: `${30 + Math.random() * 60}%` }}></div>
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );

    const renderImagePreview = () => (
         <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center p-4">
             {document.thumbnailUrl ? (
                <img src={document.thumbnailUrl} alt={document.name} className="max-w-full max-h-full object-contain rounded-lg shadow-md" />
             ) : (
                <div className="w-full h-full max-w-md bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center p-4">
                    <svg className="w-full h-full text-slate-400 dark:text-slate-500" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 80 H 100 V 30 L 75 55 L 55 35 L 25 65 L 0 40 V 80 Z" fill="currentColor" fillOpacity="0.5"/>
                        <circle cx="70" cy="20" r="8" fill="currentColor" fillOpacity="0.6"/>
                        <path d="M-10 80 L 110 80" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
                    </svg>
                </div>
             )}
        </div>
    );

    const renderGenericPreview = (Icon: React.ElementType, typeName: string) => (
        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center p-8 text-center">
            <Icon className="w-24 h-24 text-slate-300 dark:text-slate-600" />
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-300 font-semibold truncate max-w-full">{document.name}</p>
            <div className="mt-4 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg p-4 w-full max-w-xs space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">File Type:</span> <span className="font-medium text-slate-700 dark:text-slate-200">{typeName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">File Size:</span> <span className="font-medium text-slate-700 dark:text-slate-200">{document.size}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Owner:</span> <span className="font-medium text-slate-700 dark:text-slate-200">{document.owner}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Uploaded:</span> <span className="font-medium text-slate-700 dark:text-slate-200">{new Date(document.uploadedAt).toLocaleDateString()}</span></div>
            </div>
        </div>
    );


    switch(fileType) {
        case 'pdf':
            return renderTextPreview(true);
        case 'docx':
        case 'doc':
            return renderTextPreview(false);
        case 'xlsx':
        case 'xls':
            return renderSheetPreview();
        case 'png':
        case 'jpg':
        case 'jpeg':
            return renderImagePreview();
        case 'zip':
            return renderGenericPreview(ArchiveBoxIcon, 'ZIP Archive');
        case 'dwg':
            return renderGenericPreview(CodeBracketIcon, 'CAD Drawing');
        default:
            return renderGenericPreview(DocumentTextIcon, 'File');
    }
};

export default DummyPreview;
