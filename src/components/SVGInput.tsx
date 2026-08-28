"use client";

import { useCallback, useRef, useState } from "react";
import type { SVGInputData } from "../types";

interface SVGInputProps {
	onSVGChange: (data: SVGInputData) => void;
	currentInput: SVGInputData | null;
}

export function SVGInput({ onSVGChange, currentInput }: SVGInputProps) {
	const [activeTab, setActiveTab] = useState<"file" | "code" | "url">("file");
	const [dragOver, setDragOver] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [codeInput, setCodeInput] = useState(currentInput?.content || "");
	const [urlInput, setUrlInput] = useState("");

	const handleFileUpload = useCallback(
		(file: File) => {
			if (file.type !== "image/svg+xml" && !file.name.endsWith(".svg")) {
				alert("SVGファイルを選択してください");
				return;
			}

			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result as string;
				onSVGChange({
					type: "file",
					content,
					fileName: file.name,
				});
			};
			reader.readAsText(file);
		},
		[onSVGChange],
	);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setDragOver(false);

			const files = Array.from(e.dataTransfer.files);
			const svgFile = files.find(
				(file) => file.type === "image/svg+xml" || file.name.endsWith(".svg"),
			);

			if (svgFile) {
				handleFileUpload(svgFile);
			}
		},
		[handleFileUpload],
	);

	const handleCodeChange = useCallback(
		(value: string) => {
			setCodeInput(value);
			onSVGChange({
				type: "code",
				content: value,
			});
		},
		[onSVGChange],
	);

	const handleUrlLoad = useCallback(async () => {
		if (!urlInput) return;

		try {
			const response = await fetch(urlInput);
			if (!response.ok) throw new Error("Failed to fetch SVG");

			const content = await response.text();
			onSVGChange({
				type: "url",
				content,
				fileName: urlInput.split("/").pop() || "svg-from-url.svg",
			});
		} catch {
			alert("SVGの読み込みに失敗しました");
		}
	}, [urlInput, onSVGChange]);

	return (
		<fieldset style={{ border: "1px solid #ccc", padding: "15px" }}>
			<legend>SVG入力</legend>

			<div
				style={{
					display: "flex",
					gap: "0",
					borderBottom: "1px solid #ccc",
					marginBottom: "15px",
				}}
			>
				{[
					{ key: "file", label: "ファイル" },
					{ key: "code", label: "コード" },
					{ key: "url", label: "URL" },
				].map(({ key, label }) => (
					<button
						type="button"
						key={key}
						onClick={() => setActiveTab(key as typeof activeTab)}
						style={{
							padding: "8px 16px",
							border: "none",
							borderBottom:
								activeTab === key ? "2px solid #000" : "2px solid transparent",
							background: "none",
							cursor: "pointer",
							fontSize: "14px",
						}}
					>
						{label}
					</button>
				))}
			</div>

			{activeTab === "file" && (
				<div
					style={{
						border: dragOver ? "2px dashed #000" : "2px dashed #ccc",
						padding: "40px",
						textAlign: "center",
						background: dragOver ? "#f5f5f5" : "transparent",
					}}
					onDrop={handleDrop}
					onDragOver={(e) => {
						e.preventDefault();
						setDragOver(true);
					}}
					onDragLeave={() => setDragOver(false)}
				>
					<input
						ref={fileInputRef}
						type="file"
						accept=".svg,image/svg+xml"
						onChange={(e) => {
							const file = e.target.files?.[0];
							if (file) handleFileUpload(file);
						}}
						style={{ display: "none" }}
						aria-label="SVGファイルを選択"
					/>
					<p style={{ marginBottom: "10px" }}>SVGファイルをドラッグ&ドロップ</p>
					<p style={{ marginBottom: "10px", fontSize: "12px", color: "#666" }}>
						または
					</p>
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						style={{ padding: "4px 12px", fontSize: "13px" }}
					>
						ファイルを選択
					</button>
				</div>
			)}

			{activeTab === "code" && (
				<div>
					<label
						style={{ display: "block", marginBottom: "5px", fontSize: "13px" }}
					>
						SVGコード
					</label>
					<textarea
						value={codeInput}
						onChange={(e) => handleCodeChange(e.target.value)}
						placeholder="<svg>...</svg>"
						style={{
							width: "100%",
							height: "250px",
							padding: "8px",
							fontFamily: "monospace",
							fontSize: "13px",
							boxSizing: "border-box",
							resize: "vertical",
						}}
						aria-label="SVGコードを入力"
					/>
				</div>
			)}

			{activeTab === "url" && (
				<div>
					<label
						style={{ display: "block", marginBottom: "5px", fontSize: "13px" }}
					>
						SVG URL
					</label>
					<div style={{ display: "flex", gap: "8px" }}>
						<input
							type="url"
							value={urlInput}
							onChange={(e) => setUrlInput(e.target.value)}
							placeholder="https://example.com/image.svg"
							style={{
								flex: 1,
								padding: "4px 8px",
								fontSize: "13px",
							}}
							aria-label="SVG URLを入力"
						/>
						<button
							type="button"
							onClick={handleUrlLoad}
							disabled={!urlInput}
							style={{ padding: "4px 12px", fontSize: "13px" }}
						>
							読み込み
						</button>
					</div>
				</div>
			)}
		</fieldset>
	);
}
