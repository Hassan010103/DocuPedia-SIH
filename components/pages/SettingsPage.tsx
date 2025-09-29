

import React, { useState, useEffect } from 'react';
import GlassCard from '../GlassCard';
import { User } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';

interface SettingsPageProps {
    user: User;
    onUpdateUser: (user: User) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onUpdateUser }) => {
    const [formData, setFormData] = useState(user);
    const [isSaved, setIsSaved] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        setFormData(user);
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateUser(formData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('settingsPage.title')}</h2>
                <p className="text-slate-600 dark:text-slate-400">{t('settingsPage.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <GlassCard className="p-6">
                        <h3 className="text-xl font-semibold mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">{t('settingsPage.profile.title')}</h3>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('common.fullName')}</label>
                                    <input 
                                      type="text" 
                                      name="name"
                                      value={formData.name}
                                      onChange={handleChange}
                                      className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('common.emailAddress')}</label>
                                    <input 
                                      type="email" 
                                      name="email"
                                      value={formData.email}
                                      onChange={handleChange}
                                      className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('common.role')}</label>
                                <input type="text" value={formData.role} readOnly className="w-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                            </div>
                            <div className="pt-2 text-right flex items-center justify-end">
                                {isSaved && <span className="text-green-600 dark:text-green-400 mr-4 transition-opacity duration-300 animate-fade-in">{t('common.saved')}</span>}
                                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">{t('settingsPage.profile.saveChanges')}</button>
                            </div>
                        </form>
                    </GlassCard>

                     <GlassCard className="p-6">
                        <h3 className="text-xl font-semibold mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">{t('settingsPage.security.title')}</h3>
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Password functionality not implemented in this demo."); }}>
                           <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('settingsPage.security.currentPassword')}</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('settingsPage.security.newPassword')}</label>
                                    <input type="password" placeholder="••••••••" className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('settingsPage.security.confirmPassword')}</label>
                                    <input type="password" placeholder="••••••••" className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                             <div className="pt-2 text-right">
                                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">{t('settingsPage.security.updatePassword')}</button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
                <div className="space-y-8">
                     <GlassCard className="p-6">
                        <h3 className="text-xl font-semibold mb-4">{t('settingsPage.notifications.title')}</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label htmlFor="email-notifications" className="text-slate-700 dark:text-slate-300">{t('settingsPage.notifications.email')}</label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" id="email-notifications" className="sr-only peer" defaultChecked />
                                  <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                             <div className="flex items-center justify-between">
                                <label htmlFor="push-notifications" className="text-slate-700 dark:text-slate-300">{t('settingsPage.notifications.push')}</label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" id="push-notifications" className="sr-only peer" />
                                  <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                             <div className="flex items-center justify-between">
                                <label htmlFor="weekly-digest" className="text-slate-700 dark:text-slate-300">{t('settingsPage.notifications.digest')}</label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" id="weekly-digest" className="sr-only peer" defaultChecked />
                                  <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
             <style>{`
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

export default SettingsPage;
