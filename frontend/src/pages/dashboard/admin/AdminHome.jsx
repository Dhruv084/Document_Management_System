import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import { getAuth } from '../../../utils/auth';

const AdminHome = () => {
  const [stats, setStats] = useState({
    users: 0,
    students: 0,
    faculty: 0,
    documents: 0
  });
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchAdminInfo();
  }, []);

  const fetchAdminInfo = async () => {
    try {
      const res = await api.get('/auth/me');
      const userData = res.data.user;
      setAdminInfo(userData);
      setEditFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || ''
      });
    } catch (error) {
      const { user } = getAuth();
      setAdminInfo(user);
      if (user) {
        setEditFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || ''
        });
      }
    }
  };

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const userId = adminInfo.id || adminInfo._id;
      const res = await api.put(`/users/${userId}`, editFormData);
      setAdminInfo(res.data.user);
      toast.success('Profile updated successfully!');
      setShowEditModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [usersRes, documentsRes] = await Promise.all([
        api.get('/users'),
        api.get('/documents')
      ]);

      const users = usersRes.data.users || [];
      const nonAdminUsers = users.filter(u => u.role !== 'admin');
      const students = nonAdminUsers.filter(u => u.role === 'student').length;
      const faculty = nonAdminUsers.filter(u => u.role === 'faculty').length;
      const totalUsers = students + faculty;

      setStats({
        users: totalUsers,
        students,
        faculty,
        documents: documentsRes.data.total || 0
      });
    } catch (error) {
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-blue-600',
      link: '/admin/users'
    },
    {
      title: 'Students',
      value: stats.students,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      gradient: 'from-green-500 to-emerald-600',
      link: '/admin/users'
    },
    {
      title: 'Faculty',
      value: stats.faculty,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-indigo-600',
      link: '/admin/users'
    },
    {
      title: 'Documents',
      value: stats.documents,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: 'from-orange-500 to-red-600',
      link: '/admin/documents'
    }
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'View and manage all users in the system',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      link: '/admin/users',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Document Management',
      description: 'Manage all documents in the system',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      link: '/admin/documents',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Notice Management',
      description: 'Create and manage notices',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      link: '/admin/notices',
      gradient: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-blue-100 text-lg">Welcome back! Here's what's happening with your system.</p>
      </div>

      {/* Admin Info Card */}
      {adminInfo && (
        <div className="card p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Admin Information</h2>
            <button
              onClick={handleEditClick}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-lg font-bold text-gray-900">{adminInfo.name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-lg font-bold text-gray-900">{adminInfo.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-lg font-bold text-gray-900">{adminInfo.phone || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="text-lg font-bold text-gray-900 capitalize">{adminInfo.role || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="card p-6 hover:scale-105 transition-all duration-300 group"
          >
            <div className={`w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`card p-6 hover:scale-105 transition-all duration-300 group bg-gradient-to-br ${action.gradient} text-white`}
            >
              <div className="mb-4 transform group-hover:scale-110 transition-transform">
                {action.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{action.title}</h3>
              <p className="text-white/90">{action.description}</p>
              <div className="mt-4 flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform">
                <span>Get Started</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Edit Profile</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  required
                  className="input-modern w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditChange}
                  required
                  className="input-modern w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditChange}
                  className="input-modern w-full"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHome;
