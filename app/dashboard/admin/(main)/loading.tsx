import { Spinner } from "@/components/ui/spinner";

const Loading = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Spinner className="size-20" />
    </div>
  );
};

export default Loading;
