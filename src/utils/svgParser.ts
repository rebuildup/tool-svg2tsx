import type { SVGElement } from "../types";

export function parseSVG(svgContent: string): SVGElement | null {
	try {
		const parser = new DOMParser();
		const doc = parser.parseFromString(svgContent, "image/svg+xml");

		// Check for parsing errors
		const parserError = doc.querySelector("parsererror");
		if (parserError) {
			throw new Error("Invalid SVG format");
		}

		const svgElement = doc.querySelector("svg");
		if (!svgElement) {
			throw new Error("No SVG element found");
		}

		return parseElement(svgElement);
	} catch (error) {
		console.error("SVG parsing error:", error);
		return null;
	}
}

function parseElement(element: Element): SVGElement {
	const attributes: Record<string, string> = {};

	// Convert attributes to object
	for (let i = 0; i < element.attributes.length; i++) {
		const attr = element.attributes[i];
		attributes[attr.name] = attr.value;
	}

	// Parse children
	const children: SVGElement[] = [];
	for (let i = 0; i < element.children.length; i++) {
		children.push(parseElement(element.children[i]));
	}

	return {
		tagName: element.tagName.toLowerCase(),
		attributes,
		children,
		textContent: element.textContent || undefined,
	};
}

export function validateSVG(svgContent: string): {
	isValid: boolean;
	error?: string;
} {
	try {
		const parser = new DOMParser();
		const doc = parser.parseFromString(svgContent, "image/svg+xml");

		const parserError = doc.querySelector("parsererror");
		if (parserError) {
			return { isValid: false, error: "Invalid XML format" };
		}

		const svgElement = doc.querySelector("svg");
		if (!svgElement) {
			return { isValid: false, error: "No SVG element found" };
		}

		return { isValid: true };
	} catch {
		return { isValid: false, error: "Failed to parse SVG" };
	}
}
