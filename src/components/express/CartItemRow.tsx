"use client";

import Image from "next/image";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export default function CartItemRow({
  item,
  quantity,
  isUpdating,
  currency,
  onIncrease,
  onDecrease,
  onRemove,
}: any) {
  return (
    <div className="flex gap-4 border-b pb-4">
      {/* Image */}
      <div className="w-24 h-24 bg-white rounded-lg overflow-hidden">
        <Image
          src={item.image || "/placeholder-product.png"}
          alt={item.name}
          width={100}
          height={100}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Info */}
      <div className="flex-1 flex justify-between">
        <div>
          <h3 className="font-semibold">{item.name}</h3>

          <p className="text-sm text-gray-500">
            {currency} {item.price}
          </p>

          {/* 🔥 INLINE QUANTITY CONTROLS */}
          <div className="flex items-center gap-2 mt-2">
            <Button
              size="icon"
              variant="outline"
              disabled={isUpdating || quantity <= 1}
              onClick={() => onDecrease()}
            >
              <Minus size={16} />
            </Button>

            <span className="w-8 text-center font-semibold">
              {isUpdating ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : quantity}
            </span>

            <Button
              size="icon"
              variant="outline"
              disabled={isUpdating}
              onClick={() => onIncrease()}
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end justify-between">
          <button onClick={onRemove} className="text-red-500">
            <Trash2 size={18} />
          </button>

          <p className="font-bold">
            {currency} {(item.price * quantity).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}