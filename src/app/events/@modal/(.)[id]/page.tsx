import EventDetailContent from "../../[id]/EventDetailContent";
import EventDetailModal from "@/components/EventDetailModal";

export default async function EventDetailModalRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <EventDetailModal>
      <EventDetailContent id={id} isModal />
    </EventDetailModal>
  );
}
