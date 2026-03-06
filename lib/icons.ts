import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Bell,
  BookIcon,
  Check,
  ChevronDown,
  ChevronRight,
  Edit3,
  Globe,
  Info,
  LogOut,
  Mail,
  MoreVertical,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  User,
  UserPlus,
  X,
} from "lucide-react-native";
import { cssInterop } from "nativewind";

/**
 * Apply NativeWind's cssInterop to Lucide icons so that they respect
 * className for color, width, and height.
 *
 * After this, you can do:
 *   <Mail className="text-primary" />
 *   <Check className="text-success" />
 *
 * Import icons from this file instead of "lucide-react-native":
 *   import { Mail, Check } from "@/lib/icons";
 */
function interopIcon(icon: any) {
  cssInterop(icon, {
    className: {
      target: "style",
      nativeStyleToProp: {
        color: true,
        width: true,
        height: true,
      },
    },
  });
}

// Register every icon used in the app
interopIcon(ArrowLeft);
interopIcon(ArrowRight);
interopIcon(Check);
interopIcon(ChevronDown);
interopIcon(ChevronRight);
interopIcon(Mail);
interopIcon(ShieldCheck);
interopIcon(X);
interopIcon(Plus);
interopIcon(ArrowUpDown);
interopIcon(Search);
interopIcon(BookIcon);
interopIcon(MoreVertical);
interopIcon(Edit3);
interopIcon(Trash2);
interopIcon(UserPlus);
interopIcon(Info);
interopIcon(LogOut);
interopIcon(Settings);
interopIcon(User);
interopIcon(Globe);
interopIcon(Bell);

// Re-export so the rest of the app imports from here
export {
  ArrowLeft,
  ArrowRight, ArrowUpDown, Bell, BookIcon, Check,
  ChevronDown,
  ChevronRight, Edit3, Globe, Info,
  LogOut, Mail, MoreVertical, Plus, Search, Settings, ShieldCheck, Trash2, User, UserPlus, X
};

