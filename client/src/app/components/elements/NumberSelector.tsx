// Dependencies: pnpm install lucide-react

import { Button } from '@/app/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface NumberSelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export default function NumberSelector(props: NumberSelectorProps) {
  const handleChange = (value: number) => {
    if (props.min && value < props.min) return;
    if (props.max && value > props.max) return;
    props.onChange(value);
  };

  return (
    <div className="inline-flex -space-x-px rounded-lg shadow-sm shadow-black/5 rtl:space-x-reverse">
      <Button
        className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
        variant="outline"
        size="icon"
        aria-label="Upvote"
        onClick={() => handleChange(props.value + 1)}
      >
        <ChevronUp size={16} strokeWidth={2} aria-hidden="true" />
      </Button>
      <span className="flex items-center border border-input px-3 text-sm font-medium">
        {props.value}
      </span>
      <Button
        className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
        variant="outline"
        size="icon"
        aria-label="Downvote"
        onClick={() => handleChange(props.value - 1)}
      >
        <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
      </Button>
    </div>
  );
}
