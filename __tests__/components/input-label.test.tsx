import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

describe("UI Components - Input", () => {
    it("renders input field", () => {
        render(<Input placeholder="Enter text" />);
        const input = screen.getByPlaceholderText(/enter text/i) as HTMLInputElement;
        expect(input).toBeDefined();
    });

    it("can accept text input", async () => {
        const user = userEvent.setup();
        render(<Input />);
        const input = screen.getByRole("textbox") as HTMLInputElement;

        await user.type(input, "hello");
        expect(input.value).toBe("hello");
    });

    it("supports disabled state", () => {
        render(<Input disabled />);
        const input = screen.getByRole("textbox") as HTMLInputElement;
        expect(input).toBeDisabled();
    });

    it("supports type attribute", () => {
        render(<Input type="email" />);
        const input = screen.getByRole("textbox") as HTMLInputElement;
        expect(input.type).toBe("email");
    });

    it("supports placeholder", () => {
        render(<Input placeholder="Type here..." />);
        expect(screen.getByPlaceholderText(/type here/i)).toBeDefined();
    });
});

describe("UI Components - Label", () => {
    it("renders label text", () => {
        render(<Label htmlFor="email">Email Address</Label>);
        expect(screen.getByText(/email address/i)).toBeDefined();
    });

    it("associates with input by htmlFor attribute", () => {
        render(
            <>
                <Label htmlFor="username">Username</Label>
                <Input id="username" />
            </>
        );

        const label = screen.getByText(/username/i);
        expect(label.getAttribute("for")).toBe("username");
    });

    it("supports custom className", () => {
        const { container } = render(
            <Label className="text-red-500">Custom Label</Label>
        );
        const label = container.querySelector(".text-red-500");
        expect(label).toBeTruthy();
    });
});
