"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ShieldCheck, User, KeyRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await loginUser(username, password);
      router.push("/hosted-zones");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (u: string) => {
    setUsername(u);
    setPassword("password");
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-8">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg shadow-lg p-6 sm:p-8 space-y-6">
        {/* AWS Logo Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-aws-nav rounded-lg shadow text-white mb-2">
            <span className="text-xl font-black text-aws-orange">AWS</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Sign in to AWS Console
          </h1>
          <p className="text-xs text-gray-500">
            Mocked IAM session for Route 53 Management
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-500 rounded text-red-700 dark:text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="IAM username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="admin"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={loading}
          >
            Sign in
          </Button>
        </form>

        {/* Quick select demo users */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Quick Sign In with Demo Accounts:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickSelect("admin")}
              className={`p-2.5 rounded border text-left text-xs transition-colors ${
                username === "admin"
                  ? "border-aws-orange bg-orange-50/50 dark:bg-orange-950/20"
                  : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <div className="font-bold text-gray-900 dark:text-gray-100">admin</div>
              <div className="text-[10px] text-gray-500">AdministratorAccess</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect("developer")}
              className={`p-2.5 rounded border text-left text-xs transition-colors ${
                username === "developer"
                  ? "border-aws-orange bg-orange-50/50 dark:bg-orange-950/20"
                  : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <div className="font-bold text-gray-900 dark:text-gray-100">developer</div>
              <div className="text-[10px] text-gray-500">PowerUserAccess</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
