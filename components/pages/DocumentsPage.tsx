

import React, { useState, useMemo, useEffect } from 'react';
import GlassCard from '../GlassCard';
import { Document, TeamMember } from '../../types';
import ShareModal from '../ShareModal';
import ConfirmationModal from '../ConfirmationModal';
import { useTranslation } from '../../contexts/LanguageContext';
import { 
    DocumentTextIcon, ShareIcon, TrashIcon, InformationCircleIcon, ArrowDownIcon, ArrowUpIcon, 
    Squares2X2Icon, ListBulletIcon, DownloadIcon, UsersIcon, SparklesIcon
} from '../Icon';
import DocumentPreviewIcon from '../DocumentPreviewIcon';


interface DocumentsPageProps {
  documents: Document[];
  teamMembers: TeamMember[];
  searchQuery: string;
  onDeleteDocument: (docId: string) => void;
  onViewDocument: (docId: string) => void;
}

type SortKey = 'name' | 'uploadedAt' | 'owner' | 'size' | 'smartScore';
type SortOrder = 'asc' | 'desc';

const getPriorityStampClass = (priority: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
        case 'High': return 'stamp stamp-high';
        case 'Medium': return 'stamp stamp-medium';
        case 'Low': return 'stamp stamp-low';
        default: return 'stamp';
    }
};

