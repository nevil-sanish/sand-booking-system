import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import { ShoppingCart, Minus, Plus, Trash2, MapPin, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, totalPrice, isEmpty } = useCart();
  const navigate = useNavigate();

  if (isEmpty) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Your Cart is Empty"
        description="Add items from the home page to get started."
        action={
          <button className="btn btn-primary ripple" onClick={() => navigate('/')}>
            Browse Items
          </button>
        }
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Your Cart</h1>

      <div className="stagger-children">
        {cartItems.map(item => (
          <div key={item.itemId} className="card cart-item">
            <div className="cart-item-info">
              <p className="cart-item-name">{item.name}</p>
              <p className="cart-item-price">{formatPrice(item.price)} / {item.unit}</p>
            </div>
            <div className="qty-selector">
              <button
                className="qty-btn"
                onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                id={`qty-minus-${item.itemId}`}
              >
                <Minus size={16} />
              </button>
              <span className="qty-value">{item.quantity}</span>
              <button
                className="qty-btn"
                onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                id={`qty-plus-${item.itemId}`}
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              className="cart-item-remove btn btn-ghost btn-icon btn-sm"
              onClick={() => removeFromCart(item.itemId)}
              id={`remove-${item.itemId}`}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="card cart-summary">
        {cartItems.map(item => (
          <div key={item.itemId} className="cart-summary-row">
            <span>{item.name} × {item.quantity}</span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="cart-summary-row cart-summary-total">
          <span>Total</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
      </div>

      <button
        className="btn btn-primary btn-lg btn-full ripple mt-4"
        onClick={() => navigate('/location')}
        id="proceed-to-location"
      >
        <MapPin size={20} />
        Select Delivery Location
        <ArrowRight size={20} />
      </button>
    </div>
  );
}
