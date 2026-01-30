import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Plus, Zap, Brain, Sparkles, Target, TrendingUp, Palette, Link, Eraser,
    MousePointer2, Hand, Grid3X3, Edit3, Trash2, Bot, Cpu, Workflow, ZoomIn, ZoomOut,
    Loader2
} from 'lucide-react';
import { generateOpenAIContent } from '../services/openaiService';

// Types
interface CanvasBlock {
    id: string;
    x: number;
    y: number;
    title: string;
    description: string;
    note: string;
    icon: string;
    category: 'revenue' | 'efficiency' | 'creative' | 'automation';
    color: string;
}

interface Connection {
    id: string;
    from: string;
    to: string;
    style: 'straight' | 'curved' | 'step';
}

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
    'zap': <Zap className="w-5 h-5" />,
    'brain': <Brain className="w-5 h-5" />,
    'sparkles': <Sparkles className="w-5 h-5" />,
    'target': <Target className="w-5 h-5" />,
    'trending': <TrendingUp className="w-5 h-5" />,
    'palette': <Palette className="w-5 h-5" />,
    'bot': <Bot className="w-5 h-5" />,
    'cpu': <Cpu className="w-5 h-5" />,
    'workflow': <Workflow className="w-5 h-5" />,
};

// Category colors
const categoryColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    revenue: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-600', glow: 'shadow-emerald-200' },
    efficiency: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-600', glow: 'shadow-blue-200' },
    creative: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-600', glow: 'shadow-purple-200' },
    automation: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-600', glow: 'shadow-amber-200' },
};

interface AICanvasProps {
    onExit?: () => void;
}

