"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold section_title mb-1 block">
          Create account
        </h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="text-sm font-medium text-[#2f2f2f]">
            Full name
          </label>
          <input
            placeholder="Full name"
            className="auth-input w-full rounded-lg border !border-[#2f2f2f] px-4 py-2.5
              focus:outline-none focus:!border-[#f3c200]"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-[#2f2f2f]">
            Email
          </label>
          <input
            type="email"
            placeholder="Email"
            className="auth-input w-full rounded-lg border !border-[#2f2f2f] px-4 py-2.5
              focus:outline-none focus:!border-[#f3c200]"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-[#2f2f2f]">
            Password
          </label>
          <input
            type="password"
            placeholder="Password"
            className="auth-input w-full rounded-lg border !border-[#2f2f2f] px-4 py-2.5
              focus:outline-none focus:!border-[#f3c200]"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <button className="auth-button w-full rounded-lg btn-primary py-3 text-white font-semibold
            hover:bg-yellow-400 hover:text-black transition disabled:opacity-50 !border-0 mt-1" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="auth-footer text-center text-sm text-[#2f2f2f]">
          Already have an account? <span className="font-semibold text-[#2f2f2f] hover:text-[#f3c200] hover:underline transition">Sign in</span>
        </p>
      </div>
    </div>
  );
}
