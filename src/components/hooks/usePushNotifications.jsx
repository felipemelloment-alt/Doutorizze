import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Configuração Firebase (via env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let firebaseApp = null;
let messaging = null;

// Inicializar Firebase
const initFirebase = () => {
  if (firebaseApp) return;
  
  try {
    firebaseApp = initializeApp(firebaseConfig);
    messaging = getMessaging(firebaseApp);
  } catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
  }
};

export function usePushNotifications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  const isSupported = typeof window !== "undefined" && 
                      "Notification" in window && 
                      "serviceWorker" in navigator &&
                      firebaseConfig.apiKey;

  useEffect(() => {
    if (!isSupported) return;

    // Registrar service worker
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registrado:', registration);
      } catch (error) {
        console.error('Erro ao registrar Service Worker:', error);
      }
    };

    registerServiceWorker();
    initFirebase();

    // Escutar mensagens em foreground
    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log('Mensagem recebida em foreground:', payload);
        
        // Mostrar notificação no app
        if (Notification.permission === "granted") {
          new Notification(payload.notification?.title || "Doutorizze", {
            body: payload.notification?.body || "",
            icon: payload.notification?.icon || "/icon-192.png",
            badge: "/badge-72.png"
          });
        }
      });
    }
  }, [isSupported]);

  const requestPermission = async () => {
    if (!isSupported) {
      setError("Notificações não suportadas neste navegador");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== "granted") {
        setError("Permissão negada pelo usuário");
        setLoading(false);
        return false;
      }

      // Obter token FCM
      initFirebase();
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });

      if (!token) {
        throw new Error("Não foi possível obter token FCM");
      }

      setFcmToken(token);

      // Salvar token no User entity
      try {
        await base44.auth.updateMe({ fcm_token: token });
      } catch (updateError) {
        console.warn("Erro ao salvar token no usuário:", updateError);
      }

      setLoading(false);
      return true;

    } catch (err) {
      console.error("Erro ao solicitar permissão:", err);
      setError(err.message || "Erro ao ativar notificações");
      setLoading(false);
      return false;
    }
  };

  const checkPermission = async () => {
    if (!isSupported) return false;
    
    const currentPermission = Notification.permission;
    setPermission(currentPermission);
    return currentPermission === "granted";
  };

  return {
    requestPermission,
    checkPermission,
    loading,
    error,
    permission,
    fcmToken,
    isSupported
  };
}