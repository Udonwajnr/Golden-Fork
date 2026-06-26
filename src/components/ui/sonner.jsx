"use client";

import { Toaster as Sonner } from "sonner";

function Toaster(props) {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "bg-gf-bg-elevated! border! border-gf-border! text-gf-cream! rounded-lg!",
          title: "text-gf-cream! font-medium!",
          description: "text-gf-muted!",
          actionButton: "bg-gf-gold! text-gf-bg!",
          cancelButton: "bg-gf-bg-card! text-gf-muted!",
          success: "border-gf-success/40!",
          error: "border-gf-danger/40!",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
