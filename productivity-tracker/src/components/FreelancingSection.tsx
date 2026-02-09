
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Laptop, Link as LinkIcon, Plus,
    Briefcase, User, Target, TrendingUp, CheckCircle2,
    Clock, ChevronRight, MoreVertical,
    ExternalLink, Shield, X,
    CheckSquare, Square
} from 'lucide-react';
import { THEME_CLASSES, LUXURY_ANIMATIONS } from '../utils/theme';
import { useContentProtection } from '../contexts/ContentProtectionContext';
import { checkUrl, checkKeywords } from '../services/contentFilter';

interface ExternalAccount {
    id: string;
    name: string;
    type: 'marketplace' | 'payment' | 'repo' | 'branding';
    url: string;
    strategyNotes: string;
}

interface Client {
    id: string;
    name: string;
    email?: string;
}

interface Milestone {
    id: string;
    text: string;
    completed: boolean;
}

interface Project {
    id: string;
    clientId: string;
    name: string;
    status: 'active' | 'completed' | 'on-hold';
    expectedRevenue: number;
    receivedRevenue: number;
    milestones: Milestone[];
    retro?: string;
    notes?: string;
    accountIds?: string[];
}

const ACCOUNT_TYPES: { id: ExternalAccount['type'], label: string, icon: typeof Briefcase }[] = [
    { id: 'marketplace', label: 'Marketplace', icon: Briefcase },
    { id: 'payment', label: 'Payment', icon: TrendingUp },
    { id: 'repo', label: 'Repository', icon: Laptop },
    { id: 'branding', label: 'Branding', icon: Target },
];

