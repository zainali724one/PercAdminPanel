import React, { useState, useEffect, useMemo } from "react";

// --- MOCK SUPABASE CONFIG (Will use global config variables in a real environment) ---
const mockSupabaseConfig = {
  SUPABASE_URL: "https://mock-project-id.supabase.co",
  SUPABASE_ANON_KEY: "mock-anon-key-xxxxxxxxxxxxxxxxxxxxxxxx",
};

// --- DATABASE STRUCTURE (Supabase Tables) ---
const INITIAL_PRICING_DATA = [
  {
    modelId: "757279507095956705",
    description: "Flux Diffusion (Base)",
    internalCostUsd: 0.005,
    chargeMultiplier: 5,
    usageArea: "AI Gen Bkgd",
  },
  {
    modelId: "857216801149310667",
    description: "Shi Yang V1 Model",
    internalCostUsd: 0.008,
    chargeMultiplier: 5,
    usageArea: "AI Gen Bkgd",
  },
  {
    modelId: "RealESRGAN_x4plus",
    description: "Pixel Upscaler (4x)",
    internalCostUsd: 0.002,
    chargeMultiplier: 5,
    usageArea: "Upscale",
  },
  {
    modelId: "857354796301083775",
    description: "Harold & Friends V1",
    internalCostUsd: 0.012,
    chargeMultiplier: 5,
    usageArea: "AI Gen Bkgd",
  },
];

const MOCK_USERS = [
  // This mocks data from a 'profiles' or 'users' Supabase table
  {
    id: "admin123",
    email: "admin@project.com",
    role: "admin",
    pointsBalance: 99999,
    created: "2025-01-01",
    lastActive: "2025-11-18",
  },
  {
    id: "user456",
    email: "user@client.com",
    role: "user",
    pointsBalance: 15000,
    created: "2025-02-10",
    lastActive: "2025-11-19",
  },
  {
    id: "user789",
    email: "trial@user.com",
    role: "user",
    pointsBalance: 500,
    created: "2025-03-20",
    lastActive: "2025-11-15",
  },
];

// Point Calculation Constant: $0.001 USD per 1 Point
const USD_PER_POINT = 0.001;

// Helper to calculate points cost based on current multiplier
const calculatePointsCost = (internalCostUsd, multiplier) => {
  const internalCostInPoints = internalCostUsd / USD_PER_POINT;
  return Math.ceil(internalCostInPoints * multiplier);
};

// --- UTILITY COMPONENTS ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-gray-800 p-6 rounded-xl shadow-lg ${className}`}>
    {children}
  </div>
);

const UserRow = ({ user, onUpdatePoints, onUpdateRole }) => {
  const [newPoints, setNewPoints] = useState(user.pointsBalance);

  const handlePointsChange = () => {
    onUpdatePoints(user.id, newPoints);
  };

  return (
    <tr className="border-b border-gray-700 hover:bg-gray-700 transition duration-150">
      <td className="p-4 text-sm font-medium text-blue-400">{user.email}</td>
      <td className="p-4 text-sm text-gray-400">
        <select
          value={user.role}
          onChange={(e) => onUpdateRole(user.id, e.target.value)}
          className="bg-gray-600 border border-gray-500 rounded-md p-1 text-xs text-white"
        >
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </td>
      <td className="p-4 text-sm text-gray-300">
        <input
          type="number"
          value={newPoints}
          onChange={(e) => setNewPoints(parseInt(e.target.value))}
          className="bg-gray-600 border border-gray-500 rounded-md p-1 w-20 text-xs text-white"
        />
        <button
          onClick={handlePointsChange}
          className="ml-2 bg-blue-600 hover:bg-blue-500 text-white p-1 rounded-md text-xs transition duration-150"
        >
          Update
        </button>
      </td>
      <td className="p-4 text-sm text-gray-400">{user.created}</td>
    </tr>
  );
};

// --- VIEWS ---

const UserManagement = ({ users, setUsers }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const handleUpdatePoints = (userId, newPoints) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, pointsBalance: newPoints } : u
      )
    );
    // In a real Supabase app: Update the 'profiles' table here
  };

  const handleUpdateRole = (userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    // In a real Supabase app: Update the 'profiles' table here
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "all" || user.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  return (
    <Card className="min-h-[500px]">
      <h2 className="text-2xl font-bold text-white mb-6">User Management</h2>
      <div className="flex space-x-4 mb-4">
        <input
          type="text"
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-gray-400 uppercase text-xs border-b border-gray-600">
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Points Balance</th>
              <th className="p-4">Created Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onUpdatePoints={handleUpdatePoints}
                onUpdateRole={handleUpdateRole}
              />
            ))}
          </tbody>
        </table>
      </div>
      {filteredUsers.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          No users match your filter criteria.
        </p>
      )}
    </Card>
  );
};

