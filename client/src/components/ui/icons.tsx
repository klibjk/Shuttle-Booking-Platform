import React from "react";
import { cn } from "@/lib/utils";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function Logo({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-8 w-8", className)}
      {...props}
    >
      <path d="M21 7v6h-6" />
      <path d="M21 13V7h-6" />
      <path d="M9 16.2c.5.3 1 .4 1.6.4 2.1 0 3.8-1.7 3.8-3.8 0-2.1-1.7-3.8-3.8-3.8S7 10.7 7 12.8c0 .4.1.7.2 1.1" />
      <path d="M3 3v18h18" />
    </svg>
  );
}

export function BusIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6", className)}
      {...props}
    >
      <path d="M8 6v6" />
      <path d="M16 6v6" />
      <path d="M2 12h20" />
      <path d="M7 18h10" />
      <path d="M18 18h1a2 2 0 0 0 2-2v-7a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v7a2 2 0 0 0 2 2h1" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

export function SeniorIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6", className)}
      {...props}
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M21 15v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function CasinoIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6", className)}
      {...props}
    >
      <path d="M2 20h20" />
      <path d="M5 20v-5c0-1.7 1.3-3 3-3h8c1.7 0 3 1.3 3 3v5" />
      <path d="M12 3L7.5 7.5" />
      <path d="M16.5 7.5L12 3" />
      <path d="M12 3v6" />
      <path d="M11 9h2" />
      <path d="M3 5l3 2.5" />
      <path d="M21 5l-3 2.5" />
      <path d="M9 14h6" />
    </svg>
  );
}

export function IconButton({ icon, className }: { icon: React.ReactNode; className?: string }) {
  return (
    <div className={cn("h-8 w-8 flex items-center justify-center rounded-md bg-primary/10 text-primary", className)}>
      {icon}
    </div>
  );
}
