import { ConversationView } from "@/features/messages";

export default async function GuestConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  return <ConversationView conversationId={conversationId} />;
}
