import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import { getAuth } from '../../../utils/auth';

const NoticeManagement = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    targetAudience: 'all',
    expiryDate: ''
  });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [attachmentsToRemove, setAttachmentsToRemove] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState(null);
  const { user } = getAuth();

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notices');
      setNotices(res.data.notices);
    } catch (error) {
      toast.error('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'general',
      targetAudience: 'all',
      expiryDate: ''
    });
    setFiles([]);
    setAttachmentsToRemove([]);
    setEditingNotice(null);
    setShowForm(false);
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      targetAudience: Array.isArray(notice.targetAudience) ? notice.targetAudience[0] : notice.targetAudience || 'all',
      expiryDate: notice.expiryDate ? new Date(notice.expiryDate).toISOString().split('T')[0] : ''
    });
    setFiles([]);
    setAttachmentsToRemove([]);
    setShowForm(true);
  };

  const handleRemoveAttachment = (index) => {
    setAttachmentsToRemove([...attachmentsToRemove, index]);
  };

  const handleRestoreAttachment = (index) => {
    setAttachmentsToRemove(attachmentsToRemove.filter(i => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('content', formData.content);
      uploadData.append('category', formData.category);
      uploadData.append('targetAudience', formData.targetAudience);
      if (formData.expiryDate) {
        uploadData.append('expiryDate', formData.expiryDate);
      }
      if (editingNotice && attachmentsToRemove.length > 0) {
        uploadData.append('removeAttachments', JSON.stringify(attachmentsToRemove));
      }
      files.forEach((file) => {
        uploadData.append('attachments', file);
      });

      if (editingNotice) {
        // Update existing notice
        await api.put(`/notices/${editingNotice._id}`, uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Notice updated successfully');
      } else {
        // Create new notice
        await api.post('/notices', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Notice created successfully');
      }

      resetForm();
      fetchNotices();
    } catch (error) {
      toast.error(error.response?.data?.message || (editingNotice ? 'Failed to update notice' : 'Failed to create notice'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (noticeId) => {
    setNoticeToDelete(noticeId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!noticeToDelete) return;

    try {
      await api.delete(`/notices/${noticeToDelete}`);
      toast.success('Notice deleted successfully');
      setShowDeleteConfirm(false);
      setNoticeToDelete(null);
      fetchNotices();
    } catch (error) {
      toast.error('You are not able to delete admin created notices');
      setShowDeleteConfirm(false);
      setNoticeToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setNoticeToDelete(null);
  };

  const isOwnNotice = (notice) => {
    if (!notice.postedBy || !user) return false;
    const noticeUserId = notice.postedBy._id || notice.postedBy;
    const currentUserId = user._id || user.id;
    return String(noticeUserId) === String(currentUserId);
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
          <h1 className="text-3xl font-bold gradient-text">Notice Management</h1>
          <p className="text-gray-600 mt-1">Create and manage notices for students</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ Create Notice'}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="card p-8 animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingNotice ? 'Edit Notice' : 'Create New Notice'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <input
                type="text"
                required
                className="input-modern"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
              <textarea
                required
                rows="6"
                className="input-modern"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  className="input-modern"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="event">Event</option>
                  <option value="important">Important</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Target Audience</label>
                <select
                  className="input-modern"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                >
                  <option value="all">All</option>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date (optional)</label>
              <input
                type="date"
                className="input-modern"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {editingNotice ? 'Add New Attachments (optional)' : 'Attachments (optional)'}
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="input-modern"
              />
              {editingNotice && editingNotice.attachments && editingNotice.attachments.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Existing Attachments:</p>
                  <div className="space-y-2">
                    {editingNotice.attachments.map((attachment, index) => {
                      const isMarkedForRemoval = attachmentsToRemove.includes(index);
                      return (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isMarkedForRemoval
                              ? 'bg-red-50 border-red-200 opacity-60'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${isMarkedForRemoval ? 'text-red-600 line-through' : 'text-gray-900'}`}>
                                {attachment.filename}
                              </p>
                              {attachment.size && (
                                <p className="text-xs text-gray-500">
                                  {(attachment.size / 1024).toFixed(1)} KB
                                </p>
                              )}
                            </div>
                          </div>
                          {isMarkedForRemoval ? (
                            <button
                              type="button"
                              onClick={() => handleRestoreAttachment(index)}
                              className="ml-3 px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-all"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(index)}
                              className="ml-3 px-3 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-all flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remove
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {attachmentsToRemove.length > 0 && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {attachmentsToRemove.length} attachment(s) marked for removal
                    </p>
                  )}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full disabled:opacity-50"
            >
              {submitting ? (editingNotice ? 'Updating...' : 'Creating...') : (editingNotice ? 'Update Notice' : 'Create Notice')}
            </button>
          </form>
        </div>
      )}

      {/* Notices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {notices.map((notice) => {
          const canEdit = isOwnNotice(notice);
          return (
            <div key={notice._id} className="card p-6 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex-1 break-words overflow-hidden min-w-0">{notice.title}</h3>
                <div className="flex items-center gap-2 ml-4">
                  {canEdit && (
                    <button
                      onClick={() => handleEdit(notice)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 font-semibold transition-all flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => handleDeleteClick(notice._id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200 font-semibold transition-all"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 whitespace-pre-wrap line-clamp-4 break-words overflow-hidden">{notice.content}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {notice.category}
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                  {new Date(notice.createdAt).toLocaleDateString()}
                </span>
                {notice.postedBy && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {notice.postedBy.role === 'admin' ? 'Admin' : 'Faculty'} - {notice.postedBy.name}
                  </span>
                )}
                {notice.targetAudience && notice.targetAudience.length > 0 && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    Target: {notice.targetAudience.join(', ')}
                  </span>
                )}
                {notice.expiryDate && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Expires: {new Date(notice.expiryDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              {notice.attachments && notice.attachments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Attachments:</p>
                  <div className="flex flex-wrap gap-2">
                    {notice.attachments.map((attachment, index) => (
                      <button
                        key={index}
                        onClick={async () => {
                          try {
                            const res = await api.get(
                              `/notices/${notice._id}/attachments/${index}`,
                              { responseType: 'blob' }
                            );
                            const url = window.URL.createObjectURL(new Blob([res.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', attachment.filename);
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                            toast.success('Attachment downloaded successfully');
                          } catch (error) {
                            toast.error('Failed to download attachment');
                          }
                        }}
                        className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all max-w-full overflow-hidden"
                      >
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="truncate break-words overflow-hidden">{attachment.filename}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {notices.length === 0 && (
        <div className="card p-12 text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <p className="text-lg font-medium text-gray-500">No notices found</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={cancelDelete}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Confirm Delete</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this notice? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeManagement;
