export type AppId = 'brave' | 'terminal' | 'files' | 'settings' | 'notes' | 'calculator' | 'github' | 'media' | 'performance' | 'store' | 'game' | 'editor' | 'apk_runner' | 'pdf_reader';

export interface WindowState {
  id: AppId;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export interface AppConfig {
  id: AppId;
  name: string;
  icon: string;
  color: string;
}
