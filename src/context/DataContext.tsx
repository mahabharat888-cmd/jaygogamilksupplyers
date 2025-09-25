import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import { Product, Customer, DailyOrder } from '../types';

type ProductInsert = Omit<Product, 'id' | 'created_at' | 'user_id'>;
type CustomerInsert = Omit<Customer, 'id' | 'created_at' | 'user_id'>;
type OrderInsert = Omit<DailyOrder, 'id' | 'created_at' | 'user_id'>;

interface DataContextType {
  products: Product[];
  customers: Customer[];
  orders: DailyOrder[];
  
  addProduct: (product: ProductInsert) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  addCustomer: (customer: CustomerInsert) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  addOrder: (order: OrderInsert) => Promise<void>;
  updateOrder: (order: DailyOrder) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  
  isLoading: boolean;
  refetchData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<DailyOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setProducts([]);
      setCustomers([]);
      setOrders([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const [productsRes, customersRes, ordersRes] = await Promise.all([
        supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('customers').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('daily_orders').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (customersRes.error) throw customersRes.error;
      if (ordersRes.error) throw ordersRes.error;

      setProducts(productsRes.data as Product[]);
      setCustomers(customersRes.data as Customer[]);
      setOrders(ordersRes.data as DailyOrder[]);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const addProduct = async (productData: ProductInsert) => {
    if (!user) return;
    const { data, error } = await supabase.from('products').insert([{ ...productData, user_id: user.id }]).select();
    if (error) throw error;
    if (data) setProducts(prev => [data[0], ...prev]);
  };

  const updateProduct = async (productData: Product) => {
    const { data, error } = await supabase.from('products').update(productData).eq('id', productData.id).select();
    if (error) throw error;
    if (data) setProducts(prev => prev.map(p => p.id === productData.id ? data[0] : p));
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addCustomer = async (customerData: CustomerInsert) => {
    if (!user) return;
    const { data, error } = await supabase.from('customers').insert([{ ...customerData, user_id: user.id }]).select();
    if (error) throw error;
    if (data) setCustomers(prev => [data[0], ...prev]);
  };

  const updateCustomer = async (customerData: Customer) => {
    const { data, error } = await supabase.from('customers').update(customerData).eq('id', customerData.id).select();
    if (error) throw error;
    if (data) setCustomers(prev => prev.map(c => c.id === customerData.id ? data[0] : c));
  };

  const deleteCustomer = async (id: string) => {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const addOrder = async (orderData: OrderInsert) => {
    if (!user) return;
    const { data, error } = await supabase.from('daily_orders').insert([{ ...orderData, user_id: user.id }]).select();
    if (error) throw error;
    if (data) setOrders(prev => [data[0], ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const updateOrder = async (orderData: DailyOrder) => {
    const { data, error } = await supabase.from('daily_orders').update(orderData).eq('id', orderData.id).select();
    if (error) throw error;
    if (data) setOrders(prev => prev.map(o => o.id === orderData.id ? data[0] : o));
  };

  const deleteOrder = async (id: string) => {
    const { error } = await supabase.from('daily_orders').delete().eq('id', id);
    if (error) throw error;
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const value = {
    products, customers, orders,
    addProduct, updateProduct, deleteProduct,
    addCustomer, updateCustomer, deleteCustomer,
    addOrder, updateOrder, deleteOrder,
    isLoading, refetchData: fetchData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
