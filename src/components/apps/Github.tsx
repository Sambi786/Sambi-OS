import { useState, useEffect, useCallback } from 'react';
import { Github, Search, Star, GitFork, Book, Download, Check, File, Folder, ArrowLeft, RefreshCw, ChevronRight, LogOut, Lock } from 'lucide-react';
import { getFS, saveFS, FileNode } from '../../lib/fs';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export default function GithubApp() {
  const [view, setView] = useState<'repos' | 'repo-details'>('repos');
  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);

  const [isGuestMode, setIsGuestMode] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/github/status');
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
      if (data.authenticated) {
        fetchUser();
        fetchRepos();
      } else {
        // Automatically enter guest mode if not authenticated
        setIsGuestMode(true);
        loadGuestRepos();
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setIsAuthenticated(false);
      setIsGuestMode(true);
      loadGuestRepos();
    }
  }, []);

  const loadGuestRepos = () => {
    const mockRepos: Repository[] = [
      {
        id: 1,
        name: 'sambi-os',
        full_name: 'sambi/sambi-os',
        description: 'Next-generation privacy-first operating system for the intelligent web.',
        stargazers_count: 12400,
        forks_count: 850,
        language: 'TypeScript',
        updated_at: new Date().toISOString(),
        owner: {
          login: 'sambi',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sambi'
        }
      },
      {
        id: 2,
        name: 'privacy-core',
        full_name: 'sambi/privacy-core',
        description: 'Hardened kernel modules for secure cross-origin communication.',
        stargazers_count: 8200,
        forks_count: 340,
        language: 'Rust',
        updated_at: new Date().toISOString(),
        owner: {
          login: 'sambi',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=core'
        }
      },
      {
        id: 3,
        name: 'intelligence-api',
        full_name: 'sambi/intelligence-api',
        description: 'Semantic reasoning engine powered by distributed edge nodes.',
        stargazers_count: 5600,
        forks_count: 120,
        language: 'Python',
        updated_at: new Date().toISOString(),
        owner: {
          login: 'sambi',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=brain'
        }
      }
    ];
    setRepos(mockRepos);
    setUser({
      login: 'SambiQuest',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sambi'
    });
  };

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/github/user');
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error('Fetch user failed:', err);
    }
  };

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/github/user/repos?sort=updated&per_page=100');
      const data = await res.json();
      if (Array.isArray(data)) {
        setRepos(data);
      }
    } catch (err) {
      console.error('Fetch repos failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        checkAuth();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [checkAuth]);

  const handleConnect = async () => {
    try {
      const res = await fetch('/api/auth/github/url');
      const { url } = await res.json();
      window.open(url, 'github_oauth', 'width=600,height=700');
    } catch (err) {
      console.error('Failed to get auth URL:', err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/github/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setUser(null);
    setRepos([]);
  };

  const fetchRepoContents = async (repoName: string, path: string = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/github/repos/${repoName}/contents/${path}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCurrentPath(data);
      }
    } catch (err) {
      console.error('Fetch contents failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPath = currentPath.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = async (file: any) => {
    if (file.type === 'dir') return;
    
    setDownloading(file.name);
    
    try {
      const res = await fetch(file.download_url);
      const content = await res.text();
      
      const fs = getFS();
      const downloadsFolder = fs.find(node => node.name === 'Downloads');
      
      if (downloadsFolder && downloadsFolder.children) {
        // Avoid duplicates
        const existingIndex = downloadsFolder.children.findIndex(f => f.name === file.name);
        const newNode = {
          name: file.name,
          type: 'file' as const,
          content: content,
          modified: new Date().toISOString()
        };

        if (existingIndex !== -1) {
          downloadsFolder.children[existingIndex] = newNode;
        } else {
          downloadsFolder.children.push(newNode);
        }
        saveFS(fs);
      }
      
      setDownloaded(prev => [...prev, file.name]);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(null);
    }
  };

  if (isAuthenticated === false && !isGuestMode) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0d1117] text-white p-6 text-center">
        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 ring-1 ring-white/10">
          <Github size={48} className="text-white" />
        </div>
        <h2 className="text-3xl font-black tracking-tight mb-4">Connect to GitHub</h2>
        <p className="text-[#8b949e] max-w-sm mb-10 leading-relaxed font-bold uppercase text-[10px] tracking-[0.2em]">
          Experience Sambi-OS with your live codebase. Authentication is secure and minimal.
        </p>
        <button 
          onClick={handleConnect}
          className="flex items-center gap-3 bg-[#238636] hover:bg-[#2ea043] text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-emerald-500/10 active:scale-95 group"
        >
          <Lock size={18} className="group-hover:translate-y-[-2px] transition-transform" />
          Authorize GitHub Access
        </button>
        <p className="mt-8 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
          Required scopes: repo, read:user
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9] font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {isGuestMode && (
        <div className="bg-indigo-600/20 text-indigo-200 text-[10px] font-black uppercase tracking-[0.3em] py-2 text-center border-b border-indigo-500/30">
          Viewing in Guest Mode • Sandbox Data Only
        </div>
      )}
      {/* Header */}
      <header className="bg-[#161b22] border-b border-[#30363d] px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              // We need to trigger the menu in Desktop.tsx
              // Since we don't have direct access, we can dispatch a custom event
              window.dispatchEvent(new CustomEvent('TOGGLE_SAMBI_MENU'));
            }}
            className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 hover:scale-110 transition-transform md:hidden"
          >
            <Github size={20} className="text-white" />
          </button>
          <Github 
            size={32} 
            className="text-white bg-white/10 p-1.5 rounded-lg cursor-pointer hover:bg-white/20 transition-all hidden md:block" 
            onClick={() => { setView('repos'); setSelectedRepo(null); }}
          />
          <div className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 w-40 md:w-64 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
            <Search size={16} className="text-[#8b949e] shrink-0" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs font-bold text-[#8b949e] hover:text-white cursor-pointer hidden md:block">Pull requests</span>
          <span className="text-xs font-bold text-[#8b949e] hover:text-white cursor-pointer hidden md:block">Issues</span>
          <button onClick={fetchRepos} className="p-2 hover:bg-white/5 rounded-lg transition-all" title="Refresh">
            <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''} text-[#8b949e]`} />
          </button>
          <div className="flex items-center gap-3 border-l border-[#30363d] pl-6">
            {user && (
              <img src={user.avatar_url} className="w-8 h-8 rounded-full border border-white/10 shadow-lg" alt={user.login} />
            )}
            <button onClick={handleLogout} className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-all" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {view === 'repos' ? (
          <div className="max-w-4xl mx-auto p-10 space-y-6">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-6 mb-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {user ? `${user.login}'s Repositories` : 'Repositories'}
                </h2>
                <span className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest">{repos.length} Live Sync Sources</span>
              </div>
              <div className="flex gap-2">
                <button className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-black px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-xl shadow-emerald-500/10">
                  New Repository
                </button>
              </div>
            </div>

            {loading && repos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-zinc-700">
                <RefreshCw size={32} className="animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Scanning Grid...</p>
              </div>
            ) : (
              <div className="divide-y divide-[#30363d]">
                {filteredRepos.map(repo => (
                  <div key={repo.id} className="py-8 group animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => {
                              setSelectedRepo(repo);
                              setView('repo-details');
                              fetchRepoContents(repo.full_name);
                            }}
                            className="text-xl font-bold text-[#58a6ff] hover:underline tracking-tight"
                          >
                            {repo.name}
                          </button>
                          <span className="text-[9px] text-[#8b949e] border border-[#30363d] px-2 py-0.5 rounded-full uppercase font-black tracking-widest">Public</span>
                        </div>
                        <p className="text-sm text-[#8b949e] max-w-2xl leading-relaxed">{repo.description || "No description provided."}</p>
                        <div className="flex items-center gap-6 text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">
                          {repo.language && (
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                              {repo.language}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 hover:text-[#58a6ff] cursor-pointer transition-colors">
                            <Star size={14} className="mb-0.5" />
                            {repo.stargazers_count}
                          </div>
                          <div className="flex items-center gap-1.5 hover:text-[#58a6ff] cursor-pointer transition-colors">
                            <GitFork size={14} className="mb-0.5" />
                            {repo.forks_count}
                          </div>
                          <span className="text-zinc-600">Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button className="bg-[#21262d] hover:bg-[#30363d] border border-[#f0f6fc1a] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-white transition-all">
                        <Star size={14} />
                        Star
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-3 mb-10 text-[10px] font-black uppercase tracking-widest">
              <button 
                onClick={() => setView('repos')}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                Repositories
              </button>
              <ChevronRight size={14} className="text-[#30363d]" />
              <span className="text-indigo-400">{selectedRepo?.name}</span>
            </div>

            {/* Repo Content View */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-t-[20px] p-5 flex items-center justify-between ring-1 ring-white/5">
              <div className="flex items-center gap-4">
                <img src={selectedRepo?.owner.avatar_url} className="w-6 h-6 rounded-full" alt="owner" />
                <span className="text-sm font-bold text-white">{selectedRepo?.owner.login}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                <span className="text-sm text-[#8b949e]">Accessing Root Tree</span>
              </div>
            </div>

            <div className="bg-[#0d1117] border border-[#30363d] border-t-0 rounded-b-[20px] overflow-hidden shadow-2xl">
              {loading ? (
                <div className="p-20 flex flex-col items-center justify-center text-zinc-700">
                  <RefreshCw size={24} className="animate-spin mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Indexing Objects...</p>
                </div>
              ) : (
                <table className="w-full text-sm text-[#c9d1d9]">
                  <tbody className="divide-y divide-[#30363d]">
                    {filteredPath.map((file: any, i) => (
                      <tr key={i} className="hover:bg-[#161b22] transition-colors group">
                        <td className="px-6 py-4 min-w-[200px]">
                          <div className="flex items-center gap-4">
                            {file.type === 'dir' ? (
                              <Folder size={18} className="text-indigo-400/60" />
                            ) : (
                              <File size={18} className="text-[#8b949e]" />
                            )}
                            <button 
                              onClick={() => file.type === 'dir' && fetchRepoContents(selectedRepo!.full_name, file.path)}
                              className={`text-[13px] font-medium ${file.type === 'dir' ? 'hover:text-[#58a6ff] hover:underline cursor-pointer' : ''}`}
                            >
                              {file.name}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#8b949e] text-xs font-medium hidden md:table-cell">
                          {file.type === 'dir' ? 'Directory' : 'File'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {file.type === 'file' && (
                            <button 
                              onClick={() => handleDownload(file)}
                              disabled={downloading === file.name}
                              className={`p-2 rounded-xl transition-all ${
                                downloaded.includes(file.name) 
                                  ? 'text-emerald-500 bg-emerald-500/10' 
                                  : 'text-zinc-600 hover:text-white hover:bg-[#30363d] border border-white/5'
                              }`}
                              title="Sync to Sambi Disk"
                            >
                              {downloading === file.name ? (
                                <RefreshCw size={14} className="animate-spin" />
                              ) : downloaded.includes(file.name) ? (
                                <Check size={14} />
                              ) : (
                                <Download size={14} />
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <button 
              onClick={() => setView('repos')}
              className="mt-10 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Return to Grid
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
