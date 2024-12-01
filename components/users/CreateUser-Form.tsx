"use client";
import * as React from "react";
import { z } from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getCookie } from "@/lib/getcookie";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name is required and must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "A valid email is required.",
  }),
  phonenumber: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  idcard: z.string().min(13, {
    message: "ID card must be 13 digits.",
  }),
  company: z.string().min(2, {
    message: "Company name is required and must be at least 2 characters.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

const CreateUserForm = ({}: React.HTMLAttributes<HTMLDivElement>) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phonenumber: "",
      idcard: "",
      company: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    const token = getCookie("token");
    try {
      const response = await axios.post(
        "http://localhost:50100/api/v1/createAccount",
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("User Created Successfully", {
          description: "The user has been created.",
        });
        form.reset();
      } else {
        toast.error("User creation failed", {
          description:
            "There was an issue creating the user. Please try again.",
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { code, message } = error.response.data;

        if (code === "Error-01-0002") {
          // Conflict error (e.g., email or ID card already in use)
          toast.error(message);
        } else if (code === "Error-01-0003") {
          // Internal server error
          toast.error("Internal server error. Please try again later.");
        } else {
          // General backend error
          toast.error("An error occurred. Please try again.");
        }
      } else {
        // Handle network or unexpected errors
        console.error("Unexpected error:", error);
        toast.error("Failed to register. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold">Register New User</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 mt-10"
        >
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Full Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email Address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone Number */}
          <FormField
            control={form.control}
            name="phonenumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Phone Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ID Card */}
          <FormField
            control={form.control}
            name="idcard"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Card</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="ID Card Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Company */}
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Company Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
          <Toaster position="bottom-right" richColors />
        </form>
      </Form>
    </div>
  );
};

export default CreateUserForm;
