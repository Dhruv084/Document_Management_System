import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { setAuth } from '../../utils/auth';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    studentId: '',
    department: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const { name, email, password, confirmPassword, role, studentId, department, phone } = formData;

  const onChange = (e) => {
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
      setFormData({ ...formData, [name]: digitsOnly });
      return;
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate name - no numbers
    if (/\d/.test(name)) {
      toast.error('Name cannot contain numbers');
      setLoading(false);
      return;
    }

    // Validate phone - must be exactly 10 digits
    if (phone && phone.replace(/\D/g, '').length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      setLoading(false);
      return;
    }

    // Validate password - minimum 8 characters
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        studentId: role === 'student' ? studentId : undefined,
        department,
        phone
      });
      setAuth(res.data.token, res.data.user);
      toast.success('Registration successful!');
      
      const userRole = res.data.user.role;
      if (userRole === 'faculty') {
        navigate('/faculty');
      } else {
        navigate('/student');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-2xl w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl mb-6 transform hover:scale-110 transition-transform duration-300">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-4xl font-extrabold gradient-text">
            Create Your Account
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Join DocManage and start managing your documents
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-8 animate-slide-up">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input-modern"
                  placeholder="Enter your full name (no numbers)"
                  value={name}
                  onChange={onChange}
                  pattern="[A-Za-z\s]+"
                  title="Name cannot contain numbers"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-modern"
                  placeholder="Enter your email"
                  value={email}
                  onChange={onChange}
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  className="input-modern"
                  value={role}
                  onChange={onChange}
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>

              {role === 'student' && (
                <div>
                  <label htmlFor="studentId" className="block text-sm font-semibold text-gray-700 mb-2">
                    Student ID
                  </label>
                  <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    required
                    className="input-modern"
                    placeholder="Enter student ID"
                    value={studentId}
                    onChange={onChange}
                  />
                </div>
              )}

              <div>
                <label htmlFor="department" className="block text-sm font-semibold text-gray-700 mb-2">
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  required
                  className="input-modern"
                  value={department}
                  onChange={onChange}
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science & Engineering (CSE)">Computer Science & Engineering (CSE)</option>
                  <option value="Computer Engineering (CE)">Computer Engineering (CE)</option>
                  <option value="Information & Technology (IT)">Information & Technology (IT)</option>
                  <option value="Artificial Intelligence & Machine Learning (AI&ML)">Artificial Intelligence & Machine Learning (AI&ML)</option>
                </select>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="input-modern"
                  placeholder="Enter 10-digit phone number"
                  value={phone}
                  onChange={onChange}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  title="Phone number must be exactly 10 digits"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="input-modern"
                  placeholder="Enter password (min 8 characters)"
                  value={password}
                  onChange={onChange}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  className="input-modern"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={onChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="btn-secondary w-full inline-flex items-center justify-center"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500">
          © 2025 DocManage. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Signup;
