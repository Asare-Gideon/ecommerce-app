"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IconSelectorProps {
  icons: string[];
  onSelect: (icon: string) => void;
  onAddNewIcon: (newIcon: string) => void;
  currentIcon?: string;
}

export default function IconSelector({
  icons,
  onSelect,
  onAddNewIcon,
  currentIcon,
}: IconSelectorProps) {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [newIconUrl, setNewIconUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleIconSelect = (icon: string) => {
    setSelectedIcon(icon);
    onSelect(icon);
  };

  const handleAddNewIcon = () => {
    if (newIconUrl) {
      onAddNewIcon(newIconUrl);
      setNewIconUrl("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <Label htmlFor="icon-selector text-md mt-4">Select an Icon</Label>
      {selectedIcon && (
        <div className="flex items-center space-x-2">
          <Image
            src={selectedIcon || "/placeholder.svg"}
            alt="Selected Icon"
            width={42}
            height={22}
          />
          <span className="text-sm text-gray-500">Selected Icon</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleIconSelect("")}
            className="p-0 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {!selectedIcon && currentIcon && (
        <div className="flex items-center space-x-2">
          <Image
            src={currentIcon || "/placeholder.svg"}
            alt="Selected Icon"
            width={42}
            height={22}
          />
          <span className="text-sm text-gray-500">Category Icon</span>
        </div>
      )}

      <div className=" w-full p-4 border rounded-md bg-gray-50">
        <ScrollArea className="h-60 w-full">
          <div className="grid   grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4 p-4">
            {icons.map((icon, index) => (
              <Button
                type="button"
                key={index}
                variant="outline"
                className={`p-2 h-[60px] w-[60px] aspect-square ${
                  selectedIcon === icon ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleIconSelect(icon)}
              >
                <Image
                  src={icon || "/placeholder.svg"}
                  alt={`Icon ${index + 1}`}
                  width={42}
                  height={42}
                />
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
      {/* 
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Add New Icon
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Icon</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon-url" className="text-right">
                Icon URL
              </Label>
              <Input
                id="icon-url"
                value={newIconUrl}
                onChange={(e) => setNewIconUrl(e.target.value)}
                placeholder="https://example.com/icon.png"
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNewIcon} disabled={!newIconUrl}>
              Add Icon
            </Button>
          </div>
        </DialogContent>
      </Dialog> */}
    </div>
  );
}
