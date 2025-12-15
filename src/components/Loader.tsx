import { Loader2 } from "lucide-react";

export const Loader = () => {
  return (
    <div className="w-full h-screen bg-neutral-950 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-white animate-spin" />
    </div>
  );
};
