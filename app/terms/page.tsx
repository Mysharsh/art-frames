import type { Metadata } from "next"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Terms of Service for Posterwaala - Please read these terms before using our service.",
}

export default function TermsPage() {
    return (
        <AppShell>
            <div className="mx-auto max-w-3xl px-4 py-16">
                <div className="mb-8">
                    <Link
                        href="/"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        ← Back to Home
                    </Link>
                </div>

                <h1 className="font-display text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
                <p className="text-sm text-muted-foreground mb-10">Last updated: March 11, 2026</p>

                <div className="space-y-8 text-muted-foreground leading-relaxed">
                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using <span className="font-semibold text-foreground">Posterwaala</span> at{" "}
                            <a href="https://posterwaala.com" className="text-primary hover:underline">
                                https://posterwaala.com
                            </a>
                            , you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">2. Description of Service</h2>
                        <p>
                            Posterwaala is an e-commerce platform for premium metal posters. We offer limited-edition drops of high-quality metal prints from artists across various genres. Users can browse products, join the waitlist for upcoming drops, and place orders during active sale windows.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">3. User Accounts</h2>
                        <p className="mb-3">
                            To access certain features, you may sign in using your Google account. By signing in you agree to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 pl-2">
                            <li>Provide accurate and complete information</li>
                            <li>Keep your account credentials secure</li>
                            <li>Notify us immediately of any unauthorised use of your account</li>
                            <li>Accept responsibility for all activity that occurs under your account</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">4. Orders and Waitlist</h2>
                        <p className="mb-3">
                            Posterwaala operates on a limited-drop model. The following terms apply to orders and waitlist participation:
                        </p>
                        <ul className="list-disc list-inside space-y-2 pl-2">
                            <li>Joining the waitlist does not guarantee the ability to purchase a product.</li>
                            <li>Products are available on a first-come, first-served basis during each drop.</li>
                            <li>All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.</li>
                            <li>Once an order is placed and confirmed, it may not be cancelled or modified.</li>
                            <li>We reserve the right to cancel any order at our discretion, in which case a full refund will be issued.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">5. Shipping and Delivery</h2>
                        <p>
                            We ship across India. Estimated delivery times are 5–7 business days after order processing. Posterwaala is not responsible for delays caused by third-party logistics providers, customs, or events beyond our reasonable control.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">6. Returns and Refunds</h2>
                        <p>
                            Due to the limited-edition and custom nature of our products, we generally do not accept returns. However, if your order arrives damaged or defective, please contact us within 48 hours of delivery with photographic evidence and we will arrange a replacement or refund at our discretion.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">7. Intellectual Property</h2>
                        <p>
                            All content on Posterwaala — including artwork, images, logos, and text — is the property of Posterwaala or its respective artists and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works from any content without prior written permission.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">8. Prohibited Conduct</h2>
                        <p className="mb-3">You agree not to:</p>
                        <ul className="list-disc list-inside space-y-2 pl-2">
                            <li>Use the service for any unlawful purpose</li>
                            <li>Attempt to gain unauthorised access to any part of the service</li>
                            <li>Interfere with or disrupt the integrity or performance of the service</li>
                            <li>Scrape, crawl, or otherwise extract data from the service without permission</li>
                            <li>Impersonate any person or entity</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">9. Disclaimer of Warranties</h2>
                        <p>
                            The service is provided on an &quot;as is&quot; and &quot;as available&quot; basis without any warranties of any kind, either express or implied. Posterwaala does not warrant that the service will be uninterrupted, error-free, or free of viruses or other harmful components.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">10. Limitation of Liability</h2>
                        <p>
                            To the fullest extent permitted by law, Posterwaala shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the service, even if advised of the possibility of such damages.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">11. Governing Law</h2>
                        <p>
                            These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts located in Mumbai, India.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">12. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of Posterwaala after any changes constitutes your acceptance of the new terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">13. Contact Us</h2>
                        <p>For questions about these Terms of Service, please contact us:</p>
                        <div className="mt-3 rounded-lg border border-border bg-card p-4">
                            <p className="font-semibold text-foreground">Posterwaala</p>
                            <p className="mt-1">
                                Email:{" "}
                                <a href="mailto:contact@posterwaala.com" className="text-primary hover:underline">
                                    contact@posterwaala.com
                                </a>
                            </p>
                            <p className="mt-1">
                                Website:{" "}
                                <a href="https://posterwaala.com" className="text-primary hover:underline">
                                    https://posterwaala.com
                                </a>
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </AppShell>
    )
}
