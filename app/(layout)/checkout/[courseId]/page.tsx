"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/checkout/CheckOut-Forms";

const stripePromise = loadStripe("your_stripe_publishable_key");

const CheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    fetch("http://localhost:50100/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        console.log("Response status:", res.status);
        return res.json();
      })
      .then((data) => {
        if (data.clientSecret) {
          console.log("Client Secret:", data.clientSecret);
          setClientSecret(data.clientSecret);
        } else {
          console.error(
            "Failed to retrieve client secret. Response data:",
            data
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching client secret:", error);
      });
  }, []);

  return (
    <div>
      <h1>Checkout Page</h1>
      {clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm />
        </Elements>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default CheckoutPage;
