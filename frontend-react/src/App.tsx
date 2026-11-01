import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Settings, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  MoreVertical, 
  RotateCw, 
  Send, 
  MessageSquare, 
  Check, 
  X, 
  Star, 
  Menu,
  Zap
} from 'lucide-react';

// Initial Mock Conversations
const INITIAL_CONVERSATIONS = [
  { id: '1', title: 'Create Html Game Environment...', category: 'Your conversations', active: false },
  { id: '2', title: 'Apply To Leave For Emergency', category: 'Your conversations', active: false },
  { id: '3', title: 'What Is UI UX Design?', category: 'Your conversations', active: false },
  { id: '4', title: 'Create POS System', category: 'Your conversations', active: false },
  { id: '5', title: 'What Is UX Audit?', category: 'Your conversations', active: false },
  { id: '6', title: 'CyberShield AI Analysis', category: 'Your conversations', active: true },
  { id: '7', title: 'How Chat GPT Work?', category: 'Your conversations', active: false },
  { id: '8', title: 'Crypto Lending App Name', category: 'Last 7 Days', active: false },
  { id: '9', title: 'Operator Grammar Types', category: 'Last 7 Days', active: false },
  { id: '10', title: 'Min States For Binary DFA', category: 'Last 7 Days', active: false },
];

// Initial Welcome Message
const DEFAULT_CHAT_MESSAGES = [
  {
    id: 'm1',
    sender: 'ai',
    text: 'Welcome to **CyberShield**! 🛡️\n\nPaste any suspicious email, SMS, or link below. I will analyze it using our ML model, extract the red flags, and provide a safe-response checklist.',
    timestamp: 'Just now'
  }
];

