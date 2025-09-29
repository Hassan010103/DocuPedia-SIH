
import React, { useState } from 'react';
import { Document } from '../types';
import { DocumentTextIcon, ShareIcon, TrashIcon, InformationCircleIcon } from './Icon';
import GlassCard from './GlassCard';
import ShareModal from './ShareModal';
import ConfirmationModal from './ConfirmationModal';

interface DocumentListProps {
  documents: Document[];
  onUpdateDocument: (document: Document) => void;
  onDeleteDocument: (docId: string) => void;
  onViewDocument: (docId: string) => void;
}

const getFileTypeIcon = (type: string, thumbnailUrl?: string) => {
    const fileType = type.toLowerCase();
    if (thumbnailUrl) return <img src={thumbnailUrl} alt="preview" className="h-10 w-10 object-cover rounded-md" />;
    if (['pdf'].includes(fileType)) return <DocumentTextIcon className="h-8 w-8 text-red-400 flex-shrink-0" />;
    if (['docx', 'doc'].includes(fileType)) return <DocumentTextIcon className="h-8 w-8 text-blue-400 flex-shrink-0" />;
    if (['png', 'jpg', 'jpeg'].includes(fileType)) return <DocumentTextIcon className="h-8 w-8 text-green-400 flex-shrink-0" />;
    return <DocumentTextIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />;
};


const DocumentList: React.FC<DocumentListProps> = ({ documents, onUpdateDocument, onDeleteDocument, onViewDocument }) => {
  const [docToShare, setDocToShare] = useState<Document | null>(null);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);

  const handleDelete = () => {
    if (docToDelete) {
      onDeleteDocument(docToDelete.id);
      setDocToDelete(null);
    }
  };
  
  if (documents.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-gray-400">No documents found. Try uploading some!</p>
      </GlassCard>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {documents.map((doc) => (
           <GlassCard key={doc.id} className="p-4 flex flex-col justify-between group !transform-none">
            <div>
              <div className="flex items-start space-x-3 mb-3">
                {getFileTypeIcon(doc.type, doc.thumbnailUrl)}
                <div className="flex-1 overflow-hidden">
                   <p className="font-semibold text-white truncate group-hover:whitespace-normal group-hover:text-indigo-300 transition-colors" title={doc.name}>{doc.name}</p>
                   <p className="text-xs text-gray-400">{doc.size}</p>
                </div>
              </div>
               <p className="text-xs text-gray-400 line-clamp-2">{doc.summary || 'No summary available.'}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
               <div className="text-xs text-gray-500">
                  <p>{doc.owner}</p>
                  <p>{new Date(doc.uploadedAt).toLocaleDateString()}</p>
               </div>
               <div className="flex items-center space-x-1">
                  <button onClick={() => onViewDocument(doc.id)} className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="View Details">
                    <InformationCircleIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => setDocToShare(doc)} className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Share">
                    <ShareIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => setDocToDelete(doc)} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-colors" title="Delete">
                    <TrashIcon className="h-5 w-5" />
                  </button>
               </div>
            </div>
           </GlassCard>
        ))}
      </div>
      
      {docToShare && <ShareModal document={docToShare} onClose={() => setDocToShare(null)} />}
      {docToDelete && <ConfirmationModal title="Delete Document" message={`Are you sure you want to delete "${docToDelete.name}"? This action cannot be undone.`} onConfirm={handleDelete} onClose={() => setDocToDelete(null)} />}
    </>
  );
};

export default DocumentList;
