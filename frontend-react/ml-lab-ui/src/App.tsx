import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, LineChart as LineChartIcon, Network, Layers, Target, 
  Database, ArrowLeft, Sparkles, GitCommit, GitBranch, Shuffle, Activity, Play, Sliders, PieChart, ShieldAlert
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ScatterChart, Scatter, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Tree from 'react-d3-tree';

const ALGORITHMS = [
  { id: 'datasets', title: 'Dataset Analysis', icon: <PieChart /> },
  { id: 'linear', title: 'Linear Regression', icon: <ArrowLeft /> },
  { id: 'logistic', title: 'Logistic Regression', icon: <LineChartIcon /> },
  { id: 'knn', title: 'K-Nearest Neighbors', icon: <Shuffle /> },
  { id: 'bayes', title: 'Naive Bayes', icon: <Target /> },
  { id: 'svm', title: 'Kernel SVM', icon: <Activity /> },
  { id: 'perceptron', title: 'Perceptron', icon: <GitCommit /> },
  { id: 'mlp', title: 'Neural Network (MLP)', icon: <Network /> },
  { id: 'tree', title: 'Decision Tree', icon: <GitBranch /> },
  { id: 'ensemble', title: 'Random Forest', icon: <Database /> },
  { id: 'pca', title: 'TruncatedSVD', icon: <Layers /> },
  { id: 'pac', title: 'PAC Learning', icon: <Target /> }
];

