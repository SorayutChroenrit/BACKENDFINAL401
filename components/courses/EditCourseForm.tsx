"use client";
import * as React from "react";
import { z } from "zod";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { addDays, format, isAfter, isSameDay } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { Toaster, toast } from "sonner";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MultiSelector,
  MultiSelectorTrigger,
  MultiSelectorInput,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
} from "@/components/ui/extension/multi-select";
import { SmartDatetimeInput } from "../ui/extension/smart-datetime-input";
import { getCookie } from "@/lib/getcookie";

const formSchema = z.object({
  courseName: z.string().min(2, {
    message: "Course name is required and minimum 2 characters",
  }),
  courseCode: z.string().max(6, {
    message: "Course code is required and should be maximum 6 characters",
  }),
  description: z.string().min(2, {
    message: "Description is required and minimum 2 characters",
  }),
  location: z.string().min(2, {
    message: "Location is required and minimum 2 characters",
  }),
  enrollmentLimit: z
    .preprocess((value) => Number(value), z.number().min(1).max(99))
    .refine((value) => !isNaN(value), {
      message: "Enrollment limit must be a number between 1 and 99",
    }),
  hours: z
    .preprocess((value) => Number(value), z.number().min(1).max(24))
    .refine((value) => !isNaN(value), {
      message: "Hours limit must be a number between 1 and 24",
    }),
  price: z
    .preprocess((value) => Number(value), z.number().min(1).max(100000))
    .refine((value) => !isNaN(value), {
      message: "Price must be a number between 1 and 100000",
    }),
  courseDate: z.date({
    required_error: "Course date is required.",
  }),
  applicationPeriod: z
    .object({
      from: z.date({
        required_error: "Application period start date is required.",
      }),
      to: z.date({
        required_error: "Application period end date is required.",
      }),
    })
    .refine((period) => !isSameDay(period.from, period.to), {
      message: "Application period start and end dates cannot be the same.",
    }),
  courseTag: z.array(z.string()).min(1, {
    message: "Please select at least one tag.",
  }),
  courseImage: z
    .instanceof(File, { message: "Image file is required." })
    .optional(),
});

const today = new Date();

