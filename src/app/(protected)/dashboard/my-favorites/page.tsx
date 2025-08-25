import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import Saved from "./saved";

const page = async () => {
  const user = await serverAuth();
  if (!user) {
    return redirect("/auth");
  }
  return <Saved />;
};

export default page;
