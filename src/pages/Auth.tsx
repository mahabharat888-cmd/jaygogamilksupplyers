import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dairy-50 to-dairy-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          key={isLogin ? 'login' : 'register'}
          initial={{ opacity: 0, x: isLogin ? -100 : 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isLogin ? 100 : -100 }}
          transition={{ duration: 0.3 }}
        >
          {isLogin ? (
            <Login onToggleMode={() => setIsLogin(false)} />
          ) : (
            <Register onToggleMode={() => setIsLogin(true)} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
