export default function ToolsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Poultry Tools</h1>
          <p className="text-gray-600">Calculators and utilities for poultry professionals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: "🧮", name: "FCR Calculator", desc: "Calculate feed conversion ratio" },
            { icon: "📊", name: "Feed Projection", desc: "Project feed requirements" },
            { icon: "💰", name: "Profit Calculator", desc: "Calculate batch profitability" },
            { icon: "📈", name: "Mortality Tracker", desc: "Track daily mortality rates" },
            { icon: "🌡️", name: "Heat Stress Index", desc: "Calculate heat stress levels" },
            { icon: "💊", name: "Medicine Calculator", desc: "Calculate dosage amounts" },
          ].map((tool, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">{tool.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{tool.name}</h3>
              <p className="text-sm text-gray-600">{tool.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600">
            Tools will be implemented as interactive modals/pages with form inputs and real-time calculations
          </p>
        </div>
      </div>
    </div>
  );
}
