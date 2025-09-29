

import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';

interface ConfirmationModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ title, message, onConfirm, onClose }) => {
    const { t } = useTranslation();
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-md m-4 p-8 text-slate-800 dark:text-slate-200 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-semibold py-2 px-6 rounded-lg transition-colors">
                        {t('common.cancel')}
                    </button>
                    <button onClick={() => { onConfirm(); onClose(); }} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                        {t('common.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
