

import React, { useState } from 'react';
import { Document, TeamMember } from '../types';
import { UsersIcon } from './Icon';
import { useTranslation } from '../contexts/LanguageContext';

// Mock team members to share with
// Fix: Corrected team member roles to align with the TeamMemberRole type.
const mockTeamMembers: Pick<TeamMember, 'name' | 'role' | 'avatarUrl'>[] = [
    { name: 'Rohan Verma', role: 'Admin', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    { name: 'Priya Sharma', role: 'Editor', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
    { name: 'Sameer Khan', role: 'Editor', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' },
];

interface ShareModalProps {
  document: Document;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ document, onClose }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const { t } = useTranslation();

  const handleShare = () => {
    if (!email) {
      alert(t('shareModal.validationError'));
      return;
    }
    alert(t('shareModal.shareSuccess', { documentName: document.name, email, permission }));
    onClose();
  };
  
  const handleTeamMemberClick = (name: string) => {
    setEmail(name);
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg m-4 p-8 text-slate-800 dark:text-slate-200 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">{t('shareModal.title')}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-md">{document.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('shareModal.shareWith')}</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UsersIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('shareModal.placeholder')}
                    className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 pl-10 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
          </div>
          
          <div className="pt-2">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t('shareModal.selectFromTeam')}</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                {mockTeamMembers.map(member => (
                    <div key={member.name} onClick={() => handleTeamMemberClick(member.name)} className="flex items-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                        <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full mr-3"/>
                        <div>
                            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{member.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{member.role}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('shareModal.permissions')}</label>
            <div className="flex space-x-2">
                <button 
                    onClick={() => setPermission('view')}
                    className={`flex-1 py-2 rounded-lg transition-colors text-slate-700 dark:text-slate-200 ${permission === 'view' ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500'}`}
                >
                    {t('shareModal.canView')}
                </button>
                <button 
                    onClick={() => setPermission('edit')}
                    className={`flex-1 py-2 rounded-lg transition-colors text-slate-700 dark:text-slate-200 ${permission === 'edit' ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500'}`}
                >
                    {t('shareModal.canEdit')}
                </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
            <button
                onClick={onClose}
                className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-semibold py-2 px-6 rounded-lg transition-all duration-300"
            >
                {t('common.cancel')}
            </button>
            <button
                onClick={handleShare}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
            >
                {t('shareModal.share')}
            </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ShareModal;
