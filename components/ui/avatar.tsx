import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const avatarVariants = cva(
    "relative flex shrink-0 overflow-hidden rounded-full",
    {
        variants: {
            size: {
                sm: "h-8 w-8",
                md: "h-10 w-10",
                lg: "h-14 w-14",
            },
        },
        defaultVariants: { size: "md" },
    }
)

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof avatarVariants> {
    fallback?: string
    src?: string
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
    ({ className, size, fallback, src, ...props }, ref) => (
        <div ref={ref} className={cn(avatarVariants({ size }), className)} {...props}>
            {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={fallback ?? "Avatar"} className="aspect-square h-full w-full object-cover" />
            ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
                    {fallback?.slice(0, 2).toUpperCase() ?? "??"}
                </div>
            )}
        </div>
    )
)
Avatar.displayName = "Avatar"

export { Avatar }
