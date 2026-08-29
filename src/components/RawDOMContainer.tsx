"use client";

import type { ReactNode } from "react";

interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface RawDOMContainerProps {
	title: string;
	breadcrumbs?: BreadcrumbItem[];
	children: ReactNode;
}

/**
 * Minimal local layout wrapper used by the standalone svg2tsx tool.
 *
 * Originally this component was imported from the my-web-2025 monorepo's
 * shared UI package. To keep this tool standalone (no cross-repo coupling),
 * we inline a minimal version here. See
 * `docs/architecture/ADR-0002-embed-architecture.md` for the decision.
 *
 * Consumers embedding this tool in a Next.js host that already has its own
 * layout can wrap `<Svg2tsxApp />` at the host level instead.
 */
export function RawDOMContainer({
	title,
	breadcrumbs = [],
	children,
}: RawDOMContainerProps) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
			{breadcrumbs.length > 0 && (
				<nav aria-label="breadcrumb" style={{ fontSize: "13px" }}>
					{breadcrumbs.map((crumb, index) => (
						<span key={`${crumb.label}-${index}`}>
							{index > 0 && <span style={{ margin: "0 6px" }}>/</span>}
							{crumb.href ? (
								<a
									href={crumb.href}
									style={{ color: "#0066cc", textDecoration: "none" }}
								>
									{crumb.label}
								</a>
							) : (
								<span>{crumb.label}</span>
							)}
						</span>
					))}
				</nav>
			)}
			<h1 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>
				{title}
			</h1>
			{children}
		</div>
	);
}
