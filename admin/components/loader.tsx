import React from "react";
import { cn } from "@/lib/utils";
import { ShoppingCart, Package, DollarSign } from "lucide-react";

export interface EcommerceLoaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: "small" | "medium" | "large";
}

const Loader: React.FC<EcommerceLoaderProps> = ({
  size = "medium",
  className,
  ...props
}) => {
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32",
  };

  const iconSizeClasses = {
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-8 h-8",
  };

  return (
    <div
      role="status"
      className={cn("relative", sizeClasses[size], className)}
      {...props}
    >
      <div className="absolute inset-0 flex items-center justify-center animate-spin">
        <ShoppingCart className={cn("text-primary", iconSizeClasses[size])} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center animate-ping animation-delay-300">
        <Package className={cn("text-secondary", iconSizeClasses[size])} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center animate-bounce animation-delay-600">
        <DollarSign className={cn("text-accent", iconSizeClasses[size])} />
      </div>
    </div>
  );
};

export default Loader;
