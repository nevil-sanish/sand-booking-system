import { useItems } from '../../hooks/useItems';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { Mountain, Plus, ShoppingCart, Package } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

export default function HomePage() {
  const { items, loading } = useItems(true);
  const { addToCart } = useCart();
  const toast = useToast();

  const handleAddToCart = (item) => {
    addToCart(item, 1);
    toast.success(`${item.name} added to cart`);
  };

  if (loading) return <Spinner text="Loading items..." />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No Items Available"
        description="There are no items available for order right now. Please check back later."
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Order Sand</h1>
      <p className="text-muted mb-4">Select items to add to your cart</p>

      <div className="items-grid stagger-children">
        {items.map(item => (
          <div key={item.id} className="card item-card card-clickable" onClick={() => handleAddToCart(item)}>
            <div className="item-card-icon">
              <Mountain />
            </div>
            <h3>{item.name}</h3>
            <div>
              <span className="item-card-price">{formatPrice(item.price)}</span>
              <span className="item-card-unit"> / {item.unit || 'load'}</span>
            </div>
            <button
              className="btn btn-primary btn-sm btn-full ripple"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(item);
              }}
              id={`add-item-${item.id}`}
            >
              <Plus size={16} />
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
