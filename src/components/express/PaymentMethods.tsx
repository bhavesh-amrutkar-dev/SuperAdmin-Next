import SquarePaymentClient from "@/src/app/square-payment/squarePaymentClient";
import SquarePayment from "../payments/SquarePayment";

export function PaymentMethods({
    grandTotal,
    paymentMethod,
    onSelect,
    onPlaceOrder,
    placingOrder
}: any) {
  

    return (
        <div className="rounded-2xl p-5 space-y-4">

            <h2 className="text-lg font-semibold">Summary</h2>

            <div className="flex justify-between">
                <span>Total</span>
                <span>${grandTotal}</span>
            </div>

            {/* ATH MOVIL */}
            <button
                onClick={() => onSelect("athMovil")}
                className={`w-full py-3 rounded-lg font-semibold ${paymentMethod === "athMovil" ? "bg-orange-600" : "bg-orange-500"
                    }`}
            >
                Pay with ATH móvil
            </button>

            {/* SQUARE */}
            <SquarePayment
                orderId={orderId}
                amount={amount}
                authToken={accessToken}
                onSuccess={handleSuccess}
                onError={handleError}
            />
            {/* FINAL CTA */}
            <button
                onClick={onPlaceOrder}
                disabled={placingOrder || !paymentMethod}
                className="w-full bg-yellow-400 text-black py-3 rounded-lg font-bold"
            >
                {placingOrder ? "Processing..." : "PAY NOW"}
            </button>
        </div>
    );
}