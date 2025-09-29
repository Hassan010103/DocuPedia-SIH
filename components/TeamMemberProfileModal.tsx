

import React, { useState } from 'react';
import { TeamMember, TeamMemberRole } from '../types';
import MessageModal from './MessageModal';
import { EnvelopeIcon, PencilIcon, TrashIcon } from './Icon';
import { useTranslation } from '../contexts/LanguageContext';

interface TeamMemberProfileModalProps {
    member: TeamMember;
    onClose: () => void;
    onUpdate: (updatedMember: TeamMember) => void;
    onDelete: () => void;
}

const TeamMemberProfileModal: React.FC<TeamMemberProfileModalProps> = ({ member, onClose, onUpdate, onDelete }) => {
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(member);
    const { t } = useTranslation();

    const handleSave = () => {
        onUpdate(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(member);
        setIsEditing(false);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm m-4 text-slate-800 dark:text-slate-200 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                    <div className="relative h-24 bg-blue-500 rounded-t-2xl">
                        <img src={member.avatarUrl} alt={member.name} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[-50%] w-24 h-24 rounded-full border-4 border-white dark:border-slate-800" />
                    </div>
                    <div className="p-6 pt-16 text-center">
                        {isEditing ? (
                            <input 
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="text-2xl font-bold bg-slate-100 dark:bg-slate-700 rounded-md text-center w-full py-1 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <h2 className="text-2xl font-bold">{member.name}</h2>
                        )}
                        
                        {isEditing ? (
                             <select 
                                value={formData.role} 
                                onChange={(e) => setFormData(prev => ({...prev, role: e.target.value as TeamMemberRole}))}
                                className="text-blue-600 dark:text-blue-400 bg-slate-100 dark:bg-slate-700 rounded-md mt-1 text-center py-1 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Viewer">{t('roles.viewer')}</option>
                                <option value="Editor">{t('roles.editor')}</option>
                                <option value="Admin">{t('roles.admin')}</option>
                             </select>
                        ) : (
                            <p className="text-blue-600 dark:text-blue-400">{member.role}</p>
                        )}
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{member.email}</p>

                        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 p-3 rounded-lg"><p className="text-slate-500 dark:text-slate-400">{t('common.team')}</p><p className="font-semibold">{member.team}</p></div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 p-3 rounded-lg"><p className="text-slate-500 dark:text-slate-400">{t('common.status')}</p><p className="font-semibold">{member.status}</p></div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 p-3 rounded-lg"><p className="text-slate-500 dark:text-slate-400">{t('teamProfileModal.docsOwned')}</p><p className="font-semibold">{member.documentsOwned}</p></div>
                             <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 p-3 rounded-lg"><p className="text-slate-500 dark:text-slate-400">{t('teamProfileModal.joined')}</p><p className="font-semibold">{new Date(member.joinDate).toLocaleDateString()}</p></div>
                        </div>

                        {isEditing ? (
                            <div className="mt-6 flex space-x-4">
                                <button onClick={handleCancel} className="flex-1 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors">{t('common.cancel')}</button>
                                <button onClick={handleSave} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">{t('common.save')}</button>
                            </div>
                        ) : (
                            <div className="mt-6 flex space-x-4">
                                <button onClick={() => setIsMessageModalOpen(true)} className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                                    <EnvelopeIcon className="h-5 w-5" />
                                    <span>{t('teamProfileModal.message')}</span>
                                </button>
                                <button onClick={() => setIsEditing(true)} className="flex items-center justify-center space-x-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold p-2 rounded-lg transition-colors">
                                    <PencilIcon className="h-5 w-5" />
                                </button>
                                <button onClick={onDelete} className="flex items-center justify-center space-x-2 bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold p-2 rounded-lg transition-colors">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {isMessageModalOpen && <MessageModal member={member} onClose={() => setIsMessageModalOpen(false)} />}
        </>
    );
};

export default TeamMemberProfileModal;
