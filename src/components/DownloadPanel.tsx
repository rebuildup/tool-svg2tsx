"use client";

import { useState } from "react";
import type { ConversionResult, ConversionSettings } from "../types";

interface DownloadPanelProps {
	conversionResult: ConversionResult | null;
	settings: ConversionSettings;
}

export function DownloadPanel({
	conversionResult,
	settings,
}: DownloadPanelProps) {
	const [fileName, setFileName] = useState(
		settings.componentName || "Component",
	);
	const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
		"idle",
	);

	const handleDownload = () => {
		if (!conversionResult?.success || !conversionResult.tsxCode) return;

		const blob = new Blob([conversionResult.tsxCode], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${fileName}${settings.fileExtension}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	// A sandboxed iframe without `allow-same-origin` has an opaque origin,
	// where the async Clipboard API is unavailable or denied by permissions
	// policy. `document.execCommand("copy")` still works there, so it is used
	// as a fallback that keeps the feature usable.
	const copyWithExecCommand = (text: string): boolean => {
		const textarea = document.createElement("textarea");
		textarea.value = text;
		textarea.setAttribute("readonly", "");
		textarea.style.position = "fixed";
		textarea.style.opacity = "0";
		document.body.appendChild(textarea);
		textarea.select();
		let copied = false;
		try {
			copied = document.execCommand("copy");
		} catch {
			copied = false;
		}
		textarea.remove();
		return copied;
	};

	const handleCopy = async () => {
		if (!conversionResult?.success || !conversionResult.tsxCode) return;

		const text = conversionResult.tsxCode;
		let copied = false;

		try {
			await navigator.clipboard.writeText(text);
			copied = true;
		} catch (error) {
			// Expected inside an opaque-origin iframe; fall back below.
			console.error("Failed to copy to clipboard:", error);
		}

		if (!copied) {
			copied = copyWithExecCommand(text);
		}

		setCopyStatus(copied ? "copied" : "failed");
		setTimeout(() => setCopyStatus("idle"), 2000);
	};

	const isDisabled = !conversionResult?.success || !conversionResult.tsxCode;

	return (
		<fieldset style={{ border: "1px solid #ccc", padding: "15px" }}>
			<legend>ダウンロード</legend>

			<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
				<div>
					<label
						style={{ display: "block", fontSize: "12px", marginBottom: "3px" }}
					>
						ファイル名
					</label>
					<div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
						<input
							type="text"
							value={fileName}
							onChange={(e) => setFileName(e.target.value)}
							style={{
								flex: 1,
								padding: "4px 8px",
								fontSize: "13px",
							}}
							placeholder="Component"
						/>
						<span style={{ fontSize: "13px", color: "#666" }}>
							{settings.fileExtension}
						</span>
					</div>
				</div>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "8px",
					}}
				>
					<button
						type="button"
						onClick={handleDownload}
						disabled={isDisabled}
						style={{ padding: "4px 12px", fontSize: "13px" }}
					>
						ファイルをダウンロード
					</button>
					<button
						type="button"
						onClick={handleCopy}
						disabled={isDisabled}
						style={{ padding: "4px 12px", fontSize: "13px" }}
					>
						{copyStatus === "copied"
							? "コピー完了"
							: copyStatus === "failed"
								? "コピー失敗"
								: "クリップボードにコピー"}
					</button>
				</div>

				{conversionResult && (
					<div style={{ fontSize: "13px" }}>
						{conversionResult.success ? (
							<span style={{ color: "#006600" }}>
								変換完了 ({conversionResult.tsxCode.split("\n").length} 行)
							</span>
						) : (
							<span style={{ color: "#cc0000" }}>
								変換エラー: {conversionResult.error}
							</span>
						)}
					</div>
				)}

				<div style={{ fontSize: "11px", color: "#666" }}>
					<p>
						<strong>使用方法:</strong>
					</p>
					<p>1. 生成されたコンポーネントをプロジェクトにコピー</p>
					<p>2. 必要に応じてpropsを渡して使用</p>
				</div>
			</div>
		</fieldset>
	);
}
