/**
 * Icon keys Copy is allowed to name.
 *
 * Copy is framework-free, so it names an icon rather than holding a component.
 * Each Section maps these keys to the lucide components it renders — which is
 * what keeps `content/` importable by the serverless function.
 */
export type IconKey =
  | 'activity'
  | 'database'
  | 'terminal'
  | 'cpu'
  | 'trending-up'
  | 'network';
