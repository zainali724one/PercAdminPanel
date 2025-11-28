import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  CreditCard,
  Tags,
  LogOut,
  Search,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  TrendingUp,
} from "lucide-react"; // Assuming lucide-react is available, or use standard SVGs

// --- MOCK SUPABASE CONFIG ---
const mockSupabaseConfig = {
  SUPABASE_URL: "https://mock-project-id.supabase.co",
  SUPABASE_ANON_KEY: "mock-anon-key-xxxxxxxxxxxxxxxxxxxxxxxx",
};

// --- DATABASE STRUCTURE ---

// 1. AI Models & Base Costs
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
    modelId: "replicate-flux",
    description: "Replicate Flux Schnell",
    internalCostUsd: 0.003,
    chargeMultiplier: 5,
    usageArea: "AI Gen Bkgd",
  },
];

// 2. Discount Rules (NEW REQUIREMENT)
const INITIAL_DISCOUNTS = [
  {
    id: "d1",
    name: "Portal NFT Holder",
    type: "nft_ownership",
    target: "portal_pass",
    discountPercent: 20,
    isActive: true,
  },
  {
    id: "d2",
    name: "Pro Subscriber",
    type: "subscription",
    target: "pro_tier",
    discountPercent: 10,
    isActive: true,
  },
  {
    id: "d3",
    name: "Early Adopter Badge",
    type: "badge",
    target: "early_bird",
    discountPercent: 5,
    isActive: false,
  },
];

// 3. Users
const MOCK_USERS = [
  {
    id: "admin123",
    email: "admin@project.com",
    role: "admin",
    pointsBalance: 99999,
    created: "2025-01-01",
    tags: ["admin"],
  },
  {
    id: "user456",
    email: "whale@crypto.com",
    role: "user",
    pointsBalance: 15000,
    created: "2025-02-10",
    tags: ["portal_pass", "pro_tier"],
  },
  {
    id: "user789",
    email: "newbie@gmail.com",
    role: "user",
    pointsBalance: 500,
    created: "2025-03-20",
    tags: [],
  },
];

// Point Calculation Constant: $0.001 USD per 1 Point
const USD_PER_POINT = 0.001;

// Helper to calculate points cost
const calculatePointsCost = (internalCostUsd, multiplier) => {
  const internalCostInPoints = internalCostUsd / USD_PER_POINT;
  return Math.ceil(internalCostInPoints * multiplier);
};

// --- UTILITY COMPONENTS ---

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-xl ${className}`}
  >
    {children}
  </div>
);

const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-900 text-blue-200 border-blue-700",
    green: "bg-green-900 text-green-200 border-green-700",
    yellow: "bg-yellow-900 text-yellow-200 border-yellow-700",
    red: "bg-red-900 text-red-200 border-red-700",
    gray: "bg-gray-700 text-gray-300 border-gray-600",
  };
  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-medium border ${
        colors[color] || colors.gray
      }`}
    >
      {children}
    </span>
  );
};

// --- VIEWS ---

