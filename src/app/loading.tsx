import SpinnerIcon from "@/components/SpinnerIcon";

export default function Loading() {
  return (
    <div className="flex items-center justify-center py-24">
      <SpinnerIcon size={28} className="text-emerald-600" />
    </div>
  );
}
