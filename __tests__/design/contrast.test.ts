import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"
import path from "path"

/**
 * Guards the design tokens in app/globals.css against WCAG 2.1 AA contrast
 * regressions: 4.5:1 for text, 3:1 for focus indicators and UI boundaries.
 */

type Rgb = [number, number, number]

const css = readFileSync(path.resolve(__dirname, "../../app/globals.css"), "utf8")
const rootBlock = css.match(/:root\s*{([^}]*)}/)?.[1] ?? ""

function token(name: string): Rgb {
    const match = rootBlock.match(new RegExp(`--${name}:\\s*([\\d.]+)\\s+([\\d.]+)%\\s+([\\d.]+)%`))
    if (!match) throw new Error(`Token --${name} not found in :root`)
    return hslToRgb(Number(match[1]), Number(match[2]) / 100, Number(match[3]) / 100)
}

function hslToRgb(h: number, s: number, l: number): Rgb {
    const k = (n: number) => (n + h / 30) % 12
    const a = s * Math.min(l, 1 - l)
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
    return [f(0), f(8), f(4)]
}

function luminance([r, g, b]: Rgb) {
    const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(a: Rgb, b: Rgb) {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
    return (hi + 0.05) / (lo + 0.05)
}

/** `top` at `alpha` composited over `base`, e.g. bg-primary/10 on a card. */
function over(top: Rgb, alpha: number, base: Rgb): Rgb {
    return top.map((v, i) => v * alpha + base[i] * (1 - alpha)) as Rgb
}

const TEXT = 4.5
const UI = 3

const textPairs: Array<[string, string, Rgb, Rgb]> = [
    ["foreground", "background", token("foreground"), token("background")],
    ["foreground", "card", token("foreground"), token("card")],
    ["muted-foreground", "background", token("muted-foreground"), token("background")],
    ["muted-foreground", "card", token("muted-foreground"), token("card")],
    ["muted-foreground", "secondary", token("muted-foreground"), token("secondary")],
    ["primary-ink", "background", token("primary-ink"), token("background")],
    ["primary-ink", "card", token("primary-ink"), token("card")],
    ["primary-ink", "secondary", token("primary-ink"), token("secondary")],
    ["primary-ink", "primary/10 on card", token("primary-ink"), over(token("primary"), 0.1, token("card"))],
    ["primary-foreground", "primary", token("primary-foreground"), token("primary")],
    ["secondary-foreground", "secondary", token("secondary-foreground"), token("secondary")],
    ["accent-foreground", "accent", token("accent-foreground"), token("accent")],
    ["destructive-foreground", "destructive", token("destructive-foreground"), token("destructive")],
    ["destructive", "card", token("destructive"), token("card")],
]

describe("Design token contrast (WCAG AA)", () => {
    it.each(textPairs)("%s text on %s meets 4.5:1", (_fg, _bg, fg, bg) => {
        expect(contrast(fg, bg)).toBeGreaterThanOrEqual(TEXT)
    })

    it("focus ring is visible against the background (3:1)", () => {
        expect(contrast(token("ring"), token("background"))).toBeGreaterThanOrEqual(UI)
    })

    it("documents that the brand orange is not a text colour", () => {
        // If this starts passing, --primary could be used for text again.
        expect(contrast(token("primary"), token("background"))).toBeLessThan(TEXT)
    })
})