const MetricsPanel = ({ train, test }: any) => {
  if (!train || !test) return null;
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {['accuracy', 'precision', 'recall', 'f1'].map(metric => (
        <div key={metric} className="bg-black/40 p-3 rounded-xl border border-white/5">
          <p className="text-xs text-gray-400 capitalize mb-2">{metric}</p>
          <div className="flex justify-between text-sm">
            <span className="text-blue-400">Train: {(train[metric] * 100).toFixed(1)}%</span>
            <span className="text-green-400">Test: {(test[metric] * 100).toFixed(1)}%</span>
          </div>
          <div className="flex h-1 mt-2 rounded overflow-hidden">
            <div className="bg-blue-400" style={{ width: `${train[metric] * 100}%` }}></div>
            <div className="bg-green-400" style={{ width: `${test[metric] * 100}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const getAlgoExplanation = (algoId: string) => {
  switch (algoId) {
    case 'logistic':
      return {
        formula: "P(y=1) = \\frac{1}{1 + e^{-(W \\cdot X)}}",
        text: "Logistic Regression uses the Sigmoid function to output a probability. It draws a linear decision boundary. If the Test score is significantly lower than Train, it means the linear boundary is too simple and is overfitting to the training noise."
      };
    case 'knn':
      return {
        formula: "d(x, y) = \\sqrt{\\sum_{i=1}^{n} (x_i - y_i)^2}",
        text: "K-Nearest Neighbors classifies based on local similarity (Euclidean distance). If K is too small (e.g., K=5), it memorizes noise, leading to high Train accuracy but lower Test accuracy (Overfitting)."
      };
    case 'bayes':
      return {
        formula: "P(Spam|Words) = \\frac{P(Words|Spam) \\cdot P(Spam)}{P(Words)}",
        text: "Naive Bayes assumes all features are independent. Because TF-IDF words are often correlated in spam (e.g., 'bank' and 'account'), the independence assumption is violated, which can cause overconfidence and overfitting."
      };
    case 'svm':
      return {
        formula: "K(x, y) = \\exp(-\\gamma ||x - y||^2)",
        text: "Kernel SVM maps data to higher dimensions. If the regularization parameter (C) is too high, it aggressively tries to separate every point, perfectly memorizing the Train data but failing to generalize to Test data."
      };
    case 'perceptron':
      return {
        formula: "w_{new} = w_{old} + \\eta (y - \\hat{y}) x",
        text: "The Perceptron updates weights only on misclassification. If the data is not perfectly linearly separable, it will keep updating weights to force a fit, leading to overfitting on the training set."
      };
    case 'mlp':
      return {
        formula: "\\theta_{new} = \\theta_{old} - \\alpha \\nabla J(\\theta)",
        text: "Neural Networks (MLPs) are highly expressive. They memorize training data easily if there is no regularization or if the network is too deep. The gap between Train and Test proves it learned specific patterns rather than general rules."
      };
    case 'tree':
      return {
        formula: "Gini = 1 - \\sum p_i^2",
        text: "Decision Trees split data to maximize purity. Without pruning, they grow until every leaf is pure, perfectly memorizing the training set (100% Train accuracy). This makes them highly prone to overfitting."
      };
    case 'ensemble':
      return {
        formula: "\\text{Importance} = \\frac{\\text{Weighted Impurity Decrease}}{\\text{Total Samples}}",
        text: "Random Forest uses Bagging to average multiple trees. This reduces the variance and overfitting of single Decision Trees. The Train and Test scores are usually closer together, proving it generalizes better."
      };
    default:
      return { formula: "", text: "" };
  }
};

const getMetricInterpretation = (algoId: string) => {
  switch (algoId) {
    case 'logistic': return "Linear models often show a noticeable gap if the spam data has non-linear patterns (like combinations of words). Look at the Test Recall: if it's low, the linear boundary is missing some scams.";
    case 'knn': return "If Test accuracy is much lower than Train, K (neighbors) might be too small, causing it to memorize noise. Increasing K can smooth the boundary and improve Test performance.";
    case 'bayes': return "Naive Bayes is very fast but can be overconfident. If Train accuracy is near 100% but Test is lower, it means the independence assumption (treating every word separately) doesn't hold up well on unseen text.";
    case 'svm': return "Kernel SVMs are powerful but can overfit if the margin is too strict. A large gap between Train and Test suggests the model is drawing overly complex boundaries around the spam data.";
    case 'perceptron': return "Perceptrons are highly sensitive to noise. They often reach 100% on Train data but fail on Test data because they don't have a margin concept—they just find any line that separates the data.";
    case 'mlp': return "Deep Neural Networks easily overfit. If Train accuracy is very high and Test recall drops, it means the network memorized the training phrases but failed to learn generalizable spam patterns. Dropout or regularization would fix this.";
    case 'tree': return "Decision Trees are notorious for overfitting. A Train score of 100% with a much lower Test score means the tree created rules so specific that they only apply to the training data, not real-world spam.";
    case 'ensemble': return "Random Forest is designed to combat overfitting. You should see the Train and Test scores much closer together compared to a single Decision Tree. If Test Recall is high, it means the forest successfully generalized the spam patterns.";
    default: return "";
  }
};

export default function App() {
  const [data, setData] = useState<any>(null);
  const [datasetData, setDatasetData] = useState<any>(null);
  const [datasetLoading, setDatasetLoading] = useState(false);
  const [selectedAlgo, setSelectedAlgo] = useState('logistic');
  const [loading, setLoading] = useState(true);
  
  const [testMessage, setTestMessage] = useState("Congratulations! Claim your free prize now.");
  const [prediction, setPrediction] = useState<any>(null);
  const [threshold, setThreshold] = useState(0.5);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    fetch('http://127.0.0.1:8000/api/ml-lab')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedAlgo === 'datasets' && !datasetData && !datasetLoading) {
      setDatasetLoading(true);
      fetch('http://127.0.0.1:8000/api/ml-lab/datasets')
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch datasets");
          return res.json();
        })
        .then(d => {
          setDatasetData(d);
          setDatasetLoading(false);
        })
        .catch(err => {
          console.error(err);
          setDatasetLoading(false);
        });
    }
  }, [selectedAlgo, datasetData, datasetLoading]);

  const handlePredict = async () => {
    setPrediction({ loading: true });
    try {
      const res = await fetch('http://127.0.0.1:8000/api/ml-lab/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testMessage, algorithm: selectedAlgo })
      });
      const result = await res.json();
      setPrediction(result);
    } catch (e) {
      setPrediction({ error: "Prediction failed. Is backend running?" });
    }
  };

  const calculateThresholdMetrics = () => {
    if (!data?.logistic?.test_probs) return null;
    let tp = 0, fp = 0, tn = 0, fn = 0;
    data.logistic.test_probs.forEach((prob: number, i: number) => {
      const actual = data.logistic.test_actuals[i];
      const pred = prob >= threshold ? 1 : 0;
      if (actual === 1 && pred === 1) tp++;
      else if (actual === 1 && pred === 0) fn++;
      else if (actual === 0 && pred === 1) fp++;
      else tn++;
    });
    return { tp, fp, tn, fn };
  };

  const exp = getAlgoExplanation(selectedAlgo);
  const metricInterpretation = getMetricInterpretation(selectedAlgo);

  const linearGraphData = data?.linear?.predictions.map((pred: number, i: number) => ({
    actual: data.linear.actuals[i],
    predicted: pred
  })) || [];

  return (
    <div className="flex h-screen w-full bg-[#08050e] text-gray-100 font-sans overflow-hidden">
      <div className="flex w-full h-full p-4 gap-4">
        
        {/* SIDEBAR */}
        <aside className="w-72 bg-[#0e0a17] border border-white/[0.07] rounded-3xl p-5 flex flex-col gap-2 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">ThreatSense ML Engine</h1>
          </div>

          {data?.dataset_info && (
            <div className="bg-purple-900/20 border border-purple-500/30 p-3 rounded-xl mb-4 text-xs">
              <p className="text-purple-300 font-semibold mb-1">Dataset Pipeline</p>
              <p className="text-gray-400">Total: {data.dataset_info.total}</p>
              <p className="text-gray-400">Train: {data.dataset_info.train} | Test: {data.dataset_info.test}</p>
              <p className="text-gray-400">Features: {data.dataset_info.features}</p>
            </div>
          )}

          {ALGORITHMS.map(algo => (
            <button
              key={algo.id}
              onClick={() => { setSelectedAlgo(algo.id); setPrediction(null); setSelectedNode(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all ${
                selectedAlgo === algo.id 
                  ? 'bg-purple-600/20 border border-purple-500/50 text-purple-300' 
                  : 'hover:bg-white/5 text-gray-400 border border-transparent'
              }`}
            >
              <div className={selectedAlgo === algo.id ? 'text-purple-400' : 'text-gray-500'}>
                {algo.icon}
              </div>
              <div className="text-sm font-semibold">{algo.title}</div>
            </button>
          ))}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 bg-[#0b0714] border border-white/[0.07] rounded-3xl p-8 overflow-y-auto">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-purple-400 gap-4">
              <Sparkles className="w-10 h-10 animate-spin" />
              <p>Training Models & Fixing Leakage...</p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-8 pb-10">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-3xl font-bold text-white">{ALGORITHMS.find(a => a.id === selectedAlgo)?.title}</h2>
              </div>

              {/* 1. DATASET ANALYSIS TAB */}
              {selectedAlgo === 'datasets' && (
                <>
                  {datasetLoading && (
                    <div className="flex justify-center items-center h-64 text-purple-400">
                      <Sparkles className="w-8 h-8 animate-spin mr-3" /> 
                      <span>Analyzing Datasets & Running Cross-Dataset Experiments...</span>
                    </div>
                  )}

                  {!datasetLoading && !datasetData && (
                    <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-2xl text-red-400">
                      <p className="font-bold mb-2">Failed to load Dataset Analysis</p>
                      <p className="text-sm">Please ensure the backend is running and the endpoint `/api/ml-lab/datasets` is accessible.</p>
                    </div>
                  )}

                  {!datasetLoading && datasetData && datasetData.stats && (
                    <div className="space-y-8">
                      <div className="bg-[#150f24] border border-white/10 p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
                          <Database className="w-5 h-5" /> Dataset Composition & Quality Audit
                        </h3>
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                              <th className="py-3 px-4">Dataset</th>
                              <th className="py-3 px-4">Total</th>
                              <th className="py-3 px-4">Safe</th>
                              <th className="py-3 px-4">Spam</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {['SMS', 'Validation', 'NLP', 'Combined'].map((key) => (
                              <tr key={key} className={`border-b border-white/5 ${key === 'Combined' ? 'bg-purple-900/20 font-bold' : ''}`}>
                                <td className="py-3 px-4 text-white">{key}</td>
                                <td className="py-3 px-4 text-gray-300">{datasetData.stats[key]?.total || 0}</td>
                                <td className="py-3 px-4 text-green-400">{datasetData.stats[key]?.safe || 0}</td>
                                <td className="py-3 px-4 text-red-400">{datasetData.stats[key]?.spam || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="mt-6 flex gap-4">
                          <div className="flex-1 bg-yellow-900/20 border border-yellow-500/30 p-3 rounded-xl text-xs">
                            <p className="text-yellow-400 font-bold mb-1">Duplicates</p>
                            <p className="text-gray-300">{datasetData.stats.Combined?.duplicates || 0} found.</p>
                          </div>
                          <div className="flex-1 bg-red-900/20 border border-red-500/30 p-3 rounded-xl text-xs">
                            <p className="text-red-400 font-bold mb-1">Imbalance</p>
                            <p className="text-gray-300">{((datasetData.stats.Combined?.imbalance_ratio || 0) * 100).toFixed(1)}% malicious.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[#150f24] border border-white/10 p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-purple-300 mb-2 flex items-center gap-2">
                          <ShieldAlert className="w-5 h-5" /> Cross-Dataset Generalization
                        </h3>
                        <p className="text-sm text-gray-400 mb-6">Train on two datasets and test on the completely unseen third dataset to prove the model learned concepts, not just specific data.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          {datasetData.experiments?.map((exp: any, i: number) => (
                            <div key={i} className="bg-black/40 p-4 rounded-xl border border-white/10">
                              <p className="text-xs text-gray-400 mb-2">Train: <span className="text-white">{exp.train}</span> | Test: <span className="text-white">{exp.test}</span></p>
                              <div className="flex justify-between mt-2">
                                <div><p className="text-xs text-gray-500">Accuracy</p><p className="text-xl font-bold text-green-400">{(exp.accuracy * 100).toFixed(1)}%</p></div>
                                <div><p className="text-xs text-gray-500">F1 Score</p><p className="text-xl font-bold text-blue-400">{(exp.f1 * 100).toFixed(1)}%</p></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 2. PREDICTION EXPLAINABILITY LAB */}
              {['logistic', 'tree', 'ensemble', 'mlp'].includes(selectedAlgo) && (
                <div className="bg-[#150f24] border border-white/10 p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-purple-300 mb-2 flex items-center gap-2">
                    <Sliders className="w-5 h-5" /> Prediction & Feature Ablation Lab
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">Enter a message. The system will extract actual TF-IDF features and show you why the model made its decision.</p>
                  <div className="flex gap-4 mb-4">
                    <input 
                      type="text" 
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                    <button onClick={handlePredict} className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-lg font-semibold flex items-center gap-2">
                      <Play className="w-4 h-4" /> Run
                    </button>
                  </div>
                  {prediction?.loading && <p className="text-purple-400 text-sm animate-pulse">Running inference...</p>}
                  {prediction?.error && <p className="text-red-400 text-sm">{prediction.error}</p>}
                  {prediction && !prediction.loading && !prediction.error && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-black/40 p-4 rounded-xl border border-purple-500/30 flex flex-col justify-center">
                        <p className="text-gray-400 text-sm">Final Prediction</p>
                        <p className="text-3xl font-bold text-white mt-1">{prediction.prediction}</p>
                        <p className="text-fuchsia-400 text-sm mt-2">Probability: {(prediction.probability * 100).toFixed(2)}%</p>
                      </div>
                      <div className="bg-black/40 p-4 rounded-xl border border-white/10 text-xs">
                        <p className="text-purple-300 font-semibold mb-2">Feature Ablation Impact (Why?)</p>
                        {prediction.contributions && prediction.contributions.map((c: any, i: number) => (
                          <div key={i} className="flex justify-between mb-1">
                            <span className="text-gray-300">Word: <strong className="text-white">{c.word}</strong></span>
                            <span className={c.impact > 0 ? 'text-red-400' : 'text-green-400'}>{c.impact > 0 ? '+ ' : '- '}{Math.abs(c.impact).toFixed(3)}</span>
                          </div>
                        ))}
                        {prediction.decision_path && prediction.decision_path.map((p: any, i: number) => (
                          <div key={i} className="text-gray-300 mb-1">Step {i+1}: <span className="text-white font-mono">{p.rule}</span></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. METRICS & OVERFITTING ANALYSIS */}
              {!['linear', 'datasets', 'pca', 'pac'].includes(selectedAlgo) && data[selectedAlgo] && (
                <div className="bg-[#150f24] border border-white/10 p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-purple-300 mb-4">Generalization Analysis (Train vs Test)</h3>
                  
                  {exp.formula && (
                    <div className="mb-6">
                      <div className="bg-black/40 p-4 rounded-xl text-center mb-4 border border-white/5">
                        <BlockMath math={exp.formula} />
                      </div>
                      <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl text-xs text-blue-200">
                        <p><strong>Algorithm Mechanics:</strong> {exp.text}</p>
                      </div>
                    </div>
                  )}

                  <MetricsPanel train={data[selectedAlgo].train} test={data[selectedAlgo].test} />

                  <div className="mt-4 bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl text-xs text-indigo-200">
                    <p className="mb-2"><strong>What do these numbers mean?</strong> If the Train score is very high (e.g., 99%) but the Test score is much lower (e.g., 85%), your model is <strong>Overfitting</strong>—it memorized the training data but failed to learn general patterns. For cybersecurity, a high <strong>Test Recall</strong> (catching spam) is more important than a perfect Train score.</p>
                    <p className="border-t border-indigo-500/30 pt-2 mt-2"><strong>What this means for {ALGORITHMS.find(a => a.id === selectedAlgo)?.title}:</strong> {metricInterpretation}</p>
                  </div>
                </div>
              )}

              {/* 4. LOGISTIC THRESHOLD, K-FOLD, ROC & PR CURVE */}
              {selectedAlgo === 'logistic' && data.curves && (
                <>
                  {/* 5-FOLD CROSS VALIDATION */}
                  {data.logistic?.kfold && (
                    <div className="bg-[#150f24] border border-white/10 p-6 rounded-2xl mb-6">
                      <h3 className="text-lg font-semibold text-purple-300 mb-2">5-Fold Cross-Validation</h3>
                      <p className="text-xs text-gray-400 mb-4">The data is split into 5 parts; the model trains on 4 and tests on 1, rotating 5 times. This ensures the score is not just based on one lucky train/test split.</p>
                      <div className="grid grid-cols-5 gap-2">
                        {data.logistic.kfold.map((score: number, i: number) => (
                          <div key={i} className="bg-black/40 p-3 rounded border border-white/5 text-center">
                            <p className="text-xs text-gray-400 mb-1">Fold {i + 1}</p>
                            <p className="text-lg font-bold text-fuchsia-400">{(score * 100).toFixed(1)}%</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 bg-green-900/20 border border-green-500/30 p-3 rounded-xl text-xs text-green-200 text-center">
                        <p><strong>Mean F1-Score:</strong> {((data.logistic.kfold.reduce((a: number, b: number) => a + b, 0) / data.logistic.kfold.length) * 100).toFixed(2)}%</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-[#150f24] border border-white/10 p-6 rounded-2xl">
                      <h3 className="text-lg font-semibold text-purple-300 mb-4">ROC Curve (AUC: {data.curves.roc.auc.toFixed(3)})</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart>
                            <XAxis dataKey="fpr" type="number" stroke="#666" />
                            <YAxis dataKey="tpr" type="number" stroke="#666" />
                            <Line data={data.curves.roc.fpr.map((fpr: number, i: number) => ({ fpr, tpr: data.curves.roc.tpr[i] }))} type="monotone" dataKey="tpr" stroke="#82ca9d" strokeWidth={3} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="bg-[#150f24] border border-white/10 p-6 rounded-2xl">
                      <h3 className="text-lg font-semibold text-purple-300 mb-2">Threshold Lab</h3>
                      <input type="range" min="0.1" max="0.9" step="0.05" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full accent-purple-500 mb-4" />
                      <p className="text-center text-white font-bold text-xl mb-4">Threshold: {threshold.toFixed(2)}</p>
                      {(() => {
                        const cm = calculateThresholdMetrics();
                        if (!cm) return null;
                        return (
                          <div className="grid grid-cols-4 gap-2 text-center text-sm">
                            <div className="bg-green-900/30 p-2 rounded border border-green-500/30"><p className="text-[10px] text-gray-400">True Neg</p><p className="text-lg font-bold text-green-400">{cm.tn}</p></div>
                            <div className="bg-red-900/30 p-2 rounded border border-red-500/30"><p className="text-[10px] text-gray-400">False Pos</p><p className="text-lg font-bold text-red-400">{cm.fp}</p></div>
                            <div className="bg-red-900/30 p-2 rounded border border-red-500/30"><p className="text-[10px] text-gray-400">False Neg</p><p className="text-lg font-bold text-red-400">{cm.fn}</p></div>
                            <div className="bg-green-900/30 p-2 rounded border border-green-500/30"><p className="text-[10px] text-gray-400">True Pos</p><p className="text-lg font-bold text-green-400">{cm.tp}</p></div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {data?.curves?.pr && (
                    <div className="bg-[#150f24] border border-white/10 p-6 rounded-2xl mt-6">
                      <h3 className="text-lg font-semibold text-purple-300 mb-4">Precision-Recall Curve</h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={data.curves.pr.recall.map((rec: number, i: number) => ({
                              recall: rec,
                              precision: data.curves.pr.precision[i]
                            }))}
                            margin={{ top: 5, right: 20, bottom: 25, left: 0 }}
                          >
                            <XAxis 
                              dataKey="recall" 
                              type="number" 
                              stroke="#666" 
                              domain={[0, 1]} 
                              label={{ value: 'Recall', position: 'insideBottom', fill: '#888', offset: -15 }} 
                            />
                            <YAxis 
                              dataKey="precision" 
                              type="number" 
                              stroke="#666" 
                              domain={[0, 1]} 
                              label={{ value: 'Precision', angle: -90, position: 'insideLeft', fill: '#888' }} 
                            />
                            <Tooltip contentStyle={{ backgroundColor: '#150f24', borderColor: '#333' }} />
                            <Line 
                              type="monotone" 
                              dataKey="precision" 
                              stroke="#facc15" 
                              strokeWidth={3} 
                              dot={false} 
                              isAnimationActive={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-xl text-xs text-yellow-200">
                        <p><strong>What does this mean?</strong> Unlike the ROC curve, the Precision-Recall curve is much better for <strong>imbalanced datasets</strong> (like spam vs. safe). It shows the trade-off between catching all spam (Recall) and not falsely flagging safe emails (Precision). The closer this curve is to the top-right corner, the better the model is.</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 5. MLP LOSS CURVE */}
              {selectedAlgo === 'mlp' && data.mlp?.loss_curve && (
                <div className="bg-[#150f24] border border-white/10 p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-purple-300 mb-4">MLP Backpropagation Loss Curve</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.mlp.loss_curve.map((loss: number, i: number) => ({ epoch: i, loss }))}>
                        <XAxis dataKey="epoch" stroke="#666" /><YAxis stroke="#666" />
                        <Line type="monotone" dataKey="loss" stroke="#d946ef" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* 6. DECISION TREE TABS */}
              {selectedAlgo === 'tree' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="bg-[#150f24] border border-white/10 p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-purple-300 mb-4">CART (Gini) vs Entropy Criterion</h3>
                    <BlockMath math="Gini = 1 - \sum p_i^2" />
                    <BlockMath math="Entropy = -\sum p_i \log_2(p_i)" />
                    <p className="text-sm text-gray-300 mt-2">Scikit-Learn uses Gini by default, but both mathematically split the data to maximize purity.</p>
                    {selectedNode && (
                      <div className="mt-6 bg-black/40 p-4 rounded-xl border border-purple-500/50">
                        <h4 className="text-white font-bold mb-2">Node Inspector</h4>
                        <p className="text-xs text-gray-300 mb-1">Rule: <span className="text-purple-300 font-mono">{selectedNode.name}</span></p>
                        <p className="text-xs text-gray-300 mb-1">Samples: <span className="text-white">{selectedNode.attributes?.samples}</span></p>
                        <p className="text-xs text-gray-300 mb-1">Impurity: <span className="text-white">{selectedNode.attributes?.impurity?.toFixed(4)}</span></p>
                        {selectedNode.attributes?.class_counts && <p className="text-xs text-gray-300">Classes: Safe={selectedNode.attributes.class_counts[0]}, Spam={selectedNode.attributes.class_counts[1]}</p>}
                      </div>
                    )}
                  </div>
                  <div className="bg-[#150f24] border border-white/10 p-6 rounded-2xl h-[500px]">
                    <h3 className="text-lg font-semibold text-purple-300 mb-4">Visual Tree Explorer</h3>
                    <div className="w-full h-[400px] bg-white rounded-xl overflow-hidden border border-slate-300 relative">
                      {data.tree && (
                        <Tree 
                          data={data.tree.json} 
                          orientation="vertical"
                          pathFunc="step" 
                          translate={{ x: 200, y: 50 }} 
                          nodeSize={{ x: 150, y: 100 }} 
                          zoomable={true} 
                          styles={{ links: { stroke: '#94a3b8' } }}
                          renderCustomNodeElement={({ nodeDatum }) => (
                            <g onClick={() => setSelectedNode(nodeDatum)} className="cursor-pointer hover:opacity-80">
                              <circle r="15" fill={nodeDatum.attributes?.type === 'leaf' ? '#d946ef' : '#5865F2'} stroke="#fff" strokeWidth="2" />
                              <text fill="#1e293b" x="20" y="5" fontSize="11" fontWeight="bold">{nodeDatum.name}</text>
                            </g>
                          )} 
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 7. LINEAR REGRESSION */}
              {selectedAlgo === 'linear' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    <div className="bg-[#150f24] border border-white/10 p-6 rounded-2xl">
                      <h3 className="text-lg font-semibold text-purple-300 mb-4">Linear Regression Formula</h3>
                      <div className="bg-black/40 p-4 rounded-xl text-center mb-4 border border-white/5">
                        <BlockMath math="Y = W \cdot X + b" />
                      </div>
                      <p className="text-sm text-gray-300 mb-4">Linear Regression tries to fit a straight line through the data to predict a continuous number.</p>
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                        <p className="text-sm text-gray-300">Mean Squared Error (MSE): <span className="text-fuchsia-400 font-mono">{data.linear?.mse.toFixed(4)}</span></p>
                      </div>
                    </div>

                    <div className="bg-[#150f24] border border-white/10 p-6 rounded-2xl">
                      <h3 className="text-lg font-semibold text-purple-300 mb-4">Prediction Bounds (Why it fails)</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis type="number" dataKey="actual" name="Actual Class (0 or 1)" ticks={[0, 1]} domain={[-0.5, 1.5]} stroke="#666" />
                            <YAxis type="number" dataKey="predicted" name="Predicted Output" stroke="#666" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#150f24', borderColor: '#333' }} />
                            
                            <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "Bound (0)", fill: "#ef4444", position: "insideBottomLeft" }} />
                            <ReferenceLine y={1} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "Bound (1)", fill: "#ef4444", position: "insideTopLeft" }} />
                            
                            <Scatter name="Predictions" data={linearGraphData} fill="#d946ef" />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl text-xs text-red-200">
                    <p><strong>What does this mean?</strong> The red dashed lines represent the valid probability bounds (0 and 1). Notice how the pink dots (Linear Regression predictions) fall below 0 or above 1. Because Linear Regression predicts unrestricted continuous values, it is mathematically invalid for binary classification. This is why we must use Logistic Regression (Sigmoid function) to squash the outputs between 0 and 1.</p>
                  </div>

                  <div className="bg-[#150f24] border border-white/10 p-6 rounded-2xl mt-6">
                    <h3 className="text-lg font-semibold text-purple-300 mb-4">Actual Test Predictions Table</h3>
                    <table className="w-full text-sm text-left text-gray-300">
                      <thead className="text-xs text-gray-400 uppercase bg-black/30">
                        <tr><th className="px-4 py-2">Actual Class</th><th className="px-4 py-2">Prediction</th><th className="px-4 py-2">Valid Prob?</th></tr>
                      </thead>
                      <tbody>
                        {data.linear?.predictions.map((p: number, i: number) => (
                          <tr key={i} className="border-b border-white/5">
                            <td className="px-4 py-2">{data.linear.actuals[i] === 1 ? 'Spam' : 'Safe'}</td>
                            <td className="px-4 py-2 font-mono">{p.toFixed(3)}</td>
                            <td className="px-4 py-2">{p < 0 || p > 1 ? <span className="text-red-400 font-bold">No</span> : <span className="text-green-400">Yes</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 8. PCA (TruncatedSVD) */}
              {selectedAlgo === 'pca' && data.pca && (
                <div className="bg-[#150f24] border border-white/10 p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-purple-300 mb-4">TruncatedSVD (Feature Reduction)</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <XAxis dataKey="x" type="number" stroke="#666" /><YAxis dataKey="y" type="number" stroke="#666" />
                        <Scatter data={data.pca} fill="#d946ef" opacity={0.6} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 bg-purple-900/20 border border-purple-500/30 p-4 rounded-xl text-xs text-purple-200">
                    <p><strong>What does this mean?</strong> We take the 2000-dimensional TF-IDF text features and compress them into just 2 dimensions (X and Y). Each dot is a message. If you see purple (Safe) and pink (Spam) dots clustering separately, it proves that Spam and Safe messages occupy different mathematical spaces, making them easy for the model to classify.</p>
                  </div>
                </div>
              )}

              {/* 9. PAC LEARNING */}
              {selectedAlgo === 'pac' && data.pac && (
                <div className="bg-[#150f24] border border-white/10 p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-purple-300 mb-4">PAC Learning (Sample Complexity)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.pac.sizes.map((size: number, i: number) => ({ size, train: data.pac.train[i], test: data.pac.test[i] }))}>
                        <XAxis dataKey="size" stroke="#666" /><YAxis stroke="#666" />
                        <Line type="monotone" dataKey="train" stroke="#8884d8" name="Training" />
                        <Line type="monotone" dataKey="test" stroke="#82ca9d" name="Validation" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 bg-green-900/20 border border-green-500/30 p-4 rounded-xl text-xs text-green-200">
                    <p><strong>What does this mean?</strong> This is an empirical Learning Curve. As the dataset size increases (X-axis), the model's accuracy improves. If the Training score (purple) and Validation score (green) converge and flatten out, it proves that your dataset is large enough (Sample Complexity) and the model generalizes well (PAC learning).</p>
                  </div>
                </div>
              )}

            </div>
          )}
        </main>
      </div>
    </div>
  );
}