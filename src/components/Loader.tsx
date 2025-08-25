import { Loader2 } from "lucide-react";
import { ClipLoader } from "react-spinners";

export const Loader = () => {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-black via-[#111111] to-gray-900 flex items-center justify-center py-20">
      <ClipLoader size={40} color="#60A5FA" />
    </div>
  );
};
