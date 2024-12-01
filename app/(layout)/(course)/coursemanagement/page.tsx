"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  columns as createColumns,
  Course,
} from "@/components/courses/CourseColumns";
import { DataTable } from "@/components/ui/extension/datatable";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { getCookie } from "@/lib/getcookie";

export default function CourseManagement() {
  const [data, setData] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatedCode, setGeneratedCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const token = getCookie("token");

  // Reusable date formatting function
  const formatDate = (dateInput: string | Date): string => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Fetch courses data
  async function fetchData() {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:50100/api/v1/auth/courses",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        const formattedData = response.data.data.map((course: Course) => ({
          ...course,
          courseDate: formatDate(course.courseDate),
        }));
        setData(formattedData);
      } else {
        toast.error("Failed to fetch courses.");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses.");
    } finally {
      setLoading(false);
    }
  }

  // Handle generate code
  const handleGenerateCode = async (courseId: string) => {
    console.log(courseId);
    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:50100/api/v1/generatecode",
        { courseId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setIsLoading(false);

      if (response.data.status === "Success") {
        setGeneratedCode(response.data.data.generatedCode);
        console.log(generatedCode);
        toast.success("Code generated successfully!");
      } else {
        toast.error("Failed to generate code.");
      }
    } catch (error) {
      setIsLoading(false);
      // Handle specific backend errors
      if (axios.isAxiosError(error) && error.response) {
        const { code, message } = error.response.data;

        if (code === "Error-01-0004") {
          // Display a toast for the conflict error
          toast.error(message);
        } else {
          // Handle other errors from the backend
          toast.error("The code generation period has expired.");
        }
      }
    }
  };

  // Handle course status update
  const handleUpdateCourseStatus = async (
    courseId: string,
    newStatus: boolean
  ) => {
    try {
      const response = await axios.post(
        "http://localhost:50100/api/v1/course/updatecourse",
        { courseId, isPublished: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.code === "Success-01-0001") {
        toast.success(
          `Course status updated to ${newStatus ? "Published" : "Hidden"}`
        );
        fetchData(); // Refetch the data after updating the status
      } else {
        toast.error("Failed to update course status");
      }
    } catch (error) {
      console.error("Error updating course status:", error);
      toast.error("An error occurred while updating the course status.");
    }
  };

  // Memoize the columns
  const memoizedColumns = useMemo(
    () =>
      createColumns(
        fetchData,
        handleGenerateCode,
        () => toast.success("Code copied to clipboard!"),
        handleUpdateCourseStatus,
        generatedCode,
        isLoading
      ),
    [
      fetchData,
      handleGenerateCode,
      handleUpdateCourseStatus,
      generatedCode,
      isLoading,
    ]
  );

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div>
      <div className="px-6 py-4 flex justify-end">
        <Link href="/coursemanagement/create-course">
          <Button>Create New Courses</Button>
        </Link>
      </div>

      <div className="container mx-auto px-6 pb-5">
        {data.length > 0 ? (
          <DataTable columns={memoizedColumns} data={data} />
        ) : (
          <div className="text-center py-10">No results found.</div>
        )}
        <Toaster position="bottom-right" richColors />
      </div>
    </div>
  );
}
