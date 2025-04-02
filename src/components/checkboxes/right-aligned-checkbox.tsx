import { useId } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function RightAlignedCheckbox({
  text,
  checked,
  onChange,
}: {
  text: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-2">
      <Checkbox
        id={id}
        className="order-1"
        checked={checked}
        onCheckedChange={onChange}
      />
      <Label htmlFor={id}>{text}</Label>
    </div>
  );
}
