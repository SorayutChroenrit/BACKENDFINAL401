import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BadgeCheck,
  ChevronsUpDown,
  Key,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCookie } from "@/lib/getcookie";
import { Input } from "../input";

interface UserData {
  name: string;
  email: string;
  password: string;
  avatar: string | null;
  company: string;
  phonenumber: string;
}

export function NavUser() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [EnterCodeDialogOpen, setEnterCodeDialogOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [enteredCode, setEnteredCode] = useState("");

  const router = useRouter();

  const token = getCookie("token");

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

  const handleValidateCode = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:50100/api/v1/validateCode",
        { enteredCode },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setValidationMessage(response.data.message);
      setIsError(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "An unexpected error occurred.";
        setValidationMessage(errorMessage);
        setIsError(true);

        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log("Invalid or expired token. Redirecting to home page.");
          router.push("/");
        }
      } else {
        console.error("Unexpected error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const avatarContent = user?.avatar ? (
    <AvatarImage src={user.avatar} alt={user.name} />
  ) : (
    <AvatarFallback className="rounded-lg">
      <User className="h-6 w-6" />
    </AvatarFallback>
  );

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:50100/api/v1/auth/logout",
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      router.push("/");
      toast.success("Logout successful!");
      setIsLogoutDialogOpen(false);
    } catch (error) {
      toast.error("Error logging out");
      console.error("Unexpected error:", error);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-row gap-2">
        <div>
          <Link href="/sign-up">
            <Button variant={"secondary"}>Sign up</Button>
          </Link>
        </div>
        <div className="">
          <Link href="/sign-in">
            <Button>Sign in</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="bottom-right" richColors />
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">{avatarContent}</Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side="bottom"
              align="start"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    {avatarContent}
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link href="/account">
                  <DropdownMenuItem>
                    <BadgeCheck className="mr-2" />
                    Account
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={() => setEnterCodeDialogOpen(true)}>
                  <Key className="mr-2" />
                  Enter Code
                </DropdownMenuItem>
                {/* <DropdownMenuItem>
                  <Settings className="mr-2" />
                  Settings
                </DropdownMenuItem> */}
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsLogoutDialogOpen(true)}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Enter Code Dialog */}
      <Dialog open={EnterCodeDialogOpen} onOpenChange={setEnterCodeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Code</DialogTitle>
            <DialogDescription>
              Enter the course code to validate your access.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Enter course code"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value)}
              type="number"
            />
            {validationMessage && (
              <p
                className={`text-sm ${
                  isError ? "text-red-500" : "text-green-500"
                }`}
              >
                {validationMessage}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleValidateCode}
              disabled={!enteredCode || isLoading}
            >
              {isLoading ? "Validating..." : "Validate Code"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setEnterCodeDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to log out?
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsLogoutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
