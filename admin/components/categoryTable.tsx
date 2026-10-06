"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Edit2, Trash2, Search, ToggleRight, ToggleLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface Item {
  _id: string;
  name: string;
  isActive: boolean;
  description: string;
  icon: string;
  parent: string | null;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

interface CustomTableProps {
  data: Item[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string) => void;
}

export function CategoryTable({
  data,
  onEdit,
  onDelete,
  onStatusChange,
}: CustomTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="flex items-center relative space-x-2">
        <Search className="h-5 left-4 absolute w-5 text-gray-400" />
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm pl-8"
        />
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Name</TableHead>
              <TableHead className="hidden md:table-cell">
                Description
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    {/* <Avatar>
                      <AvatarImage src={item.icon} alt={item.name} />
                      <AvatarFallback>
                        {item.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar> */}
                    <div className=" p-2 h-[50px] w-[50px] aspect-square ">
                      <Image
                        src={item.icon}
                        height={40}
                        width={40}
                        objectFit="contain"
                        alt=""
                      />
                    </div>
                    <span>{item.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell max-w-[300px]">
                  <p className="truncate">{item.description}</p>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={item.isActive ? "secondary" : "secondary"}
                    className="capitalize"
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {format(item.createdAt, "PP")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusChange(item._id)}
                      className={`transition-colors duration-200 w-[6rem] ${
                        item.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {item.isActive ? (
                        <ToggleRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 mr-1" />
                      )}
                      <span className="text-xs font-medium">
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(item._id)}
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(item._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-4">No results found</div>
      )}
    </div>
  );
}
