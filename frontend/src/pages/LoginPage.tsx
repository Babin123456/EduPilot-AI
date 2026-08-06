import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<any[]>([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/auth/demo-accounts')
      .then(res => setDemoAccounts(res.data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.access_token, res.data.teacher);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-adamas-blue text-white flex items-center justify-center font-bold text-2xl shadow-lg mb-4">
          EP
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">EduPilot AI</h2>
        <p className="mt-1 text-sm font-medium text-adamas-blue dark:text-adamas-green">
          Academic Operating System • Adamas University
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Institutional Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-adamas-blue focus:outline-none"
                placeholder="faculty@adamasuniversity.ac.in"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-adamas-blue focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-adamas-blue hover:bg-adamas-blue-dark text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          {/* Demo Credentials Selector */}
          {demoAccounts.length > 0 && (
            <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Quick Demo Faculty Login
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.faculty_id}
                    onClick={() => handleDemoSelect(acc.email, acc.password)}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-adamas-blue dark:hover:border-adamas-green bg-slate-50/50 dark:bg-slate-800/50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{acc.name}</p>
                      <p className="text-[10px] text-slate-500">{acc.specialization}</p>
                    </div>
                    <span className="text-[10px] font-mono bg-adamas-blue/10 text-adamas-blue dark:text-adamas-green px-2 py-0.5 rounded">
                      Use Credentials
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
