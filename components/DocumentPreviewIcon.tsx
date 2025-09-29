
import React from 'react';
import { Document } from '../types';

interface DocumentPreviewIconProps {
  document: Document;
  className?: string;
}

const DocumentPreviewIcon: React.FC<DocumentPreviewIconProps> = ({ document, className = '' }) => {
    const fileType = document.type.toLowerCase();
    
    const getTypeSpecificStyles = () => {
        switch(fileType) {
            case 'pdf': return { color: '#ef4444', label: 'PDF' };
            case 'docx':
            case 'doc': return { color: '#3b82f6', label: 'DOC' };
            case 'xlsx':
            case 'xls': return { color: '#10b981', label: 'XLS' };
            case 'pptx':
            case 'ppt': return { color: '#f97316', label: 'PPT' };
            case 'dwg': return { color: '#8b5cf6', label: 'DWG' };
            case 'zip': return { color: '#64748b', label: 'ZIP' };
            default: return { color: '#64748b', label: document.type.toUpperCase().substring(0, 3) };
        }
    };
    
    const { color, label } = getTypeSpecificStyles();

    const renderGenericPreview = () => (
        <div className="w-full h-full bg-slate-50 p-3 text-left flex flex-col border border-slate-200">
            <div style={{ backgroundColor: color }} className="w-14 h-7 rounded flex items-center justify-center text-white text-xs font-bold mb-3 shadow-inner">{label}</div>
            <div className="space-y-1.5 flex-1">
                <div className="h-2 bg-slate-200 rounded-full w-11/12"></div>
                <div className="h-2 bg-slate-200 rounded-full w-full"></div>
                <div className="h-2 bg-slate-200 rounded-full w-full"></div>
                <div className="h-2 bg-slate-200 rounded-full w-3/4"></div>
            </div>
             <div className="space-y-1.5 flex-1 mt-3">
                <div className="h-2 bg-slate-200 rounded-full w-full"></div>
                <div className="h-2 bg-slate-200 rounded-full w-5/6"></div>
            </div>
        </div>
    );

    return (
        <div className={`relative aspect-[4/3] w-full bg-white rounded-lg shadow-sm overflow-hidden group ${className}`}>
             {document.thumbnailUrl ? (
                <img src={document.thumbnailUrl} alt={document.name} className="w-full h-full object-cover" />
             ) : (
                renderGenericPreview()
             )}
            <div className="absolute top-0 right-0 w-8 h-8 opacity-70">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M32 0 L20 0 C20 0 20 12 32 12 V 0 Z" fill="rgba(255,255,255,0.4)" style={{backdropFilter: 'blur(2px)'}}/>
                    <path d="M20 12 L32 0" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
                </svg>
            </div>
        </div>
    );
};

export default DocumentPreviewIcon;
