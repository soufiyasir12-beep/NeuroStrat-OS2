import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Send, PenLine, Inbox, FileText, Loader2, CheckCircle2, Mail, X, RefreshCcw, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendEmailViaApi, fetchIncomingEmails } from '../../services/emailService';
import { Email } from '../../types';

export const EmailHub: React.FC = () => {
  const [isComposing, setIsComposing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const sentEmails = useLiveQuery(() => db.emails.where('status').equals('sent').reverse().sortBy('createdAt'));
  const receivedEmails = useLiveQuery(() => db.emails.where('status').equals('received').reverse().sortBy('createdAt'));
  const drafts = useLiveQuery(() => db.emails.where('status').equals('draft').reverse().sortBy('createdAt'));
  const tasks = useLiveQuery(() => db.tasks.toArray());

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const incoming = await fetchIncomingEmails(tasks || []);
      for (const email of incoming) {
        await db.emails.add(email);
      }
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="h-full flex gap-6">
      {/* List Pane */}
      <div className="w-1/3 min-w-[300px] flex flex-col gap-4">
        <div className="flex gap-2">
            <button 
                onClick={() => { setIsComposing(true); setSelectedEmail(null); }}
                className="flex-1 bg-white hover:bg-gray-200 text-black py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white"
            >
                <PenLine size={16} />
                <span className="font-medium text-sm">Compose</span>
            </button>
            <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="p-3 bg-surface2/50 hover:bg-surface2 text-white rounded-lg border border-white/10 transition-all flex items-center justify-center disabled:opacity-50"
                title="Sync Transmissions"
            >
                <RefreshCcw size={16} className={isSyncing ? "animate-spin" : ""} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-8 mt-4 custom-scrollbar">
          <section>
             <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-white/5 pb-1">
                <Inbox size={10} /> Inbox
             </h3>
             <div className="space-y-2">
                {receivedEmails?.map(email => (
                    <EmailCard key={email.id} email={email} active={selectedEmail?.id === email.id} onClick={() => { setSelectedEmail(email); setIsComposing(false); }} />
                ))}
                {receivedEmails?.length === 0 && <EmptyState text="No transmissions received" />}
             </div>
          </section>

          <section>
             <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-white/5 pb-1">
                <Send size={10} /> Sent Log
             </h3>
             <div className="space-y-2">
                {sentEmails?.map(email => (
                    <EmailCard key={email.id} email={email} active={selectedEmail?.id === email.id} onClick={() => { setSelectedEmail(email); setIsComposing(false); }} />
                ))}
                {sentEmails?.length === 0 && <EmptyState text="No history" />}
             </div>
          </section>

          <section>
             <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-white/5 pb-1">
                <FileText size={10} /> Drafts
             </h3>
             <div className="space-y-2">
                {drafts?.map(email => (
                    <EmailCard key={email.id} email={email} active={selectedEmail?.id === email.id} onClick={() => { setSelectedEmail(email); setIsComposing(false); }} />
                ))}
                {drafts?.length === 0 && <EmptyState text="Empty" />}
             </div>
          </section>
        </div>
      </div>

      {/* Main Pane */}
      <div className="flex-1 bg-surface2/10 backdrop-blur-md rounded-2xl border border-white/5 p-8 relative overflow-hidden shadow-2xl flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <AnimatePresence mode='wait'>
            {isComposing ? (
                <ComposeView key="compose" onClose={() => setIsComposing(false)} />
            ) : selectedEmail ? (
                <ReadView key={`read-${selectedEmail.id}`} email={selectedEmail} onClose={() => setSelectedEmail(null)} />
            ) : (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="h-full flex flex-col items-center justify-center text-text-muted opacity-40"
                >
                    <Mail size={48} className="mb-4 text-white opacity-20" />
                    <p className="font-light tracking-wider text-sm">Select a transmission to view.</p>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const EmailCard: React.FC<{ email: Email, active?: boolean, onClick: () => void }> = ({ email, active, onClick }) => (
    <motion.div 
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-lg border transition-all group cursor-pointer ${
            active 
            ? 'bg-white/10 border-white/20 shadow-glow' 
            : 'bg-surface2/30 border-transparent hover:border-white/10 hover:bg-surface2/50'
        }`}
        onClick={onClick}
    >
        <div className="flex justify-between items-start mb-1">
            <span className={`font-medium text-sm truncate ${active ? 'text-white' : 'text-text-muted group-hover:text-white'}`}>
                {email.status === 'received' ? email.from : `To: ${email.to}`}
            </span>
            <span className="text-[9px] text-text-muted opacity-60 font-mono">
                {new Date(email.createdAt).toLocaleDateString()}
            </span>
        </div>
        <div className={`text-xs font-medium mb-1 truncate transition-colors ${active ? 'text-white' : 'text-text-muted group-hover:text-white'}`}>
            {email.subject || '(No Subject)'}
        </div>
        <div className="text-[10px] text-text-muted opacity-40 truncate">{email.body}</div>
    </motion.div>
);

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
    <div className="py-4 text-center text-[10px] text-text-muted opacity-30 italic font-mono border border-dashed border-white/5 rounded">
        {text}
    </div>
);

const ReadView: React.FC<{ email: Email, onClose: () => void }> = ({ email, onClose }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="h-full flex flex-col"
    >
        <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-6">
            <div>
                <h2 className="font-serif text-3xl text-white tracking-tight mb-2">{email.subject}</h2>
                <div className="flex items-center gap-3 text-sm text-text-muted">
                    <div className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center border border-white/10">
                        <User size={14} />
                    </div>
                    <div>
                        <p className="font-medium text-white">{email.from}</p>
                        <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">
                            {new Date(email.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-text-muted hover:text-white">
                <X size={20} />
            </button>
        </div>
        <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-text-muted leading-relaxed font-light tracking-wide text-base custom-scrollbar pr-4">
            {email.body}
        </div>
    </motion.div>
);

const SENDER_OPTIONS = [
    "Onboarding@mail.neurostrat.app",
    "Yasir@mail.neurostrat.app",
    "CEO@mail.neurostrat.app",
    "Systems@mail.neurostrat.app",
    "Demos@mail.neurostrat.app",
    "os@mail.neurostrat.app"
];

const ComposeView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [from, setFrom] = useState(SENDER_OPTIONS[0]);
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSend = async () => {
        if(!to) return;
        setStatus('sending');
        setErrorMessage('');
        
        try {
            const emailData: Email = {
                from: from,
                to,
                subject,
                body,
                status: 'sent',
                createdAt: new Date(),
            };

            const result = await sendEmailViaApi(emailData);
            
            await db.emails.add({
                ...emailData,
                sentAt: new Date()
            });

            setStatus('success');
            setTimeout(onClose, 1500);
        } catch (e: any) {
            console.error(e);
            setStatus('error');
            setErrorMessage(e.message || "Network Error");
            // Save as draft if sending failed
            await db.emails.add({
                from: from,
                to,
                subject,
                body,
                status: 'draft',
                createdAt: new Date()
            });
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="h-full flex flex-col"
        >
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                <h2 className="font-serif text-2xl text-white tracking-tight">Transmission</h2>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-text-muted hover:text-white">
                    <X size={18} />
                </button>
            </div>

            <div className="space-y-6 flex-1 flex flex-col">
                <div className="group relative">
                    <label className="text-[10px] uppercase font-bold text-text-muted mb-1 block">From Identity</label>
                    <div className="relative">
                        <select 
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="w-full bg-transparent border-b border-white/10 py-2 text-white focus:outline-none focus:border-white/50 transition-colors appearance-none font-mono text-sm cursor-pointer hover:text-white/80"
                        >
                            {SENDER_OPTIONS.map(opt => (
                                <option key={opt} value={opt} className="bg-surface text-white">
                                    {opt}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={14} />
                    </div>
                </div>

                <div className="group">
                    <label className="text-[10px] uppercase font-bold text-text-muted mb-1 block">Recipient</label>
                    <input 
                        className="w-full bg-transparent border-b border-white/10 py-2 text-white focus:outline-none focus:border-white/50 transition-colors placeholder:text-text-muted/20 font-mono text-sm"
                        placeholder="user@example.com"
                        value={to || ''}
                        onChange={e => setTo(e.target.value)}
                    />
                </div>
                <div className="group">
                    <label className="text-[10px] uppercase font-bold text-text-muted mb-1 block">Subject Line</label>
                    <input 
                        className="w-full bg-transparent border-b border-white/10 py-2 text-white focus:outline-none focus:border-white/50 transition-colors placeholder:text-text-muted/20 text-sm"
                        placeholder="Briefing..."
                        value={subject || ''}
                        onChange={e => setSubject(e.target.value)}
                    />
                </div>
                <div className="flex-1 flex flex-col group mt-4">
                     <label className="text-[10px] uppercase font-bold text-text-muted mb-2 block">Content</label>
                    <textarea 
                        className="w-full flex-1 bg-surface2/20 rounded-lg p-4 resize-none focus:outline-none border border-white/5 focus:border-white/20 text-white placeholder:text-text-muted/20 leading-relaxed text-sm font-light"
                        placeholder="Encrypted message..."
                        value={body || ''}
                        onChange={e => setBody(e.target.value)}
                    />
                </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
                <div className="text-red-400 text-[10px] font-mono uppercase tracking-tighter max-w-[50%] truncate">
                    {errorMessage}
                </div>
                <button 
                    disabled={status === 'sending' || status === 'success'}
                    onClick={handleSend}
                    className={`
                        py-2.5 px-6 rounded-md font-medium text-xs uppercase tracking-wider text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all flex items-center gap-2 hover:scale-105
                        ${status === 'success' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-white hover:bg-gray-100'}
                    `}
                >
                    {status === 'idle' && <>Send Transmission <Send size={12} /></>}
                    {status === 'sending' && <Loader2 size={12} className="animate-spin" />}
                    {status === 'success' && <>Sent <CheckCircle2 size={12} /></>}
                    {status === 'error' && "Retry Sending"}
                </button>
            </div>
        </motion.div>
    );
};