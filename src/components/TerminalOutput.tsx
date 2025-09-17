import React, { useEffect, useRef } from "react";

interface Props {
  log: string;
  height?: number;
  className?: string;
}

const TerminalOutput: React.FC<Props> = ({ log, height = 240, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 新しいログが来たら下端まで自動スクロール
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // 次のフレームでスクロール（DOM 反映後）
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [log]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        background: "#0b0f16", // ダーク背景
        color: "#e5e7eb", // 明るい文字
        border: "1px solid #1f2937",
        borderRadius: 8,
        padding: 12,
        height,
        overflowY: "auto",
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      <pre
        style={{
          margin: 0,
          whiteSpace: "pre-wrap", // 改行と余白を保持しつつ折り返し
          wordBreak: "break-word", // 長い行もはみ出さず折返し
        }}
      >
        <code>{log || ""}</code>
      </pre>
    </div>
  );
};

export default TerminalOutput;
