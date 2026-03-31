import { useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { useUsers } from '../../hooks/useUsers';
import { useItems } from '../../hooks/useItems';
import { useMessages } from '../../hooks/useMessages';
import Spinner from '../../components/common/Spinner';
import { getInitials, formatPrice, formatRelativeTime } from '../../utils/formatters';
import { Package, Users, MessageSquare, ListTodo, CheckCircle, XCircle, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { orders, loading: ordersLoading } = useOrders(null, true);
  const { users, loading: usersLoading, getPendingUsers, getApprovedUsers } = useUsers();
  const { items, loading: itemsLoading } = useItems(true);
  const { getMessagesByUser, sendMessage, loading: msgsLoading } = useMessages(null, true);
  const navigate = useNavigate();

  const [ordersTab, setOrdersTab] = useState('pending');
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [msgText, setMsgText] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgText.trim() || !selectedChatUser) return;
    try {
      await sendMessage(selectedChatUser.id, msgText, 'admin');
      setMsgText('');
    } catch (err) {
      console.error(err);
    }
  };

  if (ordersLoading || usersLoading || itemsLoading || msgsLoading) {
    return <Spinner text="Loading dashboard..." />;
  }

  // Users data
  const pendingUsers = getPendingUsers();
  const activeUsers = getApprovedUsers();

  // Orders data
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  let displayOrders = pendingOrders;
  if (ordersTab === 'confirmed') displayOrders = confirmedOrders;
  if (ordersTab === 'completed') displayOrders = completedOrders;
  if (ordersTab === 'cancelled') displayOrders = cancelledOrders;

  // Messages data
  const chatUsers = activeUsers.filter(u => u.role !== 'admin');

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h1 className="page-title mb-4" style={{ marginBottom: 'var(--space-3)' }}>Dashboard Overview</h1>

      <div className="cbdc-dashboard">
        
        {/* LEFT COLUMN */}
        <div className="cbdc-col">
          {/* USERS ROW */}
          <div className="cbdc-row">
            <div className="cbdc-widget hover-lift card-clickable" onClick={() => navigate('/admin/users')}>
              <div className="cbdc-widget-title flex-between">
                <span>Active Users</span>
                <Users size={14} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div className="cbdc-stat">{activeUsers.length}</div>
            </div>
            <div className="cbdc-widget hover-lift card-clickable" onClick={() => navigate('/admin/users')}>
              <div className="cbdc-widget-title flex-between">
                <span>Pending Users</span>
                <Users size={14} style={{ color: 'var(--color-warning)' }} />
              </div>
              <div className="cbdc-stat">{pendingUsers.length}</div>
            </div>
          </div>

          {/* ORDERS ROW */}
          <div className="cbdc-row">
            <div className="cbdc-widget hover-lift card-clickable" onClick={() => navigate('/admin/orders')}>
              <div className="cbdc-widget-title flex-between">
                <span>Active Orders</span>
                <Package size={14} style={{ color: 'var(--color-info)' }} />
              </div>
              <div className="cbdc-stat">{confirmedOrders.length}</div>
            </div>
            <div className="cbdc-widget hover-lift card-clickable" onClick={() => navigate('/admin/orders')}>
              <div className="cbdc-widget-title flex-between">
                <span>Pending Orders</span>
                <Package size={14} style={{ color: 'var(--color-warning)' }} />
              </div>
              <div className="cbdc-stat">{pendingOrders.length}</div>
            </div>
          </div>

          {/* MESSAGES PANE */}
          <div className="cbdc-messages-pane">
            <div className="cbdc-messages-list custom-scrollbar">
              <div className="cbdc-widget-title" style={{ padding: 'var(--space-3) var(--space-3) 0', borderBottom: '1px solid var(--color-border)', margin: 0, paddingBottom: 8 }}>
                Messages
              </div>
              {chatUsers.map(u => {
                const userMsgs = getMessagesByUser(u.id);
                const lastMsg = userMsgs[0];
                const isActive = selectedChatUser?.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedChatUser(u)}
                    style={{
                      padding: 'var(--space-3)',
                      borderBottom: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      background: isActive ? 'var(--color-surface)' : 'transparent',
                      transition: 'background 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)'
                    }}
                  >
                    <div className="avatar avatar-sm">{getInitials(u.name)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{u.name}</p>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {lastMsg ? lastMsg.content : 'No messages'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="cbdc-messages-detail custom-scrollbar">
              {!selectedChatUser ? (
                <>
                  <MessageSquare size={32} style={{ color: 'var(--color-text-muted)', marginBottom: 8 }} />
                  <p style={{ fontSize: 'var(--font-size-sm)' }}>Select a user to view messages</p>
                </>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
                    <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>{selectedChatUser.name}</p>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', paddingTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }} className="custom-scrollbar">
                    {getMessagesByUser(selectedChatUser.id).reverse().length === 0 && (
                      <p className="text-center text-muted" style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-4)' }}>No message history yet.</p>
                    )}
                    {getMessagesByUser(selectedChatUser.id).reverse().slice(-10).map(msg => (
                      <div key={msg.id} style={{
                        background: msg.senderId === 'admin' ? 'var(--color-primary-light)' : 'var(--color-surface)',
                        color: msg.senderId === 'admin' ? '#000' : 'var(--color-text)',
                        alignSelf: msg.senderId === 'admin' ? 'flex-end' : 'flex-start',
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        maxWidth: '85%',
                        fontSize: 'var(--font-size-sm)'
                      }}>
                        {msg.content}
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Type response..." 
                      value={msgText} 
                      onChange={e => setMsgText(e.target.value)} 
                      style={{ minHeight: '36px', fontSize: 'var(--font-size-sm)', padding: 'var(--space-2)', background: 'var(--color-surface)' }} 
                    />
                    <button type="submit" className="btn btn-primary btn-sm" disabled={!msgText.trim()}>
                      Send
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="cbdc-col">
          <div className="cbdc-widget" style={{ paddingBottom: 'var(--space-2)' }}>
            <div className="cbdc-widget-title">Items</div>
            <div className="cbdc-items-scroll custom-scrollbar" style={{
              display: 'flex',
              overflowX: 'auto',
              gap: 'var(--space-3)',
              paddingBottom: 'var(--space-2)',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin',
              maxWidth: '100%',
            }}>
              {items.map(item => (
                <div key={item.id} className="cbdc-item-card hover-lift" style={{ flex: '0 0 120px', minWidth: '120px', scrollSnapAlign: 'start' }}>
                  <div style={{ width: '100%', height: 60, background: 'var(--color-glass-base)', borderRadius: 'var(--radius-sm)', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers size={24} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>{item.name}</p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)', textAlign: 'center' }}>{formatPrice(item.price)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ORDERS TABBED VIEW */}
          <div className="cbdc-widget cbdc-orders-list">
            <div className="tabs" style={{ marginBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-1)' }}>
              <button className={`tab ${ordersTab === 'pending' ? 'tab-active' : ''}`} onClick={() => setOrdersTab('pending')} style={{ padding: '0 var(--space-2)' }}>
                Pending
              </button>
              <button className={`tab ${ordersTab === 'confirmed' ? 'tab-active' : ''}`} onClick={() => setOrdersTab('confirmed')} style={{ padding: '0 var(--space-2)' }}>
                Confirmed
              </button>
              <button className={`tab ${ordersTab === 'completed' ? 'tab-active' : ''}`} onClick={() => setOrdersTab('completed')} style={{ padding: '0 var(--space-2)' }}>
                Completed
              </button>
              <button className={`tab ${ordersTab === 'cancelled' ? 'tab-active' : ''}`} onClick={() => setOrdersTab('cancelled')} style={{ padding: '0 var(--space-2)' }}>
                Cancelled
              </button>
            </div>

            <div className="cbdc-orders-scroll custom-scrollbar">
              {displayOrders.length === 0 ? (
                <div className="text-center text-muted mt-6">
                  <ListTodo size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ fontSize: 'var(--font-size-sm)' }}>No orders in this category</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {displayOrders.map(o => {
                    const statusColors = {
                      pending: 'var(--color-warning)',
                      confirmed: 'var(--color-info)',
                      completed: 'var(--color-success)',
                      cancelled: 'var(--color-danger)'
                    };
                    return (
                      <div key={o.id} style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-glass-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-3)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <a href={`tel:${o.userPhone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                              {o.userPhone}
                            </a>
                            <span style={{
                              display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: statusColors[o.status]
                            }} />
                          </p>
                          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                            {o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{formatPrice(o.total)}</p>
                          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                            {formatRelativeTime(o.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
