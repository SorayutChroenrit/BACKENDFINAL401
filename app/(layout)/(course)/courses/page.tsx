import CourseCard from "@/components/courses/CourseCard";

const CoursesPage = () => {
  return (
    <div>
      <div className="md:mt-5 md:px-10 xl:px-16 pb-16">
        <div className="flex flex-wrap gap-7 justify-center">
          <CourseCard />
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
