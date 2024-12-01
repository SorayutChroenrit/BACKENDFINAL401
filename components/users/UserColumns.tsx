import { ColumnDef } from "@tanstack/react-table";
import { Clipboard, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DataTableColumnHeader } from "../ui/extension/columheader";
import Link from "next/link";
import { Toaster, toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "../ui/select";
import axios from "axios";
import { getCookie } from "@/lib/getcookie";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useState } from "react";
import { Table, TableCell, TableHeader, TableRow } from "../ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export interface User {
  userId: string;
  name: string;
  email: string;
  role: string;
  status: string;
  company: string;
  phonenumber: string;
  idcard: string;
  trainingInfo: [];
  statusDuration: string;
  statusStartDate: Date;
  statusEndDate: Date;
  statusExpiration: string;
}

const token = getCookie("token");

const handleUpdateUserRole = async (userId: string, newRole: string) => {
  try {
    const response = await axios.post(
      "http://localhost:50100/api/v1/user/updateUser",
      {
        userId,
        role: newRole, // Send the updated role
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status === "Success") {
      toast.success(`User role updated to ${newRole}`);
    } else {
      toast.error("Failed to update user role");
    }
  } catch (error) {
    console.error("Error updating user role:", error);
    toast.error("An error occurred while updating the user role");
  }
};

const handleUpdateUserStatus = async (userId: string, newStatus: string) => {
  console.log(userId, newStatus);
  try {
    const response = await axios.post(
      "http://localhost:50100/api/v1/user/updateUser",

      {
        userId,
        status: newStatus,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status === "Success") {
      toast.success(
        `User status updated to ${newStatus ? "Active" : "Inactive"}`
      );
    } else {
      toast.error("Failed to update course status");
    }
  } catch (error) {
    console.error("Error updating course status:", error);
    toast.error("An error occurred while updating the course status");
  }
};

export const columns = (fetchData: () => void): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const { userId, role } = row.original;

      return (
        <Select
          value={role} // Use the string status directly
          onValueChange={async (value) => {
            // Update the status directly
            await handleUpdateUserRole(userId, value);
            fetchData();
          }}
        >
          <SelectTrigger>
            <span>{role}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const { userId, status } = row.original;

      return (
        <Select
          value={status} // Use the string status directly
          onValueChange={async (value) => {
            // Update the status directly
            await handleUpdateUserStatus(userId, value);
            fetchData(); // Refresh data after status update
          }}
        >
          <SelectTrigger>
            <span>{status}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
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
              <Link href={`/users/${row.original.userId}`}>
                <DropdownMenuItem>
                  <Pencil className="h-4 w-4" />
                  <span>Edit User</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                onClick={() =>
                  handleOpenDialog(`userInfo-${row.original.userId}`)
                }
              >
                <Clipboard className="h-4 w-4" />
                <span>View Details</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog
            open={openDialog === `userInfo-${row.original.userId}`}
            onOpenChange={handleCloseDialog}
          >
            <DialogContent className="max-w-[800px] max-h-[800px]">
              <DialogHeader>
                <DialogTitle>User Information</DialogTitle>
                <DialogDescription>
                  Below are the details of the user along with their training
                  history.
                </DialogDescription>
              </DialogHeader>

              {/* Scrollable Content */}
              <ScrollArea className="max-h-[600px]">
                <div className="grid gap-4 py-4">
                  {/* User Information */}
                  <Card className="p-4">
                    <CardContent className="space-y-3">
                      <p className="text-lg flex items-center gap-2">
                        <span>👨‍💼</span> <strong>Name:</strong>{" "}
                        {row.original.name || "N/A"}
                      </p>
                      <p className="text-lg flex items-center gap-2">
                        <span>📧</span> <strong>Email:</strong>{" "}
                        {row.original.email || "N/A"}
                      </p>
                      <p className="text-lg flex items-center gap-2">
                        <span>📱</span> <strong>Phone Number:</strong>{" "}
                        {row.original.phonenumber || "N/A"}
                      </p>
                      <p className="text-lg flex items-center gap-2">
                        <span>🪪</span> <strong>ID Card:</strong>{" "}
                        {row.original.idcard || "N/A"}
                      </p>
                      <p className="text-lg flex items-center gap-2">
                        <span>🏢</span> <strong>Company:</strong>{" "}
                        {row.original.company || "N/A"}
                      </p>
                      <p className="text-lg flex items-center gap-2">
                        <span>📅</span> <strong>Status Start Date:</strong>{" "}
                        {row.original.statusStartDate
                          ? new Date(
                              row.original.statusStartDate
                            ).toLocaleDateString("en-GB", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </p>
                      <p className="text-lg flex items-center gap-2">
                        <span>📅</span> <strong>Status End Date:</strong>{" "}
                        {row.original.statusEndDate
                          ? new Date(
                              row.original.statusEndDate
                            ).toLocaleDateString("en-GB", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </p>
                      <p className="text-lg flex items-center gap-2">
                        <span>⏳</span> <strong>Status Duration:</strong>{" "}
                        {row.original.statusDuration || "N/A"}
                      </p>
                      <p className="text-lg flex items-center gap-2">
                        <span>⏰</span> <strong>Status Expiration:</strong>{" "}
                        {row.original.statusExpiration || "N/A"}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Training Information */}
                  <div className="mt-4">
                    <h3 className="text-lg font-medium py-2">
                      Training History
                    </h3>
                    {row.original.trainingInfo &&
                    row.original.trainingInfo.length > 0 ? (
                      <div>
                        <table className="table-auto w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 px-4 py-2">
                                Course Name
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Location
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Hours
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Course Date
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {row.original.trainingInfo.map((info, index) => (
                              <tr key={index}>
                                <td className="border border-gray-300 px-4 py-2">
                                  {info.courseName || "N/A"}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {info.location || "N/A"}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {info.hours || "N/A"}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {info.courseDate
                                    ? new Date(
                                        info.courseDate
                                      ).toLocaleDateString(undefined, {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })
                                    : "No date provided"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p>No training information available for this user.</p>
                    )}
                  </div>
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
