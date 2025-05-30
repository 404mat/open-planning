import { CircleAlert } from 'lucide-react';

export const ErrorToast = ({ text }: { text: string }) => (
  <div className="rounded-md border px-4 py-3 bg-background">
    <p className="text-sm">
      <CircleAlert
        className="me-3 -mt-0.5 inline-flex text-red-500"
        size={16}
        aria-hidden="true"
      />
      {text}
    </p>
  </div>
);
