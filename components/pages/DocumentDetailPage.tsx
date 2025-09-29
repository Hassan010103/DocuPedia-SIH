
import React, { useState, useEffect, useRef } from 'react';
import { Document, AIAnalysisResult, Annotation, TeamMember, TimelineEvent, User } from '../../types';
import GlassCard from '../GlassCard';
import KnowledgeGraph from '../KnowledgeGraph';
import { analyzeDocumentForDetailPage } from '../../services/geminiService';
import { useTranslation } from '../../contexts/LanguageContext';
import { 
    ArrowLeftIcon, ShieldCheckIcon, LightBulbIcon, SparklesIcon, CalendarDaysIcon, 
    PlusIcon, PencilIcon, ShareIcon, ArchiveBoxIcon, LinkIcon, PencilSquareIcon
} from '../Icon';
import DocumentContentViewer from '../DocumentContentViewer';
import { useTheme } from '../../contexts/ThemeContext';

interface DocumentDetailPageProps {
  document: Document;
  documents: Document[];
  onClose: () => void;
  onUpdateDocument: (document: Document) => void;
  onAddAnnotation: (docId: string, comment: string) => void;
  onViewDocument: (docId: string) => void;
  teamMembers: TeamMember[];
  currentUser: User;
}

const SignaturePad = ({ onSave }: { onSave: (signatureDataUrl: string) => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const { t } = useTranslation();
    const { theme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            const { width, height } = canvas.getBoundingClientRect();
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
                ctx.strokeStyle = theme === 'dark' ? '#cbd5e1' : '#334155'; // slate-300 vs slate-700
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
            }
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const getCoords = (event: MouseEvent | TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            let clientX, clientY;
            if (event instanceof MouseEvent) {
                clientX = event.clientX;
                clientY = event.clientY;
            } else if (event.touches.length > 0) {
                clientX = event.touches[0].clientX;
                clientY = event.touches[0].clientY;
            } else {
                return null;
            }
            return { x: clientX - rect.left, y: clientY - rect.top };
        };

        const startDrawing = (event: MouseEvent | TouchEvent) => {
            event.preventDefault();
            const coords = getCoords(event);
            if (!coords) return;
            ctx.beginPath();
            ctx.moveTo(coords.x, coords.y);
            setIsDrawing(true);
        };

        const draw = (event: MouseEvent | TouchEvent) => {
            if (!isDrawing) return;
            event.preventDefault();
            const coords = getCoords(event);
            if (!coords) return;
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
        };

        const stopDrawing = () => {
            if (isDrawing) {
                ctx.closePath();
                setIsDrawing(false);
            }
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseleave', stopDrawing);
            canvas.removeEventListener('touchstart', startDrawing);
            canvas.removeEventListener('touchmove', draw);
            canvas.removeEventListener('touchend', stopDrawing);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [isDrawing, theme]);

    const handleClear = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleSaveClick = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const pixelBuffer = new Uint32Array(canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
        if (!pixelBuffer.some(color => color !== 0)) {
            alert('Please provide a signature first.');
            return;
        }
        const dataUrl = canvas.toDataURL('image/png');
        onSave(dataUrl);
    };

    return (
        <div className="flex flex-col h-full min-h-[400px]">
            <canvas ref={canvasRef} className="w-full h-full bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 cursor-crosshair"></canvas>
            <div className="flex justify-end space-x-3 mt-4">
                <button onClick={handleClear} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded-lg font-semibold transition-colors">{t('common.cancel')}</button>
                <button onClick={handleSaveClick} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">{t('common.save')} Signature</button>
            </div>
        </div>
    );
};


const getTimelineStyle = (type: TimelineEvent['type']) => {
    switch(type) {
        case 'Created': return { icon: <PlusIcon className="h-4 w-4 text-green-600 dark:text-green-400" />, color: 'bg-green-100 dark:bg-green-900/50' };
        case 'Viewed': return { icon: <PencilIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />, color: 'bg-blue-100 dark:bg-blue-900/50' };
        case 'Edited': return { icon: <PencilIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />, color: 'bg-yellow-100 dark:bg-yellow-900/50' };
        case 'Shared': return { icon: <ShareIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />, color: 'bg-purple-100 dark:bg-purple-900/50' };
        case 'Summarized': return { icon: <SparklesIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />, color: 'bg-indigo-100 dark:bg-indigo-900/50' };
        case 'Archived': return { icon: <ArchiveBoxIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />, color: 'bg-slate-200 dark:bg-slate-700' };
        case 'Signed': return { icon: <PencilSquareIcon className="h-4 w-4 text-green-700 dark:text-green-300" />, color: 'bg-green-200 dark:bg-green-800/50' };
        default: return { icon: null, color: 'bg-slate-200 dark:bg-slate-700' };
    }
}

const DocumentDetailPage: React.FC<DocumentDetailPageProps> = ({ document, documents, onClose, onUpdateDocument, onAddAnnotation, onViewDocument, teamMembers, currentUser }) => {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'history' | 'journey' | 'graph' | 'sign'>('content');
  const [comment, setComment] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    const getAnalysis = async () => {
      setIsLoadingAi(true);
      const result = await analyzeDocumentForDetailPage(document.name, document.summary);
      setAiAnalysis(result);
      setIsLoadingAi(false);
    };
    getAnalysis();
  }, [document.id]);
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
        onAddAnnotation(document.id, comment.trim());
        setComment('');
    }
  };

  const handleSaveSignature = (signatureDataUrl: string) => {
    if (!currentUser) return;

    const newTimelineEvent: TimelineEvent = {
        type: 'Signed',
        user: currentUser.name,
        timestamp: new Date().toISOString(),
        details: 'Document signed digitally.'
    };

    const updatedDoc: Document = {
        ...document,
        signature: signatureDataUrl,
        timeline: [...document.timeline, newTimelineEvent]
    };

    onUpdateDocument(updatedDoc);
  };

  const getAuthenticityColor = (score: number) => {
    if (score > 85) return 'text-green-600 dark:text-green-400';
    if (score > 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };
  
  const sortedTimeline = [...document.timeline].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // FIX: Changed TabButton to be a React.FC with an interface for props to correctly handle children props.
  interface TabButtonProps {
      isActive: boolean;
      onClick: () => void;
      children: React.ReactNode;
  }
  const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
            isActive 
            ? 'bg-white dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 border-t border-l border-r rounded-t-lg -mb-px text-blue-600 dark:text-blue-400' 
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-t-lg'
        }`}
    >
        {children}
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <button onClick={onClose} className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-4">
          <ArrowLeftIcon className="h-5 w-5" />
          <span>{t('docDetail.back')}</span>
        </button>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{document.name}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t('common.owner')}: {document.owner} &middot; {t('docDetail.uploaded')}: {new Date(document.uploadedAt).toLocaleString()}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-0 flex flex-col">
                 <div className="flex-shrink-0 px-4 pt-2 border-b border-slate-200 dark:border-slate-700 flex space-x-1 overflow-x-auto">
                    <TabButton isActive={activeTab === 'content'} onClick={() => setActiveTab('content')}><span>{t('docDetail.tabs.view')}</span></TabButton>
                    <TabButton isActive={activeTab === 'history'} onClick={() => setActiveTab('history')}><span>{t('docDetail.tabs.history')}</span></TabButton>
                    <TabButton isActive={activeTab === 'journey'} onClick={() => setActiveTab('journey')}><span>{t('docDetail.tabs.journey')}</span></TabButton>
                    <TabButton isActive={activeTab === 'graph'} onClick={() => setActiveTab('graph')}><LinkIcon className="h-4 w-4"/><span>{t('docDetail.tabs.graph')}</span></TabButton>
                    <TabButton isActive={activeTab === 'sign'} onClick={() => setActiveTab('sign')}><PencilSquareIcon className="h-4 w-4"/><span>Sign</span></TabButton>
                </div>
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-b-lg min-h-[450px]">
                    {activeTab === 'content' ? (
                        <div className="bg-slate-100 dark:bg-slate-900/50 min-h-[450px] flex items-center justify-center border-t-0 rounded-b-lg overflow-hidden">
                            <DocumentContentViewer document={document} />
                        </div>
                    ) : activeTab === 'history' ? (
                        <div className="p-4 space-y-4 max-h-[450px] overflow-y-auto">
                            {document.versions?.map((v, i) => (
                                <div key={i} className="flex items-start space-x-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-semibold">{v.version}</div>
                                        { i < document.versions!.length - 1 && <div className="w-px h-12 bg-slate-300 dark:bg-slate-600"></div> }
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">{v.change}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('docDetail.versionByOn', { editor: v.editor, date: new Date(v.date).toLocaleDateString() })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : activeTab === 'journey' ? (
                        <div className="p-4 max-h-[450px] overflow-y-auto timeline-container">
                            {sortedTimeline.length > 0 ? (
                            <div className="relative pr-2">
                                <div className="absolute top-0 left-4 w-px h-full bg-slate-300 dark:bg-slate-600 -translate-x-1/2 z-0"></div>
                
                                <div className="space-y-6">
                                    {sortedTimeline.map((event, index) => {
                                    const { icon, color } = getTimelineStyle(event.type);
                                    
                                    return (
                                        <div key={index} className="relative flex items-start space-x-4">
                                        <div className={`relative z-10 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${color}`}>
                                            {icon}
                                        </div>
                                        
                                        <div className="pt-0.5 flex-grow">
                                            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{t(`timeline.${event.type.toLowerCase()}`, {defaultValue: event.type})} by {event.user}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {new Date(event.timestamp).toLocaleString(undefined, { 
                                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                            })}
                                            </p>
                                            {event.details && (
                                            <p className="text-xs text-blue-700/80 dark:text-blue-300/80 italic mt-1 bg-slate-100 dark:bg-slate-700/50 p-1.5 rounded-md border border-slate-200 dark:border-slate-600">
                                                "{event.details}"
                                            </p>
                                            )}
                                        </div>
                                        </div>
                                    );
                                    })}
                                </div>
                            </div>
                            ) : (
                            <p className="text-center text-slate-500 dark:text-slate-400 py-4">{t('docDetail.noHistory')}</p>
                            )}
                        </div>
                    ) : activeTab === 'graph' ? (
                        <KnowledgeGraph 
                            centerDocument={document}
                            allDocuments={documents}
                            allTeamMembers={teamMembers}
                            onNodeClick={onViewDocument}
                        />
                    ) : activeTab === 'sign' ? (
                        <div className="p-4">
                            {document.signature ? (
                                <div className="text-center">
                                    <h4 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-200">Document Signed</h4>
                                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600 inline-block">
                                        <img src={document.signature} alt="Digital Signature" className="h-24 object-contain" />
                                    </div>
                                    {(() => {
                                        const signatureEvent = sortedTimeline.find(e => e.type === 'Signed');
                                        if (signatureEvent) {
                                            return (
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                                    Signed by <strong>{signatureEvent.user}</strong> on {new Date(signatureEvent.timestamp).toLocaleString()}
                                                </p>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
                            ) : (
                                <SignaturePad onSave={handleSaveSignature} />
                            )}
                        </div>
                    ) : null}
                </div>
            </GlassCard>
            <GlassCard className="p-6">
                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">{t('docDetail.annotations.title')}</h3>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-4">
                    {(document.annotations || []).map(ann => (
                        <div key={ann.id} className="flex items-start space-x-3">
                            <img src={ann.user.avatarUrl} alt={ann.user.name} className="w-8 h-8 rounded-full" />
                            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg flex-1">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{ann.user.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(ann.timestamp).toLocaleTimeString()}</p>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 mt-1">{ann.text}</p>
                            </div>
                        </div>
                    ))}
                    {(!document.annotations || document.annotations.length === 0) && (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-4">{t('docDetail.annotations.none')}</p>
                    )}
                </div>
                <form onSubmit={handleCommentSubmit} className="flex space-x-3">
                    <input type="text" value={comment} onChange={e => setComment(e.target.value)} placeholder={t('docDetail.annotations.placeholder')} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">{t('common.send')}</button>
                </form>
            </GlassCard>
        </div>

        <GlassCard className="lg:col-span-1 p-6 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
             {isLoadingAi ? (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center text-slate-500 dark:text-slate-400">
                         <SparklesIcon className="h-8 w-8 text-blue-500 dark:text-blue-400 mx-auto mb-2 animate-pulse" />
                         <p className="font-semibold">{t('docDetail.ai.loading')}</p>
                    </div>
                </div>
             ) : aiAnalysis && (
                <>
                    <div>
                        <h4 className="flex items-center text-lg font-bold mb-2 text-slate-800 dark:text-slate-200"><ShieldCheckIcon className="h-5 w-5 mr-2 text-green-500 dark:text-green-400"/> {t('docDetail.ai.authenticity')}</h4>
                        <div className="text-center bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                            <p className={`text-3xl font-bold ${getAuthenticityColor(aiAnalysis.authenticity.score)}`}>{aiAnalysis.authenticity.score}%</p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{t('docDetail.ai.likelyAuthentic')}</p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{aiAnalysis.authenticity.reasoning}</p>
                    </div>
                     <div>
                        <h4 className="flex items-center text-lg font-bold mb-2 text-slate-800 dark:text-slate-200"><SparklesIcon className="h-5 w-5 mr-2 text-purple-500 dark:text-purple-400"/> {t('docDetail.ai.summary')}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">{aiAnalysis.summary}</p>
                    </div>
                     <div>
                        <h4 className="flex items-center text-lg font-bold mb-2 text-slate-800 dark:text-slate-200"><LightBulbIcon className="h-5 w-5 mr-2 text-yellow-500 dark:text-yellow-400"/> {t('docDetail.ai.keyPoints')}</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300 pl-2">
                            {aiAnalysis.keyPoints.map((pt, i) => <li key={i}>{pt}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="flex items-center text-lg font-bold mb-2 text-slate-800 dark:text-slate-200"><LightBulbIcon className="h-5 w-5 mr-2 text-yellow-500 dark:text-yellow-400"/> {t('docDetail.ai.actions')}</h4>
                        <div className="space-y-3">
                            {aiAnalysis.suggestedActions.map((act, i) => (
                                <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">{act.action} <span className="text-blue-600 dark:text-blue-400">{act.target}</span></p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{act.reasoning}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h4 className="flex items-center text-lg font-bold mb-2 text-slate-800 dark:text-slate-200"><CalendarDaysIcon className="h-5 w-5 mr-2 text-cyan-500 dark:text-cyan-400"/> {t('docDetail.ai.reminders')}</h4>
                        {aiAnalysis.reminders.length > 0 ? (
                             <div className="space-y-3">
                                {aiAnalysis.reminders.map((rem, i) => (
                                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">{rem.description}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('docDetail.ai.suggestedDate')}: {rem.date}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <p className="text-sm text-slate-500 dark:text-slate-400">{t('docDetail.ai.noReminders')}</p>
                        )}
                    </div>
                </>
             )}
        </GlassCard>
      </div>
       <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
        /* Custom scrollbar for timeline popover */
        .timeline-container::-webkit-scrollbar {
          width: 4px;
        }
        .timeline-container::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        html.dark .timeline-container::-webkit-scrollbar-track {
            background: #1e293b;
        }
        .timeline-container::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 10px;
        }
        .timeline-container::-webkit-scrollbar-thumb:hover {
            background: #64748b;
        }
      `}</style>
    </div>
  );
};

export default DocumentDetailPage;
