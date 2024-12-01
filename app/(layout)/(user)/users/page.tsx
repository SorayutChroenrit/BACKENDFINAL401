"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { columns, User } from "@/components/users/UserColumns";
import { DataTable } from "@/components/ui/extension/datatable";
import { Toaster, toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCookie } from "@/lib/getcookie";

export default function UserManagementPage() {
  const [data, setData] = useState<User[]>([]);
  const [userdata, setUserData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const token = getCookie("token");

  async function fetchData() {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:50100/api/v1/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setData(response.data.data);
      } else {
        toast.error("Failed to fetch users.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // // Fetch courses data
  // async function fetchUserData() {
  //   setLoading(true);
  //   try {
  //     const response = await axios.get(
  //       `http://localhost:50100/api/v1/users/${userId}`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );
  //     if (response.status === 200) {
  //       setUserData(response.data.data);
  //       console.log(data);
  //     } else {
  //       toast.error("Failed to fetch courses.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching courses:", error);
  //     toast.error("Failed to fetch courses.");
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div>
      <div className="px-6 py-4 flex justify-end">
        <Link href="/users/create-user">
          <Button>Create New User</Button>
        </Link>
      </div>

      <div className="container mx-auto px-6 pb-5">
        {data.length > 0 ? (
          <DataTable columns={columns(fetchData)} data={data} />
        ) : (
          <div className="text-center py-10">No results found.</div>
        )}
        <Toaster position="bottom-right" richColors />
      </div>
    </div>
  );
}
