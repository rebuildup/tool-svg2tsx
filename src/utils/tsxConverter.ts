import type {
	ConversionResult,
	ConversionSettings,
	SVGElement,
} from "../types";

export function convertSVGToTSX(
	svgElement: SVGElement,
	settings: ConversionSettings,
): ConversionResult {
	try {
		const { componentName, propsType, includeComments, fileExtension } =
			settings;

		// Generate component code
		const imports = generateImports(fileExtension);
		const propsInterface = generatePropsInterface(
			propsType,
			svgElement,
			settings,
		);
		const componentCode = generateComponent(
			componentName,
			svgElement,
			settings,
		);
		const exportStatement = generateExport(componentName, settings.exportType);

		const tsxCode = [
			imports,
			includeComments ? "// Generated SVG component" : "",
			propsInterface,
			componentCode,
			exportStatement,
		]
			.filter(Boolean)
			.join("\n\n");

		return {
			success: true,
			tsxCode: formatCode(tsxCode, settings),
		};
	} catch (error) {
		return {
			success: false,
			tsxCode: "",
			error: error instanceof Error ? error.message : "Conversion failed",
		};
	}
}

function generateImports(fileExtension: string): string {
	if (fileExtension === ".tsx" || fileExtension === ".ts") {
		return "import React from 'react';";
	}
	return "import React from 'react';";
}

function generatePropsInterface(
	propsType: string,
	svgElement: SVGElement,
	settings: ConversionSettings,
): string {
	if (
		!propsType ||
		settings.fileExtension === ".jsx" ||
		settings.fileExtension === ".js"
	) {
		return "";
	}

	const props: string[] = [];

	// Add common SVG props
	props.push("className?: string");
	props.push("style?: React.CSSProperties");

	// Add size props if variableizeSizes is enabled
	if (settings.variableizeSizes) {
		props.push("width?: string | number");
		props.push("height?: string | number");
	}

	// Add color props if variableizeColors is enabled
	if (settings.variableizeColors) {
		const colors = extractColors(svgElement);
		colors.forEach((_color, index) => {
			props.push(`color${index + 1}?: string`);
		});
	}

	return `interface ${propsType} {
  ${props.join(";\n  ")};
}`;
}

function generateComponent(
	componentName: string,
	svgElement: SVGElement,
	settings: ConversionSettings,
): string {
	const propsParam =
		settings.propsType &&
		(settings.fileExtension === ".tsx" || settings.fileExtension === ".ts")
			? `props: ${settings.propsType}`
			: "props";

	const svgJSX = convertElementToJSX(svgElement, settings, 1);

	return `function ${componentName}(${propsParam}) {
  return (
    ${svgJSX}
  );
}`;
}

function convertElementToJSX(
	element: SVGElement,
	settings: ConversionSettings,
	depth: number,
): string {
	const indent = "  ".repeat(depth);
	const { attributes } = element;

	// Convert attributes to JSX format
	const jsxAttributes = convertAttributes(attributes, settings);
	const attributeString =
		jsxAttributes.length > 0 ? ` ${jsxAttributes.join(" ")}` : "";

	// Handle self-closing elements
	if (element.children.length === 0 && !element.textContent) {
		return `${indent}<${element.tagName}${attributeString} />`;
	}

	// Handle elements with children or text content
	const openTag = `${indent}<${element.tagName}${attributeString}>`;
	const closeTag = `${indent}</${element.tagName}>`;

	if (element.textContent && element.children.length === 0) {
		return `${openTag}${element.textContent}${closeTag}`;
	}

	const childrenJSX = element.children
		.map((child) => convertElementToJSX(child, settings, depth + 1))
		.join("\n");

	return `${openTag}\n${childrenJSX}\n${closeTag}`;
}

function convertAttributes(
	attributes: Record<string, string>,
	settings: ConversionSettings,
): string[] {
	const jsxAttributes: string[] = [];

	Object.entries(attributes).forEach(([key, value]) => {
		// Skip unnecessary attributes if optimization is enabled
		if (settings.removeUnnecessaryAttributes && isUnnecessaryAttribute(key)) {
			return;
		}

		// Convert attribute names to JSX format
		const jsxKey = convertAttributeName(key);

		// Handle special cases
		if (jsxKey === "className") {
			jsxAttributes.push(`className={props.className}`);
		} else if (jsxKey === "style") {
			jsxAttributes.push(`style={props.style}`);
		} else if (
			settings.variableizeSizes &&
			(jsxKey === "width" || jsxKey === "height")
		) {
			jsxAttributes.push(`${jsxKey}={props.${jsxKey} || "${value}"}`);
		} else if (settings.variableizeColors && isColorAttribute(key)) {
			jsxAttributes.push(`${jsxKey}={props.color1 || "${value}"}`);
		} else {
			jsxAttributes.push(`${jsxKey}="${value}"`);
		}
	});

	// Add default props
	if (!attributes.className) {
		jsxAttributes.push("className={props.className}");
	}
	if (!attributes.style) {
		jsxAttributes.push("style={props.style}");
	}

	return jsxAttributes;
}

function convertAttributeName(name: string): string {
	// Convert kebab-case to camelCase
	const camelCase = name.replace(/-([a-z])/g, (_, letter) =>
		letter.toUpperCase(),
	);

	// Handle special cases
	const specialCases: Record<string, string> = {
		class: "className",
		for: "htmlFor",
		tabindex: "tabIndex",
		readonly: "readOnly",
		maxlength: "maxLength",
		cellpadding: "cellPadding",
		cellspacing: "cellSpacing",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
	};

	return specialCases[camelCase] || camelCase;
}

function isUnnecessaryAttribute(name: string): boolean {
	const unnecessary = ["xmlns", "xmlns:xlink", "version"];
	return unnecessary.includes(name);
}

function isColorAttribute(name: string): boolean {
	const colorAttributes = [
		"fill",
		"stroke",
		"stop-color",
		"flood-color",
		"lighting-color",
	];
	return colorAttributes.includes(name);
}

function extractColors(element: SVGElement): string[] {
	const colors: Set<string> = new Set();

	function extractFromElement(el: SVGElement) {
		Object.entries(el.attributes).forEach(([key, value]) => {
			if (
				isColorAttribute(key) &&
				value !== "none" &&
				value !== "transparent"
			) {
				colors.add(value);
			}
		});

		el.children.forEach(extractFromElement);
	}

	extractFromElement(element);
	return Array.from(colors);
}

function generateExport(
	componentName: string,
	exportType: "default" | "named",
): string {
	if (exportType === "default") {
		return `export default ${componentName};`;
	}
	return `export { ${componentName} };`;
}

function formatCode(code: string, settings: ConversionSettings): string {
	const { indentSize, lineBreaks } = settings;

	// Replace indentation
	if (indentSize !== 2) {
		const currentIndent = "  ";
		const newIndent = " ".repeat(indentSize);
		code = code.replace(new RegExp(currentIndent, "g"), newIndent);
	}

	// Replace line breaks
	if (lineBreaks === "crlf") {
		code = code.replace(/\n/g, "\r\n");
	}

	return code;
}
