import React from 'react';
import { Document, User } from '../types';
import GlassCard from './GlassCard';
import { ClockIcon, DocumentTextIcon } from './Icon';
import { useTranslation } from '../contexts/LanguageContext';

interface PendingTasksProps {
    documents: Document[];
    currentUser: User;
    onViewDocument: (docId: string) => void;
}

const PendingTasks: React.FC<PendingTasksProps> = ({ documents, currentUser, onViewDocument }) => {
    const { t } = useTranslation();
    
    const pendingDocuments = documents.filter(doc => 
        doc.owner === currentUser.name && (doc.status === 'new' || doc.deadline)
    ).sort((a, b) => b.smartScore - a.smartScore);

    const getDeadlineInfo = (deadline: string) => {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: t('pendingTasks.overdue'), color: 'text-red-500 dark:text-red-400' };
        if (diffDays === 0) return { text: t('pendingTasks.dueToday'), color: 'text-orange-500 dark:text-orange-400' };
        if (diffDays <= 3) return { text: t('pendingTasks.dueIn', { days: diffDays }), color: 'text-yellow-500 dark:text-yellow-400' };
        return { text: t('pendingTasks.dueOn', { date: deadlineDate.toLocaleDateString() }), color: 'text-slate-500 dark:text-slate-400' };
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">{t('pendingTasks.title')}</h3>
            <GlassCard className="p-4 max-h-[calc(100vh-22rem)] overflow-y-auto">
                {pendingDocuments.length > 0 ? (
                    <ul className="space-y-3">
                        {pendingDocuments.map(doc => {
                            const deadlineInfo = doc.deadline ? getDeadlineInfo(doc.deadline) : { text: t('pendingTasks.new'), color: 'text-blue-600 dark:text-blue-400' };
                            return (
                                <li key={doc.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center space-x-3 overflow-hidden">
                                        <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                        <div className="overflow-hidden">
                                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{doc.name}</p>
                                            <div className="flex items-center space-x-2 text-xs">
                                                <ClockIcon className={`h-4 w-4 ${deadlineInfo.color}`} />
                                                <span className={deadlineInfo.color}>{deadlineInfo.text}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => onViewDocument(doc.id)} className="ml-2 px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors flex-shrink-0">
                                        {t('pendingTasks.review')}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <p className="font-semibold">{t('pendingTasks.allCaughtUp')}</p>
                        <p className="text-sm">{t('pendingTasks.noPending')}</p>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default PendingTasks;