

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChatMessage, Document } from '../types';
import { ChatBubbleOvalLeftEllipsisIcon, PaperAirplaneIcon, XMarkIcon, DocumentTextIcon, PaperClipIcon, MagnifyingGlassIcon } from './Icon';
import GlassCard from './GlassCard';
import { useTranslation } from '../contexts/LanguageContext';

interface ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  history: ChatMessage[];
  onSendMessage: (message: string) => void;
  isResponding: boolean;
  contextDocument: Document | null;
  onSetContext: (docId: string | null) => void;
  documents: Document[];
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onToggle, history, onSendMessage, isResponding, contextDocument, onSetContext, documents }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isDocSelectorOpen, setIsDocSelectorOpen] = useState(false);
  const [docSearch, setDocSearch] = useState('');
  const { t } = useTranslation();

  const filteredDocuments = useMemo(() => 
    documents.filter(doc => doc.name.toLowerCase().includes(docSearch.toLowerCase())),
    [documents, docSearch]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isResponding]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isResponding) {
      onSendMessage(input);
      setInput('');
    }
  };
  
  const handleSelectDoc = (docId: string) => {
      onSetContext(docId);
      setIsDocSelectorOpen(false);
      setDocSearch('');
  }

  return (
    <>
      <button
        onClick={onToggle}
        className={`fixed bottom-8 right-8 z-50 h-16 w-16 bg-blue-600 rounded-full text-white flex items-center justify-center shadow-2xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 ${isOpen ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}
        aria-label={t('chatbot.toggle')}
      >
        <ChatBubbleOvalLeftEllipsisIcon className="h-8 w-8" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={onToggle}>
            <div
                className={`fixed bottom-8 right-8 z-50 w-[calc(100%-4rem)] max-w-lg h-[calc(100%-8rem)] max-h-[700px] transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                onClick={e => e.stopPropagation()}
            >
              <GlassCard className="w-full h-full flex flex-col p-0 overflow-hidden relative shadow-2xl">
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200">{t('chatbot.title')}</h3>
                    {contextDocument ? (
                        <div className="flex items-center space-x-1.5 text-xs text-green-700 dark:text-green-400 mt-1" title={contextDocument.name}>
                            <DocumentTextIcon className="h-4 w-4" />
                            <span className="truncate max-w-[200px] sm:max-w-xs">{t('chatbot.discussing')}: {contextDocument.name}</span>
                            <button onClick={() => onSetContext(null)} className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full"><XMarkIcon className="h-3 w-3"/></button>
                        </div>
                    ) : (
                        <button onClick={() => setIsDocSelectorOpen(true)} className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mt-1">
                            <PaperClipIcon className="h-4 w-4" />
                            <span>{t('chatbot.attachDocument')}</span>
                        </button>
                    )}
                  </div>
                  <button onClick={onToggle} className="p-1 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"><XMarkIcon className="h-6 w-6" /></button>
                </div>
                
                {isDocSelectorOpen ? (
                    <div className="absolute inset-0 bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm z-10 p-4 flex flex-col">
                        <div className="flex-shrink-0 mb-4">
                            <h4 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">{t('chatbot.selectDocument')}</h4>
                            <div className="relative">
                                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                                <input
                                  type="search"
                                  placeholder={t('chatbot.searchDocuments')}
                                  value={docSearch}
                                  onChange={(e) => setDocSearch(e.target.value)}
                                  className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg py-2 pl-10 pr-4 text-slate-800 dark:text-slate-200"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                          {filteredDocuments.map(doc => (
                              <div key={doc.id} onClick={() => handleSelectDoc(doc.id)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{doc.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{doc.owner}</p>
                              </div>
                          ))}
                        </div>
                        <div className="flex-shrink-0 pt-4 text-right">
                           <button onClick={() => setIsDocSelectorOpen(false)} className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200">{t('common.cancel')}</button>
                        </div>
                    </div>
                ) : (
                  <>
                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-900/50">
                      {history.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                          {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-sm">AI</div>}
                          <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl text-white ${msg.role === 'user' ? 'bg-blue-600 rounded-br-none' : 'bg-slate-600 rounded-bl-none'}`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                      ))}
                      {isResponding && (
                        <div className="flex items-start gap-3">
                           <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-sm">AI</div>
                           <div className="max-w-xs md:max-w-md px-4 py-2 rounded-2xl bg-slate-600 rounded-bl-none">
                              <div className="flex items-center space-x-1">
                                <span className="h-2 w-2 bg-white/50 rounded-full animate-bounce delay-0"></span>
                                <span className="h-2 w-2 bg-white/50 rounded-full animate-bounce delay-150"></span>
                                <span className="h-2 w-2 bg-white/50 rounded-full animate-bounce delay-300"></span>
                              </div>
                           </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-700">
                      <form onSubmit={handleSubmit} className="relative">
                        <input
                          type="text"
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          placeholder={t('chatbot.inputPlaceholder')}
                          className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg py-3 pl-4 pr-12 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" disabled={isResponding} className="absolute inset-y-0 right-0 px-4 text-blue-500 hover:text-blue-700 disabled:text-slate-400">
                          <PaperAirplaneIcon className="h-6 w-6" />
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </GlassCard>
            </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
