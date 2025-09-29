import React from 'react';
import { Page, User } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import {
  ChartPieIcon,
  DocumentDuplicateIcon,
  Cog6ToothIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  UsersIcon,
  InboxIcon,
} from './Icon';

interface SidebarProps {
  currentPage: Page;
  onNavClick: (page: Page) => void;
  user: User;
  inboxCount: number;
}

const NavItem: React.FC<{
  icon: React.ElementType;
  label: string; // Changed from Page to string to accept translated labels
  page: Page; // Added page prop to handle navigation
  isActive: boolean;
  onClick: (page: Page) => void;
  badgeCount?: number;
}> = ({ icon: Icon, label, page, isActive, onClick, badgeCount }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick(page);
      }}
      className={`relative flex items-center space-x-4 px-5 py-3.5 rounded-lg transition-all duration-200 text-[15px] md:text-[16px] ${
        isActive
          ? 'bg-blue-600 text-white font-semibold shadow-md'
          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
      }`}
    >
      <Icon className="h-6 w-6 md:h-7 md:w-7" />
      <span className="flex-1">{label}</span>
      {badgeCount && badgeCount > 0 && (
         <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>
            {badgeCount}
        </span>
      )}
    </a>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavClick, user, inboxCount }) => {
  const { t } = useTranslation();

  const navItems = [
    { page: Page.Dashboard, icon: HomeIcon },
    { page: Page.Documents, icon: DocumentDuplicateIcon },
    { page: Page.Analytics, icon: ChartPieIcon },
    { page: Page.Teams, icon: UsersIcon },
    { page: Page.Inbox, icon: InboxIcon, badgeCount: inboxCount },
    { page: Page.Settings, icon: Cog6ToothIcon },
    { page: Page.Help, icon: QuestionMarkCircleIcon },
  ];

  return (
    <aside className="w-72 bg-white dark:bg-slate-900 flex-shrink-0 flex flex-col p-6 border-r border-slate-200 dark:border-slate-800 shadow-2xl z-20 sticky top-0 h-screen">
      <div className="flex items-center space-x-3 mb-10">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold text-white">K</div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{t('sidebar.title')}</h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">{t('sidebar.subtitle')}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.page}
              icon={item.icon}
              label={t(`sidebar.nav.${item.page.toLowerCase()}`)}
              page={item.page}
              isActive={currentPage === item.page}
              onClick={onNavClick}
              badgeCount={item.badgeCount}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;