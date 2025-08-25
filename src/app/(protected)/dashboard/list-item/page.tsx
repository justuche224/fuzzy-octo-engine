import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import ListItemPage from "./list-item-page";

const page = async () => {
  const user = await serverAuth();
  if (!user) {
    return redirect("/auth");
  }
  return <ListItemPage userId={user.id} />;
};

export default page;
