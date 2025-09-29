import React from 'react';
import { User } from '../types';
import GlassCard from './GlassCard';
import { useTranslation } from '../contexts/LanguageContext';

interface LoginPageProps {
  users: User[];
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ users, onLogin }) => {
  const { t } = useTranslation();
  return (
    <div className="w-full min-h-full flex items-center justify-center p-4 animate-fade-in">
      <GlassCard className="w-full max-w-md p-8 text-center">
        <div className="flex justify-center items-center space-x-3 mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white">K</div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('sidebar.title')}</h1>
            <p className="text-md text-slate-500 dark:text-slate-400">{t('sidebar.subtitle')}</p>
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-slate-800 dark:text-slate-200">{t('login.title')}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">{t('login.subtitle')}</p>
        
        <div className="space-y-4">
          {users.map(user => (
            <div
              key={user.id}
              onClick={() => onLogin(user)}
              className="flex items-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 cursor-pointer transition-all duration-300"
            >
              <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full border-2 border-slate-300 dark:border-slate-500" />
              <div className="ml-4 text-left">
                <p className="font-semibold text-lg text-slate-800 dark:text-slate-200">{user.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user.role}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;