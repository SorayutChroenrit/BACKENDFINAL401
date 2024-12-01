"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputMask from "react-input-mask";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Course } from "@/components/courses/CourseColumns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCookie } from "@/lib/getcookie";
import Image from "next/image";
import { goToCheckout } from "@/components/checkout/CheckOut-Button";
import { jwtDecode } from "jwt-decode";

const formSchema = z.object({
  idcard: z.string().min(13, { message: "ID Card must be 13 characters long" }),
});

const Page = () => {
  const { courseId } = useParams();
  const [courses, setCourses] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const token = getCookie("token");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    async function fetchCourseById() {
      try {
        const response = await axios.get(
          `http://localhost:50100/api/v1/courses/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.status === "Success") {
          setCourses(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch courses");
        }
      } catch (err) {
        setError("An error occurred while fetching courses");
      } finally {
        setLoading(false);
      }
    }

    fetchCourseById();
  }, [courseId, token]);

  async function verifyIdCard(
    idcard: string,
    stripePriceId: string,
    courseId: string,
    userId: string
  ) {
    setIsVerifying(true);

    try {
      const verifyResponse = await axios.post(
        `http://localhost:50100/api/v1/verify-id`,
        { idcard },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (verifyResponse.data.status === "Success") {
        toast.success("ID Card verified successfully!");

        // Call the checkout API with the stripePriceId
        const checkoutResponse = await axios.post(
          "http://localhost:50100/api/create-checkout-session",
          {
            stripePriceId,
            metadata: {
              userId,
              courseId,
            },
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const sessionId = checkoutResponse.data.sessionId;

        // Redirect to Stripe checkout
        await goToCheckout(sessionId);
      } else {
        // Display an error from the response if status is not success
        toast.error(
          verifyResponse.data.message || "Invalid ID Card. Please try again."
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "An unexpected error occurred.";
        toast.error(errorMessage);
      } else {
        toast.error("Verification failed. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (courses && token) {
      // Decode the token to extract user ID
      const decodedToken: { userId: string } = jwtDecode(token);
      const userId = decodedToken.userId;
      verifyIdCard(
        values.idcard,
        courses.stripePriceId,
        courses.courseId,
        userId
      );
    } else {
      toast.error("Failed to verify. Missing required information.");
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : courses ? (
        <Card className="w-full flex-grow">
          <CardHeader>
            <CardTitle className="flex justify-center text-3xl">
              Online Register Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row gap-6">
              <div>
                <Image
                  src={courses.imageUrl}
                  alt={courses.courseName}
                  width={600}
                  height={300}
                />
              </div>
              <div>
                <p>{courses.courseName}</p>
                <p>{courses.description}</p>
                <p>Location</p>
                <p>{courses.location}</p>
                <h1>Register with ID Card</h1>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8 max-w-3xl mx-auto py-10"
                  >
                    <FormField
                      control={form.control}
                      name="idcard"
                      render={({ field }) => (
                        <FormItem className="grid gap-2">
                          <FormLabel htmlFor="idcard">ID Card</FormLabel>
                          <FormControl>
                            <InputMask
                              mask="9-9999-99999-99-9"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value)}
                              maskChar={null}
                            >
                              {(inputProps) => (
                                <Input
                                  {...inputProps}
                                  id="idcard"
                                  type="text"
                                  placeholder="1-1001-23456-78-9"
                                />
                              )}
                            </InputMask>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isVerifying}>
                      {isVerifying ? "Verifying..." : "Verify ID Card"}
                    </Button>{" "}
                  </form>
                </Form>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p>Card Footer</p>
          </CardFooter>
        </Card>
      ) : (
        <p>No course data available.</p>
      )}
    </div>
  );
};

export default Page;
