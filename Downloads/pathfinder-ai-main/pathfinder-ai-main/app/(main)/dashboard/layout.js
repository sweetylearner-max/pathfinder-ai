import { Suspense } from "react";
import { PageLoader } from "@/components/ui/page-loader";

export default function Layout({ children }) {
  return (
    <div className="px-5">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="gradient-title text-6xl font-bold">Industry Insights</h1>
      </div>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </div>
  );
}
