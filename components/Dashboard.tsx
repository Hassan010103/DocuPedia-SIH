import React from 'react';
import DocumentUpload from './DocumentUpload';
import PendingTasks from './PendingTasks';
import GlassCard from './GlassCard';
import { DocumentTextIcon, UsersIcon, ChartBarIcon } from './Icon';
import { Document, User } from '../types';
import { generateSummary } from '../services/geminiService';
import { useTranslation } from '../contexts/LanguageContext';
import DocumentPreviewIcon from './DocumentPreviewIcon';

interface DashboardProps {
  documents: Document[];
  currentUser: User;
  onFileUpload: (files: File[], summaries: string[]) => void;
  onViewDocument: (docId: string) => void;
  searchQuery: string;
}

const getPriorityClass = (priority: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
        case 'High': return 'border-red-500 bg-red-100 text-red-700';
        case 'Medium': return 'border-yellow-500 bg-yellow-100 text-yellow-700';
        case 'Low': return 'border-green-500 bg-green-100 text-green-700';
        default: return 'border-slate-500 bg-slate-100 text-slate-700';
    }
};


const Dashboard: React.FC<DashboardProps> = ({ 
  documents, 
  currentUser,
  onFileUpload, 
  onViewDocument,
  searchQuery 
}) => {
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [summarizingText, setSummarizingText] = React.useState('');
  const { t } = useTranslation();

  const handleFileUpload = async (files: File[]) => {
    setIsSummarizing(true);
    setSummarizingText(t('dashboard.summarizingMultiple', { count: files.length }));

    const summaries = await Promise.all(
        files.map(async (file, index) => {
            setSummarizingText(t('dashboard.summarizingSingle', { name: file.name, current: index + 1, total: files.length }));
            return await generateSummary(file);
        })
    );
    
    onFileUpload(files, summaries);
    setIsSummarizing(false);
    setSummarizingText('');
  };

  const filteredDocuments = documents
    .filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const categorizedDocuments = React.useMemo(() => {
    const categories: { [key: string]: Document[] } = {
        'PDFs': [],
        'Documents': [],
        'Spreadsheets': [],
        'Images': [],
    };

    filteredDocuments.forEach(doc => {
        const type = doc.type.toLowerCase();
        if (type === 'pdf') categories['PDFs'].push(doc);
        else if (['docx', 'doc'].includes(type)) categories['Documents'].push(doc);
        else if (['xlsx', 'xls'].includes(type)) categories['Spreadsheets'].push(doc);
        else if (['png', 'jpg', 'jpeg', 'dwg'].includes(type)) categories['Images'].push(doc);
    });

    for (const key in categories) {
        categories[key] = categories[key]
            .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
            .slice(0, 4);
    }
    return Object.entries(categories).filter(([, docs]) => docs.length > 0);
  }, [filteredDocuments]);


  const totalStorage = documents.reduce((acc, doc) => {
    const size = parseFloat(doc.size);
    if (doc.size.includes('MB')) return acc + size;
    if (doc.size.includes('KB')) return acc + size / 1024;
    return acc;
  }, 0);
  
  const newThisMonth = documents.filter(doc => new Date(doc.uploadedAt) > new Date(new Date().setDate(new Date().getDate() - 30))).length;
  
  const animatedTitle = "KMRL DocStream Nexus".split("").map((char, index) => (
    <span
      key={index}
      className="animated-char"
      style={{ '--delay': `${index * 0.07}s` } as React.CSSProperties}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-4 text-center animated-title">
          {animatedTitle}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-center">{t('dashboard.welcome', { name: currentUser.name })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg"><DocumentTextIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" /></div>
          <div>
            <h3 className="font-semibold text-slate-500 dark:text-slate-400">{t('dashboard.totalDocuments')}</h3>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{documents.length}</p>
          </div>
        </GlassCard>
        <GlassCard className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg"><UsersIcon className="h-8 w-8 text-green-600 dark:text-green-400" /></div>
          <div>
            <h3 className="font-semibold text-slate-500 dark:text-slate-400">{t('dashboard.newThisMonth')}</h3>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{newThisMonth}</p>
          </div>
        </GlassCard>
        <GlassCard className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg"><ChartBarIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" /></div>
          <div>
            <h3 className="font-semibold text-slate-500 dark:text-slate-400">{t('dashboard.storageUsed')}</h3>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{(totalStorage / 1024).toFixed(2)} GB</p>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="relative">
             {isSummarizing && (
                <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                    <div className="text-center">
                        <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{summarizingText}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.aiWorking')}</p>
                    </div>
                </div>
            )}
            <DocumentUpload onFileUpload={handleFileUpload} />
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('dashboard.recentUpdates')}</h3>
            <div className="space-y-6">
                {categorizedDocuments.map(([category, docs]) => (
                    <div key={category}>
                        <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-300 mb-3">{category}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {docs.map(doc => (
                                <GlassCard key={doc.id} className="p-3 group" onClick={() => onViewDocument(doc.id)}>
                                    <div className="relative">
                                        <DocumentPreviewIcon document={doc} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 mt-2 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{doc.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <PendingTasks documents={documents} currentUser={currentUser} onViewDocument={onViewDocument} />
        </div>
      </div>
      
      <style>{`
        .animated-title {
          display: inline-block;
          min-height: 1.2em; /* Prevent layout shift */
        }
        .animated-char {
          display: inline-block;
          animation: text-wave-color 3s infinite;
          animation-delay: var(--delay);
          will-change: transform, color;
        }
        html.dark .animated-char {
          animation-name: text-wave-color-dark;
        }
        @keyframes text-wave-color {
            0%, 100% {
                transform: translateY(0);
                color: #1e3a8a; /* dark blue */
            }
            25% {
                transform: translateY(-8px);
                color: #3b82f6; /* blue */
            }
            50% {
                transform: translateY(0);
                color: #1e3a8a;
            }
            75% {
                transform: translateY(5px);
                color: #60a5fa; /* light blue */
            }
        }
        @keyframes text-wave-color-dark {
            0%, 100% {
                transform: translateY(0);
                color: #93c5fd; /* light blue */
            }
            25% {
                transform: translateY(-8px);
                color: #60a5fa; /* blue */
            }
            50% {
                transform: translateY(0);
                color: #93c5fd;
            }
            75% {
                transform: translateY(5px);
                color: #bfdbfe; /* very light blue */
            }
        }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;