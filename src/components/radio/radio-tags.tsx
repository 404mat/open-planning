import { useId } from 'react';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface RadioTagsProps {
  groupName: string;
  values: { value: string; label: string }[];
  currentValue: string;
  onChange: (value: string) => void;
}

export default function RadioTags(props: RadioTagsProps) {
  const id = useId();

  return (
    <fieldset className="space-y-4">
      <legend className="text-foreground text-sm leading-none font-medium">
        {props.groupName}
      </legend>
      <RadioGroup
        className="flex flex-wrap gap-2 mx-[3px]"
        value={props.currentValue}
        onValueChange={props.onChange}
      >
        {props.values.map((item) => (
          <div
            key={`${id}-${item.value}`}
            className="border-input has-data-[state=checked]:border-ring relative flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none hover:ring-ring/50 hover:ring-[3px]"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem
                id={`${id}-${item.value}`}
                value={item.value}
                className="after:absolute after:inset-0"
              />
              <Label htmlFor={`${id}-${item.value}`}>{item.label}</Label>
            </div>
          </div>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
