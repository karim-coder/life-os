"use client";

import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

type IconName = keyof typeof Icons;

interface IconProps extends React.ComponentProps<any> {
  name: string;
  fallback?: string;
}

export function Icon({ name, fallback = "Circle", className, ...rest }: IconProps) {
  const Comp = (Icons as any)[name] as Icons.LucideIcon | undefined;
  const Fallback = (Icons as any)[fallback] as Icons.LucideIcon;
  const C = Comp || Fallback;
  return <C className={cn("h-4 w-4", className)} {...rest} />;
}
