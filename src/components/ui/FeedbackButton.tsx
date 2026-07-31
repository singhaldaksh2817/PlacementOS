import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';

export default function FeedbackButton() {
  const { user } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState('General');
  const [message, setMessage] = useState('');

  if (user?.role === 'admin') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const { error } = await supabase.from('feedback').insert({
      type,
      message,
      user_name: user?.name,
      user_email: user?.email,
      user_id: user?.id,
    });
    if (error) {
      toast.error('Failed to submit feedback');
    } else {
      toast.success('Feedback submitted! Thank you.');
      setIsOpen(false);
      setMessage('');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full shadow-lg font-medium flex items-center gap-2 z-50"
      >
        💬 Feedback
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Send Feedback</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Type</label>
                <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-[#0f111a] border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500">
                  <option value="Bug">Bug</option>
                  <option value="Suggestion">Suggestion</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full bg-[#0f111a] border border-white/10 text-white rounded-lg px-3 py-2 text-sm h-32 resize-none outline-none focus:border-indigo-500"
                  placeholder="What's on your mind?"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
