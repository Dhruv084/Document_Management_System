import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../../utils/api';

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [search, categoryFilter]);

  const fetchDocuments = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;

      const res = await api.get('/documents', { params });
      setDocuments(res.data.documents);
    } catch (error) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await api.delete(`/documents/${documentId}`);
      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleDownload = async (doc) => {
    try {
      const res = await api.get(`/documents/${doc._id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.originalName || doc.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Document downloaded successfully');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to download document');
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
          <h1 className="text-3xl font-bold gradient-text">Document Management</h1>
          <p className="text-gray-600 mt-1">Manage all documents in the system</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search documents..."
                className="input-modern pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          {/* <select
            className="input-modern sm:w-48"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="academic">Academic</option>
            <option value="administrative">Administrative</option>
            <option value="syllabus">Syllabus</option>
            <option value="form">Form</option>
            <option value="other">Other</option>
          </select> */}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => {
          const isNoticeAttachment = doc.isNoticeAttachment || doc._id?.startsWith('notice_');
          return (
            <div key={doc._id} className="card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                {isNoticeAttachment && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Notice Attachment
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{doc.title}</h3>
              {doc.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{doc.description}</p>
              )}
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {doc.category}
                </span>
                {doc.size && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    {(doc.size / 1024).toFixed(2)} KB
                  </span>
                )}
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {doc.downloadCount || 0} downloads
                </span>
                {doc.department && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    {doc.department}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(doc)}
                  className="flex-1 btn-primary text-sm py-2"
                >
                  Download
                </button>
                {!isNoticeAttachment && (
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-all"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {documents.length === 0 && (
        <div className="card p-12 text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium text-gray-500">No documents found</p>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;
