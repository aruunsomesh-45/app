
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users, Plus, ArrowLeft, MessageSquare, Target, Zap,
    ChevronRight, X, UserPlus, Heart, Send,
    Repeat, Filter, Link, DollarSign
} from 'lucide-react';
import { THEME_CLASSES, LUXURY_ANIMATIONS } from '../utils/theme';
import { useLifeTracker } from '../utils/lifeTrackerStore';
import type {
    NetworkingConnection,
    NetworkingOutcomeType,
    ConnectionOutcome,
    RelationshipRetrospective
} from '../utils/lifeTrackerStore';

const NetworkingSection: React.FC = () => {
    const navigate = useNavigate();
    const store = useLifeTracker();
    const { networking } = store.getState();
    const { connections, reusableAssets } = networking;

    const [activeTab, setActiveTab] = useState<'connections' | 'nurture' | 'assets' | 'outcomes'>('connections');
    const [selectedConnection, setSelectedConnection] = useState<NetworkingConnection | null>(null);
    const [isAddConnectionOpen, setIsAddConnectionOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleBack = () => navigate('/dashboard');

    const addConnection = (conn: Omit<NetworkingConnection, 'id' | 'createdAt' | 'lastInteraction' | 'outcomes' | 'retrospectives'>) => {
        store.addNetworkingConnection(conn);
        setIsAddConnectionOpen(false);
    };


    const deleteConnection = (id: string) => {
        if (confirm('Are you sure you want to delete this connection?')) {
            store.deleteNetworkingConnection(id);
            if (selectedConnection?.id === id) setSelectedConnection(null);
        }
    };

    const filteredConnections = connections.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.platform?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`min-h-screen ${THEME_CLASSES.BG_PRIMARY} pb-24 font-sans`}>
            {/* Header */}
            <header className="sticky top-0 z-40 px-6 py-6 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={handleBack} className="p-2 -ml-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-black tracking-tight text-heading-light dark:text-text-dark">Connection OS</h1>
                    <button
                        onClick={() => setIsAddConnectionOpen(true)}
                        className="p-2 bg-accent/10 text-accent rounded-xl hover:bg-accent/20 transition-all"
                    >
                        <UserPlus className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex gap-1 p-1 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-x-auto no-scrollbar">
                    {(['connections', 'nurture', 'assets', 'outcomes'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === tab
                                ? 'bg-accent text-white shadow-glow'
                                : 'text-subtext-light dark:text-subtext-dark hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            <main className="px-6 py-8 pb-20 max-w-lg mx-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'connections' && (
                        <motion.div
                            key="connections"
                            variants={LUXURY_ANIMATIONS.fadeIn}
                            initial="initial"
                            animate="animate"
                            exit="initial"
                            className="space-y-6"
                        >
                            <div className="relative">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext-light opacity-50" />
                                <input
                                    type="text"
                                    placeholder="Search connections..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className={`w-full pl-12 pr-6 py-4 rounded-2xl ${THEME_CLASSES.INPUT} text-sm`}
                                />
                            </div>

                            <div className="grid gap-4">
                                {filteredConnections.map(conn => (
                                    <ConnectionCard
                                        key={conn.id}
                                        connection={conn}
                                        onClick={() => setSelectedConnection(conn)}
                                    />
                                ))}
                                {filteredConnections.length === 0 && (
                                    <div className="text-center py-20 bg-surface-light dark:bg-surface-dark rounded-[2.5rem] border border-dashed border-border-light dark:border-border-dark">
                                        <Users className="w-12 h-12 text-accent/20 mx-auto mb-4" />
                                        <p className="text-sm font-bold text-subtext-light dark:text-subtext-dark">No connections found.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'assets' && (
                        <motion.div
                            key="assets"
                            variants={LUXURY_ANIMATIONS.fadeIn}
                            initial="initial"
                            animate="animate"
                            exit="initial"
                        >
                            <ReusableAssetsView
                                assets={reusableAssets}
                                onAddStarter={(s) => store.addNetworkingStarter(s)}
                                onDeleteStarter={(i) => store.deleteNetworkingStarter(i)}
                                onAddTemplate={(t, c) => store.addNetworkingTemplate(t, c)}
                                onDeleteTemplate={(id) => store.deleteNetworkingTemplate(id)}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'outcomes' && (
                        <motion.div
                            key="outcomes"
                            variants={LUXURY_ANIMATIONS.fadeIn}
                            initial="initial"
                            animate="animate"
                            exit="initial"
                            className="space-y-6"
                        >
                            <OutcomesSummary connections={connections} />
                        </motion.div>
                    )}

                    {activeTab === 'nurture' && (
                        <motion.div
                            key="nurture"
                            variants={LUXURY_ANIMATIONS.fadeIn}
                            initial="initial"
                            animate="animate"
                            exit="initial"
                            className="space-y-6"
                        >
                            <NurtureWaitlist connections={connections} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <AnimatePresence>
                {isAddConnectionOpen && (
                    <AddConnectionModal
                        onClose={() => setIsAddConnectionOpen(false)}
                        onSave={addConnection}
                    />
                )}
                {selectedConnection && (
                    <ConnectionDetailModal
                        connection={selectedConnection}
                        onClose={() => setSelectedConnection(null)}
                        onUpdate={(updates) => store.updateNetworkingConnection(selectedConnection.id, updates)}
                        onDelete={() => deleteConnection(selectedConnection.id)}
                        onAddOutcome={(outcome) => store.addConnectionOutcome(selectedConnection.id, outcome)}
                        onAddRetro={(retro) => store.addRelationshipRetrospective(selectedConnection.id, retro)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Sub-components ---

const ConnectionCard: React.FC<{ connection: NetworkingConnection, onClick: () => void }> = ({ connection, onClick }) => (
    <motion.div
        whileHover={{ y: -2 }}
        onClick={onClick}
        className={`${THEME_CLASSES.CARD} p-5 cursor-pointer flex items-center justify-between group`}
    >
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white ${connection.status === 'active' ? 'bg-green-500 shadow-glow-green' :
                connection.status === 'nurturing' ? 'bg-accent shadow-glow' :
                    'bg-gray-400'
                }`}>
                {connection.name.charAt(0)}
            </div>
            <div>
                <h3 className="font-bold text-heading-light dark:text-text-dark">{connection.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black uppercase text-accent tracking-widest">{connection.platform || 'General'}</span>
                    <span className="w-1 h-1 rounded-full bg-border-light dark:bg-border-dark" />
                    <span className="text-[9px] font-bold text-subtext-light">Trust: {connection.trustScore}/10</span>
                </div>
            </div>
        </div>
        <ChevronRight className="w-5 h-5 text-subtext-light group-hover:translate-x-1 transition-transform" />
    </motion.div>
);

const ReusableAssetsView: React.FC<{
    assets: {
        starters: string[],
        templates: any[] // Should be NetworkingTemplate but keeping any for now if not imported
    },
    onAddStarter: (s: string) => void,
    onDeleteStarter: (i: number) => void,
    onAddTemplate: (t: string, c: string) => void,
    onDeleteTemplate: (id: string) => void
}> = ({ assets, onAddStarter, onDeleteStarter, onAddTemplate, onDeleteTemplate }) => {
    const [newStarter, setNewStarter] = useState('');
    const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);

    return (
        <div className="space-y-8">
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-subtext-light dark:text-subtext-dark">Conversation Starters</h2>
                    <Zap className="w-4 h-4 text-accent" />
                </div>
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <input
                            value={newStarter}
                            onChange={e => setNewStarter(e.target.value)}
                            placeholder="Hook or context starter..."
                            className={`flex-1 p-4 ${THEME_CLASSES.INPUT} text-sm`}
                        />
                        <button
                            onClick={() => { if (newStarter) { onAddStarter(newStarter); setNewStarter(''); } }}
                            className="p-4 bg-accent text-white rounded-2xl"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    {assets.starters.map((starter: string, i: number) => (
                        <div key={i} className="group flex justify-between items-center p-4 bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark">
                            <p className="text-sm font-medium pr-4">{starter}</p>
                            <button onClick={() => onDeleteStarter(i)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-500">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-subtext-light dark:text-subtext-dark">DM Templates</h2>
                    <button onClick={() => setIsAddTemplateOpen(true)} className="p-2 bg-accent/10 text-accent rounded-lg">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                <div className="space-y-4">
                    {assets.templates.map((template: any) => (
                        <div key={template.id} className={`${THEME_CLASSES.CARD} p-5 relative group`}>
                            <button onClick={() => onDeleteTemplate(template.id)} className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <X className="w-4 h-4" />
                            </button>
                            <h4 className="font-bold mb-2">{template.title}</h4>
                            <p className="text-xs text-subtext-light whitespace-pre-wrap">{template.content}</p>
                        </div>
                    ))}
                </div>
            </section>

            {isAddTemplateOpen && (
                <AddTemplateModal
                    onClose={() => setIsAddTemplateOpen(false)}
                    onSave={(t, c) => { onAddTemplate(t, c); setIsAddTemplateOpen(false); }}
                />
            )}
        </div>
    );
};

const AddTemplateModal: React.FC<{ onClose: () => void, onSave: (t: string, c: string) => void }> = ({ onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-[2.5rem] p-8">
                <h2 className="text-xl font-black mb-6">New Template</h2>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (e.g. Follow-up)" className={`w-full p-4 mb-4 ${THEME_CLASSES.INPUT}`} />
                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content..." className={`w-full h-40 p-4 mb-6 ${THEME_CLASSES.INPUT} resize-none`} />
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-4 font-bold text-subtext-light">Cancel</button>
                    <button onClick={() => onSave(title, content)} className={`flex-2 px-8 py-4 rounded-xl font-black ${THEME_CLASSES.BTN_PRIMARY}`}>Save</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const OutcomesSummary: React.FC<{ connections: NetworkingConnection[] }> = ({ connections }) => {
    const allOutcomes = connections.flatMap(c => c.outcomes.map(o => ({ ...o, connectionName: c.name })));
    const sortedOutcomes = allOutcomes.sort((a, b) => b.date.localeCompare(a.date));

    const stats = {
        total: allOutcomes.length,
        leads: allOutcomes.filter(o => o.type === 'Freelancing Lead').length,
        referrals: allOutcomes.filter(o => o.type === 'Job Referral').length,
        collabs: allOutcomes.filter(o => o.type === 'Collaboration').length,
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
                {[
                    { label: 'Total Outcomes', value: stats.total, icon: Target, color: 'text-accent' },
                    { label: 'Leads', value: stats.leads, icon: DollarSign, color: 'text-green-500' },
                    { label: 'Referrals', value: stats.referrals, icon: Zap, color: 'text-yellow-500' },
                    { label: 'Collabs', value: stats.collabs, icon: Heart, color: 'text-pink-500' }
                ].map((stat, i) => (
                    <div key={i} className={`${THEME_CLASSES.CARD} p-5 flex flex-col justify-between h-32`}>
                        <div className="p-2 bg-surface-light dark:bg-surface-dark rounded-lg self-start">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-subtext-light tracking-widest">{stat.label}</p>
                            <h4 className="text-2xl font-black">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            <section>
                <h2 className="text-xs font-black uppercase tracking-widest text-subtext-light dark:text-subtext-dark mb-4">Outcome Feed</h2>
                <div className="space-y-4">
                    {sortedOutcomes.map((outcome) => (
                        <div key={outcome.id} className="p-5 bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark flex gap-4">
                            <div className="flex-none p-3 bg-accent/10 text-accent rounded-xl h-fit">
                                <ChevronRight className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-sm">{outcome.type}</h4>
                                    <span className="text-[10px] font-bold text-accent">via {outcome.connectionName}</span>
                                </div>
                                <p className="text-xs text-subtext-light leading-relaxed">{outcome.description}</p>
                                <span className="text-[9px] font-black text-subtext-light/50 uppercase mt-2 block">{new Date(outcome.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                    {sortedOutcomes.length === 0 && (
                        <p className="text-center py-10 text-xs text-subtext-light italic">No outcomes recorded yet. Focus on building trust.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

const NurtureWaitlist: React.FC<{ connections: NetworkingConnection[] }> = ({ connections }) => {
    const nurtureList = connections
        .filter(c => c.status === 'nurturing' || c.status === 'dormant')
        .sort((a, b) => a.lastInteraction.localeCompare(b.lastInteraction));

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-black mb-2">Waitlist Mastery</h2>
                <p className="text-xs text-subtext-light">Connections requiring a touchpoint.</p>
            </header>
            <div className="space-y-4">
                {nurtureList.map(conn => (
                    <div key={conn.id} className={`${THEME_CLASSES.CARD} p-5 flex items-center justify-between`}>
                        <div className="flex gap-4 items-center">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold">
                                {conn.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">{conn.name}</h4>
                                <p className="text-[10px] text-subtext-light">Last: {new Date(conn.lastInteraction).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <button className="p-3 bg-accent text-white rounded-xl shadow-glow">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {nurtureList.length === 0 && (
                    <div className="text-center py-20 opacity-50">
                        <Repeat className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-sm font-bold">Waitlist is empty.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const AddConnectionModal: React.FC<{ onClose: () => void, onSave: (c: Omit<NetworkingConnection, 'id' | 'createdAt' | 'lastInteraction' | 'outcomes' | 'retrospectives'>) => void }> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [platform, setPlatform] = useState('');
    const [status, setStatus] = useState<NetworkingConnection['status']>('nurturing');
    const [trustScore, setTrustScore] = useState(5);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-10">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="w-full max-w-md bg-white dark:bg-surface-dark rounded-[2.5rem] p-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black">Add Connection</h2>
                    <button onClick={onClose} className="p-2"><X /></button>
                </div>
                <div className="space-y-5">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className={`w-full p-4 ${THEME_CLASSES.INPUT}`} />
                    <input value={platform} onChange={e => setPlatform(e.target.value)} placeholder="Platform (e.g. Twitter, LinkedIn)" className={`w-full p-4 ${THEME_CLASSES.INPUT}`} />
                    <select value={status} onChange={e => setStatus(e.target.value as any)} className={`w-full p-4 ${THEME_CLASSES.INPUT}`}>
                        <option value="active">Active Relationship</option>
                        <option value="nurturing">Nurturing</option>
                        <option value="lead">Lead/Prospect</option>
                        <option value="dormant">Dormant</option>
                    </select>
                    <div>
                        <label className="text-[10px] font-black uppercase text-subtext-light mb-2 block">Trust Baseline: {trustScore}/10</label>
                        <input type="range" min="1" max="10" value={trustScore} onChange={e => setTrustScore(parseInt(e.target.value))} className="w-full accent-accent" />
                    </div>
                    <button
                        onClick={() => onSave({ name, platform, status, trustScore, responsivenessScore: 5, mutualValueScore: 5, contextNotes: '', starters: [], dmTemplates: [] })}
                        className={`w-full py-5 mt-4 rounded-2xl font-black ${THEME_CLASSES.BTN_PRIMARY}`}
                    >
                        Index Connection
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const ConnectionDetailModal: React.FC<{
    connection: NetworkingConnection,
    onClose: () => void,
    onUpdate: (updates: Partial<NetworkingConnection>) => void,
    onDelete: () => void,
    onAddOutcome: (o: Omit<ConnectionOutcome, 'id'>) => void,
    onAddRetro: (r: Omit<RelationshipRetrospective, 'id'>) => void
}> = ({ connection, onClose, onUpdate, onDelete, onAddOutcome, onAddRetro }) => {
    const [isAddOutcomeOpen, setIsAddOutcomeOpen] = useState(false);
    const [isAddRetroOpen, setIsAddRetroOpen] = useState(false);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl px-4 py-8">
            <div className="w-full max-w-sm h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-black text-white-smoke uppercase tracking-广泛">{connection.status}</span>
                    <div className="flex gap-2">
                        <button onClick={() => { if (confirm('Delete connection?')) { onDelete(); onClose(); } }} className="text-red-400 p-2"><X /></button>
                        <button onClick={onClose} className="text-white-smoke p-2"><ChevronRight className="w-6 h-6 rotate-90" /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pb-12">
                    <header>
                        <h2 className="text-3xl font-black text-white-smoke mb-2">{connection.name}</h2>
                        <a href={connection.link} target="_blank" rel="noopener noreferrer" className="text-accent text-sm flex items-center gap-2">
                            <Link className="w-4 h-4" /> {connection.platform || 'Social Profile'}
                        </a>
                    </header>

                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label: 'Trust', val: connection.trustScore },
                            { label: 'Resp', val: connection.responsivenessScore },
                            { label: 'Value', val: connection.mutualValueScore }
                        ].map((s, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                                <p className="text-[8px] font-black uppercase text-subtext-dark mb-1">{s.label}</p>
                                <p className="text-lg font-black text-white-smoke">{s.val}</p>
                            </div>
                        ))}
                    </div>

                    <section className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-accent">Context & Notes</h3>
                        </div>
                        <textarea
                            value={connection.contextNotes}
                            onChange={e => onUpdate({ contextNotes: e.target.value })}
                            placeholder="How did you meet? What do they value?"
                            className="w-full h-32 p-5 bg-white/5 border border-white/10 rounded-3xl text-sm text-silver resize-none outline-none focus:border-accent transition-all"
                        />
                    </section>

                    <section className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-accent">Outcomes</h3>
                            <button onClick={() => setIsAddOutcomeOpen(true)} className="p-1.5 bg-accent/20 text-accent rounded-lg">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {connection.outcomes.map(o => (
                                <div key={o.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                    <p className="text-[10px] font-black text-accent uppercase mb-1">{o.type}</p>
                                    <p className="text-xs text-white-smoke">{o.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-accent">Relationship Retros</h3>
                            <button onClick={() => setIsAddRetroOpen(true)} className="p-1.5 bg-accent/20 text-accent rounded-lg">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {connection.retrospectives.map(r => (
                                <div key={r.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl relative">
                                    <p className="text-[8px] font-black text-subtext-dark absolute top-4 right-4">{new Date(r.date).toLocaleDateString()}</p>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-[8px] font-black uppercase text-green-500">What Worked</p>
                                            <p className="text-[11px] text-white-smoke/80">{r.worked}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black uppercase text-red-400">What Felt Forced</p>
                                            <p className="text-[11px] text-white-smoke/80">{r.forced}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="pt-6 border-t border-white/10">
                    <button className="w-full py-5 bg-accent text-white rounded-2xl font-black shadow-glow flex items-center justify-center gap-3">
                        <MessageSquare className="w-5 h-5" /> Copy Template
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isAddOutcomeOpen && (
                    <AddOutcomeModal
                        onClose={() => setIsAddOutcomeOpen(false)}
                        onSave={(o) => { onAddOutcome(o); setIsAddOutcomeOpen(false); }}
                    />
                )}
                {isAddRetroOpen && (
                    <AddRetroModal
                        onClose={() => setIsAddRetroOpen(false)}
                        onSave={(r) => { onAddRetro(r); setIsAddRetroOpen(false); }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const AddOutcomeModal: React.FC<{ onClose: () => void, onSave: (o: Omit<ConnectionOutcome, 'id'>) => void }> = ({ onClose, onSave }) => {
    const [type, setType] = useState<NetworkingOutcomeType>('Freelancing Lead');
    const [desc, setDesc] = useState('');
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 px-4">
            <motion.div className="w-full max-w-sm bg-surface-dark rounded-[2.5rem] p-8 border border-white/10">
                <h3 className="text-xl font-black text-white-smoke mb-6">Record Outcome</h3>
                <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-4 mb-4 bg-white/5 border border-white/10 rounded-2xl text-white-smoke outline-none">
                    <option value="Freelancing Lead">Freelancing Lead</option>
                    <option value="Job Referral">Job Referral</option>
                    <option value="Collaboration">Collaboration</option>
                    <option value="Audience Growth">Audience Growth</option>
                    <option value="Other">Other</option>
                </select>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What happened? (e.g. Intro to CEO of X)" className="w-full h-32 p-4 mb-6 bg-white/5 border border-white/10 rounded-2xl text-white-smoke resize-none" />
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-4 font-bold text-subtext-dark">Cancel</button>
                    <button onClick={() => onSave({ type, description: desc, date: new Date().toISOString() })} className="flex-2 py-4 px-8 bg-accent text-white rounded-xl font-black shadow-glow">Record</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const AddRetroModal: React.FC<{ onClose: () => void, onSave: (r: Omit<RelationshipRetrospective, 'id'>) => void }> = ({ onClose, onSave }) => {
    const [worked, setWorked] = useState('');
    const [forced, setForced] = useState('');
    const [nextTime, setNextTime] = useState('');
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 px-4">
            <motion.div className="w-full max-w-sm bg-surface-dark rounded-[2.5rem] p-8 border border-white/10">
                <h3 className="text-xl font-black text-white-smoke mb-6">Interaction Review</h3>
                <div className="space-y-4 mb-6">
                    <textarea value={worked} onChange={e => setWorked(e.target.value)} placeholder="What worked well?" className="w-full h-24 p-4 bg-white/5 border border-white/10 rounded-2xl text-white-smoke resize-none" />
                    <textarea value={forced} onChange={e => setForced(e.target.value)} placeholder="What felt forced?" className="w-full h-24 p-4 bg-white/5 border border-white/10 rounded-2xl text-white-smoke resize-none" />
                    <textarea value={nextTime} onChange={e => setNextTime(e.target.value)} placeholder="Do differently next time?" className="w-full h-24 p-4 bg-white/5 border border-white/10 rounded-2xl text-white-smoke resize-none" />
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-4 font-bold text-subtext-dark">Cancel</button>
                    <button onClick={() => onSave({ worked, forced, nextTime, date: new Date().toISOString() })} className="flex-2 py-4 px-8 bg-accent text-white rounded-xl font-black shadow-glow">Save Review</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default NetworkingSection;
