import { Suspense } from "react";
import { PageLoader } from "@/components/ui/page-loader";

export default function Layout({ children }) {
  return (
    <div className="px-5">
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </div>
  );
}
