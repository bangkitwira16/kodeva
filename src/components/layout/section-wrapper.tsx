import { useId, type HTMLAttributes, type ReactNode } from "react";

export type SectionVariant = "hero" | "features" | "testimonials" | "faq";

type SectionWrapperProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  children: ReactNode;
  variant?: SectionVariant;
  eyebrow?: string;
  heading?: string;
  description?: string;
  headingLevel?: "h1" | "h2" | "h3";
  contentWidth?: "narrow" | "standard" | "wide" | "full";
};

const widthClasses = {
  narrow: "max-w-3xl",
  standard: "max-w-6xl",
  wide: "max-w-7xl",
  full: "max-w-none",
} as const;

const variantClasses: Record<SectionVariant, string> = {
  hero: "py-14 sm:py-20 lg:py-24",
  features: "py-12 sm:py-16 lg:py-20",
  testimonials: "py-12 sm:py-16 lg:py-20",
  faq: "py-12 sm:py-16 lg:py-20",
};

export function SectionWrapper({
  children,
  variant = "features",
  eyebrow,
  heading,
  description,
  headingLevel = "h2",
  contentWidth = "standard",
  className = "",
  ...sectionProps
}: SectionWrapperProps) {
  const headingId = useId();
  const Heading = headingLevel;

  return (
    <section
      {...sectionProps}
      aria-labelledby={heading ? headingId : undefined}
      className={`px-4 sm:px-6 lg:px-8 ${variantClasses[variant]} ${className}`.trim()}
    >
      <div
        className={`mx-auto w-full [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_button]:min-h-11 [&_input]:min-h-11 [&_select]:min-h-11 [&_textarea]:min-h-11 ${widthClasses[contentWidth]}`}
      >
        {(eyebrow || heading || description) && (
          <header className="mb-8 sm:mb-10">
            {eyebrow && (
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-neutral-600">
                {eyebrow}
              </p>
            )}
            {heading && (
              <Heading
                className="max-w-3xl text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl"
                id={headingId}
              >
                {heading}
              </Heading>
            )}
            {description && (
              <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
                {description}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