const PricingManagement = ({ pricing, setPricing }) => {
  const handleMultiplierChange = (modelId, newMultiplier) => {
    let multiplier = parseFloat(newMultiplier);
    if (isNaN(multiplier) || multiplier < 1) multiplier = 1;

    setPricing((prev) =>
      prev.map((model) => {
        if (model.modelId === modelId) {
          const newPointsCost = calculatePointsCost(
            model.internalCostUsd,
            multiplier
          );

          return {
            ...model,
            chargeMultiplier: multiplier,
            pointsCost: newPointsCost,
          };
        }
        return model;
      })
    );
  };

  const handleSave = () => {
    // In a real Supabase app: Push updated pricing to the 'ai_model_pricing' table
    console.log("--- SAVING PRICING TO SUPABASE ---", pricing);
    alert("Pricing configuration saved! (Mock Save)");
  };

  return (
    <Card className="min-h-[500px]">
      <h2 className="text-2xl font-bold text-white mb-6">
        Pricing & Cost Management
      </h2>
      <div className="text-gray-400 mb-4">
        {/* <p>1 Point = ${USD_PER_POINT} USD (System Constant)</p>
        <p>
          User Point Cost is calculated as: `CEIL(Internal Cost / $
          {USD_PER_POINT}) * Multiplier`
        </p> */}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-gray-400 uppercase text-xs border-b border-gray-600">
              <th className="p-4">Model / Area</th>
              <th className="p-4">Internal Cost (USD)</th>
              <th className="p-4">Markup Multiplier (X)</th>
              <th className="p-4">User Cost (Points)</th>
            </tr>
          </thead>
          <tbody>
            {pricing.map((model) => (
              <tr
                key={model.modelId}
                className="border-b border-gray-700 hover:bg-gray-700 transition duration-150"
              >
                <td className="p-4 text-sm font-medium text-blue-400">
                  {model.description}
                </td>
                <td className="p-4 text-sm text-gray-300 font-mono">
                  ${model.internalCostUsd.toFixed(4)}
                </td>
                <td className="p-4 text-sm text-gray-300">
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={model.chargeMultiplier}
                    onChange={(e) =>
                      handleMultiplierChange(model.modelId, e.target.value)
                    }
                    className="bg-gray-600 border border-gray-500 rounded-md p-1 w-16 text-xs text-white text-center"
                  />
                </td>
                <td className="p-4 text-sm font-bold text-green-400">
                  {/* Ensure pointsCost is always a number before using toLocaleString */}
                  {typeof model.pointsCost === "number"
                    ? model.pointsCost.toLocaleString()
                    : "N/A"}{" "}
                  Pts
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={handleSave}
        className="mt-6 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition duration-150"
      >
        Save Pricing Configuration
      </button>
    </Card>
  );
};

// --- MAIN APP COMPONENT ---

const AdminDashboard = () => {
  // State Initialization
  const [authReady, setAuthReady] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);
  const [activeView, setActiveView] = useState("users");
  const [users, setUsers] = useState(MOCK_USERS);
  // Initialize pricing with calculated pointsCost
  const [pricing, setPricing] = useState(() =>
    INITIAL_PRICING_DATA.map((model) => ({
      ...model,
      pointsCost: calculatePointsCost(
        model.internalCostUsd,
        model.chargeMultiplier
      ),
    }))
  );

  // --- SUPABASE AUTHENTICATION/DB SETUP (Replace with real Supabase client in production) ---
  // useEffect(() => {
  //     // 1. Initialize Supabase client:
  //     // const supabase = createClient(mockSupabaseConfig.SUPABASE_URL, mockSupabaseConfig.SUPABASE_ANON_KEY);
  //
  //     // 2. Check current session/user and fetch user profile (to determine 'admin' role).
  //     // supabase.auth.getSession().then(({ data: { session } }) => {
  //     //   if (session) {
  //     //     // Fetch user profile from 'profiles' table to check for 'admin' role
  //     //     // If role === 'admin', setIsAdmin(true);
  //     //   }
  //     //   setAuthReady(true);
  //     // });
  //
  //     // 3. Fetch pricing data from 'ai_model_pricing' table:
  //     // supabase.from('ai_model_pricing').select('*').then(({ data, error }) => {
  //     //   if (data) {
  //     //     // Map fetched data and calculate pointsCost before setting state
  //     //     const loadedPricing = data.map(model => ({
  //     //         ...model,
  //     //         pointsCost: calculatePointsCost(model.internalCostUsd, model.chargeMultiplier)
  //     //     }));
  //     //     setPricing(loadedPricing);
  //     //   }
  //     // });
  // }, []);

  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Loading Authentication...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <Card className="text-center text-red-400">
          <h2 className="text-3xl font-bold mb-4">ACCESS DENIED</h2>
          <p>
            You must be an authenticated administrator to access this panel.
          </p>
        </Card>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case "users":
        return <UserManagement users={users} setUsers={setUsers} />;
      case "pricing":
        return <PricingManagement pricing={pricing} setPricing={setPricing} />;
      default:
        return <UserManagement users={users} setUsers={setUsers} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-blue-500">
          PERC Admin Dashboard
        </h1>
        <p className="text-gray-400">Manage user access and AI costs.</p>
      </header>

      <div className="flex space-x-6">
        {/* Sidebar Navigation */}
        <Card className="w-64 flex-shrink-0 flex flex-col space-y-4 h-full">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            Navigation
          </h3>
          <button
            onClick={() => setActiveView("users")}
            className={`text-left py-2 px-3 rounded-lg font-medium transition duration-150 ${
              activeView === "users"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
            }`}
          >
            User Accounts
          </button>
          <button
            onClick={() => setActiveView("pricing")}
            className={`text-left py-2 px-3 rounded-lg font-medium transition duration-150 ${
              activeView === "pricing"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
            }`}
          >
            Pricing & Costs
          </button>
          <div className="pt-4 border-t border-gray-700 mt-auto">
            <p className="text-xs text-gray-500">
              Admin: {MOCK_USERS[0].email}
            </p>
            <p className="text-xs text-gray-500">
              {/* Supabase URL: {mockSupabaseConfig.SUPABASE_URL} */}
            </p>
            <button className="mt-2 text-red-500 hover:text-red-400 text-sm">
              Logout
            </button>
          </div>
        </Card>

        {/* Main Content Area */}
        <div className="flex-grow">{renderView()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
