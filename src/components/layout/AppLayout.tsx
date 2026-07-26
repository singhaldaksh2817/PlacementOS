import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import { useStore } from '../../store/useStore';

export default function AppLayout() {
  const { syncProfile, syncNotifications } = useStore();

  useEffect(() => {
    syncProfile();
    syncNotifications();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden relative" style={{ background: 'transparent' }}>
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Outlet />
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#f0f0ff',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
    </div>
  );
}
