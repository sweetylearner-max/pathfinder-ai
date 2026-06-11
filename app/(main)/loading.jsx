import { PageLoader } from "@/components/ui/page-loader";

export default function MainLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <PageLoader />
    </div>
  );
}
