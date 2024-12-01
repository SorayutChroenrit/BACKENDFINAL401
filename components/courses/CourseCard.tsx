"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Calendar } from "lucide-react";
import { getCookie } from "@/lib/getcookie";
import { Progress } from "@/components/ui/progress";

interface ApplicationPeriod {
  startDate: string;
  endDate: string;
}

interface Course {
  courseId: string;
  courseName: string;
  price: string;
  description: string;
  applicationPeriod: ApplicationPeriod;
  courseDate: string;
  location: string;
  imageUrl?: string;
  courseTag: string | string[];
  isPublished: boolean;
  currentEnrollment: number;
  enrollmentLimit: number;
}

const badgeVariants: Record<
  string,
  "default" | "secondary" | "updated" | "new" | "outline"
> = {
  "New Course": "new",
  "Recently Updated": "updated",
};

const parseCourseTag = (tag: string | string[]): string[] => {
  if (Array.isArray(tag)) {
    if (
      tag.length === 1 &&
      typeof tag[0] === "string" &&
      tag[0].startsWith("[")
    ) {
      try {
        return JSON.parse(tag[0]);
      } catch {
        return [];
      }
    }
    return tag;
  }
  return [tag];
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const CourseCard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [registeredCourses, setRegisteredCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const token = getCookie("token");

  useEffect(() => {
    async function fetchCoursesAndUserInfo() {
      try {
        const [coursesResponse, userResponse] = await Promise.all([
          axios.get("http://localhost:50100/api/v1/auth/courses", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:50100/api/v1/user", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (coursesResponse.data.status === "Success") {
          const publishedCourses = coursesResponse.data.data.filter(
            (course: Course) => course.isPublished
          );
          setCourses(publishedCourses);
        } else {
          setError(coursesResponse.data.message || "Failed to fetch courses");
        }

        if (userResponse.data.status === "Success") {
          const userInfo = userResponse.data.data;
          const trainingInfo = userInfo.trainingInfo || [];
          const registeredCourseIds = trainingInfo.map(
            (training: any) => training.courseId
          );
          setRegisteredCourses(registeredCourseIds);

          setIsAdmin(userInfo.role === "admin");
        } else {
          setError(userResponse.data.message || "Failed to fetch user info");
        }
      } catch (err) {
        setError("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    }

    fetchCoursesAndUserInfo();
  }, []);

  if (loading) return <p>Loading courses...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (courses.length === 0) return <p>No courses available at the moment.</p>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {courses.map((course) => {
        const tags = parseCourseTag(course.courseTag);

        return (
          <div
            key={course.courseId}
            className="shadow-lg rounded-lg overflow-hidden"
          >
            <img
              src={course.imageUrl || "/image_placeholder.webp"}
              alt={`Image of the course ${course.courseName}`}
              width={500}
              height={300}
              className="rounded-t-lg w-full h-[180px] transition-transform hover:scale-105"
            />
            <div className="p-4 flex flex-col gap-2">
              <h2 className="text-lg font-bold hover:text-[#FDAB04]">
                {course.courseName}
              </h2>

              {tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant={badgeVariants[tag] || "secondary"}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Calendar className="text-[#9196a1]" />
                <p className="text-[#9196a1] text-sm pt-1">
                  {formatDate(course.courseDate)}
                </p>
              </div>
              <hr />
              {isAdmin ? (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Enrollment: {course.currentEnrollment} /{" "}
                    {course.enrollmentLimit}
                  </p>
                  <Progress
                    value={
                      (course.currentEnrollment / course.enrollmentLimit) * 100
                    }
                  />
                </div>
              ) : (
                <div className="flex justify-between items-center mt-4">
                  {(() => {
                    const now = new Date();
                    const startDate = new Date(
                      course.applicationPeriod.startDate
                    );
                    const endDate = new Date(course.applicationPeriod.endDate);
                    const isRegistered = registeredCourses.includes(
                      course.courseId
                    );

                    if (now < startDate) {
                      return <Button disabled>Not open</Button>;
                    }

                    if (isRegistered) {
                      return (
                        <p className="text-green-500 font-semibold">
                          Already registered
                        </p>
                      );
                    }

                    if (now >= startDate && now <= endDate) {
                      return (
                        <Link
                          href={`/courses/${course.courseId}/onlineregister`}
                        >
                          <Button>Register</Button>
                        </Link>
                      );
                    }

                    return <Button disabled>Registration closed</Button>;
                  })()}
                  <p className="text-lg font-bold">{course.price} ฿</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CourseCard;
