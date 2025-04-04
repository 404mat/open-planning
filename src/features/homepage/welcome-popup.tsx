import WelcomeDialog from '@/components/welcome-dialog';

interface WelcomePopupProps {
  onClose: () => void;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function WelcomePopup({ onClose, value, onChange }: WelcomePopupProps) {
  return <WelcomeDialog onClose={onClose} value={value} onChange={onChange} />;
}
