"use client";

import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Toaster, toast } from "sonner";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export default function ForgetPasswordPreview() {
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true); // Start loading state
    try {
      const response = await axios.post(
        "http://localhost:50100/api/v1/forgot-password",
        {
          email: values.email,
        }
      );

      if (response.status === 200) {
        toast.success("Password reset email sent. Please check your inbox.");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        toast.error("Failed to send password reset email. Please try again.");
      }
    } catch (error) {
      console.error("Error sending password reset email", error);
      toast.error("Failed to send password reset email. Please try again.");
    } finally {
      setIsLoading(false); // End loading state
    }
  }

  return (
    <div className="flex min-h-[40vh] h-full w-full items-center justify-center px-4">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address to receive a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          placeholder="johndoe@mail.com"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
                <Toaster position="bottom-right" richColors />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
