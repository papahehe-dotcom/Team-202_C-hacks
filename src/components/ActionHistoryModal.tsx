import React from 'react';
import { ActionRecord } from '../types/game';
import { History, X } from 'lucide-react';
import { gameAudio } from '../utils/audio';

interface ActionHistoryModalProps {
  history: ActionRecord[];
  onClose: () => void;
}

export const ActionHistoryModal: React.FC<ActionHistoryModalProps> = ({
  history,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-black text-slate-900">Campaign Action History</h3>
          </div>
          <button
            onClick={() => {
              gameAudio.playClick();
              onClose();
            }}
            className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {history.length > 0 ? (
            history.map((record, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block font-mono">
                    Day {record.day}
                  </span>
                  <strong className="text-slate-900 font-bold">{record.name}</strong>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-700 font-mono">-{record.cost} CC</span>
                  <span className="text-[10px] text-slate-400 block">{record.timestamp}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic text-center p-6 bg-slate-50 rounded-2xl">
              No actions have been purchased yet in this campaign.
            </p>
          )}
        </div>

        <button
          onClick={() => {
            gameAudio.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
        >
          Close History
        </button>
      </div>
    </div>
  );
};
