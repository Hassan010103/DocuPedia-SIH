
import React, { useState, useMemo } from 'react';
import { Document, TeamMember, TeamMemberRole, TeamMemberStatus } from '../../types';
import GlassCard from '../GlassCard';
import AddMemberModal from '../AddMemberModal';
import TeamMemberProfileModal from '../TeamMemberProfileModal';
import ConfirmationModal from '../ConfirmationModal';
import { useTranslation } from '../../contexts/LanguageContext';
import { 
    MagnifyingGlassIcon, UsersIcon, PlusIcon, Squares2X2Icon, 
    ListBulletIcon, BriefcaseIcon, ClockIcon, DocumentTextIcon 
} from '../Icon';

interface TeamsPageProps {
  teamMembers: TeamMember[];
  documents: Document[];
  onAddMember: (newMember: Omit<TeamMember, 'id' | 'status' | 'joinDate'>) => void;
  onUpdateMember: (updatedMember: TeamMember) => void;
  onDeleteMember: (memberId: string) => void;
}

type ActiveTab = 'members' | 'workload' | 'pending';

const TeamsPage: React.FC<TeamsPageProps> = ({ 
    teamMembers, documents, onAddMember, onUpdateMember, onDeleteMember 
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('members');
  const { t } = useTranslation();

  // Members Tab State
  // FIX: Corrected the type for `viewMode` to allow both 'grid' and 'list' values.
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [roleFilter, setRoleFilter] = useState<TeamMemberRole | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<TeamMemberStatus | 'All'>('All');
  
  // Workload Tab State
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  
  // Pending Tab State
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  // Common State
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState<TeamMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
  
  const roles: (TeamMemberRole | 'All')[] = ['All', 'Admin', 'Editor', 'Viewer'];
  const statuses: (TeamMemberStatus | 'All')[] = ['All', 'Active', 'Inactive', 'Invited'];
  
  const filteredMembers = useMemo(() => {
    return teamMembers
      .filter(member => roleFilter === 'All' || member.role === roleFilter)
      .filter(member => statusFilter === 'All' || member.status === statusFilter)
      .filter(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [teamMembers, searchQuery, roleFilter, statusFilter]);

  const pendingByTeam = useMemo(() => {
    const teamsMap: { [key: string]: Document[] } = {};
    documents.forEach(doc => {
        if (doc.status === 'new') {
            const owner = teamMembers.find(tm => tm.name === doc.owner);
            if (owner && owner.team) {
                if (!teamsMap[owner.team]) {
                    teamsMap[owner.team] = [];
                }
                teamsMap[owner.team].push(doc);
            }
        }
    });
    return Object.entries(teamsMap).sort((a,b) => b[1].length - a[1].length);
  }, [documents, teamMembers]);
  
  const memberWorkload = useMemo(() => {
    return teamMembers.map(member => {
      const assignedDocs = documents.filter(doc => doc.owner === member.name);
      const pendingCount = assignedDocs.filter(doc => doc.status === 'new' || doc.deadline).length;
      return { ...member, totalDocs: assignedDocs.length, pendingDocs: pendingCount, assignedDocs };
    }).sort((a, b) => b.totalDocs - a.totalDocs);
  }, [teamMembers, documents]);

  const getStatusStampClass = (status: TeamMember['status']) => {
    switch(status) {
        case 'Active': return 'stamp stamp-active';
        case 'Invited': return 'stamp stamp-invited';
        case 'Inactive': return 'stamp stamp-inactive';
    }
  }
  
  const handleDeleteConfirm = () => {
      if(deletingMember) {
          onDeleteMember(deletingMember.id);
          setDeletingMember(null);
      }
  }

  const roleLabels: { [key in TeamMemberRole | 'All']: string } = {
    'All': t('common.all'),
    'Admin': t('roles.admin'),
    'Editor': t('roles.editor'),
    'Viewer': t('roles.viewer'),
  };

  const statusLabels: { [key in TeamMemberStatus | 'All']: string } = {
    'All': t('common.all'),
    'Active': t('statuses.active'),
    'Inactive': t('statuses.inactive'),
    'Invited': t('statuses.invited'),
  };

  return (
    <>
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('teamsPage.title')}</h2>
            <p className="text-slate-600 dark:text-slate-400">{t('teamsPage.subtitle')}</p>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            <PlusIcon className="h-5 w-5" />
            <span>{t('teamsPage.addMember')}</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            <button onClick={() => setActiveTab('members')} className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold transition-colors ${activeTab === 'members' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}> <UsersIcon className="h-5 w-5"/> <span>{t('teamsPage.tabs.members')}</span></button>
            <button onClick={() => setActiveTab('workload')} className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold transition-colors ${activeTab === 'workload' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}> <BriefcaseIcon className="h-5 w-5"/> <span>{t('teamsPage.tabs.workload')}</span></button>
            <button onClick={() => setActiveTab('pending')} className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold transition-colors ${activeTab === 'pending' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}> <ClockIcon className="h-5 w-5"/> <span>{t('teamsPage.tabs.pending')}</span></button>
        </div>

        {activeTab === 'members' && (
             <GlassCard className="p-4">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4 p-2">
                     <div className="flex items-center gap-4">
                        <div>
                          <label className="text-xs text-slate-500 dark:text-slate-400">{t('common.role')}</label>
                          <select onChange={(e) => setRoleFilter(e.target.value as any)} value={roleFilter} className="bg-white dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg p-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            {roles.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 dark:text-slate-400">{t('common.status')}</label>
                          <select onChange={(e) => setStatusFilter(e.target.value as any)} value={statusFilter} className="bg-white dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg p-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                             {statuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                          </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-1 flex items-center">
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}><Squares2X2Icon className="h-5 w-5"/></button>
                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}><ListBulletIcon className="h-5 w-5"/></button>
                        </div>
                    </div>
                </div>
                 {viewMode === 'list' ? (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                    <th className="p-3 font-semibold text-sm text-slate-600 dark:text-slate-300">{t('common.name')}</th>
                                    <th className="p-3 font-semibold text-sm text-slate-600 dark:text-slate-300">{t('common.status')}</th>
                                    <th className="p-3 font-semibold text-sm text-slate-600 dark:text-slate-300">{t('common.role')}</th>
                                    <th className="p-3 font-semibold text-sm text-slate-600 dark:text-slate-300">{t('common.team')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.map((member) => (
                                    <tr key={member.id} onClick={() => setViewingMember(member)} className="border-b border-slate-200 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200 cursor-pointer">
                                        <td className="p-3 flex items-center space-x-3">
                                            <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full" />
                                            <div>
                                                <p className="font-medium text-slate-800 dark:text-slate-200">{member.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{member.email}</p>
                                            </div>
                                        </td>
                                        <td className="p-3 text-sm"><span className={getStatusStampClass(member.status)}>{statusLabels[member.status]}</span></td>
                                        <td className="p-3 text-sm text-slate-600 dark:text-slate-300">{roleLabels[member.role]}</td>
                                        <td className="p-3 text-sm text-slate-600 dark:text-slate-300">{member.team}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-2">
                        {filteredMembers.map(member => (
                            <GlassCard key={member.id} className="p-4 text-center cursor-pointer !transform-none" onClick={() => setViewingMember(member)}>
                                <img src={member.avatarUrl} alt={member.name} className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-slate-200 dark:border-slate-700"/>
                                <p className="font-bold text-lg text-slate-800 dark:text-slate-200">{member.name}</p>
                                <p className="text-sm text-blue-600 dark:text-blue-400">{roleLabels[member.role]}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{member.team}</p>
                                <div className="mt-3"><span className={getStatusStampClass(member.status)}>{statusLabels[member.status]}</span></div>
                            </GlassCard>
                        ))}
                    </div>
                 )}
            </GlassCard>
        )}
        
        {activeTab === 'workload' && (
            <GlassCard className="p-4 overflow-x-auto">
                 <table className="w-full text-left min-w-[700px]">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <th className="p-3 font-semibold text-sm w-2/5 text-slate-600 dark:text-slate-300">{t('teamsPage.headers.teamMember')}</th>
                            <th className="p-3 font-semibold text-sm text-slate-600 dark:text-slate-300">{t('teamsPage.headers.totalDocs')}</th>
                            <th className="p-3 font-semibold text-sm text-slate-600 dark:text-slate-300">{t('teamsPage.headers.pendingDocs')}</th>
                            <th className="p-3 font-semibold text-sm text-slate-600 dark:text-slate-300">{t('teamsPage.headers.workload')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {memberWorkload.map((member) => (
                            <React.Fragment key={member.id}>
                                <tr onClick={() => setExpandedMemberId(prev => prev === member.id ? null : member.id)} className="border-b border-slate-200 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200 cursor-pointer">
                                    <td className="p-3 flex items-center space-x-3">
                                        <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-slate-200">{member.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{roleLabels[member.role]}</p>
                                        </div>
                                    </td>
                                    <td className="p-3 text-lg font-semibold text-slate-700 dark:text-slate-300">{member.totalDocs}</td>
                                    <td className="p-3 text-lg font-semibold text-yellow-600 dark:text-yellow-400">{member.pendingDocs}</td>
                                    <td className="p-3">
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                          <div className="bg-blue-500 h-2.5 rounded-full" style={{width: `${member.totalDocs > 0 ? (member.totalDocs / Math.max(...memberWorkload.map(m => m.totalDocs))) * 100 : 0}%`}}></div>
                                        </div>
                                    </td>
                                </tr>
                                {expandedMemberId === member.id && (
                                    <tr className="bg-slate-50 dark:bg-slate-800/30">
                                        <td colSpan={4} className="p-4">
                                            <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-300">{t('teamsPage.memberDocs', { name: member.name })}</h4>
                                            {member.assignedDocs.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {member.assignedDocs.map(doc => (
                                                        <div key={doc.id} className="bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 p-2 rounded-md flex justify-between items-center">
                                                            <span className="truncate pr-4 text-sm text-slate-600 dark:text-slate-300">{doc.name}</span>
                                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${doc.status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'}`}>{doc.status}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{t('teamsPage.noDocs')}</p>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </GlassCard>
        )}
        
        {activeTab === 'pending' && (
            <div className="space-y-4">
                {pendingByTeam.map(([team, docs]) => (
                    <GlassCard key={team} className="p-4">
                        <button onClick={() => setExpandedTeam(prev => prev === team ? null : team)} className="w-full flex justify-between items-center text-left">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{team}</h3>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 rounded-full font-semibold">{t('teamsPage.pendingCount', { count: docs.length })}</span>
                        </button>
                        {expandedTeam === team && (
                             <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {docs.map(doc => (
                                    <div key={doc.id} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg flex items-center space-x-3 border border-slate-200 dark:border-slate-700">
                                        <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                        <div className="overflow-hidden">
                                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{doc.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('common.owner')}: {doc.owner}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </GlassCard>
                ))}
            </div>
        )}

      </div>
      {isAddModalOpen && <AddMemberModal onClose={() => setIsAddModalOpen(false)} onAddMember={onAddMember} />}
      {viewingMember && <TeamMemberProfileModal member={viewingMember} onUpdate={onUpdateMember} onDelete={() => {setViewingMember(null); setDeletingMember(viewingMember);}} onClose={() => setViewingMember(null)} />}
      {deletingMember && <ConfirmationModal title={t('teamsPage.deleteModal.title')} message={t('teamsPage.deleteModal.message', { name: deletingMember.name })} onConfirm={handleDeleteConfirm} onClose={() => setDeletingMember(null)} />}
       <style>{`
        select { color: #334155; }
        html.dark select { color: #e2e8f0; }
        select option { background-color: #ffffff; color: #334155; }
        html.dark select option { background-color: #1e293b; color: #e2e8f0; }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default TeamsPage;
