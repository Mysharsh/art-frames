import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

describe("Design kit - Button variants", () => {
    it("never uses the brand orange as a text colour", () => {
        for (const variant of ["default", "soft", "outline", "ghost", "chip", "link"] as const) {
            expect(buttonVariants({ variant })).not.toMatch(/(^|\s)text-primary(\s|$)/);
        }
    });

    it("gives icon and brand sizes a 44px touch target", () => {
        expect(buttonVariants({ size: "icon" })).toContain("h-11 w-11");
        expect(buttonVariants({ size: "pill" })).toContain("h-11");
        expect(buttonVariants({ size: "chip" })).toContain("h-11");
        expect(buttonVariants({ size: "block" })).toContain("h-14");
    });

    it("styles the selected chip through aria-pressed", () => {
        render(
            <Button variant="chip" size="chip" aria-pressed>
                M (12x16)
            </Button>
        );
        const chip = screen.getByRole("button", { name: "M (12x16)", pressed: true });
        expect(chip.className).toContain("aria-pressed:text-primary-ink");
    });
});

describe("Design kit - Field", () => {
    it("associates the label with the control", () => {
        render(
            <Field id="city" label="City">
                <Input />
            </Field>
        );
        expect(screen.getByLabelText("City")).toHaveAttribute("id", "city");
    });

    it("describes the control with its hint", () => {
        render(
            <Field id="pincode" label="Pincode" hint="6 digits">
                <Input />
            </Field>
        );
        const input = screen.getByLabelText("Pincode");
        expect(input).toHaveAccessibleDescription("6 digits");
        expect(input).not.toHaveAttribute("aria-invalid");
    });

    it("marks the control invalid and replaces the hint with the error", () => {
        render(
            <Field id="phone" label="Phone" hint="10 digits" error="Enter a valid number">
                <Input />
            </Field>
        );
        const input = screen.getByLabelText("Phone");
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(input).toHaveAccessibleDescription("Enter a valid number");
        expect(screen.queryByText("10 digits")).toBeNull();
    });

    it("shows an optional marker", () => {
        render(
            <Field id="gst" label="GST Number" optional>
                <Input />
            </Field>
        );
        expect(screen.getByText("(optional)")).toBeInTheDocument();
    });
});
