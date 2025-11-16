import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import FacultyHome from './faculty/FacultyHome';
import StudentRecords from './faculty/StudentRecords';
import NoticeManagement from './faculty/NoticeManagement';

const FacultyDashboard = () => {
  return (
    <Layout role="faculty">
      <Routes>
        <Route path="/" element={<FacultyHome />} />
        <Route path="students" element={<StudentRecords />} />
        <Route path="notices" element={<NoticeManagement />} />
      </Routes>
    </Layout>
  );
};

export default FacultyDashboard;

