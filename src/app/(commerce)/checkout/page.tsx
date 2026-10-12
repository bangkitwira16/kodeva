import { SectionWrapper } from "@/components/layout/section-wrapper";
import { CheckoutSimulator } from "@/features/marketplace/components/checkout-simulator";

export default function CheckoutPage() {
  return (
    <SectionWrapper
      contentWidth="wide"
      description="Add your details and complete a simulated payment."
      heading="Checkout"
      headingLevel="h1"
      variant="features"
    >
      <CheckoutSimulator />
    </SectionWrapper>
  );
}
