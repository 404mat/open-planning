import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

const CustomDialog = ({ children }: { children: React.ReactNode }) => {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>
        <button className="btn">Open Dialog</button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 transition-opacity duration-200 data-[state=open]:opacity-100 data-[state=closed]:opacity-0" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 max-w-md transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 shadow-lg transition-opacity duration-200 data-[state=open]:opacity-100 data-[state=closed]:opacity-0'
          )}
        >
          {children}
          <DialogPrimitive.Close className="absolute top-3 right-3">
            <X size={16} />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default CustomDialog;
