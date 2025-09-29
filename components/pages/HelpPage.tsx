

import React, { useState } from 'react';
import GlassCard from '../GlassCard';
import { MagnifyingGlassIcon, ChevronDownIcon } from '../Icon';
import { useTranslation } from '../../contexts/LanguageContext';

// FIX: Changed FAQItem to be a React.FC with an interface for props to correctly handle the 'key' prop in lists.
interface FAQItemProps {
    faq: { question: string, answer: string };
    isOpen: boolean;
    onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ faq, isOpen, onClick }) => (
    <div className="border-b border-slate-200 dark:border-slate-700">
        <button onClick={onClick} className="w-full flex justify-between items-center text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <span className="font-semibold text-lg text-slate-800 dark:text-slate-200">{faq.question}</span>
            <ChevronDownIcon className={`h-6 w-6 text-slate-500 dark:text-slate-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
            <p className="p-4 pt-0 text-slate-600 dark:text-slate-300">{faq.answer}</p>
        </div>
    </div>
);

const HelpPage = () => {
    const [openFAQ, setOpenFAQ] = useState<number | null>(0);
    const { t } = useTranslation();

    const faqs = [
      { question: t('helpPage.faqs.q1'), answer: t('helpPage.faqs.a1') },
      { question: t('helpPage.faqs.q2'), answer: t('helpPage.faqs.a2') },
      { question: t('helpPage.faqs.q3'), answer: t('helpPage.faqs.a3') },
      { question: t('helpPage.faqs.q4'), answer: t('helpPage.faqs.a4') },
      { question: t('helpPage.faqs.q5'), answer: t('helpPage.faqs.a5') },
      { question: t('helpPage.faqs.q6'), answer: t('helpPage.faqs.a6') },
      { question: t('helpPage.faqs.q7'), answer: t('helpPage.faqs.a7') },
      { question: t('helpPage.faqs.q8'), answer: t('helpPage.faqs.a8') },
      { question: t('helpPage.faqs.q9'), answer: t('helpPage.faqs.a9') },
      { question: t('helpPage.faqs.q10'), answer: t('helpPage.faqs.a10') },
      { question: t('helpPage.faqs.q11'), answer: t('helpPage.faqs.a11') },
    ];

    const toggleFAQ = (index: number) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };
    
    const handleSupportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(t('helpPage.support.submitSuccess'));
        // Here you would typically clear the form
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('helpPage.title')}</h2>
                <p className="text-slate-600 dark:text-slate-400">{t('helpPage.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <GlassCard className="p-6">
                        <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">{t('helpPage.faqTitle')}</h3>
                        <div className="space-y-2">
                           {faqs.map((faq, index) => (
                                <FAQItem 
                                    key={index}
                                    faq={faq}
                                    isOpen={openFAQ === index}
                                    onClick={() => toggleFAQ(index)}
                                />
                           ))}
                        </div>
                    </GlassCard>
                </div>

                <div className="space-y-8">
                    <GlassCard className="p-6">
                         <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">{t('helpPage.kb.title')}</h3>
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                              type="text"
                              placeholder={t('helpPage.kb.placeholder')}
                              className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg py-2 pl-10 pr-4 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </GlassCard>
                    <GlassCard className="p-6">
                         <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">{t('helpPage.support.title')}</h3>
                         <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{t('helpPage.support.subtitle')}</p>
                         <form className="space-y-4" onSubmit={handleSupportSubmit}>
                             <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 sr-only">{t('helpPage.support.subject')}</label>
                                <input type="text" placeholder={t('helpPage.support.subject')} required className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                             <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 sr-only">{t('helpPage.support.message')}</label>
                                <textarea placeholder={t('helpPage.support.message')} rows={4} required className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                            <button type="submit" className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                                {t('helpPage.support.submit')}
                            </button>
                         </form>
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

export default HelpPage;
