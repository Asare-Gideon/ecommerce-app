import { type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  borderColor?: string;
  iconColor?: string;
  iconBgColor?: string;
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  borderColor = "border-l-blue-500",
  iconColor = "text-blue-500",
  iconBgColor = "bg-blue-50",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("border-l-4 bg-white", borderColor, className)}>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={cn("h-12 w-12 rounded-lg p-2", iconBgColor)}>
          <Icon className={cn("h-8 w-8", iconColor)} />
        </div>
      </CardContent>
    </Card>
  );
}
