import { Button } from '@/app/components/ui/button';

interface ButtonProps {
  text: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'full';
  color?: string;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  onClick?: () => void;
}

export default function ButtonAction(props: ButtonProps) {
  return (
    <Button
      disabled={props.disabled}
      size={props.size}
      onClick={props.onClick}
      variant={props.variant}
      className={props.color}
    >
      {props.icon}
      {props.text}
    </Button>
  );
}
