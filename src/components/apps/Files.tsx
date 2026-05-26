import {useState, useEffect} from 'react';
import {Folder, FileText, ChevronRight, ArrowLeft, Search, MoreVertical, HardDrive, Clock, Star, Trash2, Folders, Plus, FilePlus, FolderPlus, X, Image as ImageIcon, FileCode, ExternalLink, Download} from 'lucide-react';
import {getFS, saveFS, FileNode} from '../../lib/fs';

export default function FilesApp() {
  const [fs, setFs] = useState<FileNode[]>(getFS());
  const [path, setPath] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

  // Sync FS state when localStorage changes
  useEffect(() => {
    const handleStorage = () => {
      setFs(getFS());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const currentFolder = path.reduce((acc, folderName) => {
    const found = acc.find(node => node.name === folderName && node.type === 'folder');
    return found?.children || [];
  }, fs);

  const filteredItems = currentFolder.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigateTo = (folderName: string) => {
    setPath([...path, folderName]);
  };

  const goBack = () => {
    setPath(path.slice(0, -1));
  };

  const getFileIcon = (name: string, type: 'file' | 'folder') => {
    if (type === 'folder') return <Folder size={48} className="text-orange-500/80 group-hover:text-orange-500 transition-colors" />;
    
    const ext = name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) {
      return <ImageIcon size={48} className="text-emerald-500/80 group-hover:text-emerald-400 transition-colors" />;
    }
    if (['js', 'ts', 'tsx', 'jsx', 'html', 'css', 'json'].includes(ext || '')) {
      return <FileCode size={48} className="text-indigo-400/80 group-hover:text-indigo-300 transition-colors" />;
    }
    return <FileText size={48} className="text-zinc-400/80 group-hover:text-zinc-300 transition-colors" />;
  };

  const handleOpen = (item: FileNode) => {
    if (item.type === 'folder') {
      navigateTo(item.name);
    } else {
      setSelectedFile(item);
    }
  };

  const updateFS = (newFS: FileNode[]) => {
    setFs(newFS);
    saveFS(newFS);
  };

  const createItem = (type: 'file' | 'folder') => {
    const name = prompt(`Enter ${type} name:`);
    if (!name) return;

    const newItem: FileNode = {
      name,
      type,
      modified: new Date().toISOString(),
      content: type === 'file' ? '' : undefined,
      children: type === 'folder' ? [] : undefined
    };

    const newFS = [...fs];
    let target = newFS;
    
    for (const folderName of path) {
      const folder = target.find(n => n.name === folderName && n.type === 'folder');
      if (folder && folder.children) {
        target = folder.children;
      }
    }

    target.push(newItem);
    updateFS(newFS);
  };

  const deleteItem = (name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    const newFS = [...fs];
    let target = newFS;
    
    for (const folderName of path) {
      const folder = target.find(n => n.name === folderName && n.type === 'folder');
      if (folder && folder.children) {
        target = folder.children;
      }
    }

    const index = target.findIndex(n => n.name === name);
    if (index !== -1) {
      target.splice(index, 1);
      updateFS(newFS);
    }
  };

  const FileViewer = ({file, onClose}: {file: FileNode, onClose: () => void}) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '');
    const isPdf = ext === 'pdf';

    return (
      <div className="absolute inset-0 z-50 bg-[#0c0d10] flex flex-col items-center">
        <header className="w-full h-14 bg-white/5 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">{file.name}</span>
              <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                Modified {new Date(file.modified).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                const element = document.createElement("a");
                const fileContent = file.content || "";
                let fileBlob: Blob;
                if (fileContent.startsWith("data:")) {
                  const parts = fileContent.split(',');
                  const mime = parts[0].match(/:(.*?);/)?.[1] || "";
                  const bstr = atob(parts[1]);
                  let n = bstr.length;
                  const u8arr = new Uint8Array(n);
                  while(n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                  }
                  fileBlob = new Blob([u8arr], {type: mime});
                } else {
                  fileBlob = new Blob([fileContent], {type: 'text/plain'});
                }
                element.href = URL.createObjectURL(fileBlob);
                element.download = file.name;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
              className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white" 
              title="Download"
            >
              <Download size={18} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </header>
        
        <main className="flex-1 w-full bg-black/40 overflow-auto flex items-center justify-center p-8">
          {isImage ? (
            <div className="relative group max-w-full max-h-full">
              <img 
                src={file.content || ''} 
                alt={file.name} 
                className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl ring-1 ring-white/10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                 <button className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-white/20 transition-all">
                   <ExternalLink size={16} />
                   View Original
                 </button>
              </div>
            </div>
          ) : isPdf ? (
            <div className="w-full h-full max-w-4xl bg-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/5">
              <iframe 
                src={file.content} 
                className="w-full flex-1 border-none"
                title="PDF Viewer"
              />
            </div>
          ) : (
            <div className="w-full max-w-4xl h-full bg-[#0c0d10] rounded-[32px] border border-white/5 p-10 overflow-auto shadow-2xl">
              <pre className="text-zinc-400 font-mono text-sm leading-relaxed whitespace-pre-wrap selection:bg-indigo-500/30 selection:text-indigo-200">
                {file.content || 'No content found.'}
              </pre>
            </div>
          )}
        </main>
      </div>
    );
  };

  return (
    <div className="flex h-full bg-[#16181d] text-zinc-300 relative overflow-hidden">
      {/* Sidebar */}
      <aside className="w-48 border-r border-white/5 p-4 flex flex-col gap-6 hidden md:flex">
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 px-2">Library</div>
          {[
            {icon: Clock, label: 'Recent', path: ['Documents']},
            {icon: Star, label: 'Starred', path: ['Private']},
            {icon: Folders, label: 'Downloads', path: ['Downloads']},
            {icon: HardDrive, label: 'Sambi-SSD', path: []},
            {icon: Trash2, label: 'Trash', path: ['System']},
          ].map((item: any, i) => (
            <button 
              key={i} 
              onClick={() => setPath(item.path)}
              className="flex items-center gap-3 w-full px-4 py-2 rounded-xl hover:bg-white/5 transition-all text-[11px] font-bold tracking-tight text-zinc-500 hover:text-zinc-100 group"
            >
              <item.icon size={16} className={`group-hover:text-indigo-400 transition-colors ${path.join('/') === item.path.join('/') ? 'text-indigo-400' : ''}`} />
              {item.label}
            </button>
          ))}
        </div>
        
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 px-2">Drives</div>
          {fs.filter(n => n.type === 'folder').map((folder, i) => (
            <button 
              key={i} 
              onClick={() => setPath([folder.name])}
              className="flex items-center gap-3 w-full px-4 py-2 rounded-xl hover:bg-white/5 transition-all text-[11px] font-bold tracking-tight text-zinc-500 hover:text-zinc-100 group"
            >
              <Folder size={16} className={`text-orange-500/60 group-hover:text-orange-500 transition-colors ${path[0] === folder.name && path.length === 1 ? 'text-orange-500' : ''}`} />
              {folder.name}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#0c0d10]/40">
        {/* Toolbar */}
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 gap-6">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <button 
                onClick={goBack}
                disabled={path.length === 0}
                className="p-2 hover:bg-white/5 rounded-xl disabled:opacity-10 transition-all"
              >
                <ArrowLeft size={18} />
              </button>
            </div>
            <div className="flex items-center text-[11px] font-black uppercase tracking-widest text-zinc-500">
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => setPath([])}>Root</span>
              {path.map((p, i) => (
                <div key={i} className="flex items-center">
                  <ChevronRight size={14} className="mx-2 text-zinc-700" />
                  <span className="hover:text-white cursor-pointer transition-colors">{p}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white/5 border border-white/5 rounded-xl px-4 py-1.5 w-48 focus-within:w-64 focus-within:bg-white/10 transition-all group">
              <Search size={14} className="text-zinc-500 group-focus-within:text-indigo-400 mr-3" />
              <input 
                type="text" 
                placeholder="Find in files..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-[11px] font-bold flex-1 placeholder:text-zinc-600"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl">
              <button 
                onClick={() => createItem('file')}
                className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-all"
                title="New File"
              >
                <FilePlus size={16} />
              </button>
              <button 
                onClick={() => createItem('folder')}
                className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-all"
                title="New Folder"
              >
                <FolderPlus size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-auto">
          {filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-700">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Folders size={32} className="opacity-20" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em]">Void Cluster</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {filteredItems.map((item, i) => (
                <div
                  key={i}
                  className="group relative flex flex-col items-center gap-4 p-6 rounded-[32px] hover:bg-white/5 transition-all duration-300 text-center border border-transparent hover:border-white/5"
                >
                  <button 
                    onDoubleClick={() => handleOpen(item)}
                    className="flex flex-col items-center gap-4 w-full"
                  >
                    <div className="relative transform group-hover:scale-110 transition-transform duration-500">
                      {getFileIcon(item.name, item.type)}
                      <div className="absolute inset-0 bg-indigo-500/20 blur-2xl opacity-0 group-hover:opacity-40 transition-opacity" />
                    </div>
                    <span className="text-[11px] font-bold tracking-tight text-zinc-400 group-hover:text-white truncate w-full px-2 transition-colors">
                      {item.name}
                    </span>
                  </button>
                  
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <button 
                      onClick={() => deleteItem(item.name)}
                      className="p-2 bg-black/40 hover:bg-red-500/20 text-zinc-600 hover:text-red-400 rounded-xl transition-all border border-white/5"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* File Viewer Overlay */}
      {selectedFile && (
        <FileViewer file={selectedFile} onClose={() => setSelectedFile(null)} />
      )}
    </div>
  );
}
