import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Svg2tsxApp from "./Svg2tsxApp";

const container = document.getElementById("root");

if (!container) {
	throw new Error("SVG to TSX Converter: missing #root element");
}

createRoot(container).render(
	<StrictMode>
		<Svg2tsxApp />
	</StrictMode>,
);
