import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  orderId: string;
}

export default function PaymentSuccessModal({ isOpen, orderId }: PaymentSuccessModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        router.push(`/orders/${orderId}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, orderId, router]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white p-8 md:p-12 rounded-xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="bg-green-100 p-4 rounded-full mb-6"
            >
              <CheckCircle className="w-16 h-16 text-green-500" />
            </motion.div>
            
            <h2 className="text-2xl font-black uppercase tracking-tighter text-[#111] mb-2 text-center">
              Payment Successful!
            </h2>
            
            <p className="text-sm opacity-70 mb-6 text-center">
              Your order has been placed successfully.
            </p>
            
            <div className="bg-gray-100 w-full p-4 rounded text-center">
              <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Order ID</p>
              <p className="font-mono font-black text-sm">{orderId}</p>
            </div>
            
            <div className="mt-8 flex space-x-2 justify-center w-full">
               <div className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: '0ms' }} />
               <div className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: '150ms' }} />
               <div className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mt-4 text-center">
              Redirecting to order details...
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
