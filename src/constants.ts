import {AppConfig} from './types';

export const WALLPAPERS = [
  {id: 'mountain', name: 'Alps Peak', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070'},
  {id: 'desert', name: 'Sahara Dunes', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5edd0e92?auto=format&fit=crop&q=80&w=1974'},
  {id: 'forest', name: 'Misty Woods', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2071'},
  {id: 'city', name: 'Tokyo Night', url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=2094'},
  {id: 'abstract', name: 'Fluid Glass', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1964'},
  {id: 'minimal', name: 'Cosmic Slate', url: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=80&w=2070'},
];

export const APPS: AppConfig[] = [
  {
    id: 'brave',
    name: 'Brave',
    icon: 'Globe',
    color: 'bg-orange-600',
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: 'Terminal',
    color: 'bg-zinc-800',
  },
  {
    id: 'files',
    name: 'File Manager',
    icon: 'Folder',
    color: 'bg-blue-600',
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: 'Settings',
    color: 'bg-zinc-600',
  },
  {
    id: 'store',
    name: 'App Store',
    icon: 'ShoppingBag',
    color: 'bg-gradient-to-br from-indigo-500 to-pink-500',
  },
  {
    id: 'game',
    name: 'Sambi Arcade',
    icon: 'Gamepad2',
    color: 'bg-emerald-500',
  },
  {
    id: 'editor',
    name: 'Creative Studio',
    icon: 'Image',
    color: 'bg-purple-500',
  },
  {
    id: 'apk_runner',
    name: 'Sambi Droid',
    icon: 'Smartphone',
    color: 'bg-lime-600',
  },
  {
    id: 'pdf_reader',
    name: 'Sambi PDF Reader',
    icon: 'BookOpen',
    color: 'bg-rose-600',
  },
];
