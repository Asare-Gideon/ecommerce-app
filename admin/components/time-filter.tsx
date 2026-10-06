"use client";

import { Button } from "@/components/ui/button";

interface TimeFilterProps {
  value: string;
  onChange: (value: string) => void;
  options?: string[];
}

export default function TimeFilter({
  value,
  onChange,
  options = ["All", "Today", "Weekly", "Monthly"],
}: TimeFilterProps) {
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <Button
          key={option}
          variant={value === option ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
