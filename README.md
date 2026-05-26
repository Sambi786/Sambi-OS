# 🌌 Sambi OS Companion

Sambi OS is a high-fidelity, full-stack, web-based operating system simulator built on **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS v4**, supported by an **Express.js** backend. Featuring a windowing manager, realistic workspace state preservation, sound systems, app stores, and robust downloadable offline assets, Sambi OS brings a desktop operating environment straight to modern web browsers.

---

## 🚀 Key Capabilities

- **Frictionless Window Management**: Includes dragging, resizing, snapping (top-maximize, split-screen, snap-back mechanics), minimizing, maximizing, and dynamically maintained `zIndex` focus rings.
- **Dynamic App Store Hub**: Easily install, uninstall, launch, and repackage applications locally. Apps in the ecosystem can compile themselves to complete, single-file standalones and download themselves as individual `.html` pages.
- **Real-World Stream Downloader Proxy**: Powered by a robust, server-side Express backend gateway (`/api/download`) to bypass CORS and download resource files successfully to client environments.
- **Tailwind CSS v4 & Lucide Icons**: Consistent structural borders, typography, and beautiful Cosmic Slate aesthetics are handled through modern design standards.
- **Micro-Utility Suite**: Comes pre-packaged with pre-installed programs like Brave Browser, a full Terminal emulator, File Manager, Notes, Calculator, Media Player, GitHub Hub, and system performance telemetry diagnostics.

---

## 🛠️ How to Use Sambi OS

### 1. Navigating the Workspace
- **Desktop Grid**: Double-click or click active desktop shortcuts to open installed programs.
- **Interactive Taskbar**: Monitor active, minimized, or open windows. Clicking an app icon on the taskbar acts as a focus toggle: minimizing active states or restoring them seamlessly.
- **Virtual Control Center**: Tap the taskbar battery/status menu on the bottom right to adjust background wallpapers, cycle system sounds, and view system health.

### 2. Launching and Installing Apps
1. Open the **App Store**.
2. Click on a product card to expand its **Details & Specifications** overview.
3. Click **Download / Install** to fetch the program and add its launcher safely to your Desktop.
4. Once installed, either select **Launch application** inside the store or launch it directly from your Desktop!
5. Feel free to click **Re-download Offline (.html)** to package the fully interactive game or sketchpad into a downloadable document playable on your local computer completely without internet access.

### 3. Using the Real-World Stream Downloader
Sambi OS includes an active gateway bypass stream downloader:
- Enter any URL (such as an image link, PDF, HTML, or public stream) in the App Store downloader terminal.
- The server-side Express runtime will retrieve it, bundle the headers safely, and download it directly to your folder.

---

## 🏗️ Architecture & Directory Structure

```text
├── package.json               # System modules, build scripts (esbuild bundler + tsx dev)
├── server.ts                  # Server entrypoint running Express and API proxy routers
├── index.html                 # App gateway mounting point
├── vite.config.ts             # React + Vite compilers
├── src/
│   ├── main.tsx               # Client entrypoint
│   ├── App.tsx                # Main layout mounting taskbars and notification hubs
│   ├── types.ts               # Operating system global types and App ID definitions
│   ├── constants.ts           # Pre-installed apps configs and wallpaper selections
│   └── components/
│       ├── Desktop.tsx        # Grid, wallpaper rendering, and application windows router
│       ├── Window.tsx         # The highly reusable draggable, resizable wrapper
│       ├── Taskbar.tsx        # Dynamic navigation rail, clocks, and setting triggers
│       └── apps/              # Core application source components
│           ├── Store.tsx      # System marketplace and downloader
│           ├── Game.tsx       # Sambi Arcade component (Flappy clone, etc.)
│           ├── Terminal.tsx   # Interactive terminal parsing commands
│           ├── Settings.tsx   # Wallpaper, sound, and mock specification configurations
│           └── ...            # Other dedicated app interfaces
```

---

## 🔌 How to Add More Functions / New Apps

Adding a new application to Sambi OS is designed to be highly modular. Follow these 4 easy steps to build and launch your own custom utility:

### Step 1: Create Your App Component
Create a new `.tsx` file inside `src/components/apps/`. This component will render inside the standard window frame and can hook into parent hooks or local state.

For example, create `src/components/apps/MusicPlayer.tsx`:

```tsx
import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#0c0d10] p-6 text-white text-center justify-center items-center">
      <h3 className="text-lg font-black tracking-wider uppercase mb-2">Sambi Beats</h3>
      <p className="text-xs text-zinc-500 mb-6">Your local offline lofi synth companion</p>
      
      <button 
        onClick={() => setIsPlaying(!isPlaying)}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-400 to-indigo-500 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
      </button>
      
      <p className="text-xs text-teal-400 mt-4 font-mono">
        {isPlaying ? 'Now Playing: Cosmic Drift.mp3' : 'Player Interrupted'}
      </p>
    </div>
  );
}
```

### Step 2: Register Your App ID
Open `src/types.ts` and append your new unique App ID key to the `AppId` union type:

```typescript
// src/types.ts
export type AppId = 
  | 'brave' 
  | 'terminal' 
  // ... (existing keys)
  | 'music_player'; // Your new App ID
```

### Step 3: Configure Metadata and Launcher Details
Open `src/constants.ts` and add your launcher branding details to the `APPS` configuration array:

```typescript
// src/constants.ts
export const APPS: AppConfig[] = [
  // ... (existing configs)
  {
    id: 'music_player',
    name: 'Sambi Beats',
    icon: 'Radio', // Lucide icon identifier parsed dynamically
    color: 'bg-indigo-600',
  }
];
```

### Step 4: Mount and Launch inside Desktop
Finally, register the component resolver inside the main desktop environment so that clicking the launcher hooks the component to a Window container.

1. Open `src/components/Desktop.tsx`.
2. Import your newly created component:
   ```typescript
   import MusicPlayer from './apps/MusicPlayer';
   ```
3. Inside the apps rendering conditional chain of your desktop windows panel, search for `title="App Store"` or other pre-installed windows and append yours:
   ```tsx
   {/* Desktop-level Window mounting container */}
   {windows.music_player?.isOpen && (
     <Window
       title="Sambi Beats"
       icon="Radio"
       isOpen={windows.music_player.isOpen}
       isMinimized={windows.music_player.isMinimized}
       isMaximized={windows.music_player.isMaximized}
       zIndex={windows.music_player.zIndex}
       onClose={() => closeApp('music_player')}
       onMinimize={() => minimizeApp('music_player')}
       onMaximize={() => toggleMaximizeApp('music_player')}
       onFocus={() => focusApp('music_player')}
     >
       <MusicPlayer />
     </Window>
   )}
   ```
4. If your app is an optional app that users install through the store (rather than pre-installed), open `src/components/apps/Store.tsx` and append your app definition to the `storeItems` catalog so it can be uninstalled, re-downloaded, or installed dynamic.

---

## 🛠️ CLI Development Commands

Manage your application execution with these core scripts:

```bash
# Run local client and backend dev-server simultaneously 
npm run dev

# Bundle your React frontend and compile server.ts via esbuild to dist/server.cjs
npm run build

# Start production server using bundled resources
npm run start

# Run type checker to verify code-quality and prevent compilation glitches
npm run lint
```
