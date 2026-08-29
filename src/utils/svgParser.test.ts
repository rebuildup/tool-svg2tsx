import { describe, expect, it } from "vitest";
import { parseSVG, validateSVG } from "./svgParser";

const VALID_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10"/></svg>';

describe("parseSVG", () => {
	it("parses a simple SVG element with attributes", () => {
		const result = parseSVG(VALID_SVG);

		expect(result).not.toBeNull();
		expect(result?.tagName).toBe("svg");
		expect(result?.attributes.width).toBe("24");
		expect(result?.attributes.height).toBe("24");
		expect(result?.children).toHaveLength(1);
		expect(result?.children[0]?.tagName).toBe("circle");
	});

	it("parses nested elements recursively", () => {
		const svg =
			'<svg><g transform="translate(10,10)"><rect x="0" y="0" width="20" height="20" fill="red"/></g></svg>';
		const result = parseSVG(svg);

		expect(result).not.toBeNull();
		const group = result?.children[0];
		expect(group?.tagName).toBe("g");
		expect(group?.attributes.transform).toBe("translate(10,10)");
		expect(group?.children).toHaveLength(1);
		const rect = group?.children[0];
		expect(rect?.tagName).toBe("rect");
		expect(rect?.attributes.fill).toBe("red");
	});

	it("preserves text content on leaf elements", () => {
		const svg = '<svg><text x="0" y="0">hello</text></svg>';
		const result = parseSVG(svg);

		expect(result?.children[0]?.textContent).toBe("hello");
	});

	it("lowercases tag names for nested elements", () => {
		const svg = '<svg><G><CIRCLE cx="12" cy="12" r="10"/></G></svg>';
		const result = parseSVG(svg);

		expect(result?.tagName).toBe("svg");
		expect(result?.children[0]?.tagName).toBe("g");
		expect(result?.children[0]?.children[0]?.tagName).toBe("circle");
	});

	it("returns null for invalid XML", () => {
		const result = parseSVG("<svg>not closed");
		expect(result).toBeNull();
	});

	it("returns null when no <svg> root is present", () => {
		const result = parseSVG("<html><body>no svg</body></html>");
		expect(result).toBeNull();
	});
});

describe("validateSVG", () => {
	it("accepts a well-formed SVG", () => {
		const result = validateSVG(VALID_SVG);
		expect(result.isValid).toBe(true);
		expect(result.error).toBeUndefined();
	});

	it("rejects invalid XML with an error message", () => {
		const result = validateSVG("<svg>not closed");
		expect(result.isValid).toBe(false);
		expect(result.error).toBeDefined();
	});

	it("rejects content with no <svg> element", () => {
		const result = validateSVG("<html></html>");
		expect(result.isValid).toBe(false);
		expect(result.error).toBe("No SVG element found");
	});
});
