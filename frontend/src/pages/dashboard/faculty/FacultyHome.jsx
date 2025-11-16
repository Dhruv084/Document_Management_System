import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import { getAuth } from '../../../utils/auth';

const FacultyHome = () => {
  const [stats, setStats] = useState({
    students: 0,
    notices: 0
  });
  const [facultyInfo, setFacultyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: ''
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchFacultyInfo();
  }, []);

  const fetchFacultyInfo = async () => {
    try {
      const res = await api.get('/auth/me');
      const userData = res.data.user;
      setFacultyInfo(userData);
      setEditFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        department: userData.department || ''
      });
    } catch (error) {
      const { user } = getAuth();
      setFacultyInfo(user);
      if (user) {
        setEditFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          department: user.department || ''
        });
      }
    }
  };

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    
    // Validation for name - no numbers allowed
    if (name === 'name') {
      if (/\d/.test(value)) {
        toast.error('Name cannot contain numbers');
        return;
      }
    }
    
    // Validation for phone - only digits, max 10
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length > 10) {
        return; // Don't update if exceeds 10 digits
      }
      setEditFormData({ ...editFormData, [name]: digitsOnly });
      return;
    }
    
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validate name - no numbers
    if (/\d/.test(editFormData.name)) {
      toast.error('Name cannot contain numbers');
      return;
    }

    // Validate phone - must be exactly 10 digits if provided
    if (editFormData.phone && editFormData.phone.replace(/\D/g, '').length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    setUpdating(true);
    try {
      const userId = facultyInfo.id || facultyInfo._id;
      const res = await api.put(`/users/${userId}`, editFormData);
      setFacultyInfo(res.data.user);
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
      const [studentsRes, noticesRes] = await Promise.all([
        api.get('/users/students/list'),
        api.get('/notices')
      ]);

      setStats({
        students: studentsRes.data.total || 0,
        notices: noticesRes.data.total || 0
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
      title: 'Total Students',
      value: stats.students,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-blue-600',
      link: '/faculty/students'
    },
    {
      title: 'My Notices',
      value: stats.notices,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-indigo-600',
      link: '/faculty/notices'
    }
  ];

  const quickActions = [
    {
      title: 'Student Records',
      description: 'View and manage student records',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      link: '/faculty/students',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Manage Notices',
      description: 'Create and manage notices for students',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      link: '/faculty/notices',
      gradient: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl shadow-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Faculty Dashboard</h1>
        <p className="text-purple-100 text-lg">Manage your students and create notices</p>
      </div>

      {/* Faculty Info Card */}
      {facultyInfo && (
        <div className="card p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Faculty Information</h2>
            <button
              onClick={handleEditClick}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-lg font-bold text-gray-900">{facultyInfo.name || 'N/A'}</p>
              </div>
            </div>
            {facultyInfo.department && (
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Department</p>
                  <p className="text-lg font-bold text-gray-900">{facultyInfo.department}</p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-lg font-bold text-gray-900">{facultyInfo.email || 'N/A'}</p>
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
                <p className="text-lg font-bold text-gray-900">{facultyInfo.phone || 'N/A'}</p>
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
                <p className="text-lg font-bold text-gray-900 capitalize">{facultyInfo.role || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  pattern="[A-Za-z\s]+"
                  title="Name cannot contain numbers"
                  placeholder="Enter your full name (no numbers)"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  value={editFormData.department}
                  onChange={handleEditChange}
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
                  maxLength={10}
                  pattern="[0-9]{10}"
                  title="Phone number must be exactly 10 digits"
                  placeholder="Enter 10-digit phone number"
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default FacultyHome;
