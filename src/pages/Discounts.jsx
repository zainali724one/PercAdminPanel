import React, { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Tags, Plus, Trash2, Save } from "lucide-react";
import { supabase } from "../lib/supabase";

const Discounts = () => {
  const [discounts, setDiscounts] = useState([]);

  useEffect(() => {
    const fetchDiscounts = async () => {
      const { data } = await supabase.from("discount_rules").select("*");
      if (data) setDiscounts(data);
    };
    fetchDiscounts();
  }, []);

  const updateLocalRule = (id, field, value) => {
    setDiscounts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleSave = async () => {
    const { error } = await supabase.from("discount_rules").upsert(discounts);
    if (!error) alert("Rules saved!");
  };

  const handleAdd = () => {
    const newRule = {
      // Temporary ID until saved
      id: Math.random(),
      name: "New Rule",
      type: "nft_ownership",
      target: "",
      discount_percent: 10,
      is_active: false,
    };
    setDiscounts([...discounts, newRule]);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete rule?")) {
      await supabase.from("discount_rules").delete().eq("id", id);
      setDiscounts((prev) => prev.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-white">
      <Card className="min-h-[600px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Tags className="text-purple-400" /> Discount Rules
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="bg-blue-600 px-4 py-2 rounded font-bold flex items-center gap-2"
            >
              <Plus size={16} /> Add
            </button>
            <button
              onClick={handleSave}
              className="bg-green-600 px-4 py-2 rounded font-bold flex items-center gap-2"
            >
              <Save size={16} /> Save
            </button>
          </div>
        </div>
        <div className="grid gap-4">
          {discounts.map((rule) => (
            <div
              key={rule.id}
              className="p-4 rounded-lg border border-gray-700 bg-gray-800/50 flex flex-wrap items-center gap-4"
            >
              <div className="flex-grow">
                <input
                  type="text"
                  value={rule.name}
                  onChange={(e) =>
                    updateLocalRule(rule.id, "name", e.target.value)
                  }
                  className="bg-transparent border-none text-white font-bold text-lg w-full focus:ring-0"
                />
                <div className="flex gap-2 mt-2">
                  <select
                    value={rule.type}
                    onChange={(e) =>
                      updateLocalRule(rule.id, "type", e.target.value)
                    }
                    className="bg-gray-900 border border-gray-600 text-xs rounded text-gray-300 p-1"
                  >
                    <option value="nft_ownership">NFT</option>
                    <option value="subscription">Sub</option>
                  </select>
                  <input
                    type="text"
                    value={rule.target}
                    placeholder="Target ID"
                    onChange={(e) =>
                      updateLocalRule(rule.id, "target", e.target.value)
                    }
                    className="bg-gray-900 border border-gray-600 text-xs rounded text-gray-300 p-1 w-32"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={rule.discount_percent}
                  onChange={(e) =>
                    updateLocalRule(
                      rule.id,
                      "discount_percent",
                      parseInt(e.target.value)
                    )
                  }
                  className="bg-gray-900 border border-gray-600 w-16 text-center text-green-400 font-bold rounded"
                />
                <span className="text-green-400 font-bold">%</span>
              </div>
              <div className="flex items-center gap-4 pl-4 border-l border-gray-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.is_active}
                    onChange={(e) =>
                      updateLocalRule(rule.id, "is_active", e.target.checked)
                    }
                  />
                  <span className="text-xs text-gray-400">Active</span>
                </label>
                <button onClick={() => handleDelete(rule.id)}>
                  <Trash2 className="text-red-500 w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Discounts;
