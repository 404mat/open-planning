import { Checkbox } from '@/app/components/ui/checkbox';
import { Label } from '@/app/components/ui/label';

interface CardCheckboxProps {
  label: string;
  description: string;
  subLabel?: string;
  checked?: boolean;
  id?: string;
  onChange?: (checked: boolean) => void;
}

export default function CardCheckbox(props: CardCheckboxProps) {
  return (
    <div className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring">
      <Checkbox
        id={props.id}
        className="order-1 after:absolute after:inset-0"
        aria-describedby={`${props.id}-description`}
        checked={props.checked}
        onCheckedChange={props.onChange}
      />
      <div className="grid grow gap-2">
        <Label htmlFor={props.id}>
          {`${props.label} `}
          <span className="text-xs font-normal leading-[inherit] text-muted-foreground">
            {props.subLabel}
          </span>
        </Label>
        <p
          id={`${props.id}-description`}
          className="text-xs text-muted-foreground"
        >
          {props.description}
        </p>
      </div>
    </div>
  );
}
