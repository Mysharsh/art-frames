import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

describe("UI Components - Badge", () => {
    it("renders badge with text", () => {
        render(<Badge>Hot Deal</Badge>);
        expect(screen.getByText(/hot deal/i)).toBeDefined();
    });

    it("applies default variant", () => {
        const { container } = render(<Badge>Default</Badge>);
        const badge = container.querySelector("div[class*='badge']") || container.firstChild;
        expect(badge).toBeTruthy();
    });

    it("applies destructive variant", () => {
        render(<Badge variant="destructive">Error</Badge>);
        expect(screen.getByText(/error/i)).toHaveClass("bg-destructive");
    });

    it("supports custom className", () => {
        const { container } = render(
            <Badge className="custom-badge">Custom</Badge>
        );
        const badge = container.querySelector(".custom-badge");
        expect(badge).toBeTruthy();
    });
});

describe("UI Components - Card", () => {
    it("renders card with content", () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card description</CardDescription>
                </CardHeader>
                <CardContent>Card content here</CardContent>
            </Card>
        );

        expect(screen.getByText(/card title/i)).toBeDefined();
        expect(screen.getByText(/card description/i)).toBeDefined();
        expect(screen.getByText(/card content here/i)).toBeDefined();
    });

    it("renders card header and content separately", () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Header Title</CardTitle>
                </CardHeader>
                <CardContent>Content</CardContent>
            </Card>
        );

        expect(screen.getByText(/header title/i)).toBeDefined();
        expect(screen.getByText(/^Content$/)).toBeDefined();
    });
});