// 1. USER MANAGEMENT VIEW
const UserManagement = ({ users, setUsers }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const handleUpdatePoints = (userId, newPoints) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, pointsBalance: newPoints } : u
      )
    );
  };

  const handleUpdateRole = (userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
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
    <Card className="min-h-[600px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-400" /> User Management
        </h2>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white w-64 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full text-left bg-gray-900/50">
          <thead>
            <tr className="text-gray-400 uppercase text-xs bg-gray-800 border-b border-gray-700">
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Points Balance</th>
              <th className="p-4">Active Discounts</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-700 hover:bg-gray-800/50 transition"
              >
                <td className="p-4">
                  <div className="text-sm font-medium text-white">
                    {user.email}
                  </div>
                  <div className="text-xs text-gray-500">ID: {user.id}</div>
                </td>
                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                    className={`bg-transparent border-b ${
                      user.role === "admin"
                        ? "border-purple-500 text-purple-400"
                        : "border-gray-600 text-gray-300"
                    } text-sm focus:outline-none pb-1`}
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue={user.pointsBalance}
                      onBlur={(e) =>
                        handleUpdatePoints(user.id, parseInt(e.target.value))
                      }
                      className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-24 text-right text-sm text-white"
                    />
                    <span className="text-xs text-gray-500">pts</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {user.tags.map((tag) => (
                      <Badge key={tag} color="blue">
                        {tag}
                      </Badge>
                    ))}
                    {user.tags.length === 0 && (
                      <span className="text-gray-600 text-xs">-</span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <button className="text-blue-400 hover:text-blue-300 text-xs font-medium">
                    View Logs
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// 2. PRICING & COST VIEW
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
    console.log("--- SAVING PRICING TO SUPABASE ---", pricing);
    alert("Pricing saved successfully.");
  };

  return (
    <Card className="min-h-[600px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-400" /> Model Pricing
          Strategy
        </h2>
        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-green-900/20"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-lg">
          <h4 className="text-blue-400 text-xs font-bold uppercase">
            Base Rate
          </h4>
          <p className="text-2xl font-bold text-white mt-1">
            $0.001{" "}
            <span className="text-sm font-normal text-gray-400">/ point</span>
          </p>
        </div>
        <div className="bg-purple-900/20 border border-purple-800 p-4 rounded-lg">
          <h4 className="text-purple-400 text-xs font-bold uppercase">
            Global Multiplier
          </h4>
          <p className="text-2xl font-bold text-white mt-1">
            5.0x{" "}
            <span className="text-sm font-normal text-gray-400">(Default)</span>
          </p>
        </div>
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
          <h4 className="text-gray-400 text-xs font-bold uppercase">
            Profit Margin
          </h4>
          <p className="text-2xl font-bold text-green-400 mt-1">
            ~80%{" "}
            <span className="text-sm font-normal text-gray-400">per gen</span>
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full text-left bg-gray-900/50">
          <thead>
            <tr className="text-gray-400 uppercase text-xs bg-gray-800 border-b border-gray-700">
              <th className="p-4 w-1/3">AI Model</th>
              <th className="p-4 text-right">Your Cost (USD)</th>
              <th className="p-4 text-center">Markup (X)</th>
              <th className="p-4 text-right">User Price (Points)</th>
              <th className="p-4 text-right">Est. Profit</th>
            </tr>
          </thead>
          <tbody>
            {pricing.map((model) => {
              const costPerPoint = model.internalCostUsd / USD_PER_POINT; // e.g., 5 pts
              const profit =
                model.pointsCost * USD_PER_POINT - model.internalCostUsd;

              return (
                <tr
                  key={model.modelId}
                  className="border-b border-gray-700 hover:bg-gray-800/50 transition"
                >
                  <td className="p-4">
                    <div className="text-sm font-bold text-white">
                      {model.description}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {model.modelId}
                    </div>
                    <div className="mt-1">
                      <Badge color="gray">{model.usageArea}</Badge>
                    </div>
                  </td>
                  <td className="p-4 text-right text-sm text-gray-300 font-mono">
                    ${model.internalCostUsd.toFixed(4)}
                  </td>
                  <td className="p-4 text-center">
                    <input
                      type="number"
                      min="1"
                      step="0.1"
                      value={model.chargeMultiplier}
                      onChange={(e) =>
                        handleMultiplierChange(model.modelId, e.target.value)
                      }
                      className="bg-gray-800 border border-gray-600 rounded-md p-1 w-16 text-sm text-white text-center focus:border-blue-500 focus:outline-none"
                    />
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-lg font-bold text-blue-400">
                      {model.pointsCost.toLocaleString()} pts
                    </div>
                    <div className="text-xs text-gray-500">
                      ≈ ${(model.pointsCost * USD_PER_POINT).toFixed(3)}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-sm font-medium text-green-400">
                      +${profit.toFixed(4)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// 3. DISCOUNT RULES VIEW (NEW!)
const DiscountManagement = ({ discounts, setDiscounts }) => {
  const toggleDiscount = (id) => {
    setDiscounts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d))
    );
  };

  const updateDiscountPercent = (id, val) => {
    setDiscounts((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, discountPercent: parseInt(val) || 0 } : d
      )
    );
  };

  const handleDelete = (id) => {
    if (confirm("Delete this rule?")) {
      setDiscounts((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const handleAdd = () => {
    const newRule = {
      id: Date.now().toString(),
      name: "New Discount Rule",
      type: "nft_ownership",
      target: "",
      discountPercent: 10,
      isActive: false,
    };
    setDiscounts([...discounts, newRule]);
  };

  return (
    <Card className="min-h-[600px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Tags className="w-6 h-6 text-purple-400" /> Discount Rules
        </h2>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Rule
        </button>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-800 p-4 rounded-lg mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
        <div>
          <h4 className="text-yellow-500 font-bold text-sm">
            How Discounts Apply
          </h4>
          <p className="text-gray-400 text-xs mt-1">
            Discounts are applied automatically at generation time. If a user
            matches multiple rules, the
            <strong> highest applicable discount</strong> will be used.
            Discounts apply to the Point Cost.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {discounts.map((rule) => (
          <div
            key={rule.id}
            className={`p-4 rounded-lg border flex flex-wrap items-center gap-4 transition ${
              rule.isActive
                ? "bg-gray-750 border-gray-600"
                : "bg-gray-800/50 border-gray-700 opacity-60"
            }`}
          >
            <div className="flex-grow min-w-[200px]">
              <input
                type="text"
                value={rule.name}
                onChange={(e) =>
                  setDiscounts((prev) =>
                    prev.map((d) =>
                      d.id === rule.id ? { ...d, name: e.target.value } : d
                    )
                  )
                }
                className="bg-transparent border-none text-white font-bold text-lg focus:ring-0 p-0 w-full"
              />
              <div className="flex items-center gap-2 mt-1">
                <select
                  value={rule.type}
                  onChange={(e) =>
                    setDiscounts((prev) =>
                      prev.map((d) =>
                        d.id === rule.id ? { ...d, type: e.target.value } : d
                      )
                    )
                  }
                  className="bg-gray-900 border border-gray-600 text-xs rounded text-gray-300 py-1 px-2"
                >
                  <option value="nft_ownership">NFT Ownership</option>
                  <option value="subscription">Subscription</option>
                  <option value="badge">Profile Badge</option>
                </select>
                <span className="text-gray-500 text-xs">Target ID:</span>
                <input
                  type="text"
                  value={rule.target}
                  onChange={(e) =>
                    setDiscounts((prev) =>
                      prev.map((d) =>
                        d.id === rule.id ? { ...d, target: e.target.value } : d
                      )
                    )
                  }
                  className="bg-gray-900 border border-gray-600 text-xs rounded text-gray-300 py-1 px-2 w-32"
                  placeholder="e.g. portal_pass"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase font-bold">
                  Discount
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={rule.discountPercent}
                    onChange={(e) =>
                      updateDiscountPercent(rule.id, e.target.value)
                    }
                    className="bg-gray-900 border border-gray-600 text-green-400 font-bold text-xl w-16 rounded p-1 text-center"
                  />
                  <span className="text-green-400 font-bold ml-1">%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pl-4 border-l border-gray-700">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={rule.isActive}
                    onChange={() => toggleDiscount(rule.id)}
                  />
                  <div
                    className={`block w-10 h-6 rounded-full ${
                      rule.isActive ? "bg-green-600" : "bg-gray-600"
                    }`}
                  ></div>
                  <div
                    className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
                      rule.isActive ? "transform translate-x-4" : ""
                    }`}
                  ></div>
                </div>
                <div className="ml-3 text-xs font-medium text-gray-400">
                  {rule.isActive ? "Active" : "Disabled"}
                </div>
              </label>
              <button
                onClick={() => handleDelete(rule.id)}
                className="text-red-500 hover:text-red-400 p-2 hover:bg-red-900/20 rounded"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => alert("Discount rules saved to Supabase!")}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Rules
        </button>
      </div>
    </Card>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

const AdminDashboard = () => {
  const [authReady, setAuthReady] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);
  const [activeView, setActiveView] = useState("users");

  // Data State
  const [users, setUsers] = useState(MOCK_USERS);
  const [discounts, setDiscounts] = useState(INITIAL_DISCOUNTS);
  const [pricing, setPricing] = useState(() =>
    INITIAL_PRICING_DATA.map((model) => ({
      ...model,
      pointsCost: calculatePointsCost(
        model.internalCostUsd,
        model.chargeMultiplier
      ),
    }))
  );

  if (!authReady)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
        Loading...
      </div>
    );
  if (!isAdmin)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
        Access Denied
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex-shrink-0 p-6 flex flex-col">
        <h1 className="text-xl font-extrabold text-white mb-2 tracking-tight">
          PERC <span className="text-blue-500">ADMIN</span>
        </h1>
        {/* <p className="text-xs text-gray-500 mb-8">v2.1.0 • Supabase</p> */}

        <nav className="space-y-2 flex-grow">
          <button
            onClick={() => setActiveView("users")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
              activeView === "users"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Users className="w-5 h-5" /> Users
          </button>
          <button
            onClick={() => setActiveView("pricing")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
              activeView === "pricing"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <CreditCard className="w-5 h-5" /> Pricing & Costs
          </button>
          <button
            onClick={() => setActiveView("discounts")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
              activeView === "discounts"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Tags className="w-5 h-5" /> Discounts
          </button>
        </nav>

        <div className="pt-6 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                Administrator
              </p>
              <p className="text-xs text-gray-500 truncate">admin@perc.com</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 px-4 py-2 rounded-lg text-sm transition">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeView === "users" && (
            <UserManagement users={users} setUsers={setUsers} />
          )}
          {activeView === "pricing" && (
            <PricingManagement pricing={pricing} setPricing={setPricing} />
          )}
          {activeView === "discounts" && (
            <DiscountManagement
              discounts={discounts}
              setDiscounts={setDiscounts}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
