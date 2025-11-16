import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../../utils/api';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notices');
      setNotices(res.data.notices);
      if (res.data.notices.length > 0) {
        setSelectedNotice(res.data.notices[0]);
      }
    } catch (error) {
      toast.error('Failed to fetch notices');
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Notices</h1>
        <p className="text-blue-100 text-lg">Stay updated with all announcements and notices</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notices List */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="divide-y divide-gray-200">
              {notices.map((notice) => (
                <div
                  key={notice._id}
                  className={`p-6 cursor-pointer transition-all duration-200 overflow-hidden ${
                    selectedNotice?._id === notice._id 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedNotice(notice)}
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-2 break-words overflow-hidden">{notice.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3 break-words overflow-hidden">{notice.content}</p>
                  <div className="flex flex-wrap gap-2">
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
                    {notice.attachments && notice.attachments.length > 0 && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {notice.attachments.length} attachment{notice.attachments.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {notices.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p className="text-lg font-medium">No notices found</p>
              </div>
            )}
          </div>
        </div>

        {/* Notice Details */}
        {selectedNotice && (
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-6 overflow-hidden">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 break-words overflow-hidden">{selectedNotice.title}</h2>
              
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {selectedNotice.category}
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                  {new Date(selectedNotice.createdAt).toLocaleDateString()}
                </span>
                {selectedNotice.targetAudience && selectedNotice.targetAudience.length > 0 && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    {selectedNotice.targetAudience.join(', ')}
                  </span>
                )}
                {selectedNotice.expiryDate && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Expires: {new Date(selectedNotice.expiryDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              <div className="prose max-w-none mb-4 overflow-hidden">
                <p className="text-gray-700 whitespace-pre-wrap break-words overflow-wrap-anywhere">{selectedNotice.content}</p>
              </div>
              
              {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Attachments:</p>
                  <div className="space-y-2">
                    {selectedNotice.attachments.map((attachment, index) => (
                      <button
                        key={index}
                        onClick={async () => {
                          try {
                            const res = await api.get(
                              `/notices/${selectedNotice._id}/attachments/${index}`,
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
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors overflow-hidden"
                      >
                        <div className="flex items-center min-w-0 flex-1">
                          <svg className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm text-gray-700 truncate break-words overflow-hidden">{attachment.filename}</span>
                        </div>
                        {attachment.size && (
                          <span className="text-xs text-gray-500">
                            {(attachment.size / 1024).toFixed(1)} KB
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedNotice.postedBy && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Posted by: <span className="font-semibold text-gray-900">
                      {selectedNotice.postedBy.role === 'admin' ? 'Admin' : 'Faculty'} - {selectedNotice.postedBy.name}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notices;
