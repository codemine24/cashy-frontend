import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Bell,
  BookIcon,
  BookOpen,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Edit3,
  Globe,
  Info,
  LogOut,
  Mail,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Tag,
  Target,
  Trash2,
  User,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react-native";
import { cssInterop } from "nativewind";

/**
 * Apply NativeWind's cssInterop to Lucide icons so that they respect
 * className for color, width, and height.
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
interopIcon(Camera);
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
interopIcon(Target)
interopIcon(UserPlus);
interopIcon(Info);
interopIcon(LogOut);
interopIcon(Settings);
interopIcon(User);
interopIcon(Globe);
interopIcon(Bell);
interopIcon(Users);
interopIcon(Paperclip);
interopIcon(BookOpen);
interopIcon(Calendar);
interopIcon(Clock);
interopIcon(Copy);
interopIcon(MessageSquare);
interopIcon(Tag);
interopIcon(Wallet)

// Re-export so the rest of the app imports from here
export {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Bell,
  BookIcon, BookOpen,
  Calendar, Camera, Check,
  ChevronDown,
  ChevronRight, Clock,
  Copy, Edit3,
  Globe,
  Info,
  LogOut,
  Mail, MessageSquare, MoreVertical, Paperclip, Plus,
  Search,
  Settings,
  ShieldCheck, Tag, Trash2, Target,
  User,
  UserPlus, Users, X, Wallet
};

