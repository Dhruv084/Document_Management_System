import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import AdminHome from './admin/AdminHome';
import UserManagement from './admin/UserManagement';
import DocumentManagement from './admin/DocumentManagement';
import NoticeManagement from './admin/NoticeManagement';

const AdminDashboard = () => {
  return (
    <Layout role="admin">
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="documents" element={<DocumentManagement />} />
        <Route path="notices" element={<NoticeManagement />} />
      </Routes>
    </Layout>
  );
};

export default AdminDashboard;

