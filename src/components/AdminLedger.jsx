import React, { useState, useEffect } from "react";
import { Server, PlusCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

const AdminLedger = () => {
  const [balances, setBalances] = useState({
    tensor_balance: 0,
    replicate_balance: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchBalances = async () => {
    const { data } = await supabase
      .from("admin_config")
      .select("key, value")
      .in("key", ["tensor_balance", "replicate_balance"]);

    if (data) {
      const newBal = {};
      data.forEach((item) => (newBal[item.key] = item.value));
      setBalances((prev) => ({ ...prev, ...newBal }));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const handleTopUp = async (key, amount) => {
    const currentVal = parseFloat(balances[key] || 0);
    const newVal = currentVal + amount;

    const { error } = await supabase
      .from("admin_config")
      .upsert({ key: key, value: newVal, updated_at: new Date() });

    if (!error) {
      setBalances((prev) => ({ ...prev, [key]: newVal }));
      alert("Balance updated!");
    }
  };

  if (loading)
    return (
      <div className="animate-pulse h-24 bg-gray-800 rounded-lg mb-8"></div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="bg-gray-800 border border-gray-700 p-5 rounded-xl shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
          <Server className="w-16 h-16 text-blue-400" />
        </div>
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
          Tensor.art Credits
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-mono font-bold text-white">
            {parseInt(balances.tensor_balance || 0).toLocaleString()}
          </span>
          <span className="text-xs text-gray-500">credits</span>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => handleTopUp("tensor_balance", 1000)}
            className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-xs text-white px-3 py-1.5 rounded border border-gray-600 transition"
          >
            <PlusCircle className="w-3 h-3" /> 1k
          </button>
        </div>
      </div>
      <div className="bg-gray-800 border border-gray-700 p-5 rounded-xl shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
          <Server className="w-16 h-16 text-purple-400" />
        </div>
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
          Replicate Reserve
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-mono font-bold text-white">
            ${parseFloat(balances.replicate_balance || 0).toFixed(2)}
          </span>
          <span className="text-xs text-gray-500">USD</span>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => handleTopUp("replicate_balance", 10)}
            className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-xs text-white px-3 py-1.5 rounded border border-gray-600 transition"
          >
            <PlusCircle className="w-3 h-3" /> $10
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLedger;
