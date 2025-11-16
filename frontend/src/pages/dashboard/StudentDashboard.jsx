import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import StudentHome from './student/StudentHome';
import Notices from './student/Notices';
import Documents from './student/Documents';
import Calendar from './student/Calendar';

const StudentDashboard = () => {
  return (
    <Layout role="student">
      <Routes>
        <Route path="/" element={<StudentHome />} />
        <Route path="notices" element={<Notices />} />
        <Route path="documents" element={<Documents />} />
        <Route path="calendar" element={<Calendar />} />
      </Routes>
    </Layout>
  );
};

export default StudentDashboard;

