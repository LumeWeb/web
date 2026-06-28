import { lazy, Suspense, type FC } from "react";

export type IconProps = {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
  className?: string;
};

/** Raw lazy components (no Suspense) — wrapped by iconRegistry which adds Suspense. */
const rawIcons = {
  Activity: lazy(() => import("lucide-react").then(m => ({ default: m.Activity }))),
  AlertCircle: lazy(() => import("lucide-react").then(m => ({ default: m.AlertCircle }))),
  AlertTriangle: lazy(() => import("lucide-react").then(m => ({ default: m.AlertTriangle }))),
  Anchor: lazy(() => import("lucide-react").then(m => ({ default: m.Anchor }))),
  Apple: lazy(() => import("lucide-react").then(m => ({ default: m.Apple }))),
  ArrowDown: lazy(() => import("lucide-react").then(m => ({ default: m.ArrowDown }))),
  ArrowDownLeft: lazy(() => import("lucide-react").then(m => ({ default: m.ArrowDownLeft }))),
  ArrowLeft: lazy(() => import("lucide-react").then(m => ({ default: m.ArrowLeft }))),
  ArrowRight: lazy(() => import("lucide-react").then(m => ({ default: m.ArrowRight }))),
  ArrowUp: lazy(() => import("lucide-react").then(m => ({ default: m.ArrowUp }))),
  ArrowUpRight: lazy(() => import("lucide-react").then(m => ({ default: m.ArrowUpRight }))),
  Asterisk: lazy(() => import("lucide-react").then(m => ({ default: m.Asterisk }))),
  BarChart: lazy(() => import("lucide-react").then(m => ({ default: m.BarChart }))),
  BarChart3: lazy(() => import("lucide-react").then(m => ({ default: m.BarChart3 }))),
  BellRing: lazy(() => import("lucide-react").then(m => ({ default: m.BellRing }))),
  Bold: lazy(() => import("lucide-react").then(m => ({ default: m.Bold }))),
  Box: lazy(() => import("lucide-react").then(m => ({ default: m.Box }))),
  Calendar: lazy(() => import("lucide-react").then(m => ({ default: m.Calendar }))),
  CalendarIcon: lazy(() => import("lucide-react").then(m => ({ default: m.CalendarIcon }))),
  Camera: lazy(() => import("lucide-react").then(m => ({ default: m.Camera }))),
  Check: lazy(() => import("lucide-react").then(m => ({ default: m.Check }))),
  CheckCircle: lazy(() => import("lucide-react").then(m => ({ default: m.CheckCircle }))),
  CheckCircle2: lazy(() => import("lucide-react").then(m => ({ default: m.CheckCircle2 }))),
  ChevronDown: lazy(() => import("lucide-react").then(m => ({ default: m.ChevronDown }))),
  ChevronDownIcon: lazy(() => import("lucide-react").then(m => ({ default: m.ChevronDownIcon }))),
  ChevronLeft: lazy(() => import("lucide-react").then(m => ({ default: m.ChevronLeft }))),
  ChevronRight: lazy(() => import("lucide-react").then(m => ({ default: m.ChevronRight }))),
  ChevronsLeft: lazy(() => import("lucide-react").then(m => ({ default: m.ChevronsLeft }))),
  ChevronsRight: lazy(() => import("lucide-react").then(m => ({ default: m.ChevronsRight }))),
  Chrome: lazy(() => import("lucide-react").then(m => ({ default: m.Chrome }))),
  Circle: lazy(() => import("lucide-react").then(m => ({ default: m.Circle }))),
  CircleAlert: lazy(() => import("lucide-react").then(m => ({ default: m.CircleAlert }))),
  CircleCheck: lazy(() => import("lucide-react").then(m => ({ default: m.CircleCheck }))),
  CircleDot: lazy(() => import("lucide-react").then(m => ({ default: m.CircleDot }))),
  Clock: lazy(() => import("lucide-react").then(m => ({ default: m.Clock }))),
  Coins: lazy(() => import("lucide-react").then(m => ({ default: m.Coins }))),
  Copy: lazy(() => import("lucide-react").then(m => ({ default: m.Copy }))),
  Copyright: lazy(() => import("lucide-react").then(m => ({ default: m.Copyright }))),
  CreditCard: lazy(() => import("lucide-react").then(m => ({ default: m.CreditCard }))),
  DatabaseIcon: lazy(() => import("lucide-react").then(m => ({ default: m.DatabaseIcon }))),
  DollarSign: lazy(() => import("lucide-react").then(m => ({ default: m.DollarSign }))),
  Download: lazy(() => import("lucide-react").then(m => ({ default: m.Download }))),
  Edit: lazy(() => import("lucide-react").then(m => ({ default: m.Edit }))),
  ExternalLink: lazy(() => import("lucide-react").then(m => ({ default: m.ExternalLink }))),
  Eye: lazy(() => import("lucide-react").then(m => ({ default: m.Eye }))),
  Facebook: lazy(() => import("lucide-react").then(m => ({ default: m.Facebook }))),
  File: lazy(() => import("lucide-react").then(m => ({ default: m.File }))),
  FileIcon: lazy(() => import("lucide-react").then(m => ({ default: m.FileIcon }))),
  FileText: lazy(() => import("lucide-react").then(m => ({ default: m.FileText }))),
  FileUp: lazy(() => import("lucide-react").then(m => ({ default: m.FileUp }))),
  Filter: lazy(() => import("lucide-react").then(m => ({ default: m.Filter }))),
  Flag: lazy(() => import("lucide-react").then(m => ({ default: m.Flag }))),
  FlagIcon: lazy(() => import("lucide-react").then(m => ({ default: m.FlagIcon }))),
  Folder: lazy(() => import("lucide-react").then(m => ({ default: m.Folder }))),
  Gamepad2: lazy(() => import("lucide-react").then(m => ({ default: m.Gamepad2 }))),
  Github: lazy(() => import("lucide-react").then(m => ({ default: m.Github }))),
  Gitlab: lazy(() => import("lucide-react").then(m => ({ default: m.Gitlab }))),
  HardDrive: lazy(() => import("lucide-react").then(m => ({ default: m.HardDrive }))),
  Hash: lazy(() => import("lucide-react").then(m => ({ default: m.Hash }))),
  Home: lazy(() => import("lucide-react").then(m => ({ default: m.Home }))),
  Image: lazy(() => import("lucide-react").then(m => ({ default: m.Image }))),
  ImageIcon: lazy(() => import("lucide-react").then(m => ({ default: m.ImageIcon }))),
  Instagram: lazy(() => import("lucide-react").then(m => ({ default: m.Instagram }))),
  Italic: lazy(() => import("lucide-react").then(m => ({ default: m.Italic }))),
  Key: lazy(() => import("lucide-react").then(m => ({ default: m.Key }))),
  LayoutDashboard: lazy(() => import("lucide-react").then(m => ({ default: m.LayoutDashboard }))),
  LayoutGrid: lazy(() => import("lucide-react").then(m => ({ default: m.LayoutGrid }))),
  Link: lazy(() => import("lucide-react").then(m => ({ default: m.Link }))),
  Link2: lazy(() => import("lucide-react").then(m => ({ default: m.Link2 }))),
  LinkIcon: lazy(() => import("lucide-react").then(m => ({ default: m.LinkIcon }))),
  Linkedin: lazy(() => import("lucide-react").then(m => ({ default: m.Linkedin }))),
  Loader2: lazy(() => import("lucide-react").then(m => ({ default: m.Loader2 }))),
  Lock: lazy(() => import("lucide-react").then(m => ({ default: m.Lock }))),
  LogOut: lazy(() => import("lucide-react").then(m => ({ default: m.LogOut }))),
  Mail: lazy(() => import("lucide-react").then(m => ({ default: m.Mail }))),
  MenuIcon: lazy(() => import("lucide-react").then(m => ({ default: m.MenuIcon }))),
  MessageCircle: lazy(() => import("lucide-react").then(m => ({ default: m.MessageCircle }))),
  MessageSquare: lazy(() => import("lucide-react").then(m => ({ default: m.MessageSquare }))),
  Monitor: lazy(() => import("lucide-react").then(m => ({ default: m.Monitor }))),
  MoreHorizontal: lazy(() => import("lucide-react").then(m => ({ default: m.MoreHorizontal }))),
  Music: lazy(() => import("lucide-react").then(m => ({ default: m.Music }))),
  Pin: lazy(() => import("lucide-react").then(m => ({ default: m.Pin }))),
  PinOff: lazy(() => import("lucide-react").then(m => ({ default: m.PinOff }))),
  Plus: lazy(() => import("lucide-react").then(m => ({ default: m.Plus }))),
  PlusCircle: lazy(() => import("lucide-react").then(m => ({ default: m.PlusCircle }))),
  RefreshCw: lazy(() => import("lucide-react").then(m => ({ default: m.RefreshCw }))),
  Reply: lazy(() => import("lucide-react").then(m => ({ default: m.Reply }))),
  Scan: lazy(() => import("lucide-react").then(m => ({ default: m.Scan }))),
  Search: lazy(() => import("lucide-react").then(m => ({ default: m.Search }))),
  Server: lazy(() => import("lucide-react").then(m => ({ default: m.Server }))),
  Settings: lazy(() => import("lucide-react").then(m => ({ default: m.Settings }))),
  Shield: lazy(() => import("lucide-react").then(m => ({ default: m.Shield }))),
  ShieldAlert: lazy(() => import("lucide-react").then(m => ({ default: m.ShieldAlert }))),
  ShieldCheck: lazy(() => import("lucide-react").then(m => ({ default: m.ShieldCheck }))),
  ShieldX: lazy(() => import("lucide-react").then(m => ({ default: m.ShieldX }))),
  ShoppingBag: lazy(() => import("lucide-react").then(m => ({ default: m.ShoppingBag }))),
  Smartphone: lazy(() => import("lucide-react").then(m => ({ default: m.Smartphone }))),
  Terminal: lazy(() => import("lucide-react").then(m => ({ default: m.Terminal }))),
  Trash2: lazy(() => import("lucide-react").then(m => ({ default: m.Trash2 }))),
  Twitter: lazy(() => import("lucide-react").then(m => ({ default: m.Twitter }))),
  Upload: lazy(() => import("lucide-react").then(m => ({ default: m.Upload }))),
  User: lazy(() => import("lucide-react").then(m => ({ default: m.User }))),
  UserCog: lazy(() => import("lucide-react").then(m => ({ default: m.UserCog }))),
  UserPlus: lazy(() => import("lucide-react").then(m => ({ default: m.UserPlus }))),
  UserRound: lazy(() => import("lucide-react").then(m => ({ default: m.UserRound }))),
  Users: lazy(() => import("lucide-react").then(m => ({ default: m.Users }))),
  Video: lazy(() => import("lucide-react").then(m => ({ default: m.Video }))),
  Wallet: lazy(() => import("lucide-react").then(m => ({ default: m.Wallet }))),
  X: lazy(() => import("lucide-react").then(m => ({ default: m.X }))),
  XCircle: lazy(() => import("lucide-react").then(m => ({ default: m.XCircle }))),
  Zap: lazy(() => import("lucide-react").then(m => ({ default: m.Zap }))),
} as const;

