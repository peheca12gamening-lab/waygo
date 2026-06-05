import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, PenTool, Smile, X, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import {
  getMessages, sendMessage, markMessagesRead,
  subscribeToMessages, setTyping as dbSetTyping,
  subscribeToTyping, conversationId,
} from '../../lib/db';
import { DrawingModal } from './DrawingModal';
import type { Message } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────
export interface ChatFriend {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  isOnline?: boolean;
}

interface ChatPanelProps {
  currentUserId: string;
  friend: ChatFriend;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────
const EMOJIS = ['😀','😂','❤️','🔥','👍','🎉','😍','🙏','💪','✨','🥰','😎','🤩','👋','💯'];
const REACTIONS = ['❤️','🔥','😂','👍','🎉','😮'];

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  if (diffDays < 7) return d.toLocaleDateString(undefined, { weekday: 'short' }) + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function groupByDay(messages: Message[]): { date: string; msgs: Message[] }[] {
  const groups: { date: string; msgs: Message[] }[] = [];
  let lastDate = '';
  for (const msg of messages) {
    const d = new Date(msg.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    if (d !== lastDate) { groups.push({ date: d, msgs: [msg] }); lastDate = d; }
    else { groups[groups.length - 1].msgs.push(msg); }
  }
  return groups;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Message Bubble
// ─────────────────────────────────────────────────────────────────────────────
function Bubble({ msg, isMe, friend }: { msg: Message; isMe: boolean; friend: ChatFriend }) {
  const [reaction,   setReaction]   = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const isImage = msg.type === 'image' || msg.content.startsWith('data:image/');

  return (
    <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
      {!isMe && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mb-1 overflow-hidden"
          style={{ background: friend.color }}>
          {friend.avatar
            ? <img src={friend.avatar} className="w-full h-full object-cover" alt="" />
            : friend.name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="max-w-[72%] relative">
        <div className="relative rounded-2xl overflow-hidden"
          style={{
            background: isMe ? 'linear-gradient(135deg,#B090FF,#7AC8FF)' : 'var(--bg-chip)',
            borderBottomRightRadius: isMe ? 4 : 18,
            borderBottomLeftRadius: isMe ? 18 : 4,
          }}
          onDoubleClick={() => setShowPicker(v => !v)}>
          {isImage ? (
            <img src={msg.image_data ?? msg.content} alt="Drawing"
              className="block max-w-full" style={{ maxHeight: 280, objectFit: 'contain' }} />
          ) : (
            <p className="px-4 py-2.5 text-sm leading-relaxed"
              style={{ color: isMe ? 'white' : 'var(--text-primary)' }}>
              {msg.content}
            </p>
          )}
        </div>

        {/* Reaction picker */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 4 }}
              className={`absolute ${isMe ? 'right-0' : 'left-0'} -top-10 z-10 flex gap-1 px-2 py-1.5 rounded-full shadow-lg`}
              style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
              {REACTIONS.map(r => (
                <button key={r} className="text-lg" onClick={() => { setReaction(reaction === r ? null : r); setShowPicker(false); }}>
                  {r}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {reaction && (
          <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} -mt-1`}>
            <span className="text-sm px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              {reaction}
            </span>
          </div>
        )}

        <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px]" style={{ color: 'var(--text-soft)' }}>{formatTime(msg.created_at)}</span>
          {isMe && (msg.is_read
            ? <CheckCheck size={12} style={{ color: '#7AC8FF' }} />
            : <Check size={12} style={{ color: 'var(--text-soft)' }} />)}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Typing indicator
// ─────────────────────────────────────────────────────────────────────────────
function TypingIndicator({ friend }: { friend: ChatFriend }) {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 overflow-hidden"
        style={{ background: friend.color }}>
        {friend.avatar
          ? <img src={friend.avatar} className="w-full h-full object-cover" alt="" />
          : friend.name.charAt(0).toUpperCase()}
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1" style={{ background: 'var(--bg-chip)' }}>
        {[0, 1, 2].map(i => (
          <motion.span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#9090C0' }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ChatPanel
// ─────────────────────────────────────────────────────────────────────────────
export function ChatPanel({ currentUserId, friend, onClose }: ChatPanelProps) {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [text, setText]           = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showDraw, setShowDraw]   = useState(false);
  const [sending, setSending]     = useState(false);
  const [peerIsTyping, setPeerIsTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const convId = conversationId(currentUserId, friend.id);

  // Load history + mark read
  useEffect(() => {
    getMessages(currentUserId, friend.id).then(setMessages);
    markMessagesRead(currentUserId, friend.id).catch(() => {});
  }, [currentUserId, friend.id]);

  // Real-time new messages
  useEffect(() => {
    const sub = subscribeToMessages(currentUserId, (msg: any) => {
      if (msg.sender_id === friend.id || msg.receiver_id === friend.id) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg as Message];
        });
        markMessagesRead(currentUserId, friend.id).catch(() => {});
      }
    }, `chat-${convId}`);
    return () => { sub.unsubscribe(); };
  }, [currentUserId, friend.id, convId]);

  // Typing subscription
  useEffect(() => {
    const sub = subscribeToTyping(convId, currentUserId, (isTyping: boolean) => {
      setPeerIsTyping(isTyping);
    });
    return () => { sub.unsubscribe(); };
  }, [convId, currentUserId]);

  // Scroll to bottom
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, peerIsTyping]);

  const handleSend = useCallback(async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setText('');
    dbSetTyping(convId, currentUserId, false).catch(() => {});
    try {
      const msg = await sendMessage(currentUserId, friend.id, content);
      setMessages(prev => [...prev, msg as Message]);
    } catch { /* noop */ }
    finally { setSending(false); }
  }, [text, sending, currentUserId, friend.id, convId]);

  const handleDrawSend = useCallback(async (dataUrl: string) => {
    setShowDraw(false);
    try {
      const msg = await sendMessage(currentUserId, friend.id, dataUrl, { type: 'image', imageData: dataUrl });
      setMessages(prev => [...prev, msg as Message]);
    } catch { /* noop */ }
  }, [currentUserId, friend.id]);

  const handleTyping = (v: string) => {
    setText(v);
    dbSetTyping(convId, currentUserId, v.length > 0).catch(() => {});
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      dbSetTyping(convId, currentUserId, false).catch(() => {});
    }, 3000);
  };

  const groups = groupByDay(messages);

  return (
    <>
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 32 }}
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: 'var(--bg-primary)', maxWidth: 430, margin: '0 auto' }}>

        {/* Header */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 sticky top-0 z-10"
          style={{ background: 'var(--bg-card)', borderBottom: '1.5px solid var(--border)', boxShadow: '0 2px 12px rgba(176,144,255,0.08)' }}>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: '#EAEAF8', border: '1.5px solid #E0E0F0' }}>
            <ArrowLeft size={18} style={{ color: '#9090C0' }} />
          </button>
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold overflow-hidden"
              style={{ background: friend.color }}>
              {friend.avatar
                ? <img src={friend.avatar} className="w-full h-full object-cover" alt="" />
                : friend.name.charAt(0).toUpperCase()}
            </div>
            {friend.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white" style={{ background: '#4ADE80' }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{friend.name}</p>
            <p className="text-xs" style={{ color: friend.isOnline ? '#4ADE80' : 'var(--text-soft)' }}>
              {peerIsTyping ? 'typing…' : friend.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: '#EAEAF8', border: '1.5px solid #E0E0F0' }}>
            <X size={17} style={{ color: '#9090C0' }} />
          </button>
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-1" style={{ minHeight: 0 }}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-5xl mb-3">💬</div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Start the conversation!</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-soft)' }}>Say hi or draw something fun 🎨</p>
            </div>
          )}
          {groups.map(group => (
            <div key={group.date}>
              <div className="flex justify-center my-3">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-soft)' }}>
                  {group.date}
                </span>
              </div>
              {group.msgs.map(msg => (
                <Bubble key={msg.id} msg={msg} isMe={msg.sender_id === currentUserId} friend={friend} />
              ))}
            </div>
          ))}
          <AnimatePresence>
            {peerIsTyping && (
              <motion.div key="typing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                <TypingIndicator friend={friend} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Emoji picker */}
        <AnimatePresence>
          {showEmoji && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="flex-shrink-0 overflow-hidden">
              <div className="flex flex-wrap gap-1 p-3 mx-4 mb-2 rounded-2xl" style={{ background: 'var(--bg-chip)' }}>
                {EMOJIS.map(emoji => (
                  <button key={emoji} onClick={() => setText(prev => prev + emoji)}
                    className="w-8 h-8 flex items-center justify-center text-lg">{emoji}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="flex-shrink-0 px-4 py-3" style={{ background: 'var(--bg-card)', borderTop: '1.5px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <button onClick={() => { setShowDraw(true); setShowEmoji(false); }}
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--bg-chip)' }}>
              <PenTool size={18} style={{ color: 'var(--text-soft)' }} />
            </button>
            <button onClick={() => setShowEmoji(v => !v)}
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: showEmoji ? '#F0E8FF' : 'var(--bg-chip)', border: showEmoji ? '1.5px solid #B090FF44' : 'none' }}>
              <Smile size={18} style={{ color: showEmoji ? '#B090FF' : 'var(--text-soft)' }} />
            </button>
            <input type="text" value={text} onChange={e => handleTyping(e.target.value)}
              onFocus={() => dbSetTyping(convId, currentUserId, true).catch(() => {})}
              onBlur={() => dbSetTyping(convId, currentUserId, false).catch(() => {})}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a message…"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', color: 'var(--text-primary)' }} />
            <button onClick={handleSend} disabled={!text.trim() || sending}
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#B090FF,#7AC8FF)' }}>
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDraw && <DrawingModal onClose={() => setShowDraw(false)} onSend={handleDrawSend} />}
      </AnimatePresence>
    </>
  );
}
