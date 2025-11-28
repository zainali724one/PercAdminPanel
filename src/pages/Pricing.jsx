import React, { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import AdminLedger from "../components/AdminLedger";
import { TrendingUp, Save, Plus, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";

const USD_PER_POINT = 0.001;

const Pricing = () => {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_model_pricing")
        .select("*")
        .order("created_at", { ascending: true });

      if (data) {
        const formattedData = data.map((p) => ({
          ...p,
          charge_multiplier: parseFloat(p.charge_multiplier) || 5,
          internal_cost: parseFloat(p.internal_cost) || 0,
        }));
        setPricing(formattedData);
      }
    } catch (error) {
      console.error("Error fetching pricing:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModel = () => {
    setHasUnsavedChanges(true);
    const newModel = {
      id: `temp-${Date.now()}`,
      provider: "Tensor.art",
      model_id: "",
      description: "",
      internal_cost: 0.002,
      charge_multiplier: 5,
      points_cost: 10,
      usage_area: "AI Gen Bkgd",
    };
    setPricing([...pricing, newModel]);
  };

  const handleUpdateRow = (id, field, value) => {
    setHasUnsavedChanges(true);
    setPricing((prev) =>
      prev.map((model) => {
        if (model.id === id) {
          let updatedValue = value;
          if (field === "internal_cost" || field === "charge_multiplier") {
            updatedValue = parseFloat(value);
            if (isNaN(updatedValue)) updatedValue = 0;
          }
          const updatedModel = { ...model, [field]: updatedValue };
          if (field === "internal_cost" || field === "charge_multiplier") {
            const cost = parseFloat(updatedModel.internal_cost) || 0;
            const mult = parseFloat(updatedModel.charge_multiplier) || 1;
            updatedModel.points_cost = Math.ceil((cost / USD_PER_POINT) * mult);
          }
          return updatedModel;
        }
        return model;
      })
    );
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this pricing model?")) return;
    if (!id.toString().startsWith("temp-")) {
      const { error } = await supabase
        .from("ai_model_pricing")
        .delete()
        .eq("id", id);
      if (error) {
        alert("Error deleting from database.");
        return;
      }
    }
    setPricing((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
    const newRows = [];
    const existingRows = [];

    pricing.forEach((item) => {
      // Remove generated 'points_cost' and 'created_at' before saving
      const { points_cost, created_at, ...cleanItem } = item;

      if (item.id.toString().startsWith("temp-")) {
        // Remove temp 'id' for new rows so DB generates UUID
        const { id, ...insertPayload } = cleanItem;
        newRows.push(insertPayload);
      } else {
        // Keep 'id' for existing rows to update
        existingRows.push(cleanItem);
      }
    });

    try {
      const promises = [];
      if (existingRows.length > 0)
        promises.push(supabase.from("ai_model_pricing").upsert(existingRows));
      if (newRows.length > 0)
        promises.push(supabase.from("ai_model_pricing").insert(newRows));

      const results = await Promise.all(promises);
      const error = results.find((r) => r.error)?.error;

      if (!error) {
        alert("Pricing saved successfully!");
        setHasUnsavedChanges(false);
        fetchPricing();
      } else {
        throw error;
      }
    } catch (error) {
      console.error("Supabase Save Error:", error);
      alert(`Error saving: ${error.message}`);
    }
  };

  if (loading)
    return <div className="p-8 text-white">Loading pricing data...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      <h2 className="text-3xl font-bold mb-6">Financials</h2>
      <AdminLedger />
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="text-green-400" /> Model Pricing Strategy
            </h3>
            <div className="text-xs text-gray-400 mt-1">
              1 Point = ${USD_PER_POINT} USD (Fixed)
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddModel}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition"
            >
              <Plus size={16} /> Add Model
            </button>
            {hasUnsavedChanges && (
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 shadow-lg shadow-green-900/20 animate-pulse transition"
              >
                <Save size={16} /> Save Changes
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="min-w-full text-left bg-gray-900/50">
            <thead>
              <tr className="text-gray-400 uppercase text-xs bg-gray-800 border-b border-gray-700">
                <th className="p-4 w-32">Provider</th>
                <th className="p-4 min-w-[200px]">Model Info (Name & ID)</th>
                <th className="p-4 text-right w-32">Your Cost (USD)</th>
                <th className="p-4 text-center w-24">Markup</th>
                <th className="p-4 text-right w-32">User Price</th>
                <th className="p-4 text-right w-24">Profit</th>
                <th className="p-4 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {pricing.map((model) => (
                <tr
                  key={model.id}
                  className="border-b border-gray-700 hover:bg-gray-800/50 transition group"
                >
                  <td className="p-4 align-top">
                    <select
                      value={model.provider}
                      onChange={(e) =>
                        handleUpdateRow(model.id, "provider", e.target.value)
                      }
                      className="bg-gray-800 border border-gray-600 text-xs rounded p-1 w-full text-white focus:border-blue-500 outline-none"
                    >
                      <option value="Tensor.art">Tensor.art</option>
                      <option value="Replicate">Replicate</option>
                      <option value="Other">Other</option>
                    </select>
                  </td>
                  <td className="p-4 align-top">
                    <input
                      type="text"
                      value={model.description}
                      onChange={(e) =>
                        handleUpdateRow(model.id, "description", e.target.value)
                      }
                      className="bg-transparent border-b border-transparent hover:border-gray-600 focus:border-blue-500 text-sm font-bold text-white w-full outline-none mb-1 placeholder-gray-600"
                      placeholder="e.g. Flux Schnell"
                    />
                    <input
                      type="text"
                      value={model.model_id}
                      onChange={(e) =>
                        handleUpdateRow(model.id, "model_id", e.target.value)
                      }
                      className="bg-transparent text-xs text-gray-500 font-mono w-full outline-none hover:text-gray-300 placeholder-gray-700"
                      placeholder="API Model ID"
                    />
                    <input
                      type="text"
                      value={model.usage_area}
                      onChange={(e) =>
                        handleUpdateRow(model.id, "usage_area", e.target.value)
                      }
                      className="bg-gray-800/50 text-[10px] text-gray-400 px-1 rounded mt-1 w-24 outline-none focus:bg-gray-800 placeholder-gray-600"
                      placeholder="Category"
                    />
                  </td>
                  <td className="p-4 align-top text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-gray-500 text-sm">$</span>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={model.internal_cost}
                        onChange={(e) =>
                          handleUpdateRow(
                            model.id,
                            "internal_cost",
                            e.target.value
                          )
                        }
                        className="bg-gray-800 border border-gray-600 rounded w-24 text-right text-sm text-green-300 font-mono focus:border-blue-500 outline-none p-1"
                      />
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      Base Cost
                    </div>
                  </td>
                  <td className="p-4 align-top text-center">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={model.charge_multiplier}
                      onChange={(e) =>
                        handleUpdateRow(
                          model.id,
                          "charge_multiplier",
                          e.target.value
                        )
                      }
                      className="bg-gray-800 border border-gray-600 rounded w-16 text-center text-sm text-white focus:border-blue-500 outline-none p-1"
                    />
                    <div className="text-[10px] text-gray-500 mt-1">
                      x Multiplier
                    </div>
                  </td>
                  <td className="p-4 align-top text-right">
                    <div className="text-lg font-bold text-blue-400">
                      {(model.points_cost || 0).toLocaleString()}{" "}
                      <span className="text-xs">pts</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      ≈ ${(model.points_cost * USD_PER_POINT).toFixed(3)}
                    </div>
                  </td>
                  <td className="p-4 align-top text-right">
                    <div
                      className={`text-sm font-medium ${
                        model.points_cost * USD_PER_POINT -
                          model.internal_cost >
                        0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {model.points_cost * USD_PER_POINT - model.internal_cost >
                      0
                        ? "+"
                        : ""}
                      $
                      {(
                        model.points_cost * USD_PER_POINT -
                        model.internal_cost
                      ).toFixed(4)}
                    </div>
                  </td>
                  <td className="p-4 align-middle text-center">
                    <button
                      onClick={() => handleDelete(model.id)}
                      className="text-gray-600 hover:text-red-500 transition p-2 rounded hover:bg-red-900/20 opacity-0 group-hover:opacity-100"
                      title="Delete Model"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Pricing;
