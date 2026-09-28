import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;
const SheetTitle = SheetPrimitive.Title;
const SheetDescription = SheetPrimitive.Description;

const SheetOverlay = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[60] bg-navy/60 backdrop-blur-sm data-[state=open]:animate-[fade-in_.3s_ease-out] data-[state=closed]:animate-[fade-out_.2s_ease-in]",
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = "SheetOverlay";

const SheetContent = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      data-lenis-prevent
      className={cn(
        "fixed inset-y-0 right-0 z-[61] flex h-full w-[min(88vw,24rem)] flex-col bg-navy text-white shadow-[-24px_0_60px_rgb(1_27_114/0.5)]",
        "data-[state=open]:animate-[sheet-in_.45s_var(--ease-out-expo)] data-[state=closed]:animate-[sheet-out_.25s_ease-in]",
        className,
      )}
      {...props}
    >
      {children}
      <SheetPrimitive.Close
        className="absolute right-4 top-4 grid size-11 place-items-center rounded-pill text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Fechar menu"
      >
        <span aria-hidden className="relative block size-4">
          <span className="absolute left-0 top-1/2 h-0.5 w-4 -translate-y-1/2 rotate-45 bg-current" />
          <span className="absolute left-0 top-1/2 h-0.5 w-4 -translate-y-1/2 -rotate-45 bg-current" />
        </span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = "SheetContent";

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle, SheetDescription };
