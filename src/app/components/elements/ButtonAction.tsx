import { Button } from '@/app/components/ui/button';

interface ButtonProps {
  text: string;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'full';
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  onClick?: () => void;
}

export default function Buttom(props: ButtonProps) {
  return (
    <Button
      disabled={props.disabled}
      size={props.size}
      onClick={props.onClick}
      variant={props.variant}
    >
      {props.text}
    </Button>
  );
}
