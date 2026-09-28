import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap font-display font-extrabold tracking-[-0.01em] transition-[background-color,color,transform,box-shadow] duration-300 ease-out-quart disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-yellow text-navy hover:bg-white rounded-pill",
        onDark: "border-2 border-white/40 text-white hover:border-white hover:bg-white/10 rounded-pill",
        onLight: "border-2 border-navy/25 text-navy hover:border-navy hover:bg-navy/5 rounded-pill",
        navy: "bg-navy text-white hover:bg-royal rounded-pill",
        link: "text-current underline decoration-yellow decoration-2 underline-offset-[6px] hover:decoration-4",
      },
      size: {
        sm: "h-10 px-4 text-sm [&_svg]:size-4",
        md: "h-12 px-6 text-[0.95rem] [&_svg]:size-[1.1rem]",
        lg: "h-14 px-8 text-base [&_svg]:size-5",
        icon: "size-11 rounded-pill [&_svg]:size-5",
        link: "h-auto p-0 text-[0.95rem]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
