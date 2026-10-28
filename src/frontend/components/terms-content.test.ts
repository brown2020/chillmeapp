import { describe, expect, it } from "vitest";
import { renderTermsHtml } from "./terms-content";

describe("renderTermsHtml", () => {
  it("escapes interpolated text and quotes the privacy link", () => {
    const html = renderTermsHtml({
      companyName: "Chill <script>",
      companyEmail: "a&b@example.com",
      privacyLink: "/privacy",
      updatedAt: "September 1, 2024",
    });

    expect(html).toContain("Chill &lt;script&gt;");
    expect(html).toContain("a&amp;b@example.com");
    expect(html).toContain('href="/privacy"');
    expect(html).not.toContain("<script>");
  });

  it("drops javascript URLs from the privacy link", () => {
    const html = renderTermsHtml({
      companyName: "Chill.me",
      companyEmail: "info@example.com",
      privacyLink: "javascript:alert(1)",
      updatedAt: "September 1, 2024",
    });

    expect(html).toContain('href="#"');
    expect(html).not.toContain("javascript:");
  });
});
