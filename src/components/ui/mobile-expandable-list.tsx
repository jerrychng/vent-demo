import { ReactNode, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type KeyType = string | number;

type MobileExpandableListProps<T> = {
  items: T[];
  getKey: (item: T) => KeyType;
  renderSummary: (item: T) => ReactNode;
  renderDetails: (item: T) => ReactNode;
  emptyMessage: string;
  mobileHeader?: ReactNode;
  className?: string;
};

export function MobileExpandableList<T>({
  items,
  getKey,
  renderSummary,
  renderDetails,
  emptyMessage,
  mobileHeader,
  className,
}: MobileExpandableListProps<T>) {
  const [expandedKey, setExpandedKey] = useState<KeyType | null>(null);

  useEffect(() => {
    if (expandedKey === null) return;
    if (!items.some((item) => getKey(item) === expandedKey)) {
      setExpandedKey(null);
    }
  }, [expandedKey, items, getKey]);

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className={cn("space-y-2 md:hidden", className)}>
      {mobileHeader && (
        <div className="rounded-[10px] border border-subtle bg-white px-3 py-2">
          <div className="pl-6">{mobileHeader}</div>
        </div>
      )}
      {items.map((item) => {
        const key = getKey(item);
        const isExpanded = expandedKey === key;

        return (
          <div key={String(key)} className="overflow-hidden rounded-[10px] border border-subtle bg-background">
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left"
              onClick={() => setExpandedKey((current) => (current === key ? null : key))}
            >
              <ChevronDown
                className={cn("h-4 w-4 shrink-0 text-primary transition-transform", isExpanded && "rotate-180")}
              />
              <div className="min-w-0 flex-1">{renderSummary(item)}</div>
            </button>
            {isExpanded && <div className="border-t border-subtle bg-white px-3 py-3">{renderDetails(item)}</div>}
          </div>
        );
      })}
    </div>
  );
}
