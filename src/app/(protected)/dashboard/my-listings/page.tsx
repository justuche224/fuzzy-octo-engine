import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import SellPage from "./listing-page";

const page = async () => {
  const user = await serverAuth();
  if (!user) {
    return redirect("/auth");
  }
  return <SellPage userId={user.id} />;
};

export default page;
