import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import Checkout from "./checkout";

const page = async () => {
  const user = await serverAuth();
  if (!user) {
    return redirect("/auth?redirect=/checkout");
  }
  return <Checkout />;
};

export default page;
