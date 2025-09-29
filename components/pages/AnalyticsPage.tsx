
import React, { useMemo } from 'react';
import GlassCard from '../GlassCard';
import { ChartBarIcon, DocumentTextIcon, UsersIcon, ClockIcon, BriefcaseIcon, ShieldCheckIcon } from '../Icon';
import { Document, TeamMember } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';

interface AnalyticsPageProps {
    documents: Document[];
    teamMembers: TeamMember[];
}

// Chart Components (self-contained for clarity)
const DonutChart = ({ data, colors, title }: { data: { label: string, value: number }[], colors: string[], title: string }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    let cumulative = 0;
    const radius = 80;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h4 className="font-bold text-lg mb-4 text-slate-700 dark:text-slate-300">{title}</h4>
            <div className="relative w-48 h-48">
                <svg viewBox="0 0 200 200" className="transform -rotate-90" style={{filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))'}}>
                    <circle cx="100" cy="100" r={radius} fill="transparent" stroke="#e2e8f0" className="dark:stroke-slate-700" strokeWidth="20" />
                    {data.map((item, index) => {
                        const dashoffset = circumference - (cumulative / total) * circumference;
                        const dasharray = (item.value / total) * circumference;
                        cumulative += item.value;
                        return (
                            <circle
                                key={index}
                                cx="100"
                                cy="100"
                                r={radius}
                                fill="transparent"
                                stroke={colors[index % colors.length]}
                                strokeWidth="20"
                                strokeDasharray={`${dasharray} ${circumference}`}
                                strokeDashoffset={dashoffset}
                                strokeLinecap="round"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-800 dark:text-slate-200">{total}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">Total</span>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[index % colors.length] }}></span>
                        <span className="text-slate-600 dark:text-slate-300">{item.label}: <strong>{item.value}</strong></span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ documents, teamMembers }) => {
    const { t } = useTranslation();

    const colorPalette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
    const gradientPalette = [
        'linear-gradient(to top, #3b82f6, #60a5fa)',
        'linear-gradient(to top, #10b981, #34d399)',
        'linear-gradient(to top, #f59e0b, #fbbf24)',
        'linear-gradient(to top, #ef4444, #f87171)',
        'linear-gradient(to top, #8b5cf6, #a78bfa)',
        'linear-gradient(to top, #06b6d4, #22d3ee)',
        'linear-gradient(to top, #ec4899, #f472b6)',
    ];

    // Mock data for charts
    const docStatusData = [
        { label: 'Summarized', value: documents.filter(d => d.status === 'summarized').length },
        { label: 'New', value: documents.filter(d => d.status === 'new').length },
        { label: 'Under Review', value: 8 }, // Mocked
        { label: 'Error', value: documents.filter(d => d.status === 'error').length },
    ];

    const docsByDeptData = useMemo(() => {
        // NOTE: Using static data that reflects the mock document set.
        const data = [
            { label: 'Marketing', value: 7 },
            { label: 'Engineering', value: 4 },
            { label: 'Finance', value: 3 },
            { label: 'Compliance', value: 3 },
            { label: 'HR', value: 3 },
            { label: 'Legal', value: 3 },
            { label: 'IT', value: 2 },
            { label: 'Operations', value: 2 },
        ];
        return data.sort((a, b) => b.value - a.value).slice(0, 6);
    }, []);

    const workloadData = useMemo(() => {
        return teamMembers.map(member => ({
            label: member.name,
            value: member.documentsOwned
        })).sort((a,b) => b.value - a.value).slice(0, 10);
    }, [teamMembers]);

    const uploadsOverTime = [
        { label: 'Wk 1', value: 12 }, { label: 'Wk 2', value: 19 }, { label: 'Wk 3', value: 15 },
        { label: 'Wk 4', value: 25 }, { label: 'Wk 5', value: 22 }, { label: 'Wk 6', value: 30 },
        { label: 'Wk 7', value: 28 }
    ];

    const pendingByDeptData = [
        { label: 'Engineering', value: 5 }, { label: 'Marketing', value: 3 }, { label: 'Finance', value: 2 },
        { label: 'Compliance', value: 4 }, { label: 'HR', value: 1 }, { label: 'IT', value: 2 }
    ];

    const totalStorage = documents.reduce((acc, doc) => {
        const size = parseFloat(doc.size);
        if (doc.size.includes('MB')) return acc + size;
        if (doc.size.includes('KB')) return acc + size / 1024;
        return acc;
      }, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('analyticsPage.title')}</h2>
                <p className="text-slate-600 dark:text-slate-400">{t('analyticsPage.subtitle')}</p>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <GlassCard className="p-5 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg"><DocumentTextIcon className="h-7 w-7 text-blue-600 dark:text-blue-400" /></div>
                        <div>
                            <h3 className="font-semibold text-slate-500 dark:text-slate-400">{t('dashboard.totalDocuments')}</h3>
                            <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{documents.length}</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="p-5 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg"><UsersIcon className="h-7 w-7 text-green-600 dark:text-green-400" /></div>
                        <div>
                            <h3 className="font-semibold text-slate-500 dark:text-slate-400">{t('analyticsPage.totalUsers')}</h3>
                            <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{teamMembers.length}</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="p-5 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg"><ChartBarIcon className="h-7 w-7 text-yellow-600 dark:text-yellow-400" /></div>
                        <div>
                            <h3 className="font-semibold text-slate-500 dark:text-slate-400">{t('dashboard.storageUsed')}</h3>
                            <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{(totalStorage / 1024).toFixed(2)} GB</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="p-5 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50">
                     <div className="flex items-center space-x-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg"><ClockIcon className="h-7 w-7 text-red-600 dark:text-red-400" /></div>
                        <div>
                            <h3 className="font-semibold text-slate-500 dark:text-slate-400">Pending Reviews</h3>
                            <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{documents.filter(d => d.status === 'new').length}</p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard className="lg:col-span-2 p-6">
                    <h4 className="font-bold text-lg mb-4 text-slate-700 dark:text-slate-300">Department Activity & Insights</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Left Column: Leaderboard */}
                        <div>
                            <h5 className="font-semibold text-slate-600 dark:text-slate-300 mb-3">Department Leaderboard (by Documents)</h5>
                            <div className="space-y-4">
                                {docsByDeptData.map((dept, index) => (
                                    <div key={dept.label}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{dept.label}</span>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">{dept.value} docs</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full"
                                                style={{
                                                    width: `${(dept.value / docsByDeptData[0].value) * 100}%`,
                                                    backgroundImage: gradientPalette[index % gradientPalette.length]
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Right Column: Insights & Distribution */}
                        <div className="flex flex-col justify-between">
                            <div>
                                <h5 className="font-semibold text-slate-600 dark:text-slate-300 mb-3">Key Insights</h5>
                                <div className="space-y-3">
                                    <div className="flex items-start space-x-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <DocumentTextIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Top Contributor: Marketing</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Most documents created in the last 30 days.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <ShieldCheckIcon className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Highest Priority: Engineering</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Highest concentration of 'High' priority documents.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6">
                                <h5 className="font-semibold text-slate-600 dark:text-slate-300 mb-3">Doc Type Distribution (Overall)</h5>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm"><span className="text-slate-600 dark:text-slate-300">PDFs</span><span className="font-semibold">45%</span></div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{width: '45%'}}></div></div>
                                    <div className="flex justify-between text-sm"><span className="text-slate-600 dark:text-slate-300">DOCX</span><span className="font-semibold">30%</span></div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: '30%'}}></div></div>
                                    <div className="flex justify-between text-sm"><span className="text-slate-600 dark:text-slate-300">XLSX</span><span className="font-semibold">15%</span></div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{width: '15%'}}></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="lg:col-span-1 p-6 h-96">
                    <DonutChart data={docStatusData} colors={colorPalette} title="Document Status Overview" />
                </GlassCard>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <GlassCard className="lg:col-span-3 p-6 h-96">
                    <h4 className="font-bold text-lg mb-4 text-slate-700 dark:text-slate-300">Uploads Over Time (Last 7 Weeks)</h4>
                    <div className="h-72 w-full">
                        <svg width="100%" height="100%" viewBox="0 0 500 250">
                            {/* <!-- Grid lines --> */}
                            {[...Array(5)].map((_, i) => <line key={i} x1="0" y1={50 + i * 50} x2="500" y2={50 + i * 50} stroke="#e2e8f0" strokeWidth="1" className="dark:stroke-slate-700"/>)}
                             {/* <!-- Gradient for area --> */}
                             <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                             {/* <!-- Area --> */}
                             <path
                                fill="url(#areaGradient)"
                                d={`M25,250 ${uploadsOverTime.map((d, i) => `${25 + i * (450 / 6)} ${250 - (d.value / 35) * 225}`).join(' ')} L475,250 Z`}
                            />
                            {/* <!-- Line --> */}
                            <polyline
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="2"
                                points={uploadsOverTime.map((d, i) => `${25 + i * (450 / 6)} ${250 - (d.value / 35) * 225}`).join(' ')}
                            />
                            {/* <!-- Points --> */}
                            {uploadsOverTime.map((d, i) => <circle key={i} cx={25 + i * (450 / 6)} cy={250 - (d.value / 35) * 225} r="4" fill="#fff" className="dark:fill-slate-900" stroke="#3b82f6" strokeWidth="2" />)}
                             {/* <!-- Labels --> */}
                            {uploadsOverTime.map((d, i) => <text key={i} x={25 + i * (450 / 6)} y="270" textAnchor="middle" fontSize="12" className="axis-label">{d.label}</text>)}
                        </svg>
                    </div>
                </GlassCard>
                <GlassCard className="lg:col-span-2 p-6 h-96">
                     <h4 className="font-bold text-lg mb-4 text-slate-700 dark:text-slate-300">Workload Distribution (Top 10)</h4>
                     <div className="space-y-2 h-80 overflow-y-auto pr-2">
                        {workloadData.map((item, index) => (
                            <div key={index}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-600 dark:text-slate-300">{item.label}</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.value} docs</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                    <div className="h-2.5 rounded-full" style={{width: `${(item.value / (workloadData[0].value || 1)) * 100}%`, backgroundImage: gradientPalette[index % gradientPalette.length]}}></div>
                                </div>
                            </div>
                        ))}
                     </div>
                </GlassCard>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="p-6">
                    <h4 className="font-bold text-lg mb-4 text-slate-700 dark:text-slate-300">Pending Documents by Department</h4>
                     <div className="space-y-3">
                        {pendingByDeptData.map((item, index) => (
                             <div key={index} className="flex items-center">
                                 <span className="w-32 text-slate-600 dark:text-slate-300 text-sm">{item.label}</span>
                                 <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-5">
                                      <div className="h-5 rounded-full flex items-center justify-end px-2" style={{width: `${(item.value / Math.max(...pendingByDeptData.map(d => d.value))) * 100}%`, backgroundImage: gradientPalette[index % gradientPalette.length]}}>
                                        <span className="text-white text-xs font-bold">{item.value}</span>
                                      </div>
                                 </div>
                             </div>
                        ))}
                     </div>
                </GlassCard>
                 <GlassCard className="p-6">
                    <h4 className="font-bold text-lg mb-4 text-slate-700 dark:text-slate-300">Document Feedback Summary</h4>
                     <div className="grid grid-cols-3 gap-4 text-center">
                         <div>
                            <p className="text-4xl font-bold text-green-500 dark:text-green-400">128</p>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Positive</p>
                         </div>
                         <div>
                            <p className="text-4xl font-bold text-yellow-500 dark:text-yellow-400">42</p>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Needs Review</p>
                         </div>
                         <div>
                            <p className="text-4xl font-bold text-red-500 dark:text-red-400">9</p>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Rejected</p>
                         </div>
                     </div>
                     <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center space-x-3">
                        <ShieldCheckIcon className="h-6 w-6 text-blue-500 dark:text-blue-400"/>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Feedback is manually assigned during the review process.</p>
                     </div>
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
                .axis-label {
                    fill: #64748b;
                }
                html.dark .axis-label {
                    fill: #94a3b8; /* slate-400 */
                }
            `}</style>
        </div>
    );
};

export default AnalyticsPage;
