import { CartItem } from "@/src/app/cart/page";

type MiniCartProps = {
  cartItems: CartItem[];
  updateQuantity: (item: CartItem, qty: number) => void;
  updating: string | null;
  getProductImage: (item: CartItem) => string;
  formatCurrency: (value: number | string) => string;
};

export function MiniCart({
  cartItems,
  updateQuantity,
  updating,
  getProductImage,
  formatCurrency
}: MiniCartProps) {
  return (
    <div className="rounded-2xl  p-5 ">
      <h2 className="text-lg font-semibold mb-4">Your Cart</h2>

      {cartItems.map((item) => {
        const itemId =
          item.addToCartOnId || item._id || item.productId || "";

        const isUpdating = updating === itemId;

        const quantity =
          typeof item.quantity === "object" && item.quantity !== null
            ? Number(item.quantity.value) || 1
            : Number(item.quantity) || 1;

        // ✅ MATCH YOUR ORIGINAL FLOW
        const rawUnitPrice =
          item.accounting?.finalUnitPrice ||
          item.accounting?.unitPrice ||
          item?.product?.price ||
          item?.product?.ticketPrice ||
          item?.product?.unitPrice ||
          item.price ||
          item.unitPrice ||
          item.ticketPrice ||
          0;

        let unitPrice = Number(rawUnitPrice) || 0;

        if (unitPrice === 0 && item.accounting?.subTotal) {
          const subTotal = Number(item.accounting.subTotal) || 0;
          unitPrice = quantity > 0 ? subTotal / quantity : 0;
        }

        // ✅ IMPORTANT: SAME AS YOUR CART PAGE
        const itemTotal = unitPrice;

        return (
          <div key={itemId} className="flex gap-4 mb-4 items-center">
            <img
              src={getProductImage(item)}
              className="w-16 h-16 rounded-lg object-cover"
            />

            <div className="flex-1">
              <p className="text-sm font-medium">
                {item.productName || item.name}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateQuantity(item, quantity - 1);
                  }}
                  disabled={isUpdating || quantity <= 1}
                  className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50 hover:cursor-pointer"
                >
                  -
                </button>

                <span className="min-w-[20px] text-center">
                  {quantity}
                </span>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateQuantity(item, quantity + 1);
                  }}
                  disabled={isUpdating}
                  className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50 hover:cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="font-semibold">
              ${formatCurrency(itemTotal)}
            </div>
          </div>
        );
      })}
    </div>
  );
}