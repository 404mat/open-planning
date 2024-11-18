import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

interface TextInputProps {
  label: string;
  id: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  onChange: (value: string) => void;
}

export default function TextInput(props: TextInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id}>
        {props.label}{' '}
        {props.required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={props.id}
        placeholder={props.placeholder ?? 'Text'}
        type="text"
        required={props.required}
        className={
          props.error
            ? 'border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/30'
            : undefined
        }
        onChange={(e) => props.onChange(e.target.value)}
      />
      {props.error && (
        <p
          className="mt-2 text-xs text-destructive"
          role="alert"
          aria-live="polite"
        >
          {props.error}
        </p>
      )}
    </div>
  );
}
