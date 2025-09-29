

// Fix: Created the missing MessageModal component.
import React, { useState } from 'react';
import { TeamMember } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface MessageModalProps {
    member: TeamMember;
    onClose: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({ member, onClose }) => {
    const [message, setMessage] = useState('');
    const { t } = useTranslation();

    const handleSend = () => {
        if (!message) {
            alert(t('messageModal.validationError'));
            return;
        }
        alert(t('messageModal.sendSuccess', { name: member.name, message }));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg m-4 p-8 text-slate-800 dark:text-slate-200 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-1">{t('messageModal.title')}</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">{t('messageModal.to')}: {member.name}</p>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('messageModal.placeholder')}
                    rows={5}
                    className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-6 flex justify-end space-x-4">
                    <button type="button" onClick={onClose} className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-semibold py-2 px-6 rounded-lg transition-colors">{t('common.cancel')}</button>
                    <button type="button" onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">{t('common.send')}</button>
                </div>
            </div>
        </div>
    );
};

export default MessageModal;
