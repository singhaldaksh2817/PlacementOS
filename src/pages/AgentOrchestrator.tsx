import { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import TopBar from '../components/layout/TopBar';
import { motion } from 'framer-motion';
import { Cpu, Play, CheckCircle, HelpCircle, Activity, Sparkles, Terminal } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

// ─── React Flow Node Custom Styling ──────────────────────────────────────────
const nodeStyle = {
  background: 'rgba(15, 15, 26, 0.85)',
  color: '#f0f0ff',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  padding: '12px 18px',
  fontSize: '12px',
  fontFamily: 'Outfit, sans-serif',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
  backdropFilter: 'blur(10px)',
  width: 220,
};

const initialNodes = [
  {
    id: 'user-input',
    type: 'input',
    data: { label: '👤 User Target Profile' },
    position: { x: 30, y: 150 },
    style: {
      ...nodeStyle,
      borderColor: 'rgba(99, 102, 241, 0.5)',
      boxShadow: '0 0 15px rgba(99, 102, 241, 0.25)',
    },
  },
  {
    id: 'roadmap-agent',
    data: { label: '🗺️ Roadmap Agent (LangGraph)' },
    position: { x: 280, y: 150 },
    style: nodeStyle,
  },
  {
    id: 'dsa-agent',
    data: { label: '💻 DSA Coding Agent' },
    position: { x: 550, y: 50 },
    style: nodeStyle,
  },
  {
    id: 'aptitude-agent',
    data: { label: '🧠 Aptitude Practice Agent' },
    position: { x: 550, y: 150 },
    style: nodeStyle,
  },
  {
    id: 'resume-agent',
    data: { label: '📄 Resume Optimizer Agent' },
    position: { x: 550, y: 250 },
    style: nodeStyle,
  },
  {
    id: 'interview-agent',
    data: { label: '🗣️ AI Interview Simulator' },
    position: { x: 820, y: 50 },
    style: nodeStyle,
  },
  {
    id: 'company-agent',
    data: { label: '🏢 Company Intelligence Agent' },
    position: { x: 820, y: 250 },
    style: nodeStyle,
  },
  {
    id: 'eval-output',
    type: 'output',
    data: { label: '📊 Placement Score Evaluator' },
    position: { x: 1080, y: 150 },
    style: {
      ...nodeStyle,
      borderColor: 'rgba(16, 185, 129, 0.5)',
      boxShadow: '0 0 15px rgba(16, 185, 129, 0.25)',
    },
  },
];

const initialEdges = [
  {
    id: 'e-user-roadmap',
    source: 'user-input',
    target: 'roadmap-agent',
    animated: true,
    style: { stroke: '#6366f1' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
  },
  {
    id: 'e-roadmap-dsa',
    source: 'roadmap-agent',
    target: 'dsa-agent',
    animated: false,
    style: { stroke: 'rgba(255,255,255,0.15)' },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255,255,255,0.15)' },
  },
  {
    id: 'e-roadmap-apt',
    source: 'roadmap-agent',
    target: 'aptitude-agent',
    animated: false,
    style: { stroke: 'rgba(255,255,255,0.15)' },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255,255,255,0.15)' },
  },
  {
    id: 'e-roadmap-res',
    source: 'roadmap-agent',
    target: 'resume-agent',
    animated: false,
    style: { stroke: 'rgba(255,255,255,0.15)' },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255,255,255,0.15)' },
  },
  {
    id: 'e-dsa-int',
    source: 'dsa-agent',
    target: 'interview-agent',
    style: { stroke: 'rgba(255,255,255,0.15)' },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255,255,255,0.15)' },
  },
  {
    id: 'e-apt-eval',
    source: 'aptitude-agent',
    target: 'eval-output',
    style: { stroke: 'rgba(255,255,255,0.15)' },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255,255,255,0.15)' },
  },
  {
    id: 'e-res-comp',
    source: 'resume-agent',
    target: 'company-agent',
    style: { stroke: 'rgba(255,255,255,0.15)' },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255,255,255,0.15)' },
  },
  {
    id: 'e-int-eval',
    source: 'interview-agent',
    target: 'eval-output',
    style: { stroke: 'rgba(255,255,255,0.15)' },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255,255,255,0.15)' },
  },
  {
    id: 'e-comp-eval',
    source: 'company-agent',
    target: 'eval-output',
    style: { stroke: 'rgba(255,255,255,0.15)' },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255,255,255,0.15)' },
  },
];

const AGENT_TASKS: Record<string, string[]> = {
  'roadmap-agent': [
    'Parsing student target parameters...',
    'Generating 16-week study schedule...',
    'Assigning priority points to modules...',
  ],
  'dsa-agent': [
    'Scanning solved problems log...',
    'Recommending Arrays & Dynamic Programming sheet...',
    'Evaluating optimal code solution complexites...',
  ],
  'aptitude-agent': [
    'Monitoring mock aptitude test performance...',
    'Generating 10 custom Logical questions...',
    'Updating local percentile distribution...',
  ],
  'resume-agent': [
    'Parsing uploaded PDF structure...',
    'Extracting semantic core tokens...',
    'Performing keyword gap analysis with Target JD...',
  ],
  'interview-agent': [
    'Analyzing audio transcription confidence metrics...',
    'Verifying technical logic accuracy parameters...',
    'Aggregating conversational flow feedback report...',
  ],
  'company-agent': [
    'Fetching Microsoft drive parameters...',
    'Scoring student profile qualification probability...',
    'Calculating CGPA & DSA prerequisite shortlists...',
  ],
};

