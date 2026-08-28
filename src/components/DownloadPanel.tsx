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
	const [copySuccess, setCopySuccess] = useState(false);

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

	const handleCopy = async () => {
		if (!conversionResult?.success || !conversionResult.tsxCode) return;

		try {
			await navigator.clipboard.writeText(conversionResult.tsxCode);
			setCopySuccess(true);
			setTimeout(() => setCopySuccess(false), 2000);
		} catch (error) {
			console.error("Failed to copy to clipboard:", error);
		}
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
						{copySuccess ? "コピー完了" : "クリップボードにコピー"}
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
