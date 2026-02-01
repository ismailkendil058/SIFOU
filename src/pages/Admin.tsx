
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { WorkersManager } from "@/components/admin/WorkersManager";
import { FinanceManager } from "@/components/admin/FinanceManager";

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workers' | 'finances'>('dashboard');

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <DashboardStats />}
      {activeTab === 'workers' && <WorkersManager />}
      {activeTab === 'finances' && <FinanceManager />}
    </AdminLayout>
  );
};

export default Admin;
