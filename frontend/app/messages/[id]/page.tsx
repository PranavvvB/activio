"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AccountShell } from "../../../components/account-shell";
import { api, Message } from "../../../lib/api-service";
import { ApiError } from "../../../lib/api-client";
export default function Messages() {
  const { id } = useParams<{ id: string }>();
  const cid = Number(id);
  const [items, setItems] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .messages(cid)
      .then(setItems)
      .catch((e) =>
        setError(
          e instanceof ApiError ? e.message : "Messaging is unavailable.",
        ),
      );
  }, [cid]);
  const send = () => {
    if (!text.trim()) return;
    api
      .sendMessage(cid, text)
      .then((m) => {
        setItems([...items, m]);
        setText("");
      })
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : "Could not send message."),
      );
  };
  return (
    <AccountShell title="Messages">
      <div className="mt-8 max-w-2xl rounded-3xl bg-white p-6 shadow-sm">
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-xl bg-red-50 p-3 text-red-700"
          >
            {error}
          </p>
        )}
        <div className="min-h-64 space-y-3">
          {items.length ? (
            items.map((m) => (
              <p
                key={m.id}
                className="rounded-2xl bg-[#fff8f3] p-3 text-ink/80"
              >
                {m.content}
              </p>
            ))
          ) : (
            <p className="text-ink/50">No messages yet. Say hello!</p>
          )}
        </div>
        <div className="mt-5 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Write a message…"
            maxLength={5000}
          />
          <button
            onClick={send}
            className="rounded-2xl bg-coral-500 px-5 font-bold text-white"
          >
            Send
          </button>
        </div>
      </div>
    </AccountShell>
  );
}
