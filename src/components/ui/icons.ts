import { Activity, Cpu, Database, Network, Terminal, TrendingUp, type LucideIcon } from 'lucide-react';
import type { IconKey } from '@/content/icons';

/**
 * The one place an icon key from Copy becomes a component.
 *
 * Copy names icons as strings so that `content/` stays framework-free and can be
 * compiled into the serverless function. This registry is the adapter between
 * that naming and lucide.
 */
export const ICONS: Record<IconKey, LucideIcon> = {
  activity: Activity,
  database: Database,
  terminal: Terminal,
  cpu: Cpu,
  'trending-up': TrendingUp,
  network: Network,
};
