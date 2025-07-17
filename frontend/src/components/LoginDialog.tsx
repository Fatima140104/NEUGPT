import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { getToken } from "@/lib/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess?: () => void;
  forceOpen?: boolean;
}

const DialogContentWithoutClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContentWithoutClose.displayName = "DialogContentWithoutClose";

function LoginDialog({ open, onOpenChange, forceOpen = false }: LoginDialogProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken() && open && !forceOpen) {
      onOpenChange(false);
    }
  }, [open, onOpenChange, forceOpen]);

  const handleMicrosoftLogin = () => {
    setLoading(true);
    // Redirect to backend Microsoft OAuth endpoint
    window.location.href = "/api/auth/microsoft";
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (forceOpen && !newOpen) {
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContentWithoutClose className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Đăng nhập vào NEU GPT</DialogTitle>
          <DialogDescription>
            Vui lòng đăng nhập để tiếp tục sử dụng ứng dụng.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          <Button 
            onClick={handleMicrosoftLogin} 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {loading ? (
              <LoadingSpinner loadingTitle="Đang chuyển hướng..." />
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 23 23">
                  <path fill="#F25022" d="M1 1h10v10H1z"/>
                  <path fill="#00A4EF" d="M12 1h10v10H12z"/>
                  <path fill="#7FBA00" d="M1 12h10v10H1z"/>
                  <path fill="#FFB900" d="M12 12h10v10H12z"/>
                </svg>
                Đăng nhập với Microsoft
              </>
            )}
          </Button>
        </div>
      </DialogContentWithoutClose>
    </Dialog>
  );
}

export default LoginDialog;