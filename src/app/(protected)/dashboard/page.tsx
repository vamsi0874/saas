'use client'

import { useUser } from "@clerk/nextjs";

const DashboardPage = () => {
    const {user} = useUser()
  return (
    <div>
      <h1>{user?.firstName}</h1>
    </div>
  );
};

export default DashboardPage;