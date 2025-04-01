import { ChevronDownIcon, ChevronRight } from 'lucide-react';

export function RevealMoreLink({
  textClosed,
  textOpened,
  onClick,
  expanded = false,
}: {
  textClosed: string;
  textOpened?: string;
  onClick?: () => void;
  expanded?: boolean;
}) {
  return (
    <div
      className="flex gap-1 items-center rounded-md cursor-pointer size-max"
      onClick={onClick}
    >
      <p className="text-sm hover:text-gray-500">
        {expanded ? (textOpened ?? textClosed) : textClosed}
      </p>
      {expanded ? (
        <ChevronDownIcon className="-me-1" size={12} aria-hidden="true" />
      ) : (
        <ChevronRight className="-me-1" size={12} aria-hidden="true" />
      )}
    </div>
  );
}
