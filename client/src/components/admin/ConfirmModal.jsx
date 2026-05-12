import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', confirmColor = 'bg-red-600' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        <div className="p-8">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-2">{title}</h2>
          <p className="text-slate-500 leading-relaxed">{message}</p>
        </div>
        <div className="bg-slate-50 p-6 flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 ${confirmColor} text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-amber-100`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
