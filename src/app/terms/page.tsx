import TermsPage from "@/frontend/components/TermsPage";

export default function Terms() {
  return (
    <TermsPage
      companyName="Chill.me"
      companyEmail="info@ignitechannel.com"
      updatedAt={"September 1, 2024"}
      privacyLink={"/privacy"}
    />
  );
}
