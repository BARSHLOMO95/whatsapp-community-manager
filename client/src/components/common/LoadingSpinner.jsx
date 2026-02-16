import { Loader2 } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="animate-spin text-green-600" size={32} />
    </div>
  );
}
