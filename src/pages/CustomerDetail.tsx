import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Customer, DailyOrder } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Phone, MapPin, Edit2, Trash2, ShoppingCart, IndianRupee, Clock, CheckCircle, AlertTriangle, CreditCard } from 'lucide-react';

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { customers, orders, updateCustomer, deleteCustomer, updateOrder } = useData();

  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{ show: boolean; order: DailyOrder | null }>({ show: false, order: null });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [formData, setFormData] = useState({ name: '', address: '', contactNumber: '' });

  const customer = useMemo(() => customers.find(c => c.id === id), [customers, id]);
  
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        address: customer.address,
        contactNumber: customer.contactNumber
      });
    }
  }, [customer]);

  const customerOrders = useMemo(() => {
    if (!id) return [];
    return orders
      .filter(o => o.customerId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, id]);

  const stats = useMemo(() => {
    const totalOrdersValue = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalPaid = customerOrders.reduce((sum, o) => sum + (o.amountPaid || 0), 0);
    return {
      totalOrders: customerOrders.length,
      totalSpent: totalPaid,
      pendingAmount: totalOrdersValue - totalPaid,
    };
  }, [customerOrders]);

  const statCards = [
    { icon: ShoppingCart, label: 'Total Orders', value: stats.totalOrders, color: 'bg-blue-100 text-blue-600' },
    { icon: IndianRupee, label: 'Total Paid', value: `₹${stats.totalSpent.toFixed(2)}`, color: 'bg-green-100 text-green-600' },
    { icon: Clock, label: 'Pending Amount', value: `₹${stats.pendingAmount.toFixed(2)}`, color: 'bg-orange-100 text-orange-600' },
  ];

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    try {
      await updateCustomer({ ...customer, ...formData });
      setShowEditForm(false);
    } catch (error) {
      console.error("Failed to update customer:", error);
      alert("Failed to update customer. Please try again.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    try {
      await deleteCustomer(id);
      setShowDeleteConfirm(false);
      navigate('/customers', { replace: true });
    } catch (error) {
      console.error("Failed to delete customer:", error);
      alert("Failed to delete customer. Please try again.");
    }
  };

  const handleOpenPaymentModal = (order: DailyOrder) => {
    setPaymentModal({ show: true, order });
    setPaymentAmount('');
  };

  const handleSavePayment = async () => {
    if (!paymentModal.order) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const orderToUpdate = paymentModal.order;
    const currentAmountPaid = orderToUpdate.amountPaid || 0;
    const balance = orderToUpdate.totalAmount - currentAmountPaid;

    if (amount > balance) {
      if (!window.confirm(`Payment (₹${amount.toFixed(2)}) is more than the balance (₹${balance.toFixed(2)}). Record as overpayment?`)) {
        return;
      }
    }

    try {
      await updateOrder({ ...orderToUpdate, amountPaid: currentAmountPaid + amount });
      setPaymentModal({ show: false, order: null });
      setPaymentAmount('');
    } catch (error) {
      console.error("Failed to save payment:", error);
      alert("Failed to save payment. Please try again.");
    }
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-milk-100 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Customer Not Found</h2>
          <p className="text-gray-600 mb-4">The customer you are looking for may have been deleted.</p>
          <motion.button onClick={() => navigate('/customers')} className="bg-dairy-600 text-white px-6 py-2 rounded-lg" whileTap={{ scale: 0.95 }}>
            Back to Customers
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-milk-100 pb-10">
      <header className="bg-white p-4 shadow-sm sticky top-0 z-20">
        <div className="flex items-center">
          <motion.button onClick={() => navigate('/customers')} className="p-2 mr-2 rounded-full hover:bg-gray-100" whileTap={{ scale: 0.9 }}>
            <ArrowLeft size={20} className="text-gray-700" />
          </motion.button>
          <h1 className="text-lg font-bold text-gray-800 truncate">Customer Details</h1>
        </div>
      </header>
      
      <main className="px-4 pt-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">{customer.name}</h2>
              <div className="flex items-center space-x-2 mt-2">
                <Phone className="text-gray-500 flex-shrink-0" size={16} />
                <p className="text-sm text-gray-600">{customer.contactNumber}</p>
              </div>
              <div className="flex items-start space-x-2 mt-1">
                <MapPin className="text-gray-500 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-sm text-gray-600">{customer.address}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <motion.button onClick={() => setShowEditForm(true)} className="p-2 text-blue-600 bg-blue-100 rounded-lg" whileTap={{ scale: 0.95 }} title="Edit Customer">
                <Edit2 size={16} />
              </motion.button>
              <motion.button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-red-600 bg-red-100 rounded-lg" whileTap={{ scale: 0.95 }} title="Delete Customer">
                <Trash2 size={16} />
              </motion.button>
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          {statCards.map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.1 }} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className={`p-2 rounded-full inline-block ${stat.color} mb-2`}>
                <stat.icon size={18} />
              </div>
              <p className="text-base font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Order History</h3>
        {customerOrders.length > 0 ? (
          <div className="space-y-3">
            {customerOrders.map((order, index) => {
              const amountPaid = order.amountPaid || 0;
              const balance = order.totalAmount - amountPaid;
              const isPaid = balance <= 0;
              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.05 }} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-700">Order on {new Date(order.date).toLocaleDateString('en-IN', { timeZone: 'UTC' })}</p>
                      <p className="text-sm text-gray-500">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                      {order.status === 'delivered' ? <CheckCircle size={12} className="mr-1" /> : <Clock size={12} className="mr-1" />}
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between"><span className="text-gray-600">Total:</span><span className="font-medium">₹{order.totalAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Paid:</span><span className="font-medium text-green-600">₹{amountPaid.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Remaining Amount:</span><span className={`font-bold ${isPaid ? 'text-green-700' : 'text-red-600'}`}>₹{balance.toFixed(2)}</span></div>
                  </div>
                  
                  <div className="flex justify-end items-center pt-3 border-t">
                    {isPaid ? (
                      <span className="flex items-center text-sm font-semibold text-green-600"><CheckCircle size={16} className="mr-2" />Fully Paid</span>
                    ) : (
                      <motion.button onClick={() => handleOpenPaymentModal(order)} className="bg-dairy-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm" whileTap={{ scale: 0.95 }}>
                        <CreditCard size={16} />
                        <span>Record Payment</span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
            <ShoppingCart className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600">This customer has no orders yet.</p>
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {showEditForm && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-xl p-6 w-full max-w-md" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Customer</h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><textarea value={formData.address} onChange={e => setFormData(p => ({...p, address: e.target.value}))} className="w-full px-4 py-3 border border-gray-300 rounded-lg" rows={3} required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact</label><input type="tel" value={formData.contactNumber} onChange={e => setFormData(p => ({...p, contactNumber: e.target.value}))} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required /></div>
                <div className="flex space-x-3 pt-2"><motion.button type="button" onClick={() => setShowEditForm(false)} className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium" whileTap={{ scale: 0.98 }}>Cancel</motion.button><motion.button type="submit" className="flex-1 bg-dairy-600 text-white py-3 rounded-lg font-medium" whileTap={{ scale: 0.98 }}>Update</motion.button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
        {showDeleteConfirm && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-xl p-6 w-full max-w-sm text-center" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Customer?</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete <strong>{customer.name}</strong>? This action cannot be undone.</p>
              <div className="flex space-x-3"><motion.button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg font-medium" whileTap={{ scale: 0.98 }}>Cancel</motion.button><motion.button onClick={handleDeleteConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium" whileTap={{ scale: 0.98 }}>Delete</motion.button></div>
            </motion.div>
          </motion.div>
        )}
        {paymentModal.show && paymentModal.order && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-xl p-6 w-full max-w-md" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Record Payment</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between"><span className="text-gray-600">Total Amount:</span><span className="font-medium">₹{paymentModal.order.totalAmount.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Already Paid:</span><span className="font-medium text-green-600">₹{(paymentModal.order.amountPaid || 0).toFixed(2)}</span></div>
                <div className="flex justify-between border-t pt-2 mt-2"><span className="text-gray-600 font-bold">Balance Due:</span><span className="font-bold text-red-600">₹{(paymentModal.order.totalAmount - (paymentModal.order.amountPaid || 0)).toFixed(2)}</span></div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter Amount to Pay</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-lg" placeholder="0.00" required />
                  </div>
                </div>
                <div className="flex space-x-3 pt-2">
                  <motion.button type="button" onClick={() => setPaymentModal({ show: false, order: null })} className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium" whileTap={{ scale: 0.98 }}>Cancel</motion.button>
                  <motion.button type="button" onClick={handleSavePayment} className="flex-1 bg-dairy-600 text-white py-3 rounded-lg font-medium" whileTap={{ scale: 0.98 }}>Save Payment</motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerDetail;
