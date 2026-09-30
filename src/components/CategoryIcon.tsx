import React from "react";
import {
  Utensils,
  Car,
  Zap,
  ShoppingBag,
  Gamepad2,
  HeartPulse,
  BookOpen,
  Briefcase,
  Laptop,
  Gift,
  TrendingUp,
  PlusCircle,
  HelpCircle,
  Tag,
  CreditCard,
  Wallet,
  Home,
  Coffee,
  Smartphone,
  LucideProps,
} from "lucide-react";

interface CategoryIconProps extends Omit<LucideProps, "name"> {
  name?: string | null;
}

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  switch (name) {
    case "Utensils":
      return <Utensils {...props} />;
    case "Car":
      return <Car {...props} />;
    case "Zap":
      return <Zap {...props} />;
    case "ShoppingBag":
      return <ShoppingBag {...props} />;
    case "Gamepad2":
      return <Gamepad2 {...props} />;
    case "HeartPulse":
      return <HeartPulse {...props} />;
    case "BookOpen":
      return <BookOpen {...props} />;
    case "Briefcase":
      return <Briefcase {...props} />;
    case "Laptop":
      return <Laptop {...props} />;
    case "Gift":
      return <Gift {...props} />;
    case "TrendingUp":
      return <TrendingUp {...props} />;
    case "PlusCircle":
      return <PlusCircle {...props} />;
    case "CreditCard":
      return <CreditCard {...props} />;
    case "Wallet":
      return <Wallet {...props} />;
    case "Home":
      return <Home {...props} />;
    case "Coffee":
      return <Coffee {...props} />;
    case "Smartphone":
      return <Smartphone {...props} />;
    case "HelpCircle":
    default:
      return <Tag {...props} />;
  }
}

export const AVAILABLE_ICONS = [
  { name: "Utensils", label: "Makanan/Kuliner" },
  { name: "Car", label: "Transportasi" },
  { name: "Zap", label: "Listrik/Tagihan" },
  { name: "ShoppingBag", label: "Belanja" },
  { name: "Gamepad2", label: "Hiburan/Game" },
  { name: "HeartPulse", label: "Kesehatan" },
  { name: "BookOpen", label: "Edukasi/Buku" },
  { name: "Briefcase", label: "Gaji/Pekerjaan" },
  { name: "Laptop", label: "Freelance/Teknologi" },
  { name: "Gift", label: "Hadiah/Bonus" },
  { name: "TrendingUp", label: "Investasi" },
  { name: "Coffee", label: "Kopi/Nongkrong" },
  { name: "Home", label: "Tempat Tinggal" },
  { name: "Smartphone", label: "Pulsa/Internet" },
  { name: "Tag", label: "Lainnya" },
];
