import { categories, type Category } from "@/lib/products"

export const siteContent = {
  brand: {
    name: "Posterwaala",
    strapline: "Premium metal poster drops for bold interiors",
    location: "Mumbai, India",
    supportEmail: "hello@posterwaala.com",
    businessEmail: "business@posterwaala.com",
    legalEmail: "contact@posterwaala.com",
  },
  tickerMessages: [
    "Limited metal poster drops curated for bold rooms",
    "Museum-grade print depth with anti-fade finish",
    "Pan-India delivery in 5 to 7 business days",
    "Early access members hear about drops first",
  ],
  primaryNav: [
    { label: "Shop", href: "/collections/all" },
    { label: "Gallery Walls", href: "/gallery-walls" },
    { label: "About", href: "/about" },
    { label: "Waitlist", href: "/waitlist" },
  ],
  mobileBottomNav: [
    { label: "Home", href: "/", section: null },
    { label: "Shop", href: "/collections/all", section: null },
    { label: "Waitlist", href: "/waitlist", section: null },
    { label: "Cart", href: "/cart", section: null },
    { label: "Account", href: "/profile", section: null },
  ],
  searchSuggestions: [
    { label: "Anime Collection", href: "/collections/anime" },
    { label: "Gaming Collection", href: "/collections/gaming" },
    { label: "Music Collection", href: "/collections/music" },
    { label: "Meet the Brand", href: "/about" },
  ],
  featuredCategories: categories.filter(
    (category): category is Exclude<Category, "All"> => category !== "All"
  ),
  heroStats: [
    { value: "24h", label: "Drop windows" },
    { value: "4.8", label: "Collector rating" },
    { value: "5-7d", label: "Pan-India delivery" },
  ],
  collectorPillars: [
    {
      eyebrow: "Limited Releases",
      title: "Fast drops with real scarcity",
      description:
        "Each collection is launched in short windows so every wall still feels personal.",
    },
    {
      eyebrow: "Premium Finish",
      title: "Built for texture, depth, and longevity",
      description:
        "High-contrast metal prints with anti-fade coating and mounting kits included.",
    },
    {
      eyebrow: "Curated Taste",
      title: "Genres with a collector point of view",
      description:
        "Anime, gaming, music, abstract, and cinematic pieces chosen for statement spaces.",
    },
  ],
  collectionIntro: {
    eyebrow: "Community Picks",
    title: "Most Wanted This Week",
    description:
      "Browse the live drop lineup, move fast on collector favorites, and join early access for the editions that sell out first.",
    tags: [
      "Artist curated",
      "Limited editions",
      "Mounting kit included",
      "Fast shipping across India",
    ],
  },
  dropJourney: [
    {
      title: "Join early access",
      description:
        "Save the prints you love and join the waitlist before a collection opens.",
    },
    {
      title: "Get the drop alert",
      description:
        "Receive launch timing, availability, and quick product context by email.",
    },
    {
      title: "Display with confidence",
      description:
        "Every poster is packed for safe delivery and built to make a room feel complete.",
    },
  ],
  aboutCopy: [
    "Posterwaala curates premium metal posters for collectors who want their walls to feel deliberate, expressive, and built to last.",
    "We work like a drop-led studio, not an endless catalog. Every launch is designed around a point of view, with artwork chosen for contrast, texture, and real room presence.",
    "From anime and gaming to music, nature, and abstract forms, each series is selected to feel distinctive on arrival and memorable after installation.",
  ],
  aboutTags: [
    "Gallery-grade color depth",
    "Anti-fade metal finish",
    "Bold art for living spaces",
    "India-first collector experience",
  ],
  events: [
    {
      title: "Anime Artist Showcase",
      description:
        "Exclusive metal editions from top anime illustrators, paired with behind-the-art stories and collector previews.",
      badge: "Coming Soon",
    },
    {
      title: "Music Legends Drop",
      description:
        "A limited series of iconic music-inspired artworks designed for listening rooms and statement corners.",
      badge: "Collector Preview",
    },
  ],
  contactCards: [
    {
      title: "Studio Support",
      body: "Questions about drops, materials, shipping, or sizes.",
      href: "mailto:hello@posterwaala.com",
      label: "hello@posterwaala.com",
    },
    {
      title: "Business Inquiries",
      body: "Partnerships, collaborations, pop-ups, and bulk orders.",
      href: "mailto:business@posterwaala.com",
      label: "business@posterwaala.com",
    },
  ],
  waitlistBenefits: [
    "Early access email alerts for limited drops",
    "A cleaner personal dashboard for saved editions",
    "Availability context without needing checkout first",
  ],
  footerLinks: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Waitlist", href: "/waitlist" },
    { label: "Contact", href: "mailto:contact@posterwaala.com" },
  ],
  profileQuickLinks: [
    {
      title: "My Waitlist",
      description: "Review the drops you joined and jump back into the collection.",
      href: "/waitlist",
    },
    {
      title: "Explore Current Drops",
      description: "Browse the live catalog and save more pieces for launch day.",
      href: "/collections/all",
    },
  ],
  legalLastUpdated: "March 11, 2026",
}
