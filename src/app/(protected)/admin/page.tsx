import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import AdminDashboard from "./admin-dashboard";

const AdminPage = async () => {
  const user = await serverAuth();
  if (!user) {
    return redirect("/auth?redirect=/admin");
  }
  if (user.role !== "ADMIN") {
    return redirect("/dashboard");
  }

  return <AdminDashboard />;
};

export default AdminPage;
