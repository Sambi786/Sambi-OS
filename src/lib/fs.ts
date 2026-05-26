
export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  modified: string;
}

const DEFAULT_FS: FileNode[] = [
  {
    name: 'Documents',
    type: 'folder',
    modified: new Date().toISOString(),
    children: [
      { name: 'README.txt', type: 'file', content: 'Welcome to Sambi OS. A minimalist, privacy-focused operating system built for reliability and speed.\n\nKernel: 6.8.0-Privacy\nDesktop: Sambi-UI v2.0\nIntelligence: Neural Engine v2.0', modified: new Date().toISOString() },
      { name: 'license.md', type: 'file', content: '# MIT License\n\nCopyright (c) 2026 Sambi OS\n\nPermission is hereby granted, free of charge...', modified: new Date().toISOString() },
      { name: 'Release-Notes.pdf', type: 'file', content: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', modified: new Date().toISOString() },
    ]
  },
  {
    name: 'Downloads',
    type: 'folder',
    modified: new Date().toISOString(),
    children: [
      { name: 'checksum.txt', type: 'file', content: 'sha256: dde4c1...', modified: new Date().toISOString() },
      { name: 'installation_guide.pdf', type: 'file', content: 'https://www.africau.edu/images/default/sample.pdf', modified: new Date().toISOString() },
    ]
  },
  {
    name: 'Pictures',
    type: 'folder',
    modified: new Date().toISOString(),
    children: [
      { name: 'Wallpaper.png', type: 'file', content: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80', modified: new Date().toISOString() },
      { name: 'Avatar.jpg', type: 'file', content: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80', modified: new Date().toISOString() },
    ]
  },
  {
    name: 'Private',
    type: 'folder',
    modified: new Date().toISOString(),
    children: [
      { name: 'keys.pem', type: 'file', content: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA7V6...', modified: new Date().toISOString() }
    ]
  }
];

export const getFS = (): FileNode[] => {
  const saved = localStorage.getItem('sambi_fs');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return DEFAULT_FS;
    }
  }
  return DEFAULT_FS;
};

export const saveFS = (fs: FileNode[]) => {
  localStorage.setItem('sambi_fs', JSON.stringify(fs));
};
