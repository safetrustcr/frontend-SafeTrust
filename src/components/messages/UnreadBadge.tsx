"use client";

export function UnreadBadge({ userId }: { userId?: string }) {
  const count: number = 3;

  if (!userId || count === 0) return null;

  return (
    <div className="absolute right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white dark:bg-blue-600">
      {count > 99 ? "99+" : count}
    </div>
  );
}
