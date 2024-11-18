// Dependencies: pnpm install lucide-react

import { Button } from '@/app/components/ui/button';

interface TextButtonProps {
  text: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

export default function TextButton(props: Readonly<TextButtonProps>) {
  return (
    <Button className="group" variant="ghost" onClick={props.onClick}>
      {props.icon}
      {props.text}
    </Button>
  );
}
