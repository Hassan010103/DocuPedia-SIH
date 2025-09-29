import React, { useState, useEffect, useRef } from 'react';
import { Document, TeamMember, GraphNode, GraphEdge } from '../types';
import { DocumentTextIcon, LinkIcon, BuildingOffice2Icon } from './Icon';

interface KnowledgeGraphProps {
  centerDocument: Document;
  allDocuments: Document[];
  allTeamMembers: TeamMember[];
  onNodeClick: (docId: string) => void;
}

const getDeptColor = (dept: string) => {
    const colors: { [key: string]: string } = {
        'Finance': 'border-green-400 text-green-300',
        'Marketing': 'border-blue-400 text-blue-300',
        'Safety & Compliance': 'border-red-400 text-red-300',
        'Engineering & Design': 'border-cyan-400 text-cyan-300',
        'HR': 'border-teal-400 text-teal-300',
        'Legal': 'border-yellow-400 text-yellow-300',
        'Operations': 'border-orange-400 text-orange-300',
        'IT': 'border-purple-400 text-purple-300',
        'Executive': 'border-slate-400 text-slate-300',
    };
    return colors[dept] || 'border-gray-400 text-gray-300';
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ centerDocument, allDocuments, allTeamMembers, onNodeClick }) => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // 1. Build the dynamic graph structure
  useEffect(() => {
    if (!containerRef.current || !centerDocument) {
      return;
    }
    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;

    const newNodes: GraphNode[] = [];
    const newEdges: GraphEdge[] = [];
    const nodeMap = new Map<string, GraphNode>();
    const addedDepartments = new Set<string>();
    const addedUsers = new Set<string>();

    const addNode = (node: Omit<GraphNode, 'x' | 'y' | 'vx' | 'vy'>) => {
      if (!nodeMap.has(node.id)) {
        const newNode: GraphNode = {
          ...node,
          x: width / 2 + (Math.random() - 0.5) * 200,
          y: height / 2 + (Math.random() - 0.5) * 200,
          vx: 0,
          vy: 0,
        };
        newNodes.push(newNode);
        nodeMap.set(node.id, newNode);
      }
      return nodeMap.get(node.id)!;
    };
    
    const addEdge = (edge: GraphEdge) => { newEdges.push(edge); };

    // 1. Add the center document
    const centerNode = addNode({ id: centerDocument.id, type: 'document', label: centerDocument.name, data: centerDocument });
    
    // Center it physically
    centerNode.x = width / 2;
    centerNode.y = height / 2;

    // 2. Add its owner and department
    const owner = allTeamMembers.find(tm => tm.name === centerDocument.owner);
    if (owner && !addedUsers.has(owner.id)) {
        addNode({ id: owner.id, type: 'user', label: owner.name, data: owner });
        addEdge({ id: `${centerDocument.id}-owned-${owner.id}`, source: centerDocument.id, target: owner.id, label: 'owned by' });
        addedUsers.add(owner.id);
        
        if (!addedDepartments.has(owner.team)) {
            addNode({ id: `dept-${owner.team}`, type: 'department', label: owner.team, data: { department: owner.team } });
            addedDepartments.add(owner.team);
        }
        addEdge({ id: `${owner.id}-member-${owner.team}`, source: owner.id, target: `dept-${owner.team}`, label: 'member of' });
    }

    // 3. Add interacting users and their departments from timeline/annotations
    const interactingUserNames = new Set([
        ...centerDocument.timeline.map(e => e.user),
        ...centerDocument.annotations.map(a => a.user.name)
    ]);

    interactingUserNames.forEach(name => {
        const user = allTeamMembers.find(tm => tm.name === name);
        if (user && !addedUsers.has(user.id)) {
            addNode({ id: user.id, type: 'user', label: user.name, data: user });
            addEdge({ id: `${centerDocument.id}-interacted-${user.id}`, source: centerDocument.id, target: user.id, label: 'interacted with' });
            addedUsers.add(user.id);

            if (!addedDepartments.has(user.team)) {
                addNode({ id: `dept-${user.team}`, type: 'department', label: user.team, data: { department: user.team } });
                addedDepartments.add(user.team);
            }
            addEdge({ id: `${user.id}-member-${user.team}`, source: user.id, target: `dept-${user.team}`, label: 'member of' });
        }
    });
    
    // 4. Add entities
    (centerDocument.entities || []).slice(0, 3).forEach(entityName => {
        const entityId = `entity-${entityName.replace(/\s+/g, '-')}`;
        addNode({ id: entityId, type: 'entity', label: entityName, data: { name: entityName } });
        addEdge({ id: `${centerDocument.id}-contains-${entityId}`, source: centerDocument.id, target: entityId, label: 'contains entity' });
    });

    // 5. Find and add related documents (by tag or entity)
    const relatedDocs = allDocuments.filter(doc => {
        if (doc.id === centerDocument.id) return false;
        const hasCommonTag = doc.tags.some(tag => centerDocument.tags.includes(tag));
        const hasCommonEntity = doc.entities?.some(entity => centerDocument.entities?.includes(entity));
        return hasCommonTag || hasCommonEntity;
    }).slice(0, 3); // Limit to 3 related docs for clarity

    relatedDocs.forEach(doc => {
        addNode({ id: doc.id, type: 'document', label: doc.name, data: doc });
        addEdge({ id: `${centerDocument.id}-related-${doc.id}`, source: centerDocument.id, target: doc.id, label: 'related to' });
    });


    setNodes(newNodes);
    setEdges(newEdges);

  }, [centerDocument, allDocuments, allTeamMembers]);

  // 2. Run force simulation
  useEffect(() => {
    if (nodes.length === 0 || !containerRef.current) return;
    
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    
    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;

    let simulationNodes = JSON.parse(JSON.stringify(nodes));

    const tick = () => {
      const k = 0.04; 
      const repel = -8000;
      const gravity = 0.15;
      const friction = 0.92;

      for (const nodeA of simulationNodes) {
        nodeA.vx += ((width / 2) - nodeA.x) * gravity * 0.01;
        nodeA.vy += ((height / 2) - nodeA.y) * gravity * 0.01;

        for (const nodeB of simulationNodes) {
          if (nodeA === nodeB) continue;
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 50) dist = 50;
          const force = repel / (dist * dist);
          nodeA.vx += (dx / dist) * force;
          nodeA.vy += (dy / dist) * force;
        }
      }

      for (const edge of edges) {
        const source = simulationNodes.find((n: GraphNode) => n.id === edge.source);
        const target = simulationNodes.find((n: GraphNode) => n.id === edge.target);
        if (!source || !target) continue;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const displacement = dist - 200;
        const force = displacement * k;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        source.vx += fx;
        source.vy += fy;
        target.vx -= fx;
        target.vy -= fy;
      }

      for (const node of simulationNodes) {
        node.vx *= friction;
        node.vy *= friction;
        node.x += node.vx;
        node.y += node.vy;
        node.x = Math.max(50, Math.min(width - 50, node.x));
        node.y = Math.max(50, Math.min(height - 50, node.y));
      }
      setNodes([...simulationNodes]);
    };
    
    let i = 0;
    const runSimulation = () => {
      if (i++ < 300) {
        tick();
        animationFrameId.current = requestAnimationFrame(runSimulation);
      } else {
        animationFrameId.current = null;
      }
    };
    
    runSimulation();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [edges]);

  const renderNode = (node: GraphNode) => {
    const commonClasses = "absolute flex items-center justify-center transition-all duration-300";
    const baseStyle = {
      left: `${node.x}px`,
      top: `${node.y}px`,
      transform: 'translate(-50%, -50%)',
    };
    
    switch (node.type) {
      case 'document':
        const doc = node.data as Document;
        const isCenter = doc.id === centerDocument.id;
        return (
          <div key={node.id} style={baseStyle} title={doc.name}
            className={`${commonClasses} w-24 h-24 bg-slate-800/80 backdrop-blur-sm border-2 rounded-full shadow-lg p-2 cursor-pointer ${isCenter ? 'border-indigo-400 scale-125 shadow-2xl z-20 ring-4 ring-indigo-500/50' : `${getDeptColor(doc.department)} hover:scale-110`}`}
            onClick={() => onNodeClick(doc.id)}
          >
            <div className="text-center">
              <DocumentTextIcon className={`h-6 w-6 mx-auto ${isCenter ? 'text-indigo-300' : getDeptColor(doc.department).split(' ')[1]}`} />
              <p className="text-xs text-gray-300 truncate w-20 mt-1">{doc.name}</p>
            </div>
          </div>
        );
      case 'user':
        const user = node.data as TeamMember;
        return (
          <div key={node.id} style={baseStyle} title={user.name} className={`${commonClasses} w-20 h-20 rounded-full shadow-md bg-yellow-900/50 border-2 border-yellow-400 hover:scale-110`}>
            <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full"/>
          </div>
        );
      case 'entity':
        return (
          <div key={node.id} style={baseStyle} title={node.label} className={`${commonClasses} w-32 h-10 bg-purple-900/50 backdrop-blur-sm border border-purple-400 rounded-lg shadow-md px-2 hover:scale-110`}>
            <LinkIcon className="h-4 w-4 mr-1 text-purple-300 flex-shrink-0"/>
            <span className="text-xs text-purple-200 font-semibold truncate">{node.label}</span>
          </div>
        );
      case 'department':
          const dept = (node.data as {department: string}).department;
        return (
          <div key={node.id} style={baseStyle} title={dept} className={`${commonClasses} w-28 h-28 bg-slate-900/50 border-2 border-dashed ${getDeptColor(dept)} rounded-full p-2 hover:scale-105`}>
            <div className="text-center">
                <BuildingOffice2Icon className={`h-8 w-8 mx-auto ${getDeptColor(dept).split(' ')[1]}`}/>
                <p className="font-bold text-sm mt-1">{dept}</p>
            </div>
          </div>
        );
    }
  };

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  return (
    <div ref={containerRef} className="relative w-full h-[550px] bg-black/20 rounded-lg overflow-hidden">
        {nodes.length > 0 ? (
            <>
                <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
                    {edges.map(edge => {
                        const sourceNode = getNodeById(edge.source);
                        const targetNode = getNodeById(edge.target);
                        if (!sourceNode || !targetNode) return null;
                        
                        const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x);
                        const textOffset = 10;
                        const midX = (sourceNode.x + targetNode.x) / 2 + textOffset * Math.sin(angle);
                        const midY = (sourceNode.y + targetNode.y) / 2 - textOffset * Math.cos(angle);
                        
                        return (
                            <g key={edge.id} className="edge-group transition-opacity duration-300 hover:opacity-100 opacity-60">
                                <line x1={sourceNode.x} y1={sourceNode.y} x2={targetNode.x} y2={targetNode.y} className="stroke-white/30 stroke-[1.5px]" />
                                <text x={midX} y={midY} textAnchor="middle" className="text-[10px] fill-gray-300 font-sans" style={{ paintOrder: 'stroke', stroke: 'rgba(10, 16, 65, 0.8)', strokeWidth: '3px', strokeLinejoin: 'round' }}>
                                    {edge.label}
                                </text>
                            </g>
                        );
                    })}
                </svg>
                {nodes.map(node => renderNode(node))}
            </>
        ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
                <p>Building Knowledge Graph...</p>
            </div>
        )}
    </div>
  );
};

export default KnowledgeGraph;