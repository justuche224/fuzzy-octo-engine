import React from "react";
import PublicProfile from "./public-profile";

const page = async ({ params }: { params: Promise<{ profileID: string }> }) => {
  const { profileID } = await params;
  return <PublicProfile profileID={profileID} />;
};

export default page;
