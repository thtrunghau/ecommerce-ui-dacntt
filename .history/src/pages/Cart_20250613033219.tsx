import { useCallback, useState } from 'react';
import { CartItem } from '../components/common/CartItem';
import type { CartResDto, CartItemResDto } from '../types';
import formatPrice from '../utils/formatPrice';
import { mockCartData } from '../mockData/cartData';

const CartPage: React.FC = () => {
  // Using mock data for UI testing
  const [cart, setCart] = useState<CartResDto>(mockCartData);
  const [loading] = useState(false);

  const calculateTotal = useCallback((items: CartItemResDto[]) => {
    return items.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
  }, []);

  const handleQuantityChange = useCallback((itemId: string, newQuantity: number) => {
    setCart((prevCart) => {
      if (!prevCart) return null;
      
      const updatedItems = prevCart.cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      
      return {
        ...prevCart,
        cartItems: updatedItems,
      };
    });
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setCart((prevCart) => {
      if (!prevCart) return null;
      
      return {
        ...prevCart,
        cartItems: prevCart.cartItems.filter(item => item.id !== itemId),
      };
    });
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading cart...</p>
      </div>
    );
  }

  if (!cart || cart.cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
        <p>Your cart is empty</p>
      </div>
    );
  }

  const total = calculateTotal(cart.cartItems);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            {cart.cartItems.map(item => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <button
              className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              onClick={() => {/* TODO: Handle checkout */}}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;