"use client";

import DOMPurify from "dompurify";
import { useState } from "react";
import type { ConversionResult, SVGInputData } from "../types";

interface PreviewPanelProps {
	svgInput: SVGInputData | null;
	conversionResult: ConversionResult | null;
}

export function PreviewPanel({
	svgInput,
	conversionResult,
}: PreviewPanelProps) {
	const [activeTab, setActiveTab] = useState<"svg" | "tsx">("svg");

	return (
		<fieldset style={{ border: "1px solid #ccc", padding: "15px" }}>
			<legend>プレビュー</legend>

			<div
				style={{
					display: "flex",
					gap: "0",
					borderBottom: "1px solid #ccc",
					marginBottom: "15px",
				}}
			>
				{[
					{ key: "svg", label: "SVGプレビュー" },
					{ key: "tsx", label: "TSXコード" },
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

			{activeTab === "svg" && (
				<div>
					{svgInput?.content ? (
						<div
							style={{
								border: "1px solid #eee",
								padding: "15px",
								textAlign: "center",
							}}
						>
							<div
								dangerouslySetInnerHTML={{
									__html: DOMPurify.sanitize(svgInput.content, {
										USE_PROFILES: { svg: true, svgFilters: true },
									}),
								}}
								style={{ maxWidth: "100%", maxHeight: "400px" }}
							/>
						</div>
					) : (
						<div
							style={{ padding: "40px", textAlign: "center", color: "#999" }}
						>
							SVGを入力してください
						</div>
					)}
				</div>
			)}

			{activeTab === "tsx" && (
				<div>
					{conversionResult ? (
						<div>
							{conversionResult.success ? (
								<pre
									style={{
										border: "1px solid #eee",
										padding: "15px",
										fontFamily: "monospace",
										fontSize: "12px",
										overflowX: "auto",
										whiteSpace: "pre-wrap",
										margin: 0,
									}}
								>
									<code>{conversionResult.tsxCode}</code>
								</pre>
							) : (
								<div
									style={{
										border: "1px solid #cc0000",
										padding: "15px",
										color: "#cc0000",
									}}
								>
									<h4 style={{ margin: "0 0 5px 0", fontSize: "14px" }}>
										変換エラー
									</h4>
									<p style={{ margin: 0, fontSize: "13px" }}>
										{conversionResult.error}
									</p>
								</div>
							)}
						</div>
					) : (
						<div
							style={{ padding: "40px", textAlign: "center", color: "#999" }}
						>
							SVGを入力すると変換結果が表示されます
						</div>
					)}
				</div>
			)}
		</fieldset>
	);
}
