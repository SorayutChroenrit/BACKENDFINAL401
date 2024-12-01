"use client";
import * as React from "react";
import { z } from "zod";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { Toaster, toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  role: z.string().optional(),
  phonenumber: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  idcard: z.string().min(13, {
    message: "ID card must be 13 digits.",
  }),
  company: z.string().min(2, {
    message: "Company name is required and must be at least 2 characters.",
  }),
  avatar: z.instanceof(File).optional(),
});

const EditUserForm = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  const { userId } = useParams();
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false); // New state to track data loading

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      phonenumber: "",
      idcard: "",
      company: "",
    },
  });

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const token = getCookie("token");

      try {
        const response = await axios.get(
          `http://localhost:50100/api/v1/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.status === "Success") {
          const user = response.data.data;

          // Reset form with fetched data
          form.reset({
            name: user.name,
            email: user.email,
            role: user.role,
            phonenumber: user.phonenumber,
            idcard: user.idcard,
            company: user.company,
          });

          // Set avatar preview if available
          if (user.imageUrl) {
            setPreview(user.imageUrl);
          }

          setDataLoaded(true); // Mark data as loaded
        } else {
          toast.error("Failed to fetch user details");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("An error occurred while fetching user details");
      }
    };

    fetchUser();
  }, [userId, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("avatar", file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    if (typeof userId !== "string") {
      toast.error("Invalid course ID");
      return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("phonenumber", values.phonenumber);
    formData.append("idcard", values.idcard);
    formData.append("company", values.company);

    if (values.avatar) {
      formData.append("avatar", values.avatar);
    }

    const token = getCookie("token");
    try {
      const response = await axios.post(
        "http://localhost:50100/api/v1/user/updateUser",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast.success("User updated successfully");
      } else {
        toast.error("Failed to update the user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("An error occurred while updating the user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold">Edit User Information</h1>
      <p className="text-sm mt-3">You can update the details here.</p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 mt-10"
        >
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
          <FormItem>
            <FormLabel>Avatar</FormLabel>
            <Input
              name="avatar"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {preview && (
              <img src={preview} alt="Preview" className="mt-4 w-40 h-40" />
            )}
            <FormMessage />
          </FormItem>
          <Button type="submit" disabled={loading || !dataLoaded}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
          <Toaster position="bottom-right" richColors />
        </form>
      </Form>
    </div>
  );
};

export default EditUserForm;
