import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme } = useTheme();

  const lightBlueprint = "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3e%3cdefs%3e%3cpattern id='p' width='20' height='20' patternUnits='userSpaceOnUse'%3e%3cpath d='M0 10h20M10 0v20' stroke-width='1' stroke='rgba(203, 213, 225, 0.5)'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='hsl(215, 35%25, 96%25)'/%3e%3crect width='100%25' height='100%25' fill='url(%23p)'/%3e%3c/svg%3e\")";
  const darkBlueprint = "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3e%3cdefs%3e%3cpattern id='p' width='20' height='20' patternUnits='userSpaceOnUse'%3e%3cpath d='M0 10h20M10 0v20' stroke-width='1' stroke='rgba(51, 65, 85, 0.5)'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='hsl(222, 47%25, 11%25)'/%3e%3crect width='100%25' height='100%25' fill='url(%23p)'/%3e%3c/svg%3e\")";

  return (
    <div 
      className="min-h-screen w-full text-slate-800 dark:text-slate-200 font-sans flex"
      style={{ backgroundImage: theme === 'dark' ? darkBlueprint : lightBlueprint }}
    >
      {children}
    </div>
  );
};

export default Layout;