import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import React from "react";

describe("UI Components - Button", () => {
    it("renders button with text", () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole("button", { name: /click me/i })).toBeDefined();
    });

    it("applies default variant styles with bg-primary", () => {
        render(<Button>Default Button</Button>);
        const button = screen.getByRole("button", { name: /default button/i });
        expect(button).toHaveClass("bg-primary");
    });

    it("applies secondary variant styles", () => {
        render(<Button variant="secondary">Secondary Button</Button>);
        const button = screen.getByRole("button", { name: /secondary button/i });
        expect(button).toHaveClass("bg-secondary");
    });

    it("supports size variants by rendering different sizes", () => {
        const { rerender } = render(<Button size="sm">Small Button</Button>);
        let button = screen.getByRole("button", { name: /small button/i });
        expect(button).toHaveClass("h-9");

        rerender(<Button size="lg">Large Button</Button>);
        button = screen.getByRole("button", { name: /large button/i });
        expect(button).toHaveClass("h-11");
    });

    it("can be disabled", () => {
        render(<Button disabled>Disabled Button</Button>);
        const button = screen.getByRole("button", { name: /disabled button/i });
        expect(button).toBeDisabled();
    });

    it("supports custom className", () => {
        const { container } = render(
            <Button className="custom-class">Custom</Button>
        );
        const button = container.querySelector("button");
        expect(button).toHaveClass("custom-class");
    });
});
