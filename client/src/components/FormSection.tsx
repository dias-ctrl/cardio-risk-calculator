/**
 * FormSection — Collapsible form section with icon and title
 * Design: "Saúde Humanizada" — Warm Clinical
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FormSectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function FormSection({ title, icon, children, defaultOpen = true }: FormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 space-y-4 border-t border-border/30 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}