const EditCourseForm = ({
  className,
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { courseId } = useParams();
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [applicationPeriod, setApplicationPeriod] = useState<
    DateRange | undefined
  >({ from: today, to: today });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseName: "",
      courseCode: "",
      description: "",
      location: "",
      enrollmentLimit: 1,
      price: 0,
      hours: 0,
      courseTag: [],
      courseDate: today,
      applicationPeriod: { from: today, to: addDays(today, 1) },
    },
  });

  // Fetch course data by ID
  useEffect(() => {
    const fetchCourse = async () => {
      const token = getCookie("token");

      try {
        const response = await axios.get(
          `http://localhost:50100/api/v1/courses/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.status === "Success") {
          const course = response.data.data;
          console.log("Fetched course data:", course);

          // Handle `applicationPeriod` format dynamically
          const applicationPeriodData = course.applicationPeriod;
          const startDate = applicationPeriodData?.startDate || null;
          const endDate = applicationPeriodData?.endDate || null;

          const parsedStartDate = startDate ? new Date(startDate) : null;
          const parsedEndDate = endDate ? new Date(endDate) : null;

          console.log("Parsed startDate:", parsedStartDate);
          console.log("Parsed endDate:", parsedEndDate);

          // Populate form fields
          form.reset({
            courseName: course.courseName,
            courseCode: course.courseCode,
            description: course.description,
            location: course.location,
            enrollmentLimit: course.enrollmentLimit,
            price: course.price,
            courseDate: new Date(course.courseDate),
            hours: course.hours,
            applicationPeriod: { from: today, to: addDays(today, 1) },
            courseTag: course.courseTag || [],
          });

          setApplicationPeriod({
            from: parsedStartDate,
            to: parsedEndDate,
          });

          if (course.imageUrl) {
            setPreview(course.imageUrl);
          }
        } else {
          toast.error("Failed to fetch course details");
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        toast.error("An error occurred while fetching course details");
      }
    };

    fetchCourse();
  }, [courseId, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("courseImage", file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    if (typeof courseId !== "string") {
      toast.error("Invalid course ID");
      return;
    }
    console.log(courseId);
    const formData = new FormData();

    formData.append("courseId", courseId);
    formData.append("courseName", values.courseName);
    formData.append("courseCode", values.courseCode);
    formData.append("description", values.description);
    formData.append("location", values.location);
    formData.append("enrollmentLimit", values.enrollmentLimit.toString());
    formData.append("price", values.price.toString());
    formData.append("hours", values.hours.toString());
    formData.append("courseDate", values.courseDate.toISOString());
    console.log(values.courseTag);
    formData.append("courseTag", JSON.stringify(values.courseTag));
    formData.append(
      "applicationPeriod",
      JSON.stringify(values.applicationPeriod)
    );

    if (values.courseImage) {
      formData.append("courseImage", values.courseImage);
    }

    const token = getCookie("token");
    try {
      const response = await axios.post(
        "http://localhost:50100/api/v1/course/updateCourse",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Course updated successfully");
      } else {
        toast.error("Failed to update the course");
      }
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error("An error occurred while updating the course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold">
        Please Edit fill in course information details
      </h1>
      <p className="text-sm mt-3">All of this can be changed later.</p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 mt-10"
        >
          {/* Course Name */}
          <FormField
            control={form.control}
            name="courseName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Name</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Course Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Course Code */}
          <FormField
            control={form.control}
            name="courseCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Code</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Course Code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Course Tags */}
          <FormField
            control={form.control}
            name="courseTag"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Course Tags</FormLabel>
                <FormControl>
                  <MultiSelector
                    values={field.value}
                    onValuesChange={field.onChange}
                    loop
                    className="max-w-xs"
                  >
                    <MultiSelectorTrigger>
                      <MultiSelectorInput placeholder="Select Tag" />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        <MultiSelectorItem value="New Course">
                          New Release
                        </MultiSelectorItem>
                        <MultiSelectorItem value="Recently Updated">
                          Recently Updated
                        </MultiSelectorItem>
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between mb-7">
            {/* price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Price" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Enrollment Limit */}
            <FormField
              control={form.control}
              name="enrollmentLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enrollment Limit</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="90" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Application Period */}
            <FormField
              control={form.control}
              name="applicationPeriod"
              render={() => (
                <FormItem>
                  <FormLabel>Application Period</FormLabel>
                  <FormControl>
                    <div className={cn("grid gap-2", className)}>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-[300px] justify-start text-left font-normal",
                              !applicationPeriod && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon />
                            {applicationPeriod?.from ? (
                              applicationPeriod.to ? (
                                `${format(
                                  applicationPeriod.from,
                                  "LLL dd, y"
                                )} - ${format(
                                  applicationPeriod.to,
                                  "LLL dd, y"
                                )}`
                              ) : (
                                format(applicationPeriod.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            selected={applicationPeriod}
                            onSelect={(range) => {
                              if (range?.from && range?.to) {
                                if (
                                  isSameDay(range.from, today) ||
                                  isAfter(range.from, today)
                                ) {
                                  const validRange = {
                                    from: range.from,
                                    to: range.to,
                                  };
                                  setApplicationPeriod(validRange);
                                  form.setValue(
                                    "applicationPeriod",
                                    validRange
                                  );
                                }
                              } else {
                                setApplicationPeriod(range);
                                form.setValue("applicationPeriod", range);
                              }
                            }}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* hours Limit */}
            <FormField
              control={form.control}
              name="hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="hours" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col gap-10 sm:flex-row  items-center mb-7">
            {/* Course Date */}
            <FormField
              control={form.control}
              name="courseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Date</FormLabel>
                  <FormControl>
                    <div className={cn("grid gap-2", className)}>
                      <SmartDatetimeInput
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="e.g. Tomorrow morning 9am"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Course Image */}
          <FormItem>
            <FormLabel>Course Image</FormLabel>
            <Input
              name="courseImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {preview && (
              <img src={preview} alt="Preview" className="mt-4 w-40 h-40" />
            )}
            <FormMessage />
          </FormItem>

          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
          <Toaster position="bottom-right" richColors />
        </form>
      </Form>
    </div>
  );
};

export default EditCourseForm;
