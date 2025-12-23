import React from "react";
import { WifiOff, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnlineStatus } from "@/components/hooks/useOnlineStatus";

export default function OfflineBanner() {
  const { isOffline, justReconnected } = useOnlineStatus();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-[100] shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">
              Você está offline. Algumas funcionalidades podem não funcionar.
            </span>
          </div>
        </motion.div>
      )}
      
      {justReconnected && !isOffline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 bg-green-500 text-white text-center py-2 z-[100] shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">
              Conexão restaurada!
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}