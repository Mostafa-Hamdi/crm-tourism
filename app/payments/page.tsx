"use client";

import { useGetPaymentsQuery } from "@/store/api/apiSlice";

const page = () => {
  const { data, isLoading, error } = useGetPaymentsQuery();
  console.log("Payments data:", data);
  return <div>page</div>;
};

export default page;
