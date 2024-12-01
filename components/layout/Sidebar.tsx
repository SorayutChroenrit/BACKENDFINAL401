"use client";

import { getCookie } from "@/lib/getcookie";
import axios from "axios";
import {
  Home,
  Book,
  GraduationCap,
  Users,
  CheckCircle,
  FolderCog,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserData {
  role: string;
}

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const token = getCookie("token");

  const sidebarRoutes = [
    {
      icon: <Home />,
      label: "Home",
      path: "/home",
      roles: ["user", "admin"],
    },

    {
      icon: <GraduationCap />,
      label: "Courses",
      path: "/courses",
      roles: ["user", "admin"],
    },
    {
      icon: <Book />,
      label: "My Courses",
      path: "/mycourses",
      roles: ["user"],
    },
    {
      icon: <FolderCog />,
      label: "Course Management",
      path: "/coursemanagement",
      roles: ["admin"],
    },
    {
      icon: <Users />,
      label: "Users",
      path: "/users",
      roles: ["admin"],
    },
    {
      icon: <CheckCircle />,
      label: "Approve",
      path: "/approve",
      roles: ["admin"],
    },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        router.push("/");
        return;
      }
      try {
        const response = await axios.get("http://localhost:50100/api/v1/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/");
      }
    };

    fetchUserData();
  }, [router, token]);

  if (!user) return <div>Loading...</div>;

  const allowedRoutes = sidebarRoutes.filter((route) =>
    route.roles.includes(user.role)
  );

  return (
    <div className="max-sm:hidden flex flex-col w-64 border-r shadow-md px-3 my-4 gap-4 text-sm font-medium">
      {allowedRoutes.map((route) => (
        <Link
          href={route.path}
          key={route.path}
          className={`flex items-center gap-4 p-3 rounded-lg hover:bg-[#FFF8EB] ${
            pathname.startsWith(route.path) &&
            "bg-[#FDAB04] hover:bg-[#FDAB04]/80"
          }`}
        >
          {route.icon} {route.label}
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;
