import WelcomeDialog from '@/components/welcome-dialog';

export function WelcomePopup({ onClose }: { onClose: () => void }) {
  return <WelcomeDialog onClose={onClose} />;
}
