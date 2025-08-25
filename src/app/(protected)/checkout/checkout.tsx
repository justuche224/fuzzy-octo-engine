"use client";

import React, { useState, useTransition } from "react";
import { useCartStore } from "@/cart/cart";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import formatPrice from "@/lib/format-price";
import { CreateFullOrderInput } from "@/schemas";
import { toast } from "sonner";

interface AddressForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const Checkout = () => {
  const { items, clearCart } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const [addressForm, setAddressForm] = useState<AddressForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 0;
  const total = subtotal + shipping;

  const handleAddressChange = (field: keyof AddressForm, value: string) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleOrderSubmit = () => {
    const orderData: CreateFullOrderInput = {
      name: addressForm.firstName + " " + addressForm.lastName,
      email: addressForm.email,
      phone: addressForm.phone,
      shippingAddress: addressForm.address,
      city: addressForm.city,
      state: addressForm.state,
      zip: addressForm.zipCode,
      country: addressForm.country,
      subtotal: subtotal.toString(),
      shipping: shipping.toString(),
      total: total.toString(),
      items: items.map((item) => ({
        productId: item.id,
        sellerId: item.sellerId,
        quantity: item.quantity,
        price: item.price.toString(),
      })),
    };

    startTransition(async () => {
      try {
        const response = await fetch("/api/order", {
          method: "POST",
          body: JSON.stringify(orderData),
        });
        if (!response.ok) {
          throw new Error("Failed to create order");
        }
        const data = await response.json();
        if (data.payment?.authorization_url) {
          toast.success("Order created successfully. Proceed to payment.");
          window.location.href = data.payment.authorization_url;
        }
        clearCart();
      } catch (error) {
        console.error("Error submitting order:", error);
        toast.error("Failed to place order");
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-4">
            Add some items before checking out
          </p>
          <Link href="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 text-center">
        <h1 className="text-2xl lg:text-4xl font-bold my-4">
          Milky Way Checkout
        </h1>
        <p className="text-muted-foreground">
          Please fill in the form below to complete your order.
        </p>
      </div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/cart">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={addressForm.firstName}
                    onChange={(e) =>
                      handleAddressChange("firstName", e.target.value)
                    }
                    required
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={addressForm.lastName}
                    onChange={(e) =>
                      handleAddressChange("lastName", e.target.value)
                    }
                    required
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={addressForm.email}
                    onChange={(e) =>
                      handleAddressChange("email", e.target.value)
                    }
                    required
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={addressForm.phone}
                    onChange={(e) =>
                      handleAddressChange("phone", e.target.value)
                    }
                    required
                    placeholder="1234567890"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={addressForm.address}
                  onChange={(e) =>
                    handleAddressChange("address", e.target.value)
                  }
                  placeholder="Street address, apartment, suite, etc."
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={addressForm.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                    required
                    placeholder="Victoria Island"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={addressForm.state}
                    onChange={(e) =>
                      handleAddressChange("state", e.target.value)
                    }
                    required
                    placeholder="Lagos"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={addressForm.zipCode}
                    onChange={(e) =>
                      handleAddressChange("zipCode", e.target.value)
                    }
                    required
                    placeholder="10001"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={addressForm.country}
                  onChange={(e) =>
                    handleAddressChange("country", e.target.value)
                  }
                  required
                  placeholder="Nigeria"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                onClick={handleOrderSubmit}
                className="w-full"
                size="lg"
                disabled={
                  !addressForm.firstName ||
                  !addressForm.lastName ||
                  !addressForm.email ||
                  !addressForm.phone ||
                  isPending
                }
              >
                Place Order
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By placing your order, you agree to our terms and conditions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