const SmartScoreBadge = ({ score }: { score: number }) => {
    const getColor = () => {
        if (score > 75) return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700/50';
        if (score > 40) return 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700/50';
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700/50';
    };
    return (
        <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-bold border ${getColor()}`}>
            <SparklesIcon className="h-3 w-3"/>
            <span>{score}</span>
        </div>
    );
};


const DocumentsPage: React.FC<DocumentsPageProps> = ({ documents, teamMembers, searchQuery, onDeleteDocument, onViewDocument }) => {
  const [sortKey, setSortKey] = useState<SortKey>('smartScore');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [docToShare, setDocToShare] = useState<Document | null>(null);
  const [docsToDelete, setDocsToDelete] = useState<string[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const { t } = useTranslation();
  
  const departments = useMemo(() => ['All', ...Array.from(new Set(documents.map(d => d.department)))], [documents]);

  const sortedAndFilteredDocuments = useMemo(() => {
    const filteredByDept = documents.filter(doc => {
        if (selectedDept === 'All') return true;
        return doc.department === selectedDept;
    });

    const filteredBySearch = filteredByDept.filter(doc =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    return [...filteredBySearch].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        let comparison = 0;
        if (sortKey === 'size') {
            const sizeA = parseFloat(a.size) * (a.size.includes('GB') ? 1024 : 1);
            const sizeB = parseFloat(b.size) * (b.size.includes('GB') ? 1024 : 1);
            comparison = sizeA > sizeB ? 1 : -1;
        } else if (sortKey === 'uploadedAt') {
            comparison = new Date(a.uploadedAt) > new Date(b.uploadedAt) ? 1 : -1;
        } else if (sortKey === 'smartScore') {
             comparison = a.smartScore > b.smartScore ? 1 : -1;
        } else {
            comparison = String(aVal).localeCompare(String(bVal));
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [documents, searchQuery, sortKey, sortOrder, selectedDept]);
  
  useEffect(() => {
    setSelectedDocs(new Set());
  }, [searchQuery, selectedDept]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
        setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
        setSortKey(key);
        setSortOrder('desc');
    }
  };

  const handleSelectDoc = (docId: string) => {
    setSelectedDocs(prev => {
        const newSet = new Set(prev);
        if (newSet.has(docId)) {
            newSet.delete(docId);
        } else {
            newSet.add(docId);
        }
        return newSet;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedDocs(new Set(sortedAndFilteredDocuments.map(d => d.id)));
    } else {
        setSelectedDocs(new Set());
    }
  };
  
  const handleDeleteConfirm = () => {
    docsToDelete.forEach(id => onDeleteDocument(id));
    setDocsToDelete([]);
    setSelectedDocs(new Set());
  };
  
  const getFileTypeIcon = (type: string) => {
    const fileType = type.toLowerCase();
    if (['pdf'].includes(fileType)) return <DocumentTextIcon className="h-8 w-8 text-red-500 dark:text-red-400 flex-shrink-0" />;
    if (['docx', 'doc'].includes(fileType)) return <DocumentTextIcon className="h-8 w-8 text-blue-500 dark:text-blue-400 flex-shrink-0" />;
    if (['png', 'jpg', 'jpeg'].includes(fileType)) return <DocumentTextIcon className="h-8 w-8 text-green-500 dark:text-green-400 flex-shrink-0" />;
    return <DocumentTextIcon className="h-8 w-8 text-slate-400 dark:text-slate-500 flex-shrink-0" />;
};


  const SortableHeader = ({ label, sortValue }: { label: string, sortValue: SortKey }) => (
    <th className="p-3 font-semibold text-sm cursor-pointer text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleSort(sortValue)}>
        <div className="flex items-center">
            {label}
            {sortKey === sortValue && (sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4 ml-1" /> : <ArrowDownIcon className="h-4 w-4 ml-1" />)}
        </div>
    </th>
  );
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('documentsPage.title')}</h2>
        <p className="text-slate-600 dark:text-slate-400">{t('documentsPage.subtitle')}</p>
      </div>

       <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto pb-2">
        {departments.map(dept => (
            <button key={dept} onClick={() => setSelectedDept(dept)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${selectedDept === dept ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                {dept === 'All' ? t('common.all') : dept}
            </button>
        ))}
      </div>

      <GlassCard className="p-4">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4 p-2">
            <div className="flex items-center gap-4">
                {selectedDocs.size > 0 ? (
                    <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700 p-2 rounded-lg animate-fade-in text-blue-800 dark:text-blue-200">
                        <span className="font-semibold">{t('documentsPage.selected', { count: selectedDocs.size })}</span>
                        <div className="border-l border-blue-300/50 dark:border-blue-600/50 h-6 mx-2"></div>
                        <button className="flex items-center gap-1 p-1 hover:bg-blue-200 dark:hover:bg-blue-800/60 rounded" title={t('documentsPage.shareSelected')}><UsersIcon className="h-5 w-5"/> {t('common.share')}</button>
                        <button className="flex items-center gap-1 p-1 hover:bg-blue-200 dark:hover:bg-blue-800/60 rounded" title={t('documentsPage.downloadSelected')}><DownloadIcon className="h-5 w-5"/> {t('common.download')}</button>
                        <button onClick={() => setDocsToDelete(Array.from(selectedDocs))} className="flex items-center gap-1 p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded" title={t('documentsPage.deleteSelected')}><TrashIcon className="h-5 w-5"/> {t('common.delete')}</button>
                    </div>
                ) : (
                   <div className="flex items-center gap-2">
                     <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Sort by:</span>
                     <select 
                        value={sortKey} 
                        onChange={(e) => handleSort(e.target.value as SortKey)}
                        className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                     >
                        <option value="smartScore">Smart Score</option>
                        <option value="uploadedAt">Last Modified</option>
                        <option value="name">Name</option>
                        <option value="owner">Owner</option>
                     </select>
                   </div>
                )}
            </div>
            <div className="flex items-center gap-2">
                <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-1 flex items-center">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}><Squares2X2Icon className="h-5 w-5"/></button>
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}><ListBulletIcon className="h-5 w-5"/></button>
                </div>
            </div>
        </div>
        
        {viewMode === 'grid' ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-2">
                {sortedAndFilteredDocuments.map((doc) => (
                   <GlassCard key={doc.id} className={`p-0 flex flex-col group/card !transform-none relative overflow-hidden ${selectedDocs.has(doc.id) ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-300 dark:ring-blue-500/50' : 'border-slate-200 dark:border-transparent'}`}>
                    <input type="checkbox" checked={selectedDocs.has(doc.id)} onChange={() => handleSelectDoc(doc.id)} className="absolute top-3 left-3 z-20 h-5 w-5 accent-blue-600 opacity-0 group-hover/card:opacity-100 checked:opacity-100 transition-opacity" />
                    <div className="p-3 flex flex-col flex-1">
                        <div className="relative mb-3 cursor-pointer" onClick={() => onViewDocument(doc.id)}>
                           <DocumentPreviewIcon document={doc} />
                        </div>
                        
                        <div className="flex-1 cursor-pointer" onClick={() => onViewDocument(doc.id)}>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors truncate" title={doc.name}>{doc.name}</p>
                            <div className="flex items-center flex-wrap gap-1.5 my-2">
                                <SmartScoreBadge score={doc.smartScore} />
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 uppercase tracking-wider">{doc.department}</span>
                                <span className={getPriorityStampClass(doc.priority)}>{doc.priority}</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                           <div className="text-xs text-slate-400 dark:text-slate-500">
                              <p>{doc.owner}</p>
                              <p>{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                           </div>
                           <div className="flex items-center space-x-1">
                              <button onClick={() => onViewDocument(doc.id)} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors" title={t('common.viewDetails')}><InformationCircleIcon className="h-5 w-5" /></button>
                              <button onClick={(e) => { e.stopPropagation(); setDocToShare(doc); }} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors" title={t('common.share')}><ShareIcon className="h-5 w-5" /></button>
                           </div>
                        </div>
                    </div>
                   </GlassCard>
                ))}
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <th className="p-3 w-12"><input type="checkbox" onChange={handleSelectAll} className="h-4 w-4 accent-blue-600 rounded border-slate-300 dark:border-slate-600" /></th>
                            <SortableHeader label={t('documentsPage.headers.name')} sortValue="name" />
                            <SortableHeader label="Smart Score" sortValue="smartScore" />
                            <SortableHeader label={t('documentsPage.headers.owner')} sortValue="owner" />
                            <SortableHeader label={t('documentsPage.headers.lastModified')} sortValue="uploadedAt" />
                            <SortableHeader label={t('documentsPage.headers.fileSize')} sortValue="size" />
                            <th className="p-3 font-semibold text-sm text-center text-slate-600 dark:text-slate-300">{t('documentsPage.headers.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAndFilteredDocuments.map((doc) => (
                            <tr key={doc.id} className={`border-b border-slate-200 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200 ${selectedDocs.has(doc.id) ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
                                <td className="p-3"><input type="checkbox" checked={selectedDocs.has(doc.id)} onChange={() => handleSelectDoc(doc.id)} className="h-4 w-4 accent-blue-600 rounded border-slate-300 dark:border-slate-600" /></td>
                                <td className="p-3 flex items-center space-x-3">
                                    {getFileTypeIcon(doc.type)}
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-slate-200 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400" onClick={() => onViewDocument(doc.id)}>{doc.name}</p>
                                        <div className="flex items-center flex-wrap gap-1.5 mt-1">
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 uppercase tracking-wider">{doc.department}</span>
                                            <span className={getPriorityStampClass(doc.priority)}>{doc.priority}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3"><SmartScoreBadge score={doc.smartScore} /></td>
                                <td className="p-3 text-sm text-slate-600 dark:text-slate-400">{doc.owner}</td>
                                <td className="p-3 text-sm text-slate-600 dark:text-slate-400">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                                <td className="p-3 text-sm text-slate-600 dark:text-slate-400">{doc.size}</td>
                                <td className="p-3 text-center">
                                    <div className="flex items-center justify-center space-x-1">
                                        <button onClick={() => onViewDocument(doc.id)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors" title={t('common.viewDetails')}><InformationCircleIcon className="h-5 w-5" /></button>
                                        <button onClick={() => setDocToShare(doc)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors" title={t('common.share')}><ShareIcon className="h-5 w-5" /></button>
                                        <button onClick={() => setDocsToDelete([doc.id])} className="p-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full transition-colors" title={t('common.delete')}><TrashIcon className="h-5 w-5" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </GlassCard>
      
      {docToShare && <ShareModal document={docToShare} onClose={() => setDocToShare(null)} />}
      {docsToDelete.length > 0 && <ConfirmationModal title={t('documentsPage.deleteModal.title', { count: docsToDelete.length })} message={t('documentsPage.deleteModal.message')} onConfirm={handleDeleteConfirm} onClose={() => setDocsToDelete([])} />}
    </div>
  );
};

export default DocumentsPage;