const AICanvas: React.FC<AICanvasProps> = ({ onExit }) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [activeTool, setActiveTool] = useState<'pointer' | 'hand' | 'connect' | 'color' | 'edit' | 'delete'>('pointer');
    const [showGrid, setShowGrid] = useState(true);

    // State
    const [mode, setMode] = useState<'design' | 'view'>('design');
    const [blocks, setBlocks] = useState<CanvasBlock[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
    const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
    const [zoom, setZoom] = useState(0.85);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const connectionStyle = 'curved';
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingBlock, setEditingBlock] = useState<CanvasBlock | null>(null);

    // New block form state
    const [newBlockTitle, setNewBlockTitle] = useState('');
    const [newBlockDescription, setNewBlockDescription] = useState('');
    const [newBlockCategory, setNewBlockCategory] = useState<'revenue' | 'efficiency' | 'creative' | 'automation'>('efficiency');
    const [isBrainstorming, setIsBrainstorming] = useState(false);
    const [brainstormPrompt, setBrainstormPrompt] = useState('');
    const [showBrainstormModal, setShowBrainstormModal] = useState(false);

    // Load saved canvas data
    useEffect(() => {
        const savedData = localStorage.getItem('ai-canvas-data');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setBlocks(parsed.blocks || []);
            setConnections(parsed.connections || []);
        }
    }, []);

    // Save canvas data
    const saveCanvas = useCallback(() => {
        localStorage.setItem('ai-canvas-data', JSON.stringify({ blocks, connections }));
    }, [blocks, connections]);

    // Auto-save on changes
    useEffect(() => {
        saveCanvas();
    }, [blocks, connections, saveCanvas]);

    // Add new block
    const addBlock = () => {
        if (!newBlockTitle.trim()) return;

        const iconByCategory = {
            revenue: 'trending',
            efficiency: 'zap',
            creative: 'sparkles',
            automation: 'bot'
        };

        const newBlock: CanvasBlock = {
            id: 'block-' + Date.now(),
            x: -pan.x + 100 + Math.random() * 50,
            y: -pan.y + 100 + Math.random() * 50,
            title: newBlockTitle,
            description: newBlockDescription,
            note: '',
            icon: iconByCategory[newBlockCategory],
            category: newBlockCategory,
            color: categoryColors[newBlockCategory].text,
        };

        setBlocks([...blocks, newBlock]);
        setNewBlockTitle('');
        setNewBlockDescription('');
        setShowAddModal(false);
    };

    // Update block position
    const updateBlockPosition = (id: string, x: number, y: number) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, x, y } : b));
    };

    // Update block content
    const updateBlock = (id: string, updates: Partial<CanvasBlock>) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    // Delete block
    const deleteBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
        setConnections(connections.filter(c => c.from !== id && c.to !== id));
        setSelectedBlock(null);
    };

    // AI Brainstorming
    const handleBrainstorm = async () => {
        if (!brainstormPrompt.trim()) return;

        setIsBrainstorming(true);
        try {
            const context = blocks.map(b => `${b.title}: ${b.description}`).join('\n');
            const prompt = `Identify 3 logical next steps or missing components for this workflow:
            
            CURRENT WORKFLOW:
            ${context}
            
            USER REQUEST: ${brainstormPrompt}
            
            Return ONLY a JSON array of 3 objects with: "title", "description", and "category" (one of: revenue, efficiency, creative, automation).
            Example: [{"title": "Step 1", "description": "...", "category": "efficiency"}]`;

            const response = await generateOpenAIContent(prompt);
            const cleanedResponse = response?.replace(/```json|```/g, '').trim();
            interface BrainstormSuggestion {
                title: string;
                description: string;
                category: 'revenue' | 'efficiency' | 'creative' | 'automation';
            }

            const suggestions: BrainstormSuggestion[] = JSON.parse(cleanedResponse || '[]');

            const newBlocks: CanvasBlock[] = suggestions.map((s, i: number) => ({
                id: 'ai-block-' + Date.now() + i,
                x: -pan.x + 300 + (Math.random() * 200 - 100),
                y: -pan.y + 300 + (Math.random() * 200 - 100),
                title: s.title,
                description: s.description,
                note: 'Generated by AI',
                icon: s.category === 'revenue' ? 'trending' : s.category === 'automation' ? 'bot' : s.category === 'creative' ? 'sparkles' : 'zap',
                category: s.category,
                color: categoryColors[s.category]?.text || categoryColors.efficiency.text,
            }));

            setBlocks([...blocks, ...newBlocks]);
            setShowBrainstormModal(false);
            setBrainstormPrompt('');
        } catch (error) {
            console.error("Brainstorm Error:", error);
            alert("AI Brainstorming failed. Check console for details.");
        } finally {
            setIsBrainstorming(false);
        }
    };

    // Start connection
    const startConnection = (blockId: string) => {
        if (mode !== 'design') return;
        setConnectingFrom(blockId);
    };

    // Complete connection
    const completeConnection = (toBlockId: string) => {
        if (!connectingFrom || connectingFrom === toBlockId) {
            setConnectingFrom(null);
            return;
        }

        const exists = connections.some(c =>
            (c.from === connectingFrom && c.to === toBlockId) ||
            (c.from === toBlockId && c.to === connectingFrom)
        );

        if (!exists) {
            const newConnection: Connection = {
                id: 'conn-' + Date.now(),
                from: connectingFrom,
                to: toBlockId,
                style: connectionStyle,
            };
            setConnections([...connections, newConnection]);
        }

        setConnectingFrom(null);
    };

    // Delete connection
    const deleteConnection = (id: string) => {
        setConnections(connections.filter(c => c.id !== id));
    };

    // Get SVG path for connection
    const getConnectionPath = (from: CanvasBlock, to: CanvasBlock, style: string) => {
        const startX = from.x + 140;
        const startY = from.y + 50;
        const endX = to.x + 140;
        const endY = to.y + 50;

        const deltaX = endX - startX;

        switch (style) {
            case 'straight':
                return 'M ' + startX + ' ' + startY + ' L ' + endX + ' ' + endY;
            case 'curved': {
                const midX = (startX + endX) / 2;
                return 'M ' + startX + ' ' + startY + ' C ' + midX + ' ' + startY + ', ' + midX + ' ' + endY + ', ' + endX + ' ' + endY;
            }
            case 'step': {
                const stepX = startX + deltaX / 2;
                return 'M ' + startX + ' ' + startY + ' L ' + stepX + ' ' + startY + ' L ' + stepX + ' ' + endY + ' L ' + endX + ' ' + endY;
            }
            default:
                return 'M ' + startX + ' ' + startY + ' L ' + endX + ' ' + endY;
        }
    };

    // Tool based interactions
    const handleBlockClick = (blockId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const block = blocks.find(b => b.id === blockId);
        if (!block) return;

        if (activeTool === 'delete' || activeTool === 'pointer' && mode === 'view') { // Allow delete in tool mode
            if (activeTool === 'delete') deleteBlock(blockId);
        } else if (activeTool === 'edit') {
            setEditingBlock(block);
        } else if (activeTool === 'color') {
            const cats: CanvasBlock['category'][] = ['revenue', 'efficiency', 'creative', 'automation'];
            const nextCat = cats[(cats.indexOf(block.category) + 1) % 4];
            const iconMapHelper: Record<string, string> = { revenue: 'trending', efficiency: 'zap', creative: 'sparkles', automation: 'bot' };
            updateBlock(blockId, { category: nextCat, icon: iconMapHelper[nextCat], color: categoryColors[nextCat].text });
        } else if (activeTool === 'connect') {
            if (connectingFrom) {
                completeConnection(blockId);
            } else {
                setConnectingFrom(blockId);
            }
        } else {
            setSelectedBlock(blockId);
        }
    };

    // Handle canvas pan
    const handleMouseDown = (e: React.MouseEvent) => {
        if (activeTool === 'hand' || e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-bg')) {
            setIsPanning(true);
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            setSelectedBlock(null);
            if (activeTool === 'hand') return; // Hand tool doesn't deselect
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    return (
        <div className="relative w-full h-full bg-[#FAFAFA] overflow-hidden">
            {/* Exit / Back Button */}
            {onExit && (
                <button
                    onClick={onExit}
                    className="absolute top-6 left-6 z-50 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
            )}

            {/* Canvas Area */}
            <div
                ref={canvasRef}
                className={`absolute inset-0 touch-none ${activeTool === 'hand' ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
                style={{ height: '100%', width: '100%' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Grid Background */}
                {showGrid && (
                    <div
                        className="canvas-bg absolute inset-0 transition-opacity duration-300"
                        style={{
                            backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.3) 1px, transparent 1px)',
                            backgroundSize: (20 * zoom) + 'px ' + (20 * zoom) + 'px',
                            backgroundPosition: pan.x + 'px ' + pan.y + 'px',
                        }}
                    />
                )}

                {/* Canvas Content */}
                <div
                    className="absolute inset-0"
                    style={{
                        transform: 'translate(' + pan.x + 'px, ' + pan.y + 'px) scale(' + zoom + ')',
                        transformOrigin: '0 0',
                    }}
                >
                    {/* SVG Connections Layer */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                        <defs>
                            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#8B5CF6" />
                                <stop offset="100%" stopColor="#06B6D4" />
                            </linearGradient>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto" markerUnits="strokeWidth">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#8B5CF6" />
                            </marker>
                        </defs>

                        {connections.map((conn) => {
                            const fromBlock = blocks.find(b => b.id === conn.from);
                            const toBlock = blocks.find(b => b.id === conn.to);
                            if (!fromBlock || !toBlock) return null;

                            const path = getConnectionPath(fromBlock, toBlock, conn.style);

                            return (
                                <g key={conn.id} className="connection-group">
                                    <path d={path} fill="none" stroke="url(#connectionGradient)" strokeWidth="8" strokeOpacity="0.2" strokeLinecap="round" />
                                    <path d={path} fill="none" stroke="url(#connectionGradient)" strokeWidth="3" strokeLinecap="round" markerEnd="url(#arrowhead)" className="transition-all" />
                                    {mode === 'design' && (
                                        <g className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-100 transition-opacity" onClick={() => deleteConnection(conn.id)}>
                                            <circle cx={(fromBlock.x + toBlock.x) / 2 + 140} cy={(fromBlock.y + toBlock.y) / 2 + 50} r="12" fill="white" stroke="#EF4444" strokeWidth="2" />
                                            <text x={(fromBlock.x + toBlock.x) / 2 + 140} y={(fromBlock.y + toBlock.y) / 2 + 54} textAnchor="middle" fontSize="14" fill="#EF4444">×</text>
                                        </g>
                                    )}
                                </g>
                            );
                        })}
                    </svg>

                    {/* Render Blocks */}
                    {blocks.map((block) => (
                        <DraggableBlock
                            key={block.id}
                            block={block}
                            isSelected={selectedBlock === block.id}
                            isConnecting={connectingFrom === block.id}
                            mode={mode}
                            activeTool={activeTool}
                            categoryColors={categoryColors[block.category]}
                            iconElement={iconMap[block.icon] || <Zap className="w-5 h-5" />}
                            onSelect={(e) => handleBlockClick(block.id, e)}
                            onDragEnd={(x, y) => updateBlockPosition(block.id, x, y)}
                            onStartConnection={() => startConnection(block.id)}

                            onEdit={() => setEditingBlock(block)}
                            onDelete={() => deleteBlock(block.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Central Add Button */}
            {/* Dynamic Add Button (Center initially, then Bottom-Left) */}
            <button
                onClick={() => { setShowAddModal(true); }}
                className={`absolute z-50 rounded-full bg-violet-600 shadow-2xl shadow-violet-400/50 flex items-center justify-center text-white hover:scale-110 hover:bg-violet-700 transition-all duration-700 ease-in-out active:scale-95 group ${blocks.length === 0 ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20' : 'bottom-36 left-8 w-14 h-14'}`}
            >
                <Plus className={`transition-transform duration-300 ${blocks.length === 0 ? 'w-10 h-10 group-hover:rotate-90' : 'w-6 h-6'}`} />
            </button>

            {/* Premium Responsive Toolbar (Mini Canva Style) */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-6 md:top-1/2 md:-translate-y-1/2 flex md:flex-col items-center gap-3 p-2 bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl shadow-indigo-500/10 rounded-full md:rounded-2xl z-40 transition-all max-w-[90vw] overflow-x-auto no-scrollbar">

                {/* Tools */}
                <div className="flex md:flex-col gap-2 p-1 bg-slate-100/50 rounded-full md:rounded-xl">
                    <button
                        onClick={() => { setActiveTool('pointer'); setMode('design'); }}
                        className={`p-2.5 rounded-full md:rounded-lg transition-all group relative ${activeTool === 'pointer' && mode === 'design' ? 'bg-white shadow-lg text-violet-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Pointer Tool"
                    >
                        <MousePointer2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setActiveTool('hand')}
                        className={`p-2.5 rounded-full md:rounded-lg transition-all ${activeTool === 'hand' ? 'bg-white shadow-lg text-violet-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Hand Tool (Pan)"
                    >
                        <Hand className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setActiveTool('connect')}
                        className={`p-2.5 rounded-full md:rounded-lg transition-all ${activeTool === 'connect' ? 'bg-white shadow-lg text-violet-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Connect Tool"
                    >
                        <Link className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setActiveTool('color')}
                        className={`p-2.5 rounded-full md:rounded-lg transition-all ${activeTool === 'color' ? 'bg-white shadow-lg text-violet-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Color Tool"
                    >
                        <Palette className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setActiveTool('edit')}
                        className={`p-2.5 rounded-full md:rounded-lg transition-all ${activeTool === 'edit' ? 'bg-white shadow-lg text-violet-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Edit Tool"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setActiveTool('delete')}
                        className={`p-2.5 rounded-full md:rounded-lg transition-all ${activeTool === 'delete' ? 'bg-white shadow-lg text-red-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Delete Tool"
                    >
                        <Eraser className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={`p-2.5 rounded-full md:rounded-lg transition-all ${showGrid ? 'bg-white shadow-lg text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Toggle Grid"
                    >
                        <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setShowBrainstormModal(true)}
                        className={`p-2.5 rounded-full md:rounded-lg transition-all text-indigo-500 hover:bg-indigo-50`}
                        title="AI Brainstorm"
                    >
                        <Brain className="w-4 h-4" />
                    </button>
                </div>



                <div className="w-px h-6 md:w-6 md:h-px bg-slate-200/50 mx-1 md:mx-0"></div>

                {/* View Controls */}
                <div className="flex md:flex-col items-center gap-1">
                    <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><ZoomIn className="w-4 h-4" /></button>
                    <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><ZoomOut className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Add Block Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[2rem] shadow-2xl p-6 w-full max-w-sm border border-slate-100"
                        >
                            <h3 className="text-xl font-black italic text-slate-900 mb-6">New Node</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Title</label>
                                    <input value={newBlockTitle} onChange={e => setNewBlockTitle(e.target.value)} className="w-full h-12 bg-slate-50 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-500/20" placeholder="Node Name" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Description</label>
                                    <textarea value={newBlockDescription} onChange={e => setNewBlockDescription(e.target.value)} className="w-full h-20 bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-violet-500/20 resize-none" placeholder="Why this node?" />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Category</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {(['revenue', 'efficiency', 'creative', 'automation'] as const).map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setNewBlockCategory(cat)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${newBlockCategory === cat ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-400'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={addBlock} className="w-full h-12 bg-violet-600 text-white rounded-xl font-black uppercase tracking-widest text-xs mt-4 shadow-lg shadow-violet-200 hover:bg-violet-700 transition-colors">
                                    Create Node
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Block Modal */}
            <AnimatePresence>
                {editingBlock && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setEditingBlock(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[2rem] shadow-2xl p-6 w-full max-w-sm border border-slate-100"
                        >
                            <h3 className="text-xl font-black italic text-slate-900 mb-6">Edit Node</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Title</label>
                                    <input value={editingBlock.title} onChange={e => setEditingBlock({ ...editingBlock, title: e.target.value })} className="w-full h-12 bg-slate-50 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-500/20" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Description</label>
                                    <textarea value={editingBlock.description || ''} onChange={e => setEditingBlock({ ...editingBlock, description: e.target.value })} className="w-full h-20 bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-violet-500/20 resize-none" placeholder="Why this node?" />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button onClick={() => setEditingBlock(null)} className="flex-1 h-12 bg-slate-100 text-slate-500 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={() => { updateBlock(editingBlock.id, { title: editingBlock.title }); setEditingBlock(null); }} className="flex-1 h-12 bg-violet-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-violet-200 hover:bg-violet-700 transition-colors">
                                        Save
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Brainstorm Modal */}
            <AnimatePresence>
                {showBrainstormModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[60] bg-indigo-900/10 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setShowBrainstormModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-md border border-indigo-100"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-indigo-50 rounded-2xl">
                                    <Brain className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black italic text-slate-900 leading-none">AI Brainstorm</h3>
                                    <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mt-1">Powered by ChatGPT</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">What are we building?</label>
                                    <textarea
                                        value={brainstormPrompt}
                                        onChange={e => setBrainstormPrompt(e.target.value)}
                                        className="w-full h-32 bg-slate-50 rounded-2xl px-5 py-4 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 border border-slate-100 resize-none mt-2"
                                        placeholder="Describe your goal (e.g., 'A marketing funnel for a coffee shop' or 'An automated backup system')..."
                                    />
                                </div>

                                <button
                                    onClick={handleBrainstorm}
                                    disabled={isBrainstorming || !brainstormPrompt.trim()}
                                    className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isBrainstorming ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Architecting...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Generate Nodes
                                        </>
                                    )}
                                </button>

                                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                                    AI will analyze your current canvas and suggest 3 new components
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Draggable Block Component
interface DraggableBlockProps {
    block: CanvasBlock;
    isSelected: boolean;
    isConnecting: boolean;
    mode: 'design' | 'view';
    activeTool: string;
    categoryColors: { bg: string; border: string; text: string; glow: string };
    iconElement: React.ReactNode;
    onSelect: (e: React.MouseEvent) => void;
    onDragEnd: (x: number, y: number) => void;
    onStartConnection: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const DraggableBlock: React.FC<DraggableBlockProps> = ({
    block, isSelected, isConnecting, mode, activeTool, categoryColors, iconElement,
    onSelect, onDragEnd, onStartConnection, onEdit, onDelete
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: block.x, y: block.y });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const [prevPropsX, setPrevPropsX] = useState(block.x);
    const [prevPropsY, setPrevPropsY] = useState(block.y);

    if (!isDragging && (block.x !== prevPropsX || block.y !== prevPropsY)) {
        setPrevPropsX(block.x);
        setPrevPropsY(block.y);
        setPosition({ x: block.x, y: block.y });
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        if (mode !== 'design') return;
        if (activeTool !== 'pointer' && activeTool !== 'color') return; // Only drag in pointer/color mode
        e.stopPropagation();
        setIsDragging(true);
        setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
        onSelect(e);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        setPosition({ x: newX, y: newY });
    }, [isDragging, dragOffset]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            onDragEnd(position.x, position.y);
        }
    }, [isDragging, position, onDragEnd]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <motion.div
            className={`absolute w-[220px] md:w-[260px] rounded-2xl border-2 transition-shadow cursor-pointer ${categoryColors.bg} ${categoryColors.border} ${isSelected ? 'ring-4 ring-violet-200 shadow-xl' : 'shadow-md'} ${isDragging ? 'z-50 scale-105' : 'z-10'} ${isConnecting ? 'ring-4 ring-indigo-400 animate-pulse' : ''}`}
            style={{ left: position.x, top: position.y }}
            onMouseDown={handleMouseDown}
            onClick={(e) => { onSelect(e); }}
        >
            <div className="flex items-center gap-3 p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${categoryColors.bg} border ${categoryColors.border}`}>
                    {iconElement}
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{block.title}</h3>
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">{block.category}</p>
                    {block.description && (
                        <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">{block.description}</p>
                    )}
                </div>
            </div>
            {mode === 'design' && isSelected && activeTool === 'pointer' && (
                <div className="flex border-t border-slate-200/50 p-2 gap-2 bg-white/50 rounded-b-2xl backdrop-blur-sm">
                    <button onClick={(e) => { e.stopPropagation(); onStartConnection() }} className="flex-1 py-1.5 bg-violet-100 text-violet-700 text-[10px] font-black uppercase rounded-lg">Connect</button>
                    <button onClick={(e) => { e.stopPropagation(); onEdit() }} className="p-1.5 hover:bg-slate-200 rounded-lg"><Edit3 className="w-3 h-3 text-slate-500" /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete() }} className="p-1.5 hover:bg-red-100 rounded-lg"><Trash2 className="w-3 h-3 text-red-500" /></button>
                </div>
            )}

            {/* Connection Handles */}
            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-violet-400 rounded-full border-2 border-white" />
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-violet-400 rounded-full border-2 border-white" />
        </motion.div>
    );
};

export default AICanvas;
