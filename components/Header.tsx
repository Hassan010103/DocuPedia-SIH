import React, { useState, useEffect, useRef } from 'react';
import {
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
} from './Icon';
import { Notification, User, Page } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const mockNotifications: Notification[] = [
    { id: '1', type: 'summary_ready', message: 'Your summary for "Safety-Audit.docx" is ready.', time: '15m ago', read: false },
    { id: '2', type: 'share', message: 'Ananya shared the "Marketing" folder with you.', time: '1h ago', read: false },
    { id: '3', type: 'new_document', message: 'New document "Q3-Projections.pdf" was uploaded by Hassan.', time: '3h ago', read: false },
    { id: '4', type: 'mention', message: 'Samay mentioned you in a comment on "Phase-3-Tender.pdf".', time: '5h ago', read: false },
    { id: '5', type: 'error', message: 'Error summarizing "Annual-Report-FY2023.pptx". File may be too large.', time: '8h ago', read: false },
];

const Header: React.FC<{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  user: User;
  onLogout: () => void;
  onNavClick: (page: Page) => void;
}> = ({ searchQuery, setSearchQuery, user, onLogout, onNavClick }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex-shrink-0 h-24 flex items-center justify-between px-6 lg:px-8">
      <div className="relative w-full max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('header.searchPlaceholder')}
          className="w-full bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg py-3 pl-12 pr-4 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="h-10 w-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
        </button>
        
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => setIsNotificationsOpen(prev => !prev)}
            className="h-10 w-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={t('header.notifications', { count: unreadCount })}
          >
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-slate-100 dark:border-slate-900"></span>}
          </button>
          {isNotificationsOpen && (
            <div className="absolute top-14 right-0 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl z-30 animate-fade-in-fast">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                 {mockNotifications.map(n => (
                    <div key={n.id} className={`p-4 text-sm flex items-start space-x-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${n.read ? 'opacity-60' : ''}`}>
                        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${n.read ? 'bg-slate-400' : 'bg-blue-500'}`}></div>
                        <div>
                            <p className="text-slate-700 dark:text-slate-300">{n.message}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{n.time}</p>
                        </div>
                    </div>
                 ))}
              </div>
              <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                <button className="w-full text-center py-2 text-sm text-blue-600 dark:text-blue-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded">{t('header.viewAllNotifications')}</button>
              </div>
            </div>
          )}
        </div>

        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileOpen(prev => !prev)}
            className="flex items-center space-x-2"
          >
            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
            <div className="hidden md:block text-left">
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
            </div>
            <ChevronDownIcon className="h-5 w-5 text-slate-400 hidden md:block" />
          </button>
          {isProfileOpen && (
             <div className="absolute top-14 right-0 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl z-30 p-2 animate-fade-in-fast">
                <ul>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onNavClick(Page.Settings); setIsProfileOpen(false); }} className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"><Cog6ToothIcon className="h-5 w-5"/><span>{t('header.settings')}</span></a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="flex items-center space-x-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md"><ArrowRightOnRectangleIcon className="h-5 w-5"/><span>{t('header.logout')}</span></a></li>
                </ul>
             </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fade-in-fast {
            from { opacity: 0; transform: translateY(-5px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-fast {
            animation: fade-in-fast 0.2s ease-out forwards;
        }
      `}</style>
    </header>
  );
};

export default Header;