export default function AgentOrchestrator() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [orchestrating, setOrchestrating] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '🤖 PlacementOS Agent Engine Initialized.',
    '📊 Node network configured. Ready to run graph simulation.',
  ]);

  const addLog = (msg: string) => {
    setTerminalLogs(prev => [...prev.slice(-18), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const startPipelineSim = useCallback(async () => {
    if (orchestrating) return;
    setOrchestrating(true);
    addLog('⚡ Initiating multi-agent orchestration pipeline (LangGraph state)...');

    // Reset edge highlights
    setEdges(prev => prev.map(e => ({ ...e, animated: false, style: { stroke: 'rgba(255,255,255,0.15)' } })));

    // Highlight user -> roadmap
    setEdges(prev => prev.map(e => e.id === 'e-user-roadmap' ? { ...e, animated: true, style: { stroke: '#6366f1' } } : e));
    addLog('🗺️ Roadmap Agent processing target companies...');
    await new Promise(r => setTimeout(r, 1200));

    // Highlight roadmap -> dsa, apt, res
    setEdges(prev => prev.map(e =>
      ['e-roadmap-dsa', 'e-roadmap-apt', 'e-roadmap-res'].includes(e.id)
        ? { ...e, animated: true, style: { stroke: '#8b5cf6' } } : e
    ));
    addLog('🚀 Dispatched instructions to DSA, Aptitude, and Resume agents in parallel.');
    await new Promise(r => setTimeout(r, 1500));

    // Highlight dsa -> interview & res -> company
    setEdges(prev => prev.map(e =>
      ['e-dsa-int', 'e-res-comp'].includes(e.id)
        ? { ...e, animated: true, style: { stroke: '#3b82f6' } } : e
    ));
    addLog('📈 Feeding preparation metrics into AI Interview Simulator and Company Shortlist evaluator.');
    await new Promise(r => setTimeout(r, 1500));

    // Highlight outputs
    setEdges(prev => prev.map(e =>
      ['e-int-eval', 'e-apt-eval', 'e-comp-eval'].includes(e.id)
        ? { ...e, animated: true, style: { stroke: '#10b981' } } : e
    ));
    addLog('💾 Compiling placement readiness index...');
    await new Promise(r => setTimeout(r, 1000));

    addLog('✅ Orchestration successful! Updated student stats in local memory.');
    toast.success('Agent pipeline sync complete! 🚀');
    setOrchestrating(false);
  }, [orchestrating, setEdges]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Agent Engine" subtitle="Multi-agent orchestrator state & execution" />
      
      {/* Simulation Bar */}
      <div className="p-4 border-b border-white/6 bg-white/2 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Cpu className={`text-indigo-400 ${orchestrating ? 'animate-spin' : ''}`} size={20} />
          <div>
            <div className="text-sm font-semibold text-white">LangGraph Agent Pipeline</div>
            <div className="text-xs text-slate-500">Visualizing automated placement analysis workflow</div>
          </div>
        </div>
        <button
          onClick={startPipelineSim}
          disabled={orchestrating}
          className="btn-gradient flex items-center gap-2 text-sm py-2 px-5 disabled:opacity-50"
        >
          <Play size={14} />
          {orchestrating ? 'Syncing...' : 'Trigger Sync Pipeline'}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
        {/* React Flow Area */}
        <div className="flex-1 bg-[#07070e] relative min-h-[300px]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            attributionPosition="bottom-right"
          >
            <Background color="#1a1a2e" gap={20} />
            <Controls className="bg-dark-300 border border-white/10 text-white fill-white" />
            <MiniMap
              nodeColor="#1a1a2e"
              maskColor="rgba(10, 10, 18, 0.6)"
              className="bg-dark-300 border border-white/10 rounded-xl overflow-hidden"
            />
          </ReactFlow>
          <div className="absolute top-4 left-4 p-3 glass-card text-xs text-slate-400 max-w-xs space-y-1">
            <div className="font-semibold text-white mb-2">📌 System Architecture</div>
            <p>LangGraph state updates automatically on your dashboard actions to keep all metrics aligned.</p>
          </div>
        </div>

        {/* Visual Terminal / Side Logs */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-white/6 bg-dark-300/50 flex flex-col h-72 lg:h-auto overflow-hidden">
          <div className="p-4 border-b border-white/6 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Terminal size={12} className="text-indigo-400" /> Logs & Action State
            </span>
            <span className="badge badge-indigo text-xs">Simulated</span>
          </div>

          <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 text-slate-400">
            {terminalLogs.map((log, i) => (
              <div key={i} className="leading-relaxed border-l-2 border-indigo-500/30 pl-2">
                {log}
              </div>
            ))}
          </div>

          {/* Detailed tasks */}
          <div className="p-4 border-t border-white/6 bg-white/2 space-y-3">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-400" /> Current Tasks Dispatched
            </div>
            <div className="space-y-1.5">
              {Object.entries(AGENT_TASKS).map(([agent, tasks]) => (
                <div key={agent} className="text-xs p-2 rounded bg-white/3 border border-white/5">
                  <div className="font-semibold text-slate-300 capitalize">{agent.replace('-', ' ')}</div>
                  <div className="text-slate-500 text-[10px] truncate mt-0.5">{tasks[0]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
