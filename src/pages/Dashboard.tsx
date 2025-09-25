import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout/Layout';
import { useData } from '../context/DataContext';
import { Package, Users, ShoppingCart, TrendingUp, Calendar, IndianRupee, PackageCheck } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { orders, products, customers } = useData();

  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(order => order.date === today);
  const pendingOrders = todayOrders.filter(order => order.status === 'pending');
  const deliveredOrders = todayOrders.filter(order => order.status === 'delivered');
  const totalCollection = deliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  const stats = [
    {
      icon: ShoppingCart,
      label: 'Pending Deliveries',
      value: pendingOrders.length.toString(),
      color: 'bg-orange-100 text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: TrendingUp,
      label: 'Delivered Today',
      value: deliveredOrders.length.toString(),
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: IndianRupee,
      label: 'Today\'s Collection',
      value: `₹${totalCollection.toFixed(2)}`,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Package,
      label: 'Total Products',
      value: products.length.toString(),
      color: 'bg-purple-100 text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Users,
      label: 'Total Customers',
      value: customers.length.toString(),
      color: 'bg-pink-100 text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      icon: Calendar,
      label: 'Total Orders Today',
      value: todayOrders.length.toString(),
      color: 'bg-dairy-100 text-dairy-600',
      bgColor: 'bg-dairy-50'
    }
  ];

  const productSummary = useMemo(() => {
    const summary: { [productId: string]: { name: string; totalCount: number } } = {};

    todayOrders.forEach(order => {
        order.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return;
            
            if (!summary[product.id]) {
                summary[product.id] = {
                    name: product.name,
                    totalCount: 0,
                };
            }
            
            summary[product.id].totalCount += item.quantity;
        });
    });

    return Object.values(summary).map(data => ({
        productName: data.name,
        total: data.totalCount.toString()
    })).sort((a, b) => a.productName.localeCompare(b.productName));

  }, [todayOrders, products]);

  return (
    <Layout title="Dashboard">
      <div className="px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-2">Today's Overview</h2>
          <p className="text-gray-600 text-sm">
            {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bgColor} p-4 rounded-xl border border-gray-100`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-gray-600">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6"
        >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Product Summary</h3>
            {productSummary.length > 0 ? (
                <div className="space-y-3">
                    {productSummary.map((summary, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-dairy-100 rounded-full">
                                   <PackageCheck size={18} className="text-dairy-600" />
                                </div>
                                <p className="font-medium text-gray-800">{summary.productName}</p>
                            </div>
                            <p className="font-semibold text-gray-800">{summary.total}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-4">
                    <p className="text-gray-600">No products have been ordered today.</p>
                </div>
            )}
        </motion.div>

        {todayOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Orders</h3>
            <div className="space-y-3">
              {todayOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{order.customerName}</p>
                    <p className="text-sm text-gray-600">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">₹{order.totalAmount.toFixed(2)}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      order.status === 'delivered' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {order.status === 'delivered' ? 'Delivered' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {todayOrders.length > 5 && (
              <p className="text-center text-sm text-gray-500 mt-3">
                +{todayOrders.length - 5} more orders
              </p>
            )}
          </motion.div>
        )}

        {todayOrders.length === 0 && !productSummary.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center"
          >
            <ShoppingCart className="mx-auto mb-4 text-gray-300" size={48} />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Orders Today</h3>
            <p className="text-gray-600">Start adding orders for today's deliveries</p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
