import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../../utils/api';

const StudentRecords = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const fetchStudents = async () => {
    try {
      const params = {};
      if (search) params.search = search;

      const res = await api.get('/users/students/list', { params });
      setStudents(res.data.students);
    } catch (error) {
      toast.error('Failed to fetch students');
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Student Records</h1>
          <p className="text-gray-600 mt-1">View and manage student information</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search students..."
            className="input-modern pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => (
          <div 
            key={student._id} 
            className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
          >
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-24 relative">
              <div className="absolute inset-0 bg-black opacity-5"></div>
            </div>
            
            {/* Avatar Section */}
            <div className="relative px-6 -mt-12 mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-xl ring-4 ring-white transform group-hover:scale-105 transition-transform duration-300">
                {student.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
            </div>

            {/* Content Section */}
            <div className="px-6 pb-6">
              {/* Name and Email */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {student.name}
                </h3>
                <p className="text-sm text-gray-500 flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {student.email}
                </p>
              </div>

              {/* Details Section */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                {student.studentId && (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Student ID</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{student.studentId}</p>
                    </div>
                  </div>
                )}
                
                {student.department && (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Department</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{student.department}</p>
                    </div>
                  </div>
                )}
                
                {student.phone && (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{student.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {students.length === 0 && (
        <div className="card p-12 text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-lg font-medium text-gray-500">No students found</p>
        </div>
      )}
    </div>
  );
};

export default StudentRecords;
