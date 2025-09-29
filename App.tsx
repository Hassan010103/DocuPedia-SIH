
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DocumentsPage from './components/pages/DocumentsPage';
import AnalyticsPage from './components/pages/AnalyticsPage';
import TeamsPage from './components/pages/TeamsPage';
import InboxPage from './components/pages/InboxPage';
import SettingsPage from './components/pages/SettingsPage';
import HelpPage from './components/pages/HelpPage';
import DocumentDetailPage from './components/pages/DocumentDetailPage';
import LoginPage from './components/LoginPage';
import Chatbot from './components/Chatbot';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

import { Page, User, Document, TeamMember, InboxDocument, Annotation, ChatMessage } from './types';
import { mockUsers } from './users';
import { mockDocuments } from './data/documents';
import { mockTeamMembers } from './data/teamMembers';
import { mockInboxDocuments } from './data/inboxDocuments';
import { generateSummary, getChatbotResponseStream } from './services/geminiService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [inboxDocuments, setInboxDocuments] = useState<InboxDocument[]>(mockInboxDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for document detail page vs chatbot context
  const [detailViewDocument, setDetailViewDocument] = useState<Document | null>(null);
  const [chatbotContextDocument, setChatbotContextDocument] = useState<Document | null>(null);


  // Chatbot state
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am Doc Assistant. How can I help you today? You can ask me about your documents or features of this application.' }
  ]);
  const [isChatbotResponding, setIsChatbotResponding] = useState(false);


  useEffect(() => {
    // If a user is logged in, filter documents/tasks for them
    if (currentUser) {
      // Potentially load user-specific data here
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage(Page.Dashboard);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    setDetailViewDocument(null); // Close document detail view on page change
    setChatbotContextDocument(null); // Clear chat context when navigating
  };

  const handleViewDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      setDetailViewDocument(doc);
      setChatbotContextDocument(doc); // Automatically set chat context when viewing a doc
    }
  };

  const handleCloseDocumentView = () => {
    setDetailViewDocument(null);
    setChatbotContextDocument(null); // Clear chat context when closing doc view
  };
  
  const handleUpdateDocument = (updatedDoc: Document) => {
     setDocuments(docs => docs.map(d => d.id === updatedDoc.id ? updatedDoc : d));
     if(detailViewDocument?.id === updatedDoc.id) {
         setDetailViewDocument(updatedDoc);
     }
     if(chatbotContextDocument?.id === updatedDoc.id) {
        setChatbotContextDocument(updatedDoc);
     }
  };
  
  const handleAddAnnotation = (docId: string, comment: string) => {
    if (!currentUser) return;
    const newAnnotation: Annotation = {
        id: `ann-${Date.now()}`,
        user: { name: currentUser.name, avatarUrl: currentUser.avatarUrl },
        text: comment,
        timestamp: new Date().toISOString(),
    };
    const updatedDoc = documents.find(d => d.id === docId);
    if (updatedDoc) {
        const newAnnotations = [...(updatedDoc.annotations || []), newAnnotation];
        handleUpdateDocument({ ...updatedDoc, annotations: newAnnotations });
    }
  };
  
  const handleDeleteDocument = (docId: string) => {
    setDocuments(docs => docs.filter(d => d.id !== docId));
  };
  
  // FIX: Added missing properties `department`, `priority`, and `timeline` to new Document objects to satisfy the type definition.
  const handleFileUpload = async (files: File[], summaries: string[]) => {
    if (!currentUser) return;

    const teamMember = teamMembers.find(tm => tm.id === currentUser.id);
    const teamToDepartmentMap: { [key: string]: Document['department'] } = {
        'Engineering': 'Engineering & Design',
        'Compliance': 'Safety & Compliance',
        'Finance': 'Finance',
        'Marketing': 'Marketing',
        'HR': 'HR',
        'Legal': 'Legal',
        'Operations': 'Operations',
        'IT': 'IT'
    };
    const department = (teamMember && teamToDepartmentMap[teamMember.team]) || 'Operations';

    const newDocuments: Document[] = files.map((file, index) => {
        const uploadedAt = new Date().toISOString();
        return {
            id: `doc-${Date.now()}-${index}`,
            name: file.name,
            type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
            size: `${(file.size / (1024*1024)).toFixed(2)} MB`,
            owner: currentUser.name,
            uploadedAt,
            status: 'summarized',
            summary: summaries[index],
            tags: [],
            versions: [{ version: 1, date: uploadedAt, editor: currentUser.name, change: 'Initial upload' }],
            annotations: [],
            department,
            priority: 'Medium',
            timeline: [{ type: 'Created', user: currentUser.name, timestamp: uploadedAt, details: 'Initial upload' }],
            // FIX: Added missing smartScore property to satisfy the Document type.
            smartScore: 50,
        };
    });
    setDocuments(prev => [...newDocuments, ...prev]);
  };

  const handleUpdateUser = (user: User) => {
    setCurrentUser(user);
  };
  
  const handleAddMember = (newMember: Omit<TeamMember, 'id' | 'status' | 'joinDate'>) => {
    const member: TeamMember = {
        ...newMember,
        id: `user-${Date.now()}`,
        status: 'Active',
        joinDate: new Date().toISOString(),
    };
    setTeamMembers(prev => [...prev, member]);
  };

  const handleUpdateMember = (updatedMember: TeamMember) => {
    setTeamMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const handleDeleteMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== memberId));
  };
  
  // FIX: Added missing properties `department`, `priority`, and `timeline` to the new Document object to satisfy the type definition.
  const handleAcceptInboxDoc = async (docToAccept: InboxDocument) => {
    if (!currentUser) return;
    // Set processing state
    setInboxDocuments(prev => prev.map(d => d.id === docToAccept.id ? { ...d, isProcessing: true } : d));

    const summary = await generateSummary({ name: docToAccept.name, type: docToAccept.type } as File);

    const teamMember = teamMembers.find(tm => tm.id === currentUser.id);
    const teamToDepartmentMap: { [key: string]: Document['department'] } = {
        'Engineering': 'Engineering & Design',
        'Compliance': 'Safety & Compliance',
        'Finance': 'Finance',
        'Marketing': 'Marketing',
        'HR': 'HR',
        'Legal': 'Legal',
        'Operations': 'Operations',
        'IT': 'IT'
    };
    const department = (teamMember && teamToDepartmentMap[teamMember.team]) || 'Operations';
    const uploadedAt = new Date().toISOString();

    const newDoc: Document = {
        id: `doc-${Date.now()}`,
        name: docToAccept.name,
        type: docToAccept.type,
        size: docToAccept.size,
        owner: currentUser.name,
        uploadedAt,
        status: 'summarized',
        summary: summary,
        tags: ['inbox', docToAccept.source.toLowerCase()],
        versions: [{ version: 1, date: uploadedAt, editor: currentUser.name, change: `Initial upload from ${docToAccept.source}` }],
        annotations: [],
        department,
        priority: 'Medium',
        timeline: [{ type: 'Created', user: currentUser.name, timestamp: uploadedAt, details: `Accepted from Inbox (${docToAccept.source})` }],
        // FIX: Added missing smartScore property to satisfy the Document type.
        smartScore: 50,
    };
    setDocuments(prev => [newDoc, ...prev]);
    setInboxDocuments(prev => prev.filter(d => d.id !== docToAccept.id));
  };

  const handleRejectInboxDoc = (docId: string) => {
    setInboxDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const handleSetChatbotContext = (docId: string | null) => {
    if (docId === null) {
      setChatbotContextDocument(null);
    } else {
      const doc = documents.find(d => d.id === docId);
      if (doc) setChatbotContextDocument(doc);
    }
  };

  const handleSendMessage = async (message: string) => {
      const newUserMessage: ChatMessage = { role: 'user', text: message };
      const newHistory = [...chatHistory, newUserMessage];
      setChatHistory(newHistory);
      setIsChatbotResponding(true);

      const stream = getChatbotResponseStream(newHistory, chatbotContextDocument || undefined, documents);
      
      let fullResponse = '';
      setChatHistory(prev => [...prev, { role: 'model', text: '' }]); // Add empty model message

      for await (const chunk of stream) {
          fullResponse += chunk;
          setChatHistory(prev => {
              const lastMessage = prev[prev.length - 1];
              lastMessage.text = fullResponse;
              return [...prev.slice(0, -1), lastMessage];
          });
      }

      setIsChatbotResponding(false);
  };
  
  const AppContent = () => {
    if (!currentUser) {
      return <Layout><LoginPage users={mockUsers} onLogin={handleLogin} /></Layout>;
    }

    const renderPage = () => {
      if (detailViewDocument) {
        return <DocumentDetailPage 
          document={detailViewDocument} 
          documents={documents}
          onClose={handleCloseDocumentView} 
          onUpdateDocument={handleUpdateDocument}
          onAddAnnotation={handleAddAnnotation}
          onViewDocument={handleViewDocument}
          teamMembers={teamMembers}
          currentUser={currentUser}
        />;
      }

      switch (currentPage) {
        case Page.Dashboard:
          return <Dashboard 
                    documents={documents} 
                    currentUser={currentUser} 
                    onFileUpload={handleFileUpload} 
                    onViewDocument={handleViewDocument}
                    searchQuery={searchQuery}
                  />;
        case Page.Documents:
          return <DocumentsPage 
                  documents={documents} 
                  teamMembers={teamMembers}
                  searchQuery={searchQuery} 
                  onDeleteDocument={handleDeleteDocument} 
                  onViewDocument={handleViewDocument}
                 />;
        case Page.Analytics:
          return <AnalyticsPage documents={documents} teamMembers={teamMembers} />;
        case Page.Teams:
          return <TeamsPage 
                    teamMembers={teamMembers} 
                    documents={documents}
                    onAddMember={handleAddMember}
                    onUpdateMember={handleUpdateMember}
                    onDeleteMember={handleDeleteMember}
                  />;
        case Page.Inbox:
          return <InboxPage inboxDocuments={inboxDocuments} onAccept={handleAcceptInboxDoc} onReject={handleRejectInboxDoc} />;
        case Page.Settings:
          return <SettingsPage user={currentUser} onUpdateUser={handleUpdateUser} />;
        case Page.Help:
          return <HelpPage />;
        default:
          return <Dashboard 
                  documents={documents} 
                  currentUser={currentUser} 
                  onFileUpload={handleFileUpload} 
                  onViewDocument={handleViewDocument}
                  searchQuery={searchQuery}
                 />;
      }
    };

    return (
      <Layout>
        <Sidebar 
          currentPage={currentPage} 
          onNavClick={handleNavClick} 
          user={currentUser} 
          inboxCount={inboxDocuments.length} 
        />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            user={currentUser} 
            onNavClick={handleNavClick}
            onLogout={handleLogout}
          />
          <main className="flex-1 p-6 lg:p-8 overflow-hidden">
            <div className="w-full h-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-y-auto p-6 lg:p-8">
              {renderPage()}
            </div>
          </main>
        </div>
        <Chatbot
          isOpen={isChatbotOpen}
          onToggle={() => setIsChatbotOpen(prev => !prev)}
          history={chatHistory}
          onSendMessage={handleSendMessage}
          isResponding={isChatbotResponding}
          contextDocument={chatbotContextDocument}
          onSetContext={handleSetChatbotContext}
          documents={documents}
        />
      </Layout>
    );
  };
  
  return (
    // FIX: This component was likely causing a cascading error. Although the error pointed here, the fix is in LanguageProvider's definition.
    <LanguageProvider>
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;
