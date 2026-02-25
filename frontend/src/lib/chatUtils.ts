import type {
  ChatMessage as ChatMessageType,
  MessageType,
  SearchResponse,
} from "@/lib/types";

let messageId = 0;

export function nextId(): string {
  return `msg-${++messageId}`;
}

/**
 * Creates a system (left-aligned) chat message.
 */
export function systemMsg(
  content: string,
  type: MessageType = "text",
  data?: SearchResponse
): ChatMessageType {
  return { id: nextId(), role: "system", type, content, data };
}

/**
 * Creates a user (right-aligned) chat message.
 */
export function userMsg(content: string): ChatMessageType {
  return { id: nextId(), role: "user", type: "text", content };
}
