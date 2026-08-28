export interface ConversionSettings {
	componentName: string;
	propsType: string;
	defaultValues: Record<string, string>;
	includeComments: boolean;
	removeUnnecessaryAttributes: boolean;
	optimizePaths: boolean;
	variableizeColors: boolean;
	variableizeSizes: boolean;
	indentSize: number;
	lineBreaks: "lf" | "crlf";
	exportType: "default" | "named";
	fileExtension: ".tsx" | ".ts" | ".jsx" | ".js";
}

export interface SVGInputData {
	type: "file" | "code" | "url";
	content: string;
	fileName?: string;
}

export interface ConversionResult {
	success: boolean;
	tsxCode: string;
	error?: string;
	warnings?: string[];
}

export interface SVGElement {
	tagName: string;
	attributes: Record<string, string>;
	children: SVGElement[];
	textContent?: string;
}
