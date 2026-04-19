import { getToken } from "@/lib/auth";
import type { BoardData } from "@/lib/kanban";

export type BoardInfo = { id: number; name: string; created_at: string };

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function getBoards(): Promise<BoardInfo[]> {
  const res = await fetch("/api/boards", { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch boards");
  return res.json();
}

export async function createBoard(name: string): Promise<BoardInfo> {
  const res = await fetch("/api/boards", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to create board");
  return res.json();
}

export async function deleteBoard(boardId: number): Promise<void> {
  const res = await fetch(`/api/boards/${boardId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete board");
}

export async function getBoard(boardId: number): Promise<BoardData> {
  const res = await fetch(`/api/boards/${boardId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch board");
  return res.json();
}

export async function saveBoard(boardId: number, board: BoardData): Promise<BoardData> {
  const res = await fetch(`/api/boards/${boardId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(board),
  });
  if (!res.ok) throw new Error("Failed to save board");
  return res.json();
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type AIResponsePayload = {
  message: string;
  board_update: BoardData | null;
};

export async function sendChat(
  message: string,
  history: ChatMessage[],
  boardId: number
): Promise<AIResponsePayload> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ message, history, board_id: boardId }),
  });
  if (!res.ok) throw new Error("Chat request failed");
  return res.json();
}
