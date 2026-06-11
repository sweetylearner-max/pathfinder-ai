import { PageLoader } from "@/components/ui/page-loader";

export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <PageLoader />
    </div>
  );
}
