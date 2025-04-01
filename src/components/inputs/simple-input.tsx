import { useId } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SimpleInput({
  label,
  helperText,
  placeholder,
  required,
}: {
  label: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const id = useId();
  return (
    <div className="*:not-first:mt-2">
      <Label htmlFor={id}>
        {label} {required ? <span className="text-destructive">*</span> : ''}
      </Label>
      <Input
        id={id}
        placeholder={placeholder ?? ''}
        required={required ?? false}
      />
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
