import { type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  trend: {
    value: string;
    positive?: boolean;
  };
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}

export default function AnalyticsCard({
  title,
  value,
  trend,
  icon: Icon,
  iconColor,
  iconBgColor,
}: AnalyticsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <h3 className="text-2xl font-semibold mt-1">{value}</h3>
          </div>
          <div
            className={`h-12 w-12 rounded-full flex items-center justify-center ${iconBgColor}`}
          >
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
        <p
          className={`text-sm mt-2 ${
            trend.positive ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend.value}
        </p>
      </CardContent>
    </Card>
  );
}
