"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getCookie } from "@/lib/getcookie";

// Define types for the session details
interface SessionDetails {
  payment_status: string;
  amount_total: number;
  currency: string;
  customer_details: {
    email: string;
  };
}

const ReturnPage: React.FC = () => {
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const token = getCookie("token");

  useEffect(() => {
    if (session_id) {
      const fetchSessionDetails = async () => {
        try {
          const response = await fetch(
            `http://localhost:50100/api/stripe/checkout-session?session_id=${session_id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.ok) {
            throw new Error("Failed to fetch session details");
          }
          const data: SessionDetails = await response.json();
          setSessionDetails(data);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      };

      fetchSessionDetails();
    }
  }, [session_id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Return Page</h1>
      {sessionDetails ? (
        <div>
          <h2>Payment Details</h2>
          <p>Status: {sessionDetails.payment_status}</p>
          <p>
            Amount: {sessionDetails.amount_total / 100}{" "}
            {sessionDetails.currency.toUpperCase()}
          </p>
          <p>Email: {sessionDetails.customer_details.email}</p>
        </div>
      ) : (
        <p>No session details available.</p>
      )}
    </div>
  );
};

export default ReturnPage;
