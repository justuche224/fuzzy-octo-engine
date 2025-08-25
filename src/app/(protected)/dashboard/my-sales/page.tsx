import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import SalesPage from "./sales-page";

const page = async () => {
  const user = await serverAuth();
  if (!user) {
    return redirect("/auth");
  }
  return <SalesPage userId={user.id} />;
};

export default page;
