import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About NECC Egg Prices - Data Sources & Information | PoultryCo",
  description: "Learn about NECC, our data sources, and how we provide accurate egg price information.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          About NECC Data
        </h1>

        <div className="prose max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What is NECC?</h2>
            <p className="text-gray-700 mb-4">
              The National Egg Coordination Committee (NECC) is the apex body representing the 
              layer poultry industry in India. NECC provides daily and monthly egg price data 
              across various production and consumption centers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Source</h2>
            <p className="text-gray-700 mb-4">
              All price data is sourced from the official NECC website:{" "}
              <Link 
                href="https://e2necc.com/home/eggprice" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                e2necc.com
              </Link>
            </p>
            <p className="text-gray-700 mb-4">
              We collect this data daily and present it with additional analytics, expert insights, 
              and trend analysis to help stakeholders make informed decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Disclaimer</h2>
            <p className="text-gray-700 mb-4">
              The daily egg prices suggested by NECC are merely suggestive and not mandatory. 
              The suggested prices are published solely for the reference and information of 
              the trade and industry.
            </p>
            <p className="text-gray-700 mb-4">
              Expert annotations and predictions on this platform are user-generated content 
              and represent expert opinions, not official NECC statements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use This Data</h2>
            <p className="text-gray-700 mb-4">
              At PoultryCo, we enhance NECC's official price data with:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Interactive analytics and trend visualization</li>
              <li>Historical data analysis (10+ years)</li>
              <li>Zone-wise comparisons and insights</li>
              <li>Expert annotations and market analysis</li>
              <li>AI-powered predictions (coming soon)</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Our goal is to make NECC data more accessible and actionable for all stakeholders 
              in the Indian poultry industry.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">External Links</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>
                <Link 
                  href="https://e2necc.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  NECC Official Website
                </Link>
              </li>
              <li>
                <Link 
                  href="https://e2necc.com/home/eggprice" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  NECC Daily Egg Prices
                </Link>
              </li>
            </ul>
          </section>

          <section className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-amber-900">Important Notice</h2>
            <p className="text-amber-800 mb-2">
              <strong>Data Accuracy:</strong> While we strive to provide accurate and up-to-date information, 
              prices are collected from public sources and may occasionally have discrepancies. 
              For official and most current prices, please refer to the NECC website directly.
            </p>
            <p className="text-amber-800">
              <strong>Expert Content:</strong> Annotations, predictions, and expert insights on this platform 
              are user-generated content and represent individual expert opinions. They do not constitute 
              official NECC statements or financial advice.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