export default function App() {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState('6');
  const [chatMessages, setChatMessages] = useState<any[]>(DEFAULT_CHAT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, string | null>>({});
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');
  const [showProModal, setShowProModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages appear
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isGenerating]);

  // Handle switching active conversation
  const handleSelectConversation = (id: string) => {
    setActiveConvId(id);
    setConversations(prev =>
      prev.map(c => ({ ...c, active: c.id === id }))
    );
    setMobileSidebarOpen(false);

    const conv = conversations.find(c => c.id === id);
    if (conv && id !== '6') {
      setChatMessages([
        {
          id: `m-init-${id}`,
          sender: 'ai',
          text: `This is a demo conversation. Return to the "CyberShield AI Analysis" chat to use the security analyzer.`,
          timestamp: 'Just now'
        }
      ]);
    } else if (id === '6') {
      setChatMessages(DEFAULT_CHAT_MESSAGES);
    }
  };

  // Create new conversation
  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newConv = {
      id: newId,
      title: 'New Scan...',
      category: 'Your conversations',
      active: true
    };
    setConversations(prev => [
      newConv,
      ...prev.map(c => ({ ...c, active: false }))
    ]);
    setActiveConvId(newId);
    setChatMessages([...DEFAULT_CHAT_MESSAGES]);
    setMobileSidebarOpen(false);
  };

  // Clear all "Your conversations"
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear your conversation history?")) {
      setConversations(prev => prev.filter(c => c.category !== 'Your conversations'));
    }
  };

  // Delete individual conversation
  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    if (activeConvId === id && updated.length > 0) {
      handleSelectConversation(updated[0].id);
    }
  };

  // Start editing conversation title
  const handleStartEditTitle = (e: React.MouseEvent, conv: any) => {
    e.stopPropagation();
    setEditingTitleId(conv.id);
    setTempTitle(conv.title);
  };

  // Save conversation title
  const handleSaveTitle = (id: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, title: tempTitle || c.title } : c))
    );
    setEditingTitleId(null);
  };

  // Submit User Message and call FastAPI Backend
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isGenerating) return;

    const userMsgText = inputText;
    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsGenerating(true);

    // Update current conversation title if it was default
    const currentConv = conversations.find(c => c.id === activeConvId);
    if (currentConv && currentConv.title.startsWith('New Scan')) {
      const formattedTitle = userMsgText.slice(0, 24) + (userMsgText.length > 24 ? '...' : '');
      setConversations(prev =>
        prev.map(c => c.id === activeConvId ? { ...c, title: formattedTitle } : c)
      );
    }

    try {
      // CONNECT TO FASTAPI BACKEND
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsgText })
      });

      if (!response.ok) throw new Error("Backend Error");

      const data = await response.json();

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.explanation, // The Markdown from Python
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: "⚠️ **Connection Error:** Could not connect to the CyberShield backend. Please ensure the Python FastAPI server is running on port 8000.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Copy Text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle Like/Dislike toggle
  const handleReaction = (msgId: string, type: string) => {
    setLikedMap(prev => ({
      ...prev,
      [msgId]: prev[msgId] === type ? null : type
    }));
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full bg-[#EAEFF8] font-sans antialiased p-2 md:p-5 overflow-hidden text-slate-800">
      <div className="flex w-full h-full max-w-[1700px] mx-auto gap-4 relative">

        {/* MOBILE SIDEBAR TOGGLE */}
        <button 
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="md:hidden absolute top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-md text-slate-700"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* LEFT SIDEBAR */}
        <div className={`fixed md:relative z-40 inset-y-0 left-0 w-[300px] lg:w-[320px] bg-white rounded-3xl p-5 flex flex-col justify-between shadow-xl md:shadow-none transition-transform duration-300 ease-in-out ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div>
            <div className="flex items-center justify-between pt-1 pb-6 px-1">
              <h1 className="text-xl font-extrabold tracking-wider text-slate-900 flex items-center gap-1.5">
                CYBERSHIELD<span className="text-[#5865F2]">+</span>
              </h1>
              {mobileSidebarOpen && (
                <button onClick={() => setMobileSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleNewChat}
                className="flex-1 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 px-5 rounded-full flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 text-sm"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Scan</span>
              </button>
              <button
                onClick={() => setIsSearching(!isSearching)}
                className={`p-3 rounded-full transition-all duration-200 flex items-center justify-center ${isSearching ? 'bg-indigo-100 text-[#5865F2]' : 'bg-black text-white hover:bg-slate-800'}`}
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {isSearching && (
              <div className="mb-4 relative">
                <input
                  type="text"
                  placeholder="Filter conversations..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 text-xs py-2.5 px-3.5 pr-8 rounded-xl border border-slate-200 focus:outline-none focus:border-[#5865F2]"
                  autoFocus
                />
              </div>
            )}

            <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-340px)] pr-1 custom-scrollbar">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-3 px-2">
                  <span>Your conversations</span>
                  <button onClick={handleClearAll} className="text-[#5865F2] hover:underline hover:text-indigo-700 text-[11px] font-medium transition-colors">
                    Clear All
                  </button>
                </div>

                <div className="space-y-1">
                  {filteredConversations.filter(c => c.category === 'Your conversations').map(conv => (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-150 ${conv.active ? 'bg-[#EBF0FF] text-[#5865F2] font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${conv.active ? 'text-[#5865F2]' : 'text-slate-400'}`} />
                        {editingTitleId === conv.id ? (
                          <input
                            type="text"
                            value={tempTitle}
                            onChange={e => setTempTitle(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSaveTitle(conv.id)}
                            onBlur={() => handleSaveTitle(conv.id)}
                            className="bg-white border border-indigo-300 rounded px-1.5 py-0.5 text-xs focus:outline-none w-full"
                            autoFocus
                          />
                        ) : (
                          <span className="truncate">{conv.title}</span>
                        )}
                      </div>

                      {conv.active && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={(e) => handleDeleteConversation(e, conv.id)} className="p-1 hover:bg-white rounded-full text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <button onClick={(e) => handleStartEditTitle(e, conv)} className="p-1 hover:bg-white rounded-full text-slate-400 hover:text-slate-700 transition-colors">
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <div className="w-2 h-2 rounded-full bg-[#5865F2] ml-1"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button onClick={() => setShowSettingsModal(true)} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors">
              <div className="p-1.5 bg-slate-100 rounded-full border border-slate-200">
                <Settings className="w-3.5 h-3.5 text-slate-600" />
              </div>
              <span>Settings</span>
            </button>

            <div className="flex items-center gap-3 px-3 py-2 rounded-full border border-slate-100 bg-slate-50/80 hover:bg-slate-100 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-[#5865F2] text-white flex items-center justify-center font-bold text-xs">CS</div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">CyberShield User</p>
                <p className="text-[10px] text-slate-400 truncate">sec-agent@cybershield.ai</p>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CHAT VIEWPORT */}
        <div className="flex-1 bg-white rounded-3xl flex flex-col justify-between relative shadow-sm overflow-hidden">
          
          <div className="flex-1 overflow-y-auto px-6 md:px-16 lg:px-24 py-8 space-y-8 custom-scrollbar">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="space-y-3 max-w-4xl mx-auto">
                
                {msg.sender === 'user' ? (
                  <div className="flex items-start justify-between gap-4 group">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-slate-600">U</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 pt-1 leading-relaxed">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center text-[10px] font-bold text-[#5865F2] tracking-wider uppercase">
                        <span>CyberShield AI</span>
                        <div className="w-3.5 h-3.5 ml-1 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-200">
                          <Zap className="w-2.5 h-2.5 text-[#5865F2]" />
                        </div>
                      </div>
                    </div>

                    {/* REACT-MARKDOWN RENDERER */}
                    <div className="text-xs md:text-sm text-slate-700 leading-relaxed space-y-3 pl-1 font-normal prose prose-sm max-w-none">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 text-slate-400">
                        <button onClick={() => handleReaction(msg.id, 'like')} className={`p-1.5 rounded hover:bg-slate-100 transition-colors ${likedMap[msg.id] === 'like' ? 'text-[#5865F2]' : 'hover:text-slate-600'}`}>
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleReaction(msg.id, 'dislike')} className={`p-1.5 rounded hover:bg-slate-100 transition-colors ${likedMap[msg.id] === 'dislike' ? 'text-red-500' : 'hover:text-slate-600'}`}>
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleCopy(msg.id, msg.text)} className="p-1.5 rounded hover:bg-slate-100 hover:text-slate-600 transition-colors relative">
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <button onClick={() => { setIsGenerating(true); setTimeout(() => setIsGenerating(false), 1000); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200">
                        <RotateCw className={`w-3 h-3 ${isGenerating ? 'animate-spin text-[#5865F2]' : ''}`} />
                        <span>Regenerate</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isGenerating && (
              <div className="flex items-center gap-3 max-w-4xl mx-auto py-2">
                <div className="w-2 h-2 rounded-full bg-[#5865F2] animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-[#5865F2] animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-[#5865F2] animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-xs text-slate-400 font-medium">CyberShield is analyzing...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* BOTTOM INPUT */}
          <div className="p-4 md:px-16 lg:px-24 bg-gradient-to-t from-white via-white to-transparent">
            <form onSubmit={handleSendMessage} className="relative max-w-3xl mx-auto">
              <div className="flex items-center bg-white rounded-full border border-slate-200/80 shadow-lg px-4 py-2 hover:border-slate-300 focus-within:border-[#5865F2] focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <div className="p-1.5 rounded-full bg-indigo-100 text-[#5865F2] mr-2 shrink-0 flex items-center justify-center">
                  <span className="text-xs">🛡️</span>
                </div>
                <input
                  type="text"
                  placeholder="Paste a suspicious email, SMS, or link here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-transparent text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isGenerating}
                  className={`p-2.5 rounded-full transition-all duration-200 shrink-0 ml-2 ${inputText.trim() && !isGenerating ? 'bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-md cursor-pointer' : 'bg-indigo-300 text-white cursor-not-allowed'}`}
                >
                  <Send className="w-4 h-4 transform rotate-45 -translate-x-0.5 translate-y-0.5" />
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* Modals (Kept from original) */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setShowSettingsModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Preferences</h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="font-medium text-slate-700">Theme</span>
                <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-600 font-medium">Light Mode</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="font-medium text-slate-700">LLM Model</span>
                <span className="bg-indigo-50 text-[#5865F2] font-semibold px-3 py-1 rounded-full">Gemini 1.5 Flash</span>
              </div>
            </div>
            <button onClick={() => setShowSettingsModal(false)} className="w-full mt-6 bg-slate-900 text-white font-medium py-2.5 rounded-full text-xs">
              Done
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}