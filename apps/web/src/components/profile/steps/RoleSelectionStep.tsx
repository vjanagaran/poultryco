'use client';

interface Props {
  selectedRoles: string[];
  onRolesChange: (roles: string[]) => void;
  onNext: (data: any) => void;
  onBack: () => void;
  loading: boolean;
}

const ROLES = [
  { id: 'farmer', name: 'Poultry Farmer', icon: '👨‍🌾', description: 'Commercial or backyard farming' },
  { id: 'veterinarian', name: 'Veterinarian', icon: '👨‍⚕️', description: 'Poultry health specialist' },
  { id: 'supplier', name: 'Supplier/Dealer', icon: '🏭', description: 'Feed, medicine, equipment' },
  { id: 'consultant', name: 'Consultant', icon: '💼', description: 'Farm management & technical' },
  { id: 'researcher', name: 'Researcher', icon: '🔬', description: 'Academic or industry R&D' },
  { id: 'feed_miller', name: 'Feed Miller', icon: '🌾', description: 'Feed production' },
  { id: 'hatchery_operator', name: 'Hatchery Operator', icon: '🥚', description: 'Chick production' },
  { id: 'processor', name: 'Processor', icon: '🏪', description: 'Slaughtering & processing' },
  { id: 'trader', name: 'Trader/Broker', icon: '💱', description: 'Buy & sell birds/products' },
  { id: 'transporter', name: 'Transporter', icon: '🚚', description: 'Logistics & transport' },
  { id: 'nutritionist', name: 'Nutritionist', icon: '🥗', description: 'Feed formulation expert' },
  { id: 'educator', name: 'Educator/Trainer', icon: '👨‍🏫', description: 'Teaching & training' },
];

export default function RoleSelectionStep({ selectedRoles, onRolesChange, onNext, onBack, loading }: Props) {
  const toggleRole = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      onRolesChange(selectedRoles.filter(r => r !== roleId));
    } else {
      onRolesChange([...selectedRoles, roleId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What roles do you have?</h2>
        <p className="text-gray-600">Select all that apply. You can update this anytime.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {ROLES.map((role) => (
          <label
            key={role.id}
            className={`relative flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
              selectedRoles.includes(role.id)
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedRoles.includes(role.id)}
              onChange={() => toggleRole(role.id)}
              className="sr-only"
            />
            <div className="flex items-start gap-3 flex-1">
              <span className="text-3xl">{role.icon}</span>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  {role.name}
                  {selectedRoles.includes(role.id) && (
                    <span className="text-green-600">✓</span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-1">{role.description}</div>
              </div>
            </div>
          </label>
        ))}
      </div>

      {selectedRoles.length === 0 && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
          Please select at least one role to continue
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={selectedRoles.length === 0 || loading}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </form>
  );
}

