"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { getCookie } from "@/lib/getcookie";
import { CheckIcon, XIcon } from "lucide-react";
import { Toaster, toast } from "sonner";
const ApprovePage = () => {
  const [waitingList, setWaitingList] = useState<any[]>([]);

  const token = getCookie("token");

  useEffect(() => {
    const fetchWaitingList = async () => {
      try {
        const response = await axios.get(
          "http://localhost:50100/api/v1/waitingList",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const courses = response.data.data;

        // Flatten the waiting list, referencing `waitingForApproveList`
        const flattenedList = courses.flatMap((course: any) =>
          course.waitingForApproveList.map((entry: any) => ({
            ...entry,
            courseName: course.courseName,
            courseId: course.courseId,
          }))
        );

        setWaitingList(flattenedList);
        console.log(flattenedList);
      } catch (error) {
        console.error("Error fetching waiting list:", error);
      }
    };

    if (token) {
      fetchWaitingList();
    }
  }, [token]);

  const handleAction = async (
    userId: string,
    courseId: string,
    action: "approve" | "reject"
  ) => {
    try {
      console.log(courseId);
      const response = await axios.post(
        "http://localhost:50100/api/v1/action",

        { userId, courseId, action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const successMessage =
          action === "approve"
            ? ` ${response.data.message}`
            : ` ${response.data.message}`;

        toast.success(successMessage);
        // Update the waiting list
        setWaitingList((prevList) =>
          prevList.filter(
            (entry) => entry.userId !== userId || entry.courseId !== courseId
          )
        );
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${formattedTime} ${formattedDate}`;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Approval Page</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead className="text-left">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {waitingList.length > 0 ? (
            waitingList.map((waiting) => (
              <TableRow key={`${waiting.userId}-${waiting.courseId}`}>
                <TableCell>{waiting.courseName}</TableCell>
                <TableCell>{waiting.email}</TableCell>
                <TableCell>{formatTimestamp(waiting.timestamp)}</TableCell>
                <TableCell className="text-left flex space-x-2  justify-end">
                  <div
                    onClick={() =>
                      handleAction(waiting.userId, waiting.courseId, "approve")
                    }
                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full cursor-pointer inline-flex items-center justify-center"
                    aria-label="Approve"
                  >
                    <CheckIcon className="h-5 w-5 text-white" />
                  </div>
                  <div
                    onClick={() =>
                      handleAction(waiting.userId, waiting.courseId, "reject")
                    }
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full cursor-pointer inline-flex items-center justify-center"
                    aria-label="Reject"
                  >
                    <XIcon className="h-5 w-5 text-white" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                No users waiting for approval.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ApprovePage;
<Toaster position="bottom-right" richColors />;
