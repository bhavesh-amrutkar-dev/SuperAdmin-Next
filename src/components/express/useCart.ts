// hooks/useCart.ts
"use client";

import { useEffect, useState, useRef } from "react";
import { CartService } from "@/src/lib/services/cart";
import { getCookie } from "cookies-next";
import { CartItem } from "@/src/app/cart/page";

export function useCart() {
    const [cartData, setCartData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const fetchingCartRef = useRef(false);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async (showLoading = true) => {
        if (fetchingCartRef.current) return;
        fetchingCartRef.current = true;

        try {
            if (showLoading) setLoading(true);

            const res = await CartService.getCart();
            const data = res?.data?.data || res?.data || res;

            setCartData(data);
        } catch (e) {
            console.warn("cart error", e);
        } finally {
            setLoading(false);
            fetchingCartRef.current = false;
        }
    };

    // 🔥 SAME FUNCTION (copied from your code)
    const updateQuantity = async (item: any, newQuantity: number) => {
        if (newQuantity < 1) return;

        const itemId = item.addToCartOnId || item._id || "";
        setUpdating(itemId);

        try {
            await CartService.addToCart({
                productId: item.productId || item._id || "",
                newQuantity,
                action: 2,
            });

            fetchCart(false);
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(null);
        }
    };

    const getAllCartItems = () => {
        if (!cartData?.sellers) return [];

        const items: any[] = [];

        cartData.sellers.forEach((seller: any) => {
            seller.products?.forEach((p: any) => {
                items.push(p);
            });
        });

        return items;
    };

    const getProductImage = (item: CartItem): string => {
        // Check images object (old project uses product.images.large)
        if (item.images) {
            if (item.images.large) return item.images.large;
            if (item.images.medium) return item.images.medium;
            if (item.images.small) return item.images.small;
        }
        // Check if images is an array
        if (Array.isArray(item.images) && item.images.length > 0) {
            const firstImage = item.images[0];
            if (typeof firstImage === 'string') {
                return firstImage;
            }
            if (typeof firstImage === 'object' && firstImage !== null) {
                if (firstImage.large) return firstImage.large;
                if (firstImage.medium) return firstImage.medium;
                if (firstImage.small) return firstImage.small;
            }
        }
        if (item.productImage) {
            return item.productImage;
        }
        if (item.image) {
            return item.image;
        }
        if (item.product?.image) {
            return item.product.image;
        }
        if (item.product?.images) {
            if (typeof item.product.images === 'object' && !Array.isArray(item.product.images)) {
                const images = item.product.images as { large?: string; medium?: string; small?: string };
                if (images.large) return images.large;
                if (images.medium) return images.medium;
                if (images.small) return images.small;
            }
        }
        return "/placeholder-product.png";
    };
    const formatCurrency = (value: any) => {
        return (Number(value) || 0).toFixed(2);
    };

    return {
        cartItems: getAllCartItems(),
        updating,
        updateQuantity,
        getProductImage,
        formatCurrency,
        loading,
    };
}