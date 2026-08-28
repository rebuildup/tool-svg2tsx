"use client";

import type { ConversionSettings } from "../types";

interface ConversionSettingsProps {
	settings: ConversionSettings;
	onSettingsChange: (settings: ConversionSettings) => void;
}

export function ConversionSettingsPanel({
	settings,
	onSettingsChange,
}: ConversionSettingsProps) {
	const updateSetting = <K extends keyof ConversionSettings>(
		key: K,
		value: ConversionSettings[K],
	) => {
		onSettingsChange({ ...settings, [key]: value });
	};

	return (
		<fieldset style={{ border: "1px solid #ccc", padding: "15px" }}>
			<legend>変換設定</legend>

			<div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
				<div>
					<h4
						style={{
							fontSize: "13px",
							fontWeight: "bold",
							marginBottom: "8px",
						}}
					>
						基本設定
					</h4>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "10px",
						}}
					>
						<div>
							<label
								htmlFor="svg2tsx-component-name"
								style={{
									display: "block",
									fontSize: "12px",
									marginBottom: "3px",
								}}
							>
								コンポーネント名
							</label>
							<input
								id="svg2tsx-component-name"
								type="text"
								value={settings.componentName}
								onChange={(e) => updateSetting("componentName", e.target.value)}
								style={{
									width: "100%",
									padding: "4px 8px",
									fontSize: "13px",
									boxSizing: "border-box",
								}}
								placeholder="MyIcon"
								aria-label="コンポーネント名"
							/>
						</div>
						<div>
							<label
								htmlFor="svg2tsx-props-type"
								style={{
									display: "block",
									fontSize: "12px",
									marginBottom: "3px",
								}}
							>
								Props型名
							</label>
							<input
								id="svg2tsx-props-type"
								type="text"
								value={settings.propsType}
								onChange={(e) => updateSetting("propsType", e.target.value)}
								style={{
									width: "100%",
									padding: "4px 8px",
									fontSize: "13px",
									boxSizing: "border-box",
								}}
								placeholder="IconProps"
								aria-label="Props型名"
							/>
						</div>
					</div>
					<div style={{ marginTop: "8px" }}>
						<label
							htmlFor="svg2tsx-include-comments"
							style={{
								display: "flex",
								alignItems: "center",
								gap: "5px",
								fontSize: "13px",
								cursor: "pointer",
							}}
						>
							<input
								id="svg2tsx-include-comments"
								type="checkbox"
								checked={settings.includeComments}
								onChange={(e) =>
									updateSetting("includeComments", e.target.checked)
								}
							/>
							コメントを追加
						</label>
					</div>
				</div>

				<div>
					<h4
						style={{
							fontSize: "13px",
							fontWeight: "bold",
							marginBottom: "8px",
						}}
					>
						最適化設定
					</h4>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "6px",
						}}
					>
						{[
							{
								key: "removeUnnecessaryAttributes" as const,
								label: "不要属性を削除",
								id: "svg2tsx-remove-unnecessary-attributes",
							},
							{
								key: "optimizePaths" as const,
								label: "パスを最適化",
								id: "svg2tsx-optimize-paths",
							},
							{
								key: "variableizeColors" as const,
								label: "色を変数化",
								id: "svg2tsx-variableize-colors",
							},
							{
								key: "variableizeSizes" as const,
								label: "サイズを変数化",
								id: "svg2tsx-variableize-sizes",
							},
						].map(({ key, label, id }) => (
							<label
								key={key}
								htmlFor={id}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "5px",
									fontSize: "13px",
									cursor: "pointer",
								}}
							>
								<input
									id={id}
									type="checkbox"
									checked={settings[key]}
									onChange={(e) => updateSetting(key, e.target.checked)}
								/>
								{label}
							</label>
						))}
					</div>
				</div>

				<div>
					<h4
						style={{
							fontSize: "13px",
							fontWeight: "bold",
							marginBottom: "8px",
						}}
					>
						出力設定
					</h4>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "10px",
						}}
					>
						<div>
							<label
								htmlFor="svg2tsx-indent-size"
								style={{
									display: "block",
									fontSize: "12px",
									marginBottom: "3px",
								}}
							>
								インデント
							</label>
							<select
								id="svg2tsx-indent-size"
								value={settings.indentSize}
								onChange={(e) =>
									updateSetting("indentSize", parseInt(e.target.value, 10))
								}
								style={{
									width: "100%",
									padding: "4px 8px",
									fontSize: "13px",
									boxSizing: "border-box",
								}}
							>
								<option value={2}>2スペース</option>
								<option value={4}>4スペース</option>
								<option value={8}>8スペース</option>
							</select>
						</div>
						<div>
							<label
								htmlFor="svg2tsx-line-breaks"
								style={{
									display: "block",
									fontSize: "12px",
									marginBottom: "3px",
								}}
							>
								改行設定
							</label>
							<select
								id="svg2tsx-line-breaks"
								value={settings.lineBreaks}
								onChange={(e) =>
									updateSetting("lineBreaks", e.target.value as "lf" | "crlf")
								}
								style={{
									width: "100%",
									padding: "4px 8px",
									fontSize: "13px",
									boxSizing: "border-box",
								}}
							>
								<option value="lf">LF (Unix)</option>
								<option value="crlf">CRLF (Windows)</option>
							</select>
						</div>
						<div>
							<label
								htmlFor="svg2tsx-export-type"
								style={{
									display: "block",
									fontSize: "12px",
									marginBottom: "3px",
								}}
							>
								エクスポート形式
							</label>
							<select
								id="svg2tsx-export-type"
								value={settings.exportType}
								onChange={(e) =>
									updateSetting(
										"exportType",
										e.target.value as "default" | "named",
									)
								}
								style={{
									width: "100%",
									padding: "4px 8px",
									fontSize: "13px",
									boxSizing: "border-box",
								}}
							>
								<option value="default">デフォルトエクスポート</option>
								<option value="named">名前付きエクスポート</option>
							</select>
						</div>
						<div>
							<label
								htmlFor="svg2tsx-file-extension"
								style={{
									display: "block",
									fontSize: "12px",
									marginBottom: "3px",
								}}
							>
								ファイル拡張子
							</label>
							<select
								id="svg2tsx-file-extension"
								value={settings.fileExtension}
								onChange={(e) =>
									updateSetting(
										"fileExtension",
										e.target.value as ConversionSettings["fileExtension"],
									)
								}
								style={{
									width: "100%",
									padding: "4px 8px",
									fontSize: "13px",
									boxSizing: "border-box",
								}}
							>
								<option value=".tsx">.tsx (TypeScript JSX)</option>
								<option value=".ts">.ts (TypeScript)</option>
								<option value=".jsx">.jsx (JavaScript JSX)</option>
								<option value=".js">.js (JavaScript)</option>
							</select>
						</div>
					</div>
				</div>
			</div>
		</fieldset>
	);
}
