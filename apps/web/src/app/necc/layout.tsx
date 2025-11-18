import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Script from "next/script";

export const metadata: Metadata = {
  title: "NECC Egg Prices - Daily Rates, Trends & Expert Analysis | PoultryCo",
  description: "Get daily NECC egg prices, expert insights, and market analysis. Compare zones, track trends, and make informed decisions.",
  keywords: [
    "NECC egg prices",
    "egg rates",
    "poultry prices",
    "NECC data",
    "egg market analysis",
    "daily egg prices",
    "NECC zones",
    "egg price trends",
    "poultry market",
    "layer industry",
  ],
  openGraph: {
    title: "NECC Egg Prices - Daily Rates & Analysis",
    description: "Get daily NECC egg prices, expert insights, and market analysis.",
    type: "website",
    url: "https://poultryco.net/necc",
  },
  alternates: {
    canonical: "https://poultryco.net/necc",
  },
};

export default function NECCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "NECC Egg Prices",
    "description": "Daily NECC egg prices with expert insights and market analysis",
    "url": "https://poultryco.net/necc",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "provider": {
      "@type": "Organization",
      "name": "PoultryCo",
      "url": "https://poultryco.net"
    }
  };

  return (
    <>
      <Script
        id="necc-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
      <Footer />
    </>
  );
}

