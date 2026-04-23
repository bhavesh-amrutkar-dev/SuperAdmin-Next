function ExpressRegister() {
  return (
    <div className="rounded-2xl bg-[#1a1a1a] p-5 text-white">
      <h2 className="text-lg font-semibold mb-4">Quick Checkout</h2>

      <input placeholder="First Name" className="input" />
      <input placeholder="Last Name" className="input mt-2" />
      <input placeholder="Email" className="input mt-2" />
      <input placeholder="Phone" className="input mt-2" />
    </div>
  );
}