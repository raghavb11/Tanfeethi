import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@reach/shared-core"

const buttonVariants = cva(
  // Radius 12px and a solid 3px primary focus ring, per Figma.
  "group/button inline-flex shrink-0 items-center justify-center rounded-[12px] border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      // Fills, borders and label colours per the Figma design system's Button
      // page. Flat fills — the previous default variant used a gradient and a
      // glow, which the design does not have.
      variant: {
        default:
          "bg-primary text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-hover)] [a]:text-[var(--btn-primary-fg)]",
        outline:
          "border-[var(--btn-outline-border)] bg-[var(--btn-outline-bg)] text-[var(--btn-neutral-fg)] hover:bg-[var(--btn-outline-hover)] aria-expanded:bg-[var(--btn-outline-hover)]",
        secondary:
          "bg-[var(--btn-secondary-bg)] text-[var(--btn-neutral-fg)] hover:bg-[var(--btn-secondary-hover)] aria-expanded:bg-[var(--btn-secondary-hover)]",
        ghost:
          "text-[var(--btn-neutral-fg)] hover:bg-[var(--btn-ghost-hover)] aria-expanded:bg-[var(--btn-ghost-hover)]",
        destructive:
          "bg-[var(--btn-destructive-bg)] text-[var(--btn-destructive-fg)] hover:brightness-[0.97] focus-visible:ring-destructive/30",
        link: "text-primary underline-offset-4 hover:underline",
      },
      // Heights, paddings, gaps, radii and icon sizes are the Figma values:
      // xs 24/8/4/r8/12px · sm 28/10/4/r8/14px · default 32/10/6/r12/16px ·
      // lg 36/10/6/r12/16px. Small sizes use the "Button/Label · Small" type
      // style (12.8px).
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[8px] px-2 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[8px] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[8px] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[8px] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
