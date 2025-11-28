import React, { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { ShoppingBag, Plus, Trash2, Save } from "lucide-react";
import { supabase } from "../lib/supabase";

const PurchasePlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("point_packages")
        .select("*")
        .order("price_usd", { ascending: true });

      if (error) throw error;
      if (data) setPlans(data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = () => {
    setHasUnsavedChanges(true);
    const newPlan = {
      id: `temp-${Date.now()}`,
      name: "New Bundle",
      points_amount: 1000,
      price_usd: 1.0,
      is_active: true,
    };
    setPlans([...plans, newPlan]);
  };

  const handleUpdateRow = (id, field, value) => {
    setHasUnsavedChanges(true);
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id === id) {
          if (field === "points_amount") value = parseInt(value) || 0;
          if (field === "price_usd") value = parseFloat(value) || 0;
          return { ...plan, [field]: value };
        }
        return plan;
      })
    );
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this package?")) return;
    if (!id.toString().startsWith("temp-")) {
      const { error } = await supabase
        .from("point_packages")
        .delete()
        .eq("id", id);
      if (error) return alert("Error deleting from database.");
    }
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
    const recordsToSave = plans.map(({ id, created_at, ...rest }) => {
      if (id.toString().startsWith("temp-")) return rest;
      return { id, ...rest };
    });

    const { error } = await supabase
      .from("point_packages")
      .upsert(recordsToSave);
    if (!error) {
      alert("Plans updated successfully!");
      setHasUnsavedChanges(false);
      fetchPlans();
    } else {
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading plans...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto text-white">
      <Card className="min-h-[600px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="text-yellow-400" /> Point Packages
          </h2>
          <div className="flex gap-3">
            <button
              onClick={handleAddPlan}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition"
            >
              <Plus size={16} /> Add Package
            </button>
            {hasUnsavedChanges && (
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-green-900/20 animate-pulse"
              >
                <Save size={16} /> Save Changes
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          {plans.map((plan) => {
            const costPerPoint = plan.price_usd / plan.points_amount;
            const isGoodDeal = costPerPoint <= 0.001;

            return (
              <div
                key={plan.id}
                className={`p-4 rounded-lg border flex flex-wrap items-center gap-4 transition ${
                  plan.is_active
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-900 border-gray-800 opacity-60"
                }`}
              >
                <div className="flex-grow min-w-[200px]">
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) =>
                      handleUpdateRow(plan.id, "name", e.target.value)
                    }
                    className="bg-transparent border-none text-white font-bold text-lg w-full focus:ring-0 placeholder-gray-600"
                    placeholder="Package Name"
                  />
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={plan.is_active}
                      onChange={(e) =>
                        handleUpdateRow(plan.id, "is_active", e.target.checked)
                      }
                      className="rounded bg-gray-700 border-gray-600 text-blue-600"
                    />
                    <span className="text-xs text-gray-400">
                      {plan.is_active
                        ? "Active & Visible"
                        : "Hidden from Store"}
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-6 bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase mb-1">
                      Points
                    </div>
                    <input
                      type="number"
                      value={plan.points_amount}
                      onChange={(e) =>
                        handleUpdateRow(
                          plan.id,
                          "points_amount",
                          e.target.value
                        )
                      }
                      className="bg-gray-800 border border-gray-600 w-24 text-center text-white font-bold rounded p-1"
                    />
                  </div>
                  <div className="text-gray-600 font-bold text-xl">=</div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase mb-1">
                      Price (USD)
                    </div>
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-gray-400 text-xs">
                        $
                      </span>
                      <input
                        type="number"
                        value={plan.price_usd}
                        step="0.01"
                        onChange={(e) =>
                          handleUpdateRow(plan.id, "price_usd", e.target.value)
                        }
                        className="bg-gray-800 border border-gray-600 w-24 text-center text-green-400 font-bold rounded p-1 pl-4"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-32 text-right">
                  <div className="text-xs text-gray-500">Cost per Point</div>
                  <div
                    className={`font-mono text-sm ${
                      isGoodDeal ? "text-blue-400" : "text-yellow-500"
                    }`}
                  >
                    ${costPerPoint.toFixed(5)}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(plan.id)}
                  className="p-2 hover:bg-red-900/20 rounded text-gray-500 hover:text-red-400 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default PurchasePlans;
