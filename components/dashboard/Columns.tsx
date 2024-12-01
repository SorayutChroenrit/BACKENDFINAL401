import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DataTableColumnHeader } from "../ui/extension/columheader";
import Link from "next/link";

export interface Course {
  courseId: string;
  courseCode: string;
  courseName: string;
  courseDate: string;
  isPublished: boolean;
}

export const columns = (
  handleDeleteCourse: (courseId: string) => void
): ColumnDef<Course>[] => [
  {
    accessorKey: "courseCode",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course Code" />
    ),
  },
  {
    accessorKey: "courseName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course Name" />
    ),
  },
  {
    accessorKey: "courseDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course Date" />
    ),
  },
  {
    accessorKey: "isPublished",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ getValue }) => (getValue<boolean>() ? "Published" : "Hidden"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { courseId } = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href={`/coursemanagement/${courseId}`}>
              <DropdownMenuItem className="flex items-center space-x-2">
                <Pencil className="h-4 w-4" />
                <span>Edit Course</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              className="flex items-center space-x-2"
              onClick={() => handleDeleteCourse(courseId)}
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Course</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
