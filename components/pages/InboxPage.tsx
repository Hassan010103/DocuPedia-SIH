

import React, { useState } from 'react';
import GlassCard from '../GlassCard';
import { InboxDocument } from '../../types';
import { EnvelopeIcon, ChatBubbleBottomCenterTextIcon, CodeBracketIcon, CheckCircleIcon, XCircleIcon, InboxIcon } from '../Icon';
import ConfirmationModal from '../ConfirmationModal';
import { useTranslation } from '../../contexts/LanguageContext';

interface InboxPageProps {
  inboxDocuments: InboxDocument[];
  onAccept: (doc: InboxDocument) => void;
  onReject: (docId: string) => void;
}

const getSourceIcon = (source: InboxDocument['source']) => {
    switch (source) {
        case 'Email': return <EnvelopeIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
        case 'WhatsApp': return <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-green-500 dark:text-green-400" />;
        case 'API Upload': return <CodeBracketIcon className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
    }
};

const InboxPage: React.FC<InboxPageProps> = ({ inboxDocuments, onAccept, onReject }) => {
  const [selectedDoc, setSelectedDoc] = useState<InboxDocument | null>(inboxDocuments[0] || null);
  const [docToReject, setDocToReject] = useState<InboxDocument | null>(null);
  const { t } = useTranslation();

  const handleRejectConfirm = () => {
      if (docToReject) {
          onReject(docToReject.id);
          if (selectedDoc?.id === docToReject.id) {
            setSelectedDoc(inboxDocuments.find(d => d.id !== docToReject.id) || null);
          }
          setDocToReject(null);
      }
  };

  return (
    <>
      <div className="space-y-8 animate-fade-in h-full">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('inboxPage.title')}</h2>
          <p className="text-slate-600 dark:text-slate-400">{t('inboxPage.subtitle')}</p>
        </div>
        
        {inboxDocuments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100%-8rem)]">
                <GlassCard className="lg:col-span-1 p-4 h-full">
                    <h3 className="text-lg font-semibold mb-3 px-2 text-slate-800 dark:text-slate-200">{t('inboxPage.pendingItems', { count: inboxDocuments.length })}</h3>
                    <div className="space-y-2 h-[calc(100%-2.5rem)] overflow-y-auto">
                        {inboxDocuments.map(doc => (
                            <div key={doc.id} onClick={() => setSelectedDoc(doc)} className={`p-3 rounded-lg cursor-pointer transition-colors flex items-start space-x-3 ${selectedDoc?.id === doc.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <div className="mt-1">{getSourceIcon(doc.source)}</div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{doc.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('inboxPage.from')} {doc.sender}</p>
                                </div>
                                {doc.isProcessing && (
                                    <svg className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                            </div>
                        ))}
                    </div>
                </GlassCard>
                <GlassCard className="lg:col-span-2 p-6 h-full flex flex-col justify-between">
                   {selectedDoc ? (
                       <div>
                           <div className="flex justify-between items-start">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">{getSourceIcon(selectedDoc.source)}</div>
                                    <div className="overflow-hidden">
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{selectedDoc.name}</h3>
                                        <p className="text-slate-500 dark:text-slate-400">{t('inboxPage.fromVia', { sender: selectedDoc.sender, source: selectedDoc.source })}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400 dark:text-slate-500">{new Date(selectedDoc.receivedAt).toLocaleString()}</span>
                           </div>
                           <div className="my-6 border-t border-slate-200 dark:border-slate-700"></div>
                           <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">{t('inboxPage.fileType')}:</span> <span className="font-medium">{selectedDoc.type}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">{t('inboxPage.fileSize')}:</span> <span className="font-medium">{selectedDoc.size}</span></div>
                           </div>
                            <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-lg min-h-[200px] flex items-center justify-center text-slate-500 dark:text-slate-400 mt-6">
                             <p>{t('common.previewUnavailable')}</p>
                         </div>
                       </div>
                   ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                            <p>{t('inboxPage.selectItem')}</p>
                        </div>
                   )}
                   {selectedDoc && (
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-4">
                        <button onClick={() => setDocToReject(selectedDoc)} disabled={selectedDoc.isProcessing} className="flex items-center space-x-2 px-6 py-2 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <XCircleIcon className="h-5 w-5"/>
                            <span>{t('inboxPage.reject')}</span>
                        </button>
                        <button onClick={() => onAccept(selectedDoc)} disabled={selectedDoc.isProcessing} className="flex items-center space-x-2 px-6 py-2 bg-green-100 dark:bg-green-900/40 hover:bg-green-200 dark:hover:bg-green-900/60 text-green-700 dark:text-green-300 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {selectedDoc.isProcessing ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-slate-600 dark:text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>{t('inboxPage.processing')}</span>
                                </>
                            ) : (
                                <>
                                <CheckCircleIcon className="h-5 w-5"/>
                                <span>{t('inboxPage.accept')}</span>
                                </>
                            )}
                        </button>
                    </div>
                   )}
                </GlassCard>
            </div>
        ) : (
             <GlassCard className="p-6 text-center h-full flex flex-col items-center justify-center">
                <InboxIcon className="h-16 w-16 text-slate-400 dark:text-slate-500 mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{t('inboxPage.emptyTitle')}</h3>
                <p className="text-slate-500 dark:text-slate-400">{t('inboxPage.emptySubtitle')}</p>
             </GlassCard>
        )}
      </div>

      {docToReject && <ConfirmationModal title={t('inboxPage.deleteModal.title')} message={t('inboxPage.deleteModal.message', { name: docToReject.name })} onConfirm={handleRejectConfirm} onClose={() => setDocToReject(null)} />}

       <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default InboxPage;
