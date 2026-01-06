
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef } from 'react';
import { FurnitureType, HomeStats, AIDesignGoal, MagazineSnippet } from '../types';
import { FURNITURE } from '../constants';

interface UIOverlayProps {
  stats: HomeStats;
  selectedTool: FurnitureType;
  onSelectTool: (type: FurnitureType) => void;
  currentGoal: AIDesignGoal | null;
  newsFeed: MagazineSnippet[];
  onClaimReward: () => void;
  isGeneratingGoal: boolean;
  aiError: string | null;
  onRetryGoal: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({
  stats,
  selectedTool,
  onSelectTool,
  currentGoal,
  newsFeed,
  onClaimReward,
  isGeneratingGoal,
  aiError,
  onRetryGoal
}) => {
  const newsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (newsRef.current) newsRef.current.scrollTop = newsRef.current.scrollHeight;
  }, [newsFeed]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 font-sans z-10">
      <div className="flex justify-between items-start pointer-events-auto gap-4">
        {/* Stats */}
        <div className="bg-white/90 p-4 rounded-2xl border border-stone-200 shadow-xl backdrop-blur-md flex gap-8 items-center text-stone-800">
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">Ngân sách</span>
            <span className="text-2xl font-black text-emerald-600 font-mono">${stats.budget.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">Phong cách</span>
            <span className="text-2xl font-bold text-amber-600 font-mono">{stats.stylePoints}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">Giai đoạn</span>
            <span className="text-xl font-bold">{stats.phase}</span>
          </div>
        </div>

        {/* AI Designer Panel */}
        <div className="w-80 bg-stone-900 text-white rounded-2xl border border-stone-700 shadow-2xl backdrop-blur-md overflow-hidden">
          <div className="bg-stone-800 px-4 py-2 flex justify-between items-center border-b border-stone-700">
            <span className="font-bold uppercase text-xs tracking-widest flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isGeneratingGoal ? 'bg-amber-400 animate-ping' : aiError ? 'bg-red-500' : 'bg-sky-400 animate-pulse'}`}></span>
              Tư vấn Thiết kế
            </span>
            {aiError && (
              <button onClick={onRetryGoal} className="text-[10px] bg-stone-700 hover:bg-stone-600 px-2 py-0.5 rounded border border-stone-600 transition-colors">
                Thử lại
              </button>
            )}
          </div>
          <div className="p-4">
            {aiError ? (
              <div className="text-xs text-red-400 italic">
                {aiError}
              </div>
            ) : currentGoal ? (
              <>
                <p className="text-sm italic text-stone-300 mb-4 leading-relaxed">"{currentGoal.description}"</p>
                <div className="flex justify-between items-center bg-stone-800 p-2 rounded-lg border border-stone-700">
                  <div className="text-xs text-stone-400">
                    Thưởng: <span className="font-bold text-white">${currentGoal.reward}</span>
                  </div>
                </div>
                {currentGoal.completed && (
                  <button onClick={onClaimReward} className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl transition-all animate-bounce">
                    Hoàn thành Giai đoạn
                  </button>
                )}
              </>
            ) : <div className="text-xs text-stone-500 italic">Đang tạo nhiệm vụ mới...</div>}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end pointer-events-auto gap-4">
        {/* Furniture Bar */}
        <div className="flex gap-2 bg-white/90 p-2 rounded-3xl border border-stone-200 backdrop-blur-xl shadow-2xl overflow-x-auto">
          {Object.values(FurnitureType).map((type) => {
            const config = FURNITURE[type];
            return (
              <div key={type} className="relative group">
                {type !== FurnitureType.None && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold whitespace-nowrap shadow-lg border border-stone-700">
                    ${config.cost}
                  </div>
                )}
                <button
                  onClick={() => onSelectTool(type)}
                  disabled={stats.budget < config.cost && type !== FurnitureType.None}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 transition-all w-16 h-16 
                    ${selectedTool === type ? 'border-amber-500 bg-amber-50 scale-105 shadow-md' : 'border-transparent hover:bg-stone-100'}
                    ${stats.budget < config.cost && type !== FurnitureType.None ? 'opacity-30' : ''}`}
                >
                  <div className="w-6 h-6 rounded-md mb-1" style={{ backgroundColor: config.color }}></div>
                  <span className="text-[10px] font-bold text-stone-600 uppercase tracking-tighter">{config.name}</span>
                </button>
              </div>
            );
          })}
        </div>


      </div>
    </div>
  );
};

export default UIOverlay;
