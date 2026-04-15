export type MoireTheme = 'receipt' | 'cyberpunk' | 'academic' | 'bento' | 'pixel' | 'classic';

export interface MoireConfig {
  title: string;
  author: string;
  description: string;
  url: string;
  theme: MoireTheme;
  heatmap: boolean;
  pageSize: number;
  order_by: 'created' | 'modified';
  keywords: string;
}

export const config: MoireConfig = {
  title: '.dot.',
  author: 'harun',
  description: 'Notes and fragments synced from Apple Notes.',
  url: 'https://harunpirim.github.io/dot',
  theme: 'classic',
  heatmap: false,
  pageSize: 10,
  order_by: 'created',
  keywords: 'memo, thought, sync'
};
