import { useId } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SimpleInput({
  label,
  helperText,
}: {
  label: string;
  helperText?: string;
}) {
  const id = useId();
  return (
    <div className="*:not-first:mt-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} placeholder="Email" type="email" />
      <p
        className="text-muted-foreground mt-2 text-xs"
        role="region"
        aria-live="polite"
      >
        {helperText ?? ''}
      </p>
    </div>
  );
}
