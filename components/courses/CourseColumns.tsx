import { ColumnDef } from "@tanstack/react-table";
import { Clipboard, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DataTableColumnHeader } from "../ui/extension/columheader";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "../ui/select";
import { toast, Toaster } from "sonner";
import { Table, TableCell, TableHeader, TableRow } from "../ui/table";
import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";

export interface Course {
  courseId: string;
  courseCode: string;
  description: string;
  location: string;
  courseName: string;
  stripePriceId: string;
  courseDate: string;
  isPublished: boolean;
  imageUrl: string;
  currentEnrollment: number;
  enrollmentLimit: number;
  registeredUsers: RegisteredUser[];
  generatedCode: string;
}

export interface RegisteredUser {
  userId: string;
  name: string;
  email: string;
  phonenumber: string;
  idcard: string;
  company: string;
}

export const columns = (
  fetchData: () => void,
  handleGenerateCode: (courseId: string) => void,
  handleCopyToClipboard: () => void,
  handleUpdateCourseStatus: (courseId: string, newStatus: boolean) => void,
  generatedCode: string,
  isLoading: boolean
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
    accessorKey: "currentEnrollment",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Enrollment" />
    ),
    cell: ({ row }) => (
      <div>
        {`${row.original.currentEnrollment} / ${row.original.enrollmentLimit}`}
      </div>
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
    cell: ({ row }) => {
      const { courseId, isPublished } = row.original;

      return (
        <Select
          value={isPublished ? "Published" : "Hidden"}
          onValueChange={async (value) => {
            const newStatus = value === "Published";
            await handleUpdateCourseStatus(courseId, newStatus);
            fetchData(); // Refetch the data after updating the status
          }}
        >
          <SelectTrigger>
            <span>{isPublished ? "Published" : "Hidden"}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="Published">Published</SelectItem>
              <SelectItem value="Hidden">Hidden</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const { courseId } = row.original;
      const [openDialog, setOpenDialog] = useState<string | null>(null);

      const handleOpenDialog = (dialogType: string) => {
        setOpenDialog(dialogType);
      };

      const handleCloseDialog = () => {
        setOpenDialog(null);
      };

      return (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* Trigger the Generate Code Dialog */}
              <Link href={`/coursemanagement/${courseId}`}>
                <DropdownMenuItem className="flex items-center space-x-2">
                  <Pencil className="h-4 w-4" />
                  <span>Edit Course</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                className="flex items-center space-x-2"
                onClick={() => handleOpenDialog(`generate-code-${courseId}`)}
              >
                <Clipboard className="h-4 w-4" />
                <span>Generate Code</span>
              </DropdownMenuItem>

              {/* Trigger the Course Participants Dialog */}
              <DropdownMenuItem
                className="flex items-center space-x-2"
                onClick={() => handleOpenDialog(`participants-${courseId}`)}
              >
                <Users className="h-4 w-4" />
                <span>Course Participants</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Generate Code Dialog */}
          <Dialog
            open={openDialog === `generate-code-${courseId}`}
            onOpenChange={handleCloseDialog}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate Code</DialogTitle>
                <DialogDescription>
                  {generatedCode
                    ? "Below is the generated code for this course."
                    : "Click the button below to generate a unique code for this course."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {row.original.generatedCode ? (
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <span className="text-sm font-mono">
                      {row.original.generatedCode}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          row.original.generatedCode
                        )
                      }
                      className="flex items-center space-x-2"
                    >
                      <Clipboard className="h-4 w-4" />
                      <span>Copy</span>
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleGenerateCode(courseId)}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Generating..." : "Generate Code"}
                  </Button>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={handleCloseDialog}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Course Participants Dialog */}
          <Dialog
            open={openDialog === `participants-${courseId}`}
            onOpenChange={handleCloseDialog}
          >
            <DialogContent className="max-w-[1000px] max-h-[1000px]">
              <DialogHeader>
                <DialogTitle>Registered Users</DialogTitle>
                <DialogDescription>
                  Below is the list of users registered for this course.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[600px]">
                <div className="grid gap-4 py-4">
                  {row?.original?.registeredUsers &&
                  row.original.registeredUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone Number</TableCell>
                            <TableCell>ID Card</TableCell>
                            <TableCell>Company</TableCell>
                          </TableRow>
                        </TableHeader>
                        <tbody>
                          {row.original.registeredUsers.map((user) => (
                            <TableRow key={user.userId}>
                              <TableCell>{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.phonenumber}</TableCell>
                              <TableCell>{user.idcard}</TableCell>
                              <TableCell>{user.company}</TableCell>
                            </TableRow>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <p>No registered users found for this course.</p>
                  )}
                </div>
              </ScrollArea>

              <DialogFooter>
                <Button type="button" onClick={handleCloseDialog}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
];
<Toaster richColors />;
