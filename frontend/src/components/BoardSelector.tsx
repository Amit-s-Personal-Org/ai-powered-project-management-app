"use client";

import { useEffect, useRef, useState } from "react";
import type { BoardInfo } from "@/lib/api";
import { createBoard, deleteBoard } from "@/lib/api";

type BoardSelectorProps = {
  boards: BoardInfo[];
  activeBoardId: number;
  onSwitch: (board: BoardInfo) => void;
  onBoardsChange: (boards: BoardInfo[]) => void;
};

export const BoardSelector = ({
  boards,
  activeBoardId,
  onSwitch,
  onBoardsChange,
}: BoardSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
        setNewName("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeBoard = boards.find((b) => b.id === activeBoardId);

  const handleCreate = async () => {
    const name = newName.trim() || "New Board";
    setLoading(true);
    try {
      const board = await createBoard(name);
      const updated = [...boards, board];
      onBoardsChange(updated);
      onSwitch(board);
      setCreating(false);
      setNewName("");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, board: BoardInfo) => {
    e.stopPropagation();
    if (boards.length === 1) return;
    if (!confirm(`Delete "${board.name}"? This cannot be undone.`)) return;
    await deleteBoard(board.id);
    const updated = boards.filter((b) => b.id !== board.id);
    onBoardsChange(updated);
    if (board.id === activeBoardId) {
      onSwitch(updated[0]);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-2xl border border-[var(--stroke)] bg-[var(--surface)] px-5 py-4 text-left transition hover:border-[var(--primary-blue)]"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--gray-text)]">
            Active Board
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--navy-dark)]">
            {activeBoard?.name ?? "—"}
          </p>
        </div>
        <span className="ml-2 text-[var(--gray-text)]">▾</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-[var(--stroke)] bg-white shadow-[var(--shadow)]">
          <div className="max-h-60 overflow-y-auto py-2">
            {boards.map((board) => (
              <div
                key={board.id}
                className={`flex items-center justify-between px-4 py-2 text-sm font-medium transition cursor-pointer ${
                  board.id === activeBoardId
                    ? "bg-[var(--surface)] text-[var(--primary-blue)]"
                    : "text-[var(--navy-dark)] hover:bg-[var(--surface)]"
                }`}
                onClick={() => { onSwitch(board); setOpen(false); }}
              >
                <span className="truncate">{board.name}</span>
                {boards.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, board)}
                    aria-label={`Delete ${board.name}`}
                    className="ml-2 shrink-0 rounded-full p-1 text-[var(--gray-text)] hover:bg-red-50 hover:text-red-500"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--stroke)] p-3">
            {creating ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="Board name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") { setCreating(false); setNewName(""); }}}
                  className="flex-1 rounded-xl border border-[var(--stroke)] px-3 py-1.5 text-sm text-[var(--navy-dark)] outline-none focus:border-[var(--primary-blue)]"
                />
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={loading}
                  className="rounded-xl bg-[var(--primary-blue)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {loading ? "…" : "Add"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="w-full rounded-xl border border-dashed border-[var(--stroke)] py-2 text-xs font-semibold uppercase tracking-wide text-[var(--gray-text)] transition hover:border-[var(--primary-blue)] hover:text-[var(--primary-blue)]"
              >
                + New Board
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
