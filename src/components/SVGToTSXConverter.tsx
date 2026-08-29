"use client";

import { useEffect, useMemo, useState } from "react";
import { RawDOMContainer } from "../../../../src/components/tools-ui/RawDOMContainer";
import type {
	ConversionResult,
	ConversionSettings,
	SVGInputData,
} from "../types";
import { parseSVG, validateSVG } from "../utils/svgParser";
import { convertSVGToTSX } from "../utils/tsxConverter";
import { ConversionSettingsPanel } from "./ConversionSettings";
import { DownloadPanel } from "./DownloadPanel";
import { PreviewPanel } from "./PreviewPanel";
import { SVGInput } from "./SVGInput";

const defaultSettings: ConversionSettings = {
	componentName: "MyIcon",
	propsType: "IconProps",
	defaultValues: {},
	includeComments: true,
	removeUnnecessaryAttributes: true,
	optimizePaths: false,
	variableizeColors: false,
	variableizeSizes: true,
	indentSize: 2,
	lineBreaks: "lf",
	exportType: "default",
	fileExtension: ".tsx",
};

function deriveComponentName(fileName: string | undefined): string {
	if (!fileName) return "MyIcon";
	const baseName = fileName.replace(/\.svg$/i, "");
	return (
		baseName
			.replace(/[^a-zA-Z0-9]/g, "")
			.replace(/^[0-9]/, "Icon$&")
			.replace(/^./, (c) => c.toUpperCase()) || "MyIcon"
	);
}

export function SVGToTSXConverter() {
	const [svgInput, setSvgInput] = useState<SVGInputData | null>(null);
	const [settings, setSettings] = useState<ConversionSettings>(defaultSettings);

	// Sync the component name with the uploaded filename only when the
	// filename itself changes (not whenever settings.componentName changes),
	// so the effect does not loop with downstream conversion logic.
	useEffect(() => {
		if (svgInput?.fileName && svgInput.type === "file") {
			const componentName = deriveComponentName(svgInput.fileName);
			setSettings((prev) =>
				prev.componentName === componentName
					? prev
					: { ...prev, componentName },
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally fire only on filename changes
	}, [svgInput?.fileName, svgInput?.type]);

	const conversionResult = useMemo<ConversionResult | null>(() => {
		if (!svgInput?.content) return null;

		const validation = validateSVG(svgInput.content);
		if (!validation.isValid) {
			return {
				success: false,
				tsxCode: "",
				error: validation.error || "Invalid SVG",
			};
		}

		const svgElement = parseSVG(svgInput.content);
		if (!svgElement) {
			return {
				success: false,
				tsxCode: "",
				error: "Failed to parse SVG",
			};
		}

		return convertSVGToTSX(svgElement, settings);
	}, [svgInput?.content, settings]);

	return (
		<RawDOMContainer
			title="SVG to TSX Converter"
			breadcrumbs={[
				{ label: "Home", href: "/" },
				{ label: "Tools", href: "/tools" },
				{ label: "SVG to TSX Converter" },
			]}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
				<SVGInput onSVGChange={setSvgInput} currentInput={svgInput} />

				<div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
					<div style={{ flex: "1 1 300px" }}>
						<ConversionSettingsPanel
							settings={settings}
							onSettingsChange={setSettings}
						/>
					</div>
					<div style={{ flex: "1 1 300px" }}>
						<PreviewPanel
							svgInput={svgInput}
							conversionResult={conversionResult}
						/>
					</div>
				</div>

				<DownloadPanel
					conversionResult={conversionResult}
					settings={settings}
				/>
			</div>
		</RawDOMContainer>
	);
}
