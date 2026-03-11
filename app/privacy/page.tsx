import type { Metadata } from "next"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Privacy Policy for Posterwaala - Learn how we collect and use your data.",
}

export default function PrivacyPage() {
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

                <h1 className="font-display text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
                <p className="text-sm text-muted-foreground mb-10">Last updated: March 11, 2026</p>

                <div className="space-y-8 text-muted-foreground leading-relaxed">
                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">1. Introduction</h2>
                        <p>
                            Welcome to <span className="font-semibold text-foreground">Posterwaala</span> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We operate the website{" "}
                            <a href="https://posterwaala.com" className="text-primary hover:underline">
                                https://posterwaala.com
                            </a>
                            . This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit or use our service.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">2. Information We Collect</h2>
                        <p className="mb-3">
                            We collect information you provide when you sign in to Posterwaala using <span className="font-semibold text-foreground">Google Sign-In</span>. This includes:
                        </p>
                        <ul className="list-disc list-inside space-y-2 pl-2">
                            <li><span className="text-foreground font-medium">Name</span> — your Google display name</li>
                            <li><span className="text-foreground font-medium">Email address</span> — your Google account email</li>
                            <li><span className="text-foreground font-medium">Profile photo</span> — your Google profile picture</li>
                        </ul>
                        <p className="mt-3">
                            This information is retrieved solely from your Google profile at the time of authentication and is used only to identify your account within Posterwaala.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">3. How We Use Your Information</h2>
                        <p className="mb-3">We use the information we collect for the following purposes:</p>
                        <ul className="list-disc list-inside space-y-2 pl-2">
                            <li>To create and manage your Posterwaala account</li>
                            <li>To authenticate you when you sign in</li>
                            <li>To personalise your experience on the platform</li>
                            <li>To communicate with you about your orders and waitlist status</li>
                        </ul>
                        <p className="mt-3">
                            We do <span className="font-semibold text-foreground">not</span> use your data for advertising, profiling, or any purpose beyond what is needed to operate the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">4. Data Sharing</h2>
                        <p>
                            We do <span className="font-semibold text-foreground">not sell, rent, trade, or share</span> your personal information with any third parties for their marketing or commercial purposes. Your data stays with Posterwaala and is used exclusively to provide you with our service.
                        </p>
                        <p className="mt-3">
                            We may share your information only in the following limited circumstances:
                        </p>
                        <ul className="list-disc list-inside space-y-2 pl-2 mt-2">
                            <li>When required by law or a valid legal process</li>
                            <li>To protect the rights, property, or safety of Posterwaala, our users, or the public</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">5. Google Sign-In</h2>
                        <p>
                            Our authentication is powered by <span className="font-semibold text-foreground">Firebase Authentication</span> with Google Sign-In. When you sign in, you are redirected to Google&apos;s own sign-in page and Google&apos;s{" "}
                            <a
                                href="https://policies.google.com/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                Privacy Policy
                            </a>{" "}
                            applies to that process. We only receive the profile data you consent to share with us.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">6. Data Retention</h2>
                        <p>
                            We retain your account information for as long as your account is active or as needed to provide you with our services. You may request deletion of your account and associated data at any time by contacting us.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">7. Security</h2>
                        <p>
                            We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">8. Your Rights</h2>
                        <p className="mb-3">You have the right to:</p>
                        <ul className="list-disc list-inside space-y-2 pl-2">
                            <li>Access the personal information we hold about you</li>
                            <li>Request correction of inaccurate data</li>
                            <li>Request deletion of your personal data</li>
                            <li>Withdraw consent for data processing at any time</li>
                        </ul>
                        <p className="mt-3">
                            To exercise any of these rights, please contact us at the email address below.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">9. Children&apos;s Privacy</h2>
                        <p>
                            Posterwaala is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">10. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the &quot;Last updated&quot; date at the top of this page. Continued use of Posterwaala after changes constitutes your acceptance of the updated policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl text-foreground mb-3">11. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy or how we handle your data, please contact us:
                        </p>
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
