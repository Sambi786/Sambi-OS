import {useState, useEffect, useRef, FormEvent} from 'react';
import {getFS, saveFS, FileNode} from '../../lib/fs';
import { pushNotification } from '../NotificationSystem';

export default function TerminalApp() {
  const [history, setHistory] = useState<string[]>([
    'SAMBI OS v1.0.0 (kernel 6.8.0-generic)',
    'Welcome to the encrypted shell. Type "help" for a list of commands.',
    '',
  ]);
  const [input, setInput] = useState('');
  const [fs, setFs] = useState<FileNode[]>(getFS());
  const [installedPackages, setInstalledPackages] = useState<string[]>(() => {
    const saved = localStorage.getItem('sambi_packages');
    return saved ? JSON.parse(saved) : [];
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('sambi_packages', JSON.stringify(installedPackages));
  }, [installedPackages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [history]);

  const handleCommand = (e: FormEvent) => {
    e.preventDefault();
    const fullCmd = input.trim();
    if (!fullCmd) {
      setHistory(prev => [...prev, 'sambi@user:~$ ']);
      setInput('');
      return;
    }

    const parts = fullCmd.split(' ');
    const cmd = parts[0].toLowerCase();
    const arg = parts[1];
    
    const newHistory = [...history, `sambi@user:~$ ${fullCmd}`];

    if (cmd !== 'clear' && cmd !== 'ls') {
      pushNotification('Terminal Process', `Running: ${cmd}`, 'info');
    }

    switch (cmd) {
      case 'help':
        newHistory.push('Available commands: help, clear, whoami, ls, cat, uname, sudo, pdfwriter, neofetch, exit');
        break;
      case 'sudo':
        if (parts[1] === 'apt' && parts[2] === 'install') {
          const pkg = parts[3];
          if (!pkg) {
            newHistory.push('E: Must specify a package to install');
          } else {
            newHistory.push(`Reading package lists... Done`);
            newHistory.push(`Building dependency tree... Done`);
            newHistory.push(`The following NEW packages will be installed: ${pkg}`);
            newHistory.push(`0 upgraded, 1 newly installed, 0 to remove.`);
            newHistory.push(`Get:1 http://sambi.repo/pool ${pkg} [1.2 MB]`);
            newHistory.push(`Fetched 1.2 MB in 0s (4.5 MB/s)`);
            newHistory.push(`Selecting previously unselected package ${pkg}.`);
            newHistory.push(`Setting up ${pkg} (1.0.0)...`);
            if (!installedPackages.includes(pkg)) {
              setInstalledPackages([...installedPackages, pkg]);
            }
          }
        } else {
          newHistory.push('sudo: system privileges required');
        }
        break;
      case 'pdfwriter':
        if (!installedPackages.includes('pdfwriter')) {
          newHistory.push('bash: pdfwriter: command not found');
        } else if (!arg) {
          newHistory.push('Usage: pdfwriter <filename.pdf>');
        } else {
          newHistory.push(`Writing PDF to ${arg}...`);
          newHistory.push(`Done. File saved to Downloads.`);
          // Simulate file creation
          const updatedFS = [...fs];
          const downloads = updatedFS.find(n => n.name === 'Downloads');
          if (downloads && downloads.children) {
            downloads.children.push({
              name: arg.endsWith('.pdf') ? arg : `${arg}.pdf`,
              type: 'file',
              content: '%PDF-1.4\n1 0 obj\n<< /Title (Sambi Linux Export) >>\nendobj\n...',
              modified: new Date().toISOString()
            });
            setFs(updatedFS);
            saveFS(updatedFS);
          }
        }
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'whoami':
        newHistory.push('sambi');
        break;
      case 'uname':
        newHistory.push('Linux sambi 6.8.0-privacy-node #1 SMP PREEMPT_DYNAMIC x86_64');
        break;
      case 'ls': {
        const items = fs.map(f => f.name).join('  ');
        newHistory.push(items);
        break;
      }
      case 'cat': {
        if (!arg) {
          newHistory.push('cat: missing file operand');
        } else {
          // Simplistic search for file in top level or folders for simulation
          let found = false;
          for (const node of fs) {
            if (node.name.toLowerCase() === arg.toLowerCase() && node.type === 'file') {
              newHistory.push(node.content || '');
              found = true;
              break;
            }
            if (node.type === 'folder' && node.children) {
              const sub = node.children.find(c => c.name.toLowerCase() === arg.toLowerCase());
              if (sub && sub.type === 'file') {
                newHistory.push(sub.content || '');
                found = true;
                break;
              }
            }
          }
          if (!found) newHistory.push(`cat: ${arg}: No such file or directory`);
        }
        break;
      }
      case 'neofetch':
        newHistory.push(
          '   .--.',
          '  |o_o |   \x1b[38;5;208mOS:\x1b[0m SAMBI Linux 1.0',
          '  |:_/ |   \x1b[38;5;208mHost:\x1b[0m Web Sandbox',
          ' //   \\ \\  \x1b[38;5;208mKernel:\x1b[0m 6.8.0-generic',
          '/(     )\\  \x1b[38;5;208mUptime:\x1b[0m 10 mins',
          ' ^---^     \x1b[38;5;208mShell:\x1b[0m bash 5.1.16'
        );
        break;
      default:
        newHistory.push(`Command not found: ${cmd}`);
    }

    setHistory(newHistory);
    setInput('');
  };

  return (
    <div className="p-4 h-full bg-[#0a0a0c] font-mono text-[13px] text-zinc-300 overflow-auto selection:bg-orange-500/30">
      <div className="max-w-4xl mx-auto">
        {history.map((line, i) => {
          if (line.includes('\x1b')) {
            // Very basic ANSI color support simulation
            return (
              <div key={i} className="whitespace-pre-wrap mb-1">
                {line.split('\x1b').map((part, pi) => {
                  if (part.startsWith('[38;5;208m')) return <span key={pi} className="text-orange-500">{part.replace('[38;5;208m', '').replace('[0m', '')}</span>;
                  return part.replace('[38;5;208m', '').replace('[0m', '');
                })}
              </div>
            );
          }
          return <div key={i} className={`whitespace-pre-wrap mb-1 ${line.startsWith('sambi@user') ? 'text-zinc-500' : ''}`}>{line}</div>;
        })}
        <form onSubmit={handleCommand} className="flex">
          <span className="text-orange-500 mr-2 font-bold shrink-0">sambi@user:~$</span>
          <input
            type="text"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-zinc-100"
            spellCheck={false}
            autoComplete="off"
          />
        </form>
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}
