"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MultiSelectProps {
  options: string[];
  selected: string[] | undefined;
  onChange: (selected: string[]) => void;
  placeholder?: string;
  singleSelect?: boolean;
}

export default function MultiSelect({
  options,
  selected = [],
  onChange,
  placeholder = "Select...",
  singleSelect = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  // Ensure selected is always an array
  const selectedArray = selected || [];

  const handleUnselect = (item: string) => {
    if (singleSelect) {
      onChange([]);
    } else {
      onChange(selectedArray.filter((i) => i !== item));
    }
  };

  const handleSelect = (item: string) => {
    if (singleSelect) {
      onChange([item]);
      setOpen(false);
      return;
    }

    if (selectedArray.includes(item)) {
      onChange(selectedArray.filter((i) => i !== item));
    } else {
      onChange([...selectedArray, item]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full" asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-11"
        >
          <div className="flex flex-wrap gap-1">
            {selectedArray.length > 0 ? (
              selectedArray.map((item) => (
                <Badge
                  variant="secondary"
                  key={item}
                  className="mr-1 rounded-sm px-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUnselect(item);
                  }}
                >
                  {item}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[30rem] left-0 self-start p-0">
        <Command>
          <CommandInput
            placeholder={`Search ${placeholder.toLowerCase()}...`}
          />
          <CommandEmpty>No item found.</CommandEmpty>
          <CommandList>
            <CommandGroup className="max-h-64 overflow-auto">
              {options?.map((option) => (
                <CommandItem key={option} onSelect={() => handleSelect(option)}>
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      selectedArray?.includes(option)
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
