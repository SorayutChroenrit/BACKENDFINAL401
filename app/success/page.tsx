"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { getCookie } from "@/lib/getcookie";

const SuccessPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [courseName, setCourseName] = useState("");
  const [userId, setUserId] = useState("");
  const [countdown, setCountdown] = useState(5);
  const token = getCookie("token");

  // Effect to handle session data fetching and training registration
  useEffect(() => {
    if (!sessionId) return; // Exit early if there's no session ID

    async function fetchSessionData() {
      try {
        const sessionResponse = await axios.get(
          `http://localhost:50100/api/checkout-session/${sessionId}`
        );

        const sessionData = sessionResponse.data.data;
        const { userId, courseId } = sessionData.metadata;
        console.log("Session metadata:", { userId, courseId });

        if (userId && courseId) {
          setUserId(userId);

          // Call the /add-training API
          const addTrainingResponse = await axios.post(
            `http://localhost:50100/api/v1/registerCourse`,
            { userId, courseId },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log("Registration Response:", sessionData.data);

          const courses = addTrainingResponse.data.data;
          if (courses && Array.isArray(courses)) {
            const course = courses.find(
              (info: { courseId: string }) => info.courseId === courseId
            );
            if (course) setCourseName(course.courseName);
          }
        } else {
          console.error("Metadata missing userId or courseId");
        }
      } catch (error) {
        console.error(
          "Error handling session data or adding training info:",
          error
        );
      }
    }

    fetchSessionData();
  }, []);

  // Effect to handle countdown and redirect after completion
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push("/mycourses");
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center p-4">
      <h1 className="text-2xl font-bold text-green-600">
        Payment Successful! 🎉
      </h1>
      <p className="text-gray-700 mt-2">
        Thank you for your purchase. You have successfully registered for the
        course.
      </p>

      {courseName && (
        <p className="text-gray-800 mt-2">
          <strong>Course Name:</strong> {courseName}
        </p>
      )}

      <p className="text-gray-500 mt-4">
        You will be redirected to the home page in {""}
        <strong>{countdown} seconds</strong>.
      </p>

      <p className="text-gray-500 mt-2">If not, click the button below:</p>
      <button
        onClick={() => router.push("/mycourses")}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go to Home
      </button>
    </div>
  );
};

export default SuccessPage;
