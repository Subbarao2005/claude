import { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';

export default function ReasonModal({ isOpen, title, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reason.length >= 5) {
      onConfirm(reason);
      setReason('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        <form onSubmit={handleSubmit}>
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                <MessageSquare size={28} />
              </div>
              <button type="button" onClick={onCancel} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><X size={20} /></button>
            </div>
            <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-2">{title}</h2>
            <p className="text-slate-500 mb-6">Please provide a valid reason (min 5 characters).</p>
            
            <textarea
              required
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none resize-none h-32"
              placeholder="Enter reason here..."
            />
          </div>
          <div className="bg-slate-50 p-6 flex gap-3">
            <button 
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={reason.length < 5}
              className="flex-1 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Submit Reason
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
