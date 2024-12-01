"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { getCookie } from "@/lib/getcookie";
import { Calendar } from "../ui/extension/calendar-bond";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface TrainingInfo {
  courseId: string;
  courseName: string;
  description: string;
  location: string;
  courseImage: string;
  courseDate: string;
  hours: number;
}

interface User {
  userId: string;
  name: string;
  email: string;
  role: string;
  phonenumber: string;
  idcard: string;
  company: string;
  trainingInfo: TrainingInfo[];
  statusDuration: string;
  statusEndDate: string;
  statusExpiration: string;
  statusStartDate: string;
}

export default function Mycourseinfo() {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const token = getCookie("token");

  async function fetchData() {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:50100/api/v1/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setData(response.data.data);
      } else {
        toast.error("Failed to fetch user data.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to fetch user data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!data) {
    return <div className="text-center py-10">No user data found.</div>;
  }

  const highlightDates = data.trainingInfo.map(
    (course) => new Date(course.courseDate).toISOString().split("T")[0]
  );

  return (
    <div className="container mx-auto px-4">
      <Toaster richColors />
      <div className="flex">
        {/* Left Section */}
        <div className="w-1/2 p-4 ">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                👤 User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-lg flex items-center gap-2">
                <span>👨‍💼</span> <strong>Name:</strong> {data.name}
              </p>
              <p className="text-lg flex items-center gap-2">
                <span>📧</span> <strong>Email:</strong> {data.email}
              </p>
              <p className="flex items-center gap-2">
                <span>📱</span> <strong>Phone Number:</strong>{" "}
                {data.phonenumber}
              </p>
              <p className="flex items-center gap-2">
                <span>🪪</span> <strong>ID Card:</strong> {data.idcard}
              </p>
              <p className="text-lg flex items-center gap-2">
                <span>🏢</span> <strong>Company:</strong> {data.company}
              </p>
              <p className="flex items-center gap-2">
                <span>📅</span> <strong>Status Start Date:</strong>{" "}
                {data.statusStartDate
                  ? new Date(data.statusStartDate).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <span>📅</span> <strong>Status End Date:</strong>{" "}
                {data.statusEndDate
                  ? new Date(data.statusEndDate).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <span>⏳</span> <strong>Status Duration:</strong>{" "}
                {data.statusDuration || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <span>⏰</span> <strong>Status Expiration:</strong>{" "}
                {data.statusExpiration || "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Section */}
        <div className="w-1/2 flex p-4 justify-end">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar highlightDates={highlightDates} />
            </CardContent>
          </Card>
        </div>
      </div>

      <h1 className="text-2xl font-bold ml-4 mt-4 mb-4">
        My Registered Courses
      </h1>
      {data.trainingInfo.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.trainingInfo.map((course) => (
            <div
              key={course.courseId}
              className="border rounded-lg shadow-md p-4"
            >
              <img
                src={course.courseImage}
                alt={course.courseName}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h2 className="text-xl font-semibold">{course.courseName}</h2>
              <p className="text-gray-700 mt-2">{course.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                <strong>Location:</strong> {course.location}
              </p>
              <p className="text-sm text-gray-500 mt-2 flex gap-2">
                <span>
                  <strong>Date:</strong>{" "}
                  {new Date(course.courseDate).toLocaleDateString()}
                </span>
                <span>
                  <strong>Hours:</strong> {course.hours}
                </span>
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">No courses registered yet.</p>
      )}
    </div>
  );
}
