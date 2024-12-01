"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";
import { Toaster, toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { getCookie } from "@/lib/getcookie";
import { Input } from "../ui/input";

interface Carousel {
  carouselImageUrl: string;
}

interface UserData {
  name: string;
  email: string;
  password: string;
  avatar: string | null;
  company: string;
  phonenumber: string;
  role: string;
}

const HomeCarousel = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [carousel, setCarousel] = useState<Carousel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const router = useRouter();

  const token = getCookie("token");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file)); // Generate preview URL
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select an image file!");
      return;
    }

    const formData = new FormData();
    formData.append("courseImage", selectedFile);

    try {
      setLoading(true);
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const response = await axios.post(
        "http://localhost:50100/api/v1/createCarousel",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === "Success") {
        toast.success("Carousel created successfully!");
        router.push("/home");
      } else {
        toast.error(response.data.message || "Failed to create carousel");
      }
    } catch (err) {
      console.error("Error creating carousel:", err);
      toast.error("An error occurred while creating the carousel.");
    } finally {
      setLoading(false);
      setPreviewImage(null);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:50100/api/v1/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.data);
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          console.log("Invalid or expired token. Redirecting to home page.");
          router.push("/");
        } else {
          console.error("Unexpected error:", error);
        }
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await axios.get(
          "http://localhost:50100/api/v1/carousels"
        );

        if (response.data.status === "Success") {
          setCarousel(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch carousels");
        }
      } catch (err) {
        setError("An error occurred while fetching carousels");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  return (
    <div>
      <Toaster richColors />
      <div className="flex justify-end">
        {user?.role === "admin" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add new Carousel</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Carousel Image</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center">
                <h1 className="text-xl font-medium mb-4">Upload an Image</h1>
                <form className="w-full max-w-md" onSubmit={handleFormSubmit}>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mb-4"
                  />
                  {previewImage && (
                    <div className="mb-4">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-auto object-cover rounded-md"
                      />
                    </div>
                  )}
                  <Button type="submit" disabled={loading}>
                    {loading ? "Uploading..." : "Upload Image"}
                  </Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Carousel
        className="w-full"
        plugins={[
          Autoplay({
            delay: 3000,
          }),
        ]}
      >
        <CarouselContent className="flex w-full">
          {carousel.map((item, index) => (
            <CarouselItem key={index} className="w-full">
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-[16/9] items-center justify-center p-6 ">
                    <img
                      src={item.carouselImageUrl}
                      alt={`Carousel Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default HomeCarousel;