const FreelancingSection: React.FC = () => {
    const navigate = useNavigate();
    const { settings, logBlockedAttempt } = useContentProtection();
    const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'identity'>('overview');

    // State
    const [accounts, setAccounts] = useState<ExternalAccount[]>(() => {
        const saved = localStorage.getItem('freelance_accounts');
        return saved ? JSON.parse(saved) : [];
    });

    const [clients, setClients] = useState<Client[]>(() => {
        const saved = localStorage.getItem('freelance_clients');
        return saved ? JSON.parse(saved) : [];
    });

    const [projects, setProjects] = useState<Project[]>(() => {
        const saved = localStorage.getItem('freelance_projects');
        return saved ? JSON.parse(saved) : [];
    });

    // Modal States
    const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
    const [isAddClientOpen, setIsAddClientOpen] = useState(false);
    const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Save to LocalStorage
    useEffect(() => {
        localStorage.setItem('freelance_accounts', JSON.stringify(accounts));
    }, [accounts]);

    useEffect(() => {
        localStorage.setItem('freelance_clients', JSON.stringify(clients));
    }, [clients]);

    useEffect(() => {
        localStorage.setItem('freelance_projects', JSON.stringify(projects));
    }, [projects]);

    const handleBack = () => navigate('/dashboard');

    const addAccount = (account: Omit<ExternalAccount, 'id'>) => {
        const newAccount = { ...account, id: Date.now().toString() };
        setAccounts([...accounts, newAccount]);
        setIsAddAccountOpen(false);
    };

    const addClient = (client: Omit<Client, 'id'>) => {
        const newClient = { ...client, id: Date.now().toString() };
        setClients([...clients, newClient]);
        setIsAddClientOpen(false);
    };

    const addProject = (project: Omit<Project, 'id' | 'status' | 'milestones' | 'receivedRevenue'>) => {
        const newProject: Project = {
            ...project,
            id: Date.now().toString(),
            status: 'active',
            milestones: [],
            receivedRevenue: 0
        };
        setProjects([...projects, newProject]);
        setIsAddProjectOpen(false);
    };

    const toggleMilestone = (projectId: string, milestoneId: string) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                return {
                    ...p,
                    milestones: p.milestones.map(m =>
                        m.id === milestoneId ? { ...m, completed: !m.completed } : m
                    )
                };
            }
            return p;
        }));
    };

    const addMilestone = (projectId: string, text: string) => {
        if (!text.trim()) return;
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                return {
                    ...p,
                    milestones: [...p.milestones, { id: Date.now().toString(), text, completed: false }]
                };
            }
            return p;
        }));
    };

    const updateProjectStatus = (projectId: string, status: Project['status'], retro?: string, receivedRevenue?: number, notes?: string, accountIds?: string[]) => {
        setProjects(prev => prev.map(p =>
            p.id === projectId ? {
                ...p,
                status,
                retro: retro !== undefined ? retro : p.retro,
                receivedRevenue: receivedRevenue !== undefined ? receivedRevenue : p.receivedRevenue,
                notes: notes !== undefined ? notes : p.notes,
                accountIds: accountIds !== undefined ? accountIds : p.accountIds
            } : p
        ));
    };

    return (
        <div className={`min-h-screen ${THEME_CLASSES.BG_PRIMARY} pb-24 font-sans`}>
            {/* Header */}
            <header className="sticky top-0 z-30 px-6 py-6 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={handleBack} className="p-2 -ml-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-black tracking-tight text-heading-light dark:text-text-dark">Freelancing OS</h1>
                    <div className="w-10"></div>
                </div>

                <div className="flex gap-1 p-1 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark">
                    {(['overview', 'projects', 'identity'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === tab
                                ? 'bg-accent text-white-smoke shadow-glow'
                                : 'text-subtext-light dark:text-subtext-dark hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            <main className="px-6 py-8 max-w-md mx-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            variants={LUXURY_ANIMATIONS.fadeIn}
                            initial="initial"
                            animate="animate"
                            exit="initial"
                            className="space-y-8"
                        >
                            {/* Revenue Stats */}
                            <section className="grid grid-cols-2 gap-4">
                                <div className={`${THEME_CLASSES.CARD} p-5`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-accent/10 rounded-lg">
                                            <TrendingUp className="w-5 h-5 text-accent" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-subtext-light dark:text-subtext-dark mb-1">Expected</p>
                                    <h3 className="text-2xl font-black text-heading-light dark:text-text-dark">
                                        ${projects.filter(p => p.status === 'active').reduce((acc, p) => acc + p.expectedRevenue, 0).toLocaleString()}
                                    </h3>
                                </div>
                                <div className={`${THEME_CLASSES.CARD} p-5`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-green-500/10 rounded-lg">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-subtext-light dark:text-subtext-dark mb-1">Received</p>
                                    <h3 className="text-2xl font-black text-heading-light dark:text-text-dark">
                                        ${projects.reduce((acc, p) => acc + p.receivedRevenue, 0).toLocaleString()}
                                    </h3>
                                </div>
                            </section>

                            {/* Active Milestones */}
                            <section>
                                <h2 className="text-xs font-black uppercase tracking-widest text-subtext-light dark:text-subtext-dark mb-4">Focus Today</h2>
                                <div className="space-y-3">
                                    {projects.filter(p => p.status === 'active').flatMap(p =>
                                        p.milestones.filter(m => !m.completed).map(m => ({ ...m, projectName: p.name, projectId: p.id }))
                                    ).length === 0 ? (
                                        <div className="text-center py-10 text-subtext-light dark:text-subtext-dark text-sm bg-surface-light dark:bg-surface-dark rounded-2xl border border-dashed border-border-light dark:border-border-dark">
                                            No active milestones. Rest or plan.
                                        </div>
                                    ) : (
                                        projects.filter(p => p.status === 'active').flatMap(p =>
                                            p.milestones.filter(m => !m.completed).slice(0, 3).map(m => (
                                                <div key={m.id} className="flex items-center gap-4 p-4 bg-white dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-soft">
                                                    <button onClick={() => toggleMilestone(p.id, m.id)} className="text-accent">
                                                        <Square className="w-6 h-6" />
                                                    </button>
                                                    <div>
                                                        <p className="font-bold text-sm text-heading-light dark:text-text-dark">{m.text}</p>
                                                        <p className="text-[10px] font-medium text-subtext-light dark:text-subtext-dark uppercase">{p.name}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )
                                    )}
                                </div>
                            </section>

                            {/* Recent Reflections */}
                            <section>
                                <h2 className="text-xs font-black uppercase tracking-widest text-subtext-light dark:text-subtext-dark mb-4">Leverage & Learning</h2>
                                <div className="space-y-3">
                                    {projects.filter(p => p.retro).slice(0, 2).map(p => (
                                        <div key={p.id} className="p-4 bg-accent/5 rounded-2xl border border-accent/10 italic text-sm text-subtext-light dark:text-subtext-dark">
                                            "{p.retro}"
                                            <p className="not-italic font-bold text-[10px] mt-2 text-accent uppercase">— {p.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeTab === 'projects' && (
                        <motion.div
                            key="projects"
                            variants={LUXURY_ANIMATIONS.fadeIn}
                            initial="initial"
                            animate="animate"
                            exit="initial"
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-xs font-black uppercase tracking-widest text-subtext-light dark:text-subtext-dark">Active Engagements</h2>
                                <button onClick={() => setIsAddProjectOpen(true)} className="flex items-center gap-1 text-xs font-bold text-accent">
                                    <Plus className="w-4 h-4" /> New Project
                                </button>
                            </div>

                            <div className="space-y-4">
                                {projects.filter(p => p.status === 'active').map(project => (
                                    <div
                                        key={project.id}
                                        onClick={() => setSelectedProject(project)}
                                        className={`${THEME_CLASSES.CARD} p-5 cursor-pointer`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">
                                                    {clients.find(c => c.id === project.clientId)?.name}
                                                </p>
                                                <h3 className="font-bold text-lg text-heading-light dark:text-text-dark">{project.name}</h3>
                                            </div>
                                            <div className="p-2 bg-accent/10 rounded-lg text-accent">
                                                <Target className="w-5 h-5" />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-light dark:border-border-dark">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-subtext-light dark:text-subtext-dark" />
                                                <span className="text-xs font-bold text-subtext-light dark:text-subtext-dark">
                                                    {project.milestones.filter(m => m.completed).length}/{project.milestones.length} Milestones
                                                </span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-subtext-light dark:text-subtext-dark" />
                                        </div>
                                    </div>
                                ))}
                                {projects.filter(p => p.status === 'active').length === 0 && (
                                    <div className="text-center py-20 bg-surface-light dark:bg-surface-dark rounded-3xl border border-dashed border-border-light dark:border-border-dark">
                                        <p className="text-sm font-bold text-subtext-light dark:text-subtext-dark">No active projects.</p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-8">
                                <h2 className="text-xs font-black uppercase tracking-widest text-subtext-light dark:text-subtext-dark mb-4">Clients</h2>
                                <div className="space-y-3">
                                    {clients.map(client => (
                                        <div key={client.id} className="flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center text-accent">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <span className="font-bold text-sm">{client.name}</span>
                                            </div>
                                            <MoreVertical className="w-4 h-4 text-subtext-light dark:text-subtext-dark" />
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setIsAddClientOpen(true)}
                                        className="w-full py-4 rounded-xl border border-dashed border-border-light dark:border-border-dark text-xs font-bold text-subtext-light dark:text-subtext-dark hover:border-accent transition-all"
                                    >
                                        + Add New Client
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'identity' && (
                        <motion.div
                            key="identity"
                            variants={LUXURY_ANIMATIONS.fadeIn}
                            initial="initial"
                            animate="animate"
                            exit="initial"
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-black text-heading-light dark:text-text-dark">External Accounts</h2>
                                    <p className="text-xs font-medium text-subtext-light dark:text-subtext-dark mt-1">Reputation & Strategy Linkage</p>
                                </div>
                                <button onClick={() => setIsAddAccountOpen(true)} className="p-3 bg-accent text-white-smoke rounded-xl shadow-glow active:scale-95 transition-all">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {accounts.map(acc => {
                                    const TypeIcon = ACCOUNT_TYPES.find(t => t.id === acc.type)?.icon || LinkIcon;
                                    return (
                                        <div key={acc.id} className={`${THEME_CLASSES.CARD} p-5 group`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                                                        <TypeIcon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-heading-light dark:text-text-dark">{acc.name}</h3>
                                                        <p className="text-[10px] font-bold text-accent uppercase tracking-widest">{acc.type}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (settings.protectionLevel !== 'off') {
                                                            const protectionResult = checkUrl(acc.url, settings.protectionLevel, settings.customBlockedDomains);
                                                            if (protectionResult.blocked) {
                                                                alert(`Access Blocked: ${protectionResult.reason}`);
                                                                logBlockedAttempt(acc.url, undefined, protectionResult.reason);
                                                                return;
                                                            }
                                                        }
                                                        window.open(acc.url, '_blank');
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                                                >
                                                    <ExternalLink className="w-4 h-4 text-subtext-light dark:text-subtext-dark" />
                                                </button>
                                            </div>

                                            {acc.strategyNotes && (
                                                <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Shield className="w-3 h-3 text-accent" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-accent">Strategy Note</span>
                                                    </div>
                                                    <p className="text-xs text-subtext-light dark:text-subtext-dark leading-relaxed">
                                                        {acc.strategyNotes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {accounts.length === 0 && (
                                    <div className="text-center py-20 bg-surface-light dark:bg-surface-dark rounded-3xl border border-dashed border-border-light dark:border-border-dark">
                                        <LinkIcon className="w-10 h-10 text-accent/20 mx-auto mb-4" />
                                        <p className="text-sm font-bold text-subtext-light dark:text-subtext-dark">No accounts linked yet.</p>
                                        <p className="text-[10px] text-subtext-light max-w-[200px] mx-auto mt-2">Link your marketplaces, repos, and payment profiles for a holistic view.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Modals & Detail Views */}
            <AnimatePresence>
                {isAddAccountOpen && (
                    <AccountModal onClose={() => setIsAddAccountOpen(false)} onSave={addAccount} />
                )}
                {isAddClientOpen && (
                    <ClientModal onClose={() => setIsAddClientOpen(false)} onSave={addClient} />
                )}
                {isAddProjectOpen && (
                    <ProjectModal clients={clients} accounts={accounts} onClose={() => setIsAddProjectOpen(false)} onSave={addProject} />
                )}
                {selectedProject && (
                    <ProjectDetailModal
                        project={selectedProject}
                        clients={clients}
                        accounts={accounts}
                        onClose={() => setSelectedProject(null)}
                        onToggleMilestone={toggleMilestone}
                        onAddMilestone={addMilestone}
                        onUpdateStatus={updateProjectStatus}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// Sub-components (Modals)
const AccountModal: React.FC<{ onClose: () => void, onSave: (acc: Omit<ExternalAccount, 'id'>) => void }> = ({ onClose, onSave }) => {
    const { settings, logBlockedAttempt } = useContentProtection();
    const [name, setName] = useState('');
    const [type, setType] = useState<ExternalAccount['type']>('marketplace');
    const [url, setUrl] = useState('');
    const [notes, setNotes] = useState('');

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-10"
        >
            <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                className="w-full max-w-md bg-white dark:bg-surface-dark rounded-[2.5rem] p-8 shadow-luxury"
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-heading-light dark:text-text-dark">Link Account</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"><X /></button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-subtext-light mb-2 block">Platform Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="e.g. Upwork, GitHub" className={`w-full p-4 ${THEME_CLASSES.INPUT}`} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-subtext-light mb-2 block">Account Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {ACCOUNT_TYPES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setType(t.id)}
                                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${type === t.id ? 'bg-accent text-white border-accent' : 'border-border-light dark:border-border-dark text-subtext-light'}`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-subtext-light mb-2 block">Profile URL</label>
                        <input value={url} onChange={e => setUrl(e.target.value)} type="text" placeholder="https://..." className={`w-full p-4 ${THEME_CLASSES.INPUT}`} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-subtext-light mb-2 block">Strategy Note</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="What's your goal here?" className={`w-full p-4 ${THEME_CLASSES.INPUT} h-24 resize-none`} />
                    </div>

                    <button
                        onClick={() => {
                            if (settings.protectionLevel !== 'off') {
                                // Check Keywords in Name and Notes
                                const nameResult = checkKeywords(name, settings.protectionLevel, settings.customBlockedKeywords);
                                const notesResult = checkKeywords(notes, settings.protectionLevel, settings.customBlockedKeywords);
                                if (nameResult.blocked) {
                                    alert(`Content Blocked: ${nameResult.reason}`);
                                    logBlockedAttempt(undefined, name, nameResult.reason);
                                    return;
                                }
                                if (notesResult.blocked) {
                                    alert(`Content Blocked: ${notesResult.reason}`);
                                    logBlockedAttempt(undefined, notes, notesResult.reason);
                                    return;
                                }

                                // Check URL
                                const urlResult = checkUrl(url, settings.protectionLevel, settings.customBlockedDomains);
                                if (urlResult.blocked) {
                                    alert(`URL Blocked: ${urlResult.reason}`);
                                    logBlockedAttempt(url, undefined, urlResult.reason);
                                    return;
                                }
                            }
                            onSave({ name, type, url, strategyNotes: notes });
                        }}
                        className={`w-full py-5 rounded-2xl font-black ${THEME_CLASSES.BTN_PRIMARY}`}
                    >
                        Save Identity
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const ClientModal: React.FC<{ onClose: () => void, onSave: (c: Omit<Client, 'id'>) => void }> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-[2.5rem] p-8"
            >
                <h2 className="text-xl font-black mb-6">New Client</h2>
                <div className="space-y-4">
                    <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Client Name" className={`w-full p-4 ${THEME_CLASSES.INPUT}`} />
                    <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email (Optional)" className={`w-full p-4 ${THEME_CLASSES.INPUT}`} />
                    <div className="flex gap-3 pt-4">
                        <button onClick={onClose} className="flex-1 py-4 font-bold text-subtext-light">Cancel</button>
                        <button onClick={() => onSave({ name, email })} className={`flex-2 px-8 py-4 rounded-xl font-black ${THEME_CLASSES.BTN_PRIMARY}`}>Create</button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const ProjectModal: React.FC<{
    clients: Client[],
    accounts: ExternalAccount[],
    onClose: () => void,
    onSave: (p: Omit<Project, 'id' | 'status' | 'milestones' | 'receivedRevenue'>) => void
}> = ({ clients, accounts, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [clientId, setClientId] = useState(clients[0]?.id || '');
    const [revenue, setRevenue] = useState<number>(0);
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-10"
        >
            <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                className="w-full max-w-md bg-white dark:bg-surface-dark rounded-[2.5rem] p-8"
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black">New Engagement</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-subtext-light mb-2 block">Project Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="e.g. Design System Refactor" className={`w-full p-4 ${THEME_CLASSES.INPUT}`} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-subtext-light mb-2 block">Client</label>
                        <select value={clientId} onChange={e => setClientId(e.target.value)} className={`w-full p-4 ${THEME_CLASSES.INPUT} appearance-none`}>
                            <option value="">Select a client</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-subtext-light mb-2 block">Expected Revenue ($)</label>
                        <input value={revenue} onChange={e => setRevenue(Number(e.target.value))} type="number" placeholder="0.00" className={`w-full p-4 ${THEME_CLASSES.INPUT}`} />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-subtext-light mb-3 block">Link External Accounts</label>
                        <div className="flex flex-wrap gap-2">
                            {accounts.map(acc => (
                                <button
                                    key={acc.id}
                                    onClick={() => setSelectedAccounts(prev => prev.includes(acc.id) ? prev.filter(id => id !== acc.id) : [...prev, acc.id])}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${selectedAccounts.includes(acc.id) ? 'bg-accent text-white' : 'bg-black/5 dark:bg-white/5 text-subtext-light'}`}
                                >
                                    {acc.name}
                                </button>
                            ))}
                            {accounts.length === 0 && <p className="text-[10px] text-subtext-light italic">No accounts linked yet.</p>}
                        </div>
                    </div>

                    <button
                        onClick={() => onSave({ name, clientId, expectedRevenue: revenue, accountIds: selectedAccounts })}
                        className={`w-full py-5 rounded-2xl font-black ${THEME_CLASSES.BTN_PRIMARY}`}
                    >
                        Start Project
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const ProjectDetailModal: React.FC<{
    project: Project,
    clients: Client[],
    accounts: ExternalAccount[],
    onClose: () => void,
    onToggleMilestone: (pId: string, mId: string) => void,
    onAddMilestone: (pId: string, text: string) => void,
    onUpdateStatus: (pId: string, status: Project['status'], retro?: string, receivedRevenue?: number, notes?: string, accountIds?: string[]) => void
}> = ({ project, clients, accounts, onClose, onToggleMilestone, onAddMilestone, onUpdateStatus }) => {
    const [newMilestone, setNewMilestone] = useState('');
    const [isCompleting, setIsCompleting] = useState(false);
    const [retro, setRetro] = useState('');
    const [receivedRevenue, setReceivedRevenue] = useState(project.expectedRevenue);
    const [projectNotes, setProjectNotes] = useState(project.notes || '');
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>(project.accountIds || []);

    const client = clients.find(c => c.id === project.clientId);

    if (isCompleting) {
        return (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl px-6"
            >
                <div className="w-full max-w-sm text-white-smoke text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-black mb-2">Delivery Reached</h2>
                    <div className="mb-6 text-left">
                        <label className="text-[10px] font-black uppercase tracking-widest text-silver mb-2 block">Revenue Received ($)</label>
                        <input
                            type="number"
                            value={receivedRevenue}
                            onChange={e => setReceivedRevenue(Number(e.target.value))}
                            className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white-smoke outline-none focus:border-accent"
                        />
                    </div>

                    <div className="mb-6 text-left">
                        <label className="text-[10px] font-black uppercase tracking-widest text-silver mb-2 block">Retrospective Lesson</label>
                        <textarea
                            value={retro}
                            onChange={e => setRetro(e.target.value)}
                            placeholder="What went well? What would you change next time?"
                            className="w-full h-32 p-4 bg-white/10 border border-white/20 rounded-2xl text-white-smoke outline-none focus:border-accent resize-none"
                        />
                    </div>

                    <button
                        onClick={() => {
                            onUpdateStatus(project.id, 'completed', retro, receivedRevenue);
                            onClose();
                        }}
                        className={`w-full py-5 rounded-2xl font-black ${THEME_CLASSES.BTN_PRIMARY}`}
                    >
                        Finalize & Archive
                    </button>
                    <button onClick={() => setIsCompleting(false)} className="mt-4 text-silver font-bold">Nevermind</button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
        >
            <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                className="w-full max-w-md h-[90vh] bg-white dark:bg-surface-dark rounded-t-[3rem] overflow-hidden flex flex-col shadow-luxury"
            >
                <div className="p-8 pb-4">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">{client?.name}</p>
                            <h2 className="text-2xl font-black text-heading-light dark:text-text-dark">{project.name}</h2>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"><X /></button>
                    </div>

                    <div className="flex gap-4 p-4 bg-black/5 dark:bg-white/5 rounded-2xl">
                        <div className="flex-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-subtext-light mb-1">Status</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                                <span className="text-xs font-bold uppercase tracking-widest text-accent">{project.status}</span>
                            </div>
                        </div>
                        <div className="flex-1 border-l border-border-light dark:border-border-dark pl-4">
                            <p className="text-[9px] font-black uppercase tracking-widest text-subtext-light mb-1">Comp.</p>
                            <p className="text-sm font-black text-heading-light dark:text-text-dark">
                                {Math.round((project.milestones.filter(m => m.completed).length / (project.milestones.length || 1)) * 100)}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-8">
                    {/* Milestones SECTION */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-subtext-light">Milestones</h3>
                            <span className="text-[10px] font-bold text-accent">{project.milestones.length} Total</span>
                        </div>

                        <div className="space-y-3">
                            {project.milestones.map(m => (
                                <div key={m.id} className="flex items-center gap-3 p-4 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark">
                                    <button onClick={() => onToggleMilestone(project.id, m.id)} className="text-accent">
                                        {m.completed ? <CheckSquare className="w-5 h-5 shadow-glow rounded" /> : <Square className="w-5 h-5 text-subtext-light" />}
                                    </button>
                                    <span className={`text-sm font-medium ${m.completed ? 'text-subtext-light line-through' : 'text-heading-light dark:text-text-dark'}`}>
                                        {m.text}
                                    </span>
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <input
                                    value={newMilestone}
                                    onChange={e => setNewMilestone(e.target.value)}
                                    placeholder="Add next step..."
                                    className={`flex-1 p-3 text-sm ${THEME_CLASSES.INPUT}`}
                                    onKeyDown={e => { if (e.key === 'Enter') { onAddMilestone(project.id, newMilestone); setNewMilestone(''); } }}
                                />
                                <button
                                    onClick={() => { onAddMilestone(project.id, newMilestone); setNewMilestone(''); }}
                                    className="p-3 bg-accent text-white rounded-xl shadow-soft"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Communication & Scope Notes */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-subtext-light">Scope & Notes</h3>
                            <button
                                onClick={() => onUpdateStatus(project.id, project.status, undefined, undefined, projectNotes)}
                                className="text-[10px] font-bold text-accent px-2 py-1 bg-accent/5 rounded-lg"
                            >
                                Save Notes
                            </button>
                        </div>
                        <textarea
                            value={projectNotes}
                            onChange={e => setProjectNotes(e.target.value)}
                            placeholder="Current scope, important links, or client preferences..."
                            className={`w-full h-32 p-4 text-sm ${THEME_CLASSES.INPUT} resize-none`}
                        />
                    </section>

                    {/* Financial Summary */}
                    <section>
                        <h3 className="text-xs font-black uppercase tracking-widest text-subtext-light mb-4">Finance</h3>
                        <div className="p-5 bg-green-500/5 border border-green-500/10 rounded-2xl flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase text-green-600 mb-1">Expected Revenue</p>
                                <p className="text-xl font-black text-green-700">${project.expectedRevenue.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-green-500 text-white rounded-xl">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                    </section>

                    {/* Linked IDENTITY */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-subtext-light">Linked Identity</h3>
                            <button
                                onClick={() => onUpdateStatus(project.id, project.status, undefined, undefined, undefined, selectedAccounts)}
                                className="text-[10px] font-bold text-accent px-2 py-1 bg-accent/5 rounded-lg"
                            >
                                Update Links
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {accounts.map(acc => (
                                <button
                                    key={acc.id}
                                    onClick={() => setSelectedAccounts(prev => prev.includes(acc.id) ? prev.filter(id => id !== acc.id) : [...prev, acc.id])}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${selectedAccounts.includes(acc.id) ? 'bg-accent text-white shadow-glow' : 'bg-black/5 dark:bg-white/5 text-subtext-light'}`}
                                >
                                    {acc.name}
                                </button>
                            ))}
                            {accounts.length === 0 && <p className="text-[10px] text-subtext-light italic">No accounts linked. Go to Identity OS to add some.</p>}
                        </div>
                    </section>
                </div>

                <div className="p-8 pt-4 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark">
                    <button
                        onClick={() => setIsCompleting(true)}
                        className={`w-full py-5 rounded-2xl font-black flex items-center justify-center gap-3 ${THEME_CLASSES.BTN_PRIMARY}`}
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        Complete Project
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default FreelancingSection;
