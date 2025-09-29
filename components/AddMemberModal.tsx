

import React, { useState } from 'react';
import { TeamMember, TeamMemberRole } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface AddMemberModalProps {
    onClose: () => void;
    onAddMember: (newMember: Omit<TeamMember, 'id' | 'status' | 'lastActive' | 'joinDate'>) => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ onClose, onAddMember }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<TeamMemberRole>('Viewer');
    const [team, setTeam] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const { t } = useTranslation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !role || !team) {
            alert(t('addMemberModal.validationError'));
            return;
        }
        // FIX: Added `team` and `documentsOwned` properties to the new member object to match the required type. `documentsOwned` defaults to 0 for new members.
        onAddMember({ name, email, role, team, documentsOwned: 0, avatarUrl: avatarUrl || `https://i.pravatar.cc/150?u=${email}` });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-md m-4 p-8 text-slate-800 dark:text-slate-200 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">{t('addMemberModal.title')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('common.fullName')}</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('common.emailAddress')}</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('common.team')}</label>
                        <input type="text" value={team} onChange={(e) => setTeam(e.target.value)} required placeholder={t('addMemberModal.teamPlaceholder')} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('common.role')}</label>
                         <select value={role} onChange={(e) => setRole(e.target.value as TeamMemberRole)} required className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Viewer">{t('roles.viewer')}</option>
                            <option value="Editor">{t('roles.editor')}</option>
                            <option value="Admin">{t('roles.admin')}</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('addMemberModal.avatarUrl')}</label>
                        <input type="text" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder={t('addMemberModal.avatarPlaceholder')} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mt-8 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-semibold py-2 px-6 rounded-lg transition-colors">{t('common.cancel')}</button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">{t('addMemberModal.addMember')}</button>
                    </div>
                </form>
                 <style>{`
                  select { color: #334155; }
                  html.dark select { color: #e2e8f0; }
                  select option { background-color: #ffffff; color: #334155; }
                  html.dark select option { background-color: #1e293b; color: #e2e8f0; }
                `}</style>
            </div>
        </div>
    );
};
export default AddMemberModal;
