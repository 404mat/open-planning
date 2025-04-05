import { CircleCheckIcon } from 'lucide-react';

export const SuccessToast = ({ text }: { text: string }) => (
  <div className="rounded-md border px-4 py-3 bg-background">
    <p className="text-sm">
      <CircleCheckIcon
        className="me-3 -mt-0.5 inline-flex text-emerald-500"
        size={16}
        aria-hidden="true"
      />
      {text}
    </p>
  </div>
);
