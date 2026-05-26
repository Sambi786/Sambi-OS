
import {useState, useEffect} from 'react';
import {Plus, Trash2, FileText, Search, CloudCheck, Cloud} from 'lucide-react';
import { pushNotification } from '../NotificationSystem';

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('sambi_notes');
    return saved ? JSON.parse(saved) : [
      {id: '1', title: 'System Notes', content: 'Sambi Linux kernel is stable. Privacy shields at 94%.', date: new Date().toISOString(), tags: ['system']}
    ];
  });
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsSaving(true);
    const timer = setTimeout(() => {
      localStorage.setItem('sambi_notes', JSON.stringify(notes));
      setIsSaving(false);
    }, 800); // Subtle debounce for visual feedback
    return () => clearTimeout(timer);
  }, [notes]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      date: new Date().toISOString(),
      tags: []
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(n => n.id === id ? {...n, ...updates} : n));
  };

  const deleteNote = (id: string) => {
    const noteToDelete = notes.find(n => n.id === id);
    const nextNotes = notes.filter(n => n.id !== id);
    setNotes(nextNotes);
    if (activeNoteId === id) setActiveNoteId(nextNotes[0]?.id || null);
    pushNotification('Note Deleted', `"${noteToDelete?.title || 'Untitled'}" was removed from local storage.`, 'warning');
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full bg-[#16181d] text-zinc-300">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col bg-black/10">
        <header className="p-4 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight uppercase text-zinc-500">Notes</h2>
          <button 
            onClick={addNote}
            className="p-1.5 bg-orange-600 hover:bg-orange-500 rounded-lg text-white transition-colors"
          >
            <Plus size={14} />
          </button>
        </header>

        <div className="px-4 mb-4">
          <div className="flex items-center bg-black/30 border border-white/5 rounded-lg px-2 py-1.5">
            <Search size={12} className="text-zinc-600 mr-2" />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[10px] flex-1"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto px-2 space-y-1">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`w-full text-left p-3 rounded-xl transition-all ${note.id === activeNoteId ? 'bg-orange-600/10 border border-orange-500/20 shadow-lg' : 'hover:bg-white/5 border border-transparent'}`}
            >
              <h3 className={`text-xs font-bold mb-1 truncate ${note.id === activeNoteId ? 'text-zinc-100' : 'text-zinc-400'}`}>
                {note.title || 'Untitled Note'}
              </h3>
              <p className="text-[10px] text-zinc-600 line-clamp-1">{note.content || 'No content...'}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[8px] text-zinc-700 font-mono">
                  {new Date(note.date).toLocaleDateString([], {month: 'short', day: 'numeric'})}
                </span>
                <div className="flex gap-1">
                  {note.tags.map(t => (
                    <span key={t} className="px-1 py-0.5 bg-white/5 rounded-[2px] text-[8px] text-zinc-500">#{t}</span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Editor */}
      <main className="flex-1 flex flex-col">
        {activeNote ? (
          <>
            <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-black/5">
              <div className="flex items-center gap-4 flex-1">
                <input 
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => updateNote(activeNote.id, {title: e.target.value})}
                  className="bg-transparent border-none outline-none text-sm font-black uppercase tracking-[0.1em] text-zinc-100 flex-1"
                  placeholder="Note Title"
                />
                
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-500 ${
                  isSaving ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  {isSaving ? <Cloud size={10} className="animate-pulse" /> : <CloudCheck size={10} />}
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {isSaving ? 'Saving' : 'Synced'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => deleteNote(activeNote.id)}
                  className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-zinc-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </header>
            <textarea 
              value={activeNote.content}
              onChange={(e) => updateNote(activeNote.id, {content: e.target.value})}
              className="flex-1 bg-transparent border-none outline-none p-8 text-sm text-zinc-400 resize-none font-sans leading-relaxed"
              placeholder="Start typing..."
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-700">
            <FileText size={64} className="mb-4 opacity-5" />
            <p className="text-sm">Select or create a note</p>
          </div>
        )}
      </main>
    </div>
  );
}
