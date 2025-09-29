import React from 'react';
import { TimelineEvent } from '../types';
import { 
    PlusIcon, 
    PencilIcon,
    ShareIcon,
    SparklesIcon,
    EyeIcon,
    ArchiveBoxIcon,
} from './Icon';

interface TimelinePopoverProps {
  timeline: TimelineEvent[];
}

const getTimelineStyle = (type: TimelineEvent['type']) => {
    switch(type) {
        case 'Created': return { icon: <PlusIcon className="h-4 w-4 text-green-300" />, color: 'bg-green-500/20' };
        case 'Viewed': return { icon: <EyeIcon className="h-4 w-4 text-blue-300" />, color: 'bg-blue-500/20' };
        case 'Edited': return { icon: <PencilIcon className="h-4 w-4 text-yellow-300" />, color: 'bg-yellow-500/20' };
        case 'Shared': return { icon: <ShareIcon className="h-4 w-4 text-purple-300" />, color: 'bg-purple-500/20' };
        case 'Summarized': return { icon: <SparklesIcon className="h-4 w-4 text-indigo-300" />, color: 'bg-indigo-500/20' };
        case 'Archived': return { icon: <ArchiveBoxIcon className="h-4 w-4 text-gray-400" />, color: 'bg-gray-500/20' };
        default: return { icon: null, color: 'bg-gray-500/20' };
    }
}

const TimelinePopover: React.FC<TimelinePopoverProps> = ({ timeline }) => {
  // Sort from newest to oldest for relevance
  const sortedTimeline = [...timeline].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-96 max-w-lg bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-lg shadow-2xl p-4 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:pointer-events-auto">
      <h4 className="font-bold text-white mb-4 border-b border-white/10 pb-2">Document Journey</h4>
      
      {sortedTimeline.length > 0 ? (
        <div className="relative max-h-80 overflow-y-auto pr-2">
          {/* The main vertical line behind everything */}
          <div className="absolute top-0 left-4 w-px h-full bg-white/20 -translate-x-1/2 z-0"></div>

          <div className="space-y-6">
              {sortedTimeline.map((event, index) => {
                const { icon, color } = getTimelineStyle(event.type);
                
                return (
                  <div key={index} className="relative flex items-start space-x-4">
                    {/* Icon container, sits on top of the line */}
                    <div className={`relative z-10 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${color}`}>
                      {icon}
                    </div>
                    
                    {/* Event details */}
                    <div className="pt-0.5 flex-grow">
                      <p className="font-semibold text-sm text-white">{event.type} by {event.user}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(event.timestamp).toLocaleString(undefined, { 
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </p>
                      {event.details && (
                        <p className="text-xs text-indigo-300/80 italic mt-1 bg-black/20 p-1.5 rounded-md">
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
        <p className="text-center text-gray-400 py-4">No history available for this document.</p>
      )}

      <style>{`
        /* Custom scrollbar for timeline popover */
        .max-h-80::-webkit-scrollbar {
          width: 4px;
        }
        .max-h-80::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .max-h-80::-webkit-scrollbar-thumb {
          background: rgba(79, 70, 229, 0.6);
          border-radius: 10px;
        }
        .max-h-80::-webkit-scrollbar-thumb:hover {
            background: rgba(99, 102, 241, 0.8);
        }
      `}</style>
    </div>
  );
};

export default TimelinePopover;
