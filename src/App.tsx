import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Trash2, Hash, X, ChevronRight, Tag as TagIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Note = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  updatedAt: string;
};

const STORAGE_KEY = 'mymemo.notes';

const SEED_DATA: Note[] = [
  {
    id: 1,
    title: "시안 작업 가이드",
    body: "브랜딩 가이드라인에 따라 색상 팔레트와 폰트 조합을 확인하세요.",
    tags: ["디자인", "가이드"],
    updatedAt: new Date('2024-04-20T10:00:00').toLocaleString(),
  },
  {
    id: 2,
    title: "읽어야 할 책 리스트",
    body: "1. 클린 코드\n2. 리팩터링\n3. 디자인 패턴",
    tags: ["독서", "자기개발"],
    updatedAt: new Date('2024-04-21T15:30:00').toLocaleString(),
  },
  {
    id: 3,
    title: "프로젝트 아이디어",
    body: "개인 포트폴리오 사이트를 다크 모드와 인터랙티브한 요소로 구성.",
    tags: ["업무", "개발"],
    updatedAt: new Date('2024-04-22T09:15:00').toLocaleString(),
  },
];

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // --- Initialize ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setNotes(JSON.parse(saved));
    } else {
      setNotes(SEED_DATA);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    }
  }, []);

  // --- Persistence ---
  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
  };

  // --- Handlers ---
  const handleAddNote = (title: string, body: string, tags: string[]) => {
    const newNote: Note = {
      id: Date.now(),
      title,
      body,
      tags: tags.map(t => t.trim()).filter(Boolean),
      updatedAt: new Date().toLocaleString(),
    };
    saveNotes([newNote, ...notes]);
    setIsModalOpen(false);
  };

  const handleUpdateNote = (id: number, title: string, body: string, tags: string[]) => {
    const updated = notes.map(n =>
      n.id === id
        ? { ...n, title, body, tags: tags.map(t => t.trim()).filter(Boolean), updatedAt: new Date().toLocaleString() }
        : n
    );
    saveNotes(updated);
    setEditingNote(null);
  };

  const handleDeleteNote = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('이 메모를 삭제하시겠습니까?')) {
      saveNotes(notes.filter(n => n.id !== id));
    }
  };

  // --- Filters ---
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTag = !selectedTag || note.tags.includes(selectedTag);
      
      return matchesSearch && matchesTag;
    });
  }, [notes, searchQuery, selectedTag]);

  const allTags = useMemo(() => {
    const tagMap = new Map<string, number>();
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1]);
  }, [notes]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 transition-all">
        <div className="flex items-center gap-2 text-indigo-600">
          <TagIcon className="w-6 h-6 fill-indigo-600/10" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900">MyMemo</h1>
        </div>

        <div className="flex-1 max-w-xl mx-8 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search notes, tags, content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 bg-slate-100 rounded-full pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white border-transparent focus:border-indigo-500/30 border transition-all outline-none text-sm"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 active:scale-95 transition-all shadow-sm shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          <span>New Memo</span>
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-200 bg-white p-6 hidden md:flex flex-col shrink-0">
          <nav className="space-y-6 flex-1">
            <div>
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 pl-1">Navigation</h2>
              <button
                onClick={() => setSelectedTag(null)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                  !selectedTag 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm shadow-indigo-100/50' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Hash className="w-4 h-4" />
                  All Notes
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${!selectedTag ? 'bg-indigo-100' : 'bg-slate-100 text-slate-400'}`}>
                  {notes.length}
                </span>
              </button>
            </div>

            <div>
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 pl-1">Tags</h2>
              <div className="space-y-1">
                {allTags.map(([tag, count]) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      selectedTag === tag 
                        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm shadow-indigo-100/50' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-3 truncate">
                      <TagIcon className="w-4 h-4" />
                      {tag}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedTag === tag ? 'bg-indigo-100' : 'bg-slate-100 text-slate-400'}`}>
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <div className="text-sm font-medium text-slate-700">User Profile</div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {selectedTag && (
              <div className="mb-8 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtered By</span>
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-indigo-100 shadow-sm shadow-indigo-100/20">
                  #{selectedTag}
                  <button onClick={() => setSelectedTag(null)} className="hover:text-indigo-900 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              </div>
            )}

            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onDelete={handleDeleteNote}
                    onClick={() => setEditingNote(note)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredNotes.length === 0 && (
              <div className="h-96 flex flex-col items-center justify-center text-slate-300">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 opacity-20" />
                </div>
                <h3 className="text-lg font-semibold text-slate-500">No results found</h3>
                <p className="text-sm">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(isModalOpen || editingNote) && (
          <NoteModal
            isOpen={true}
            note={editingNote}
            onClose={() => {
              setIsModalOpen(false);
              setEditingNote(null);
            }}
            onSave={editingNote ? handleUpdateNote : handleAddNote}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Components ---

interface NoteCardProps {
  note: Note;
  onDelete: (id: number, e: React.MouseEvent) => void;
  onClick: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete, onClick }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group relative bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 cursor-pointer transition-all flex flex-col min-h-[200px]"
    >
      <button
        onClick={(e) => onDelete(note.id, e)}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all rounded-full hover:bg-red-50 z-10"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <h3 className="font-bold text-lg text-slate-800 mb-2 pr-6 leading-tight group-hover:text-indigo-700 transition-colors">{note.title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed line-clamp-4 mb-4 flex-1 whitespace-pre-wrap">{note.body}</p>

      <div className="flex flex-wrap gap-2 mt-auto">
        {note.tags.map(tag => (
          <span key={tag} className="text-[9px] font-black px-2 py-1 rounded-lg bg-slate-100 text-slate-500 uppercase tracking-widest border border-slate-200/50">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-medium tracking-wide">Updated {note.updatedAt}</span>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
      </div>
    </motion.div>
  );
}

interface NoteModalProps {
  isOpen: boolean;
  note: Note | null;
  onClose: () => void;
  onSave: (arg1: any, arg2: any, arg3: any, arg4?: any) => void;
}

function NoteModal({
  note,
  onClose,
  onSave,
}: NoteModalProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [body, setBody] = useState(note?.body || '');
  const [tagsInput, setTagsInput] = useState(note?.tags.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    
    if (note) {
      onSave(note.id, title, body, tags);
    } else {
      onSave(title, body, tags);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl shadow-indigo-900/10 overflow-hidden border border-slate-100"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">{note ? 'Edit Memo' : 'New Memo'}</h2>
          <button onClick={onClose} className="p-2.5 hover:bg-white hover:shadow-sm rounded-full transition-all text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Title</label>
            <input
              type="text"
              autoFocus
              required
              placeholder="e.g. Project Kickoff"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-bold p-4 bg-slate-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white border-transparent focus:border-indigo-500/30 border transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Content</label>
            <textarea
              placeholder="Start writing your thoughts..."
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-4 bg-slate-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white border-transparent focus:border-indigo-500/30 border transition-all resize-none text-slate-600 leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tags (Comma separated)</label>
            <div className="relative">
              <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="design, dev, personal"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white border-transparent focus:border-indigo-500/30 border transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 border border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 py-4 px-6 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            >
              Save Memo
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