export type IconName = keyof typeof rawIcons;

/** Type for a lazy icon component (FC, not ComponentClass). */
type LazyIconComponent = FC<IconProps>;

/** Compatible type alias for migration from lucide-react's LucideIcon. */
export type LucideIcon = LazyIconComponent;

/**
 * Internal registry: each icon wrapped in its own Suspense boundary.
 * This allows any icon to be used as a plain component reference
 * (route `icon` property, variable assignment, etc.) without callers
 * needing to provide their own Suspense.
 */
const iconRegistry = Object.fromEntries(
  Object.entries(rawIcons).map(([name, LazyComp]) => {
    const LazyFC = LazyComp as unknown as FC<IconProps>;
    const Wrapped: LazyIconComponent = (props) => (
      <Suspense fallback={null}>
        <LazyFC {...props} />
      </Suspense>
    );
    return [name, Wrapped];
  }),
) as Record<IconName, LazyIconComponent>;

export { iconRegistry };

/**
 * Returns a lazy-loaded icon component by name.
 * The component is wrapped in its own Suspense boundary.
 *
 * Usage:
 *   // Route definition or variable assignment
 *   icon: lazyIcon("ChevronDown")
 *   const CheckIcon = lazyIcon("Check")
 *
 *   // JSX
 *   const Check = lazyIcon("Check")
 *   <Check className="h-4 w-4" />
 */
export function lazyIcon(name: IconName): LazyIconComponent {
  return iconRegistry[name];
}
