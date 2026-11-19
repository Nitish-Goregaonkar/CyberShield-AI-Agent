import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ScatterChart, Scatter, BarChart, Bar, Tooltip, ResponsiveContainer } from 'recharts';

export default function MLLab() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/ml-lab')
      .then(res => res.json())
      .then(d => setData(d));
  }, []);

  if (!data) return <div className="text-purple-400 p-10 flex justify-center">Running All Algorithms & Calculating Math...</div>;
  if (data.error) return <div className="text-red-500 p-10">Error: {data.error}</div>;

  return (
    <div className="p-6 h-full overflow-y-auto no-scrollbar space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">ML Lab Analytics</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Linear Regression vs Logistic */}
        <div className="bg-[#150f24] border border-white/10 p-5 rounded-2xl">
          <h2 className="text-purple-400 font-semibold mb-2">1. Why Linear Regression Fails</h2>
          <p className="text-xs text-gray-400 mb-4">Raw predictions from Linear Regression:</p>
          <div className="text-sm font-mono text-fuchsia-300 bg-[#0e0a17] p-3 rounded-lg">
            {data.linear_reg_fail?.map((p: number) => p.toFixed(2)).join(', ')}
          </div>
          <p className="text-xs text-gray-500 mt-2">Notice the numbers exceed 1 and go below 0. This is why we need the Logistic Sigmoid function.</p>
        </div>

        {/* 2. Logistic Regression (Sigmoid Curve) */}
        <div className="bg-[#150f24] border border-white/10 p-5 rounded-2xl">
          <h2 className="text-purple-400 font-semibold mb-2">2. Logistic Regression (Sigmoid)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data.sigmoid?.x.map((x: number, i: number) => ({ x, y: data.sigmoid.y[i] }))}>
              <XAxis dataKey="x" stroke="#666" /><YAxis stroke="#666" />
              <Line type="monotone" dataKey="y" stroke="#8884d8" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 3. MLP Loss Curve */}
        <div className="bg-[#150f24] border border-white/10 p-5 rounded-2xl">
          <h2 className="text-purple-400 font-semibold mb-2">3. MLP Backpropagation Loss</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data.loss_curve?.map((loss: number, i: number) => ({ epoch: i, loss }))}>
              <XAxis dataKey="epoch" stroke="#666" /><YAxis stroke="#666" />
              <Line type="monotone" dataKey="loss" stroke="#ff7300" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 4. PCA Scatter Plot */}
        <div className="bg-[#150f24] border border-white/10 p-5 rounded-2xl">
          <h2 className="text-purple-400 font-semibold mb-2">4. Feature Reduction (PCA)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <ScatterChart>
              <XAxis dataKey="x" type="number" stroke="#666" /><YAxis dataKey="y" type="number" stroke="#666" />
              <Scatter name="Data" data={data.pca} fill="#d946ef" opacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* 5. PAC Learning Curve */}
        <div className="bg-[#150f24] border border-white/10 p-5 rounded-2xl">
          <h2 className="text-purple-400 font-semibold mb-2">5. PAC Learning (Sample Complexity)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data.pac?.sizes.map((size: number, i: number) => ({ size, train: data.pac.train[i], test: data.pac.test[i] }))}>
              <XAxis dataKey="size" stroke="#666" /><YAxis stroke="#666" />
              <Line type="monotone" dataKey="train" stroke="#8884d8" name="Training" />
              <Line type="monotone" dataKey="test" stroke="#82ca9d" name="Validation" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 6. Ensemble Feature Importance */}
        <div className="bg-[#150f24] border border-white/10 p-5 rounded-2xl">
          <h2 className="text-purple-400 font-semibold mb-2">6. Ensemble Feature Importance</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.top_words} layout="vertical">
              <XAxis type="number" stroke="#666" /><YAxis dataKey="word" type="category" stroke="#666" width={80} />
              <Bar dataKey="score" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 7. Decision Tree Logic */}
        <div className="bg-[#150f24] border border-white/10 p-5 rounded-2xl col-span-1 lg:col-span-2">
          <h2 className="text-purple-400 font-semibold mb-2">7. Decision Tree Mathematical Rules</h2>
          <pre className="text-xs bg-[#0e0a17] text-green-400 p-4 rounded-lg overflow-x-auto">
            {data.tree_rules}
          </pre>
        </div>

      </div>
    </div>
  );
}