import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const milestoneStatus = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
};

const taskStatus = {
  todo: 'bg-gray-100 text-gray-500',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

const projectStatus = {
  active: 'bg-green-100 text-green-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ title: '', due_date: '' });
  const [taskForms, setTaskForms] = useState({});
  const [uploading, setUploading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const fileRef = useRef();

  const isStaffOrAdmin = ['admin', 'staff'].includes(user?.role);

  const load = async () => {
    try {
      const [p, f] = await Promise.all([api.get(`/projects/${id}`), api.get(`/files/${id}`)]);
      setProject(p.data); setFiles(f.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const calcProgress = () => {
    if (!project?.milestones) return 0;
    const all = project.milestones.flatMap(m => m.tasks || []);
    if (!all.length) return 0;
    return Math.round((all.filter(t => t.status === 'completed').length / all.length) * 100);
  };

  const addMilestone = async (e) => {
    e.preventDefault();
    await api.post(`/milestones/${id}`, milestoneForm);
    setMilestoneForm({ title: '', due_date: '' });
    setShowMilestoneForm(false);
    load();
  };

  const updateMilestoneStatus = async (mId, status, title) => {
    await api.put(`/milestones/${mId}`, { title, status });
    load();
  };

  const deleteMilestone = async (milestoneId, title) => {
    if (!confirm(`Delete milestone "${title}"? All tasks under it will also be deleted.`)) return;
    try {
      await api.delete(`/milestones/${milestoneId}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete milestone');
    }
  };

  const addTask = async (milestoneId, e) => {
    e.preventDefault();
    const form = taskForms[milestoneId];
    if (!form?.title) return;
    await api.post(`/tasks/${milestoneId}`, form);
    setTaskForms(prev => ({ ...prev, [milestoneId]: { title: '', assigned_to: '' } }));
    load();
  };

  const updateTaskStatus = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}/status`, { status });
    load();
  };

  const deleteTask = async (taskId, title) => {
    if (!confirm(`Delete task "${title}"?`)) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      await api.post(`/files/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      load();
    } finally {
      setUploading(false);
      fileRef.current.value = '';
    }
  };

  const deleteFile = async (fileId, filename) => {
    if (!confirm(`Delete "${filename}"? This cannot be undone.`)) return;
    setDeletingFileId(fileId);
    try {
      await api.delete(`/files/${fileId}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete file');
    } finally {
      setDeletingFileId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
    </div>
  );

  if (!project) return (
    <div className="text-center py-20 text-gray-400">
      <p className="text-4xl mb-3">🔍</p>
      <p>Project not found</p>
    </div>
  );

  const progress = calcProgress();
  const totalTasks = project.milestones?.flatMap(m => m.tasks || []).length || 0;
  const doneTasks = project.milestones?.flatMap(m => m.tasks || []).filter(t => t.status === 'completed').length || 0;

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition mb-5">
        ← Back
      </button>

      {/* Project Header Card */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">🌐</div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">{project.title}</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Client: {project.client_name} · Managed by: {project.created_by_name}
              </p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${projectStatus[project.status] || 'bg-gray-100 text-gray-600'}`}>
            {project.status?.replace('_', ' ')}
          </span>
        </div>

        {project.description && (
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">{project.description}</p>
        )}

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-semibold text-gray-800">{progress}%</p>
            <p className="text-xs text-gray-400 mt-0.5">Overall progress</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-semibold text-gray-800">{doneTasks}/{totalTasks}</p>
            <p className="text-xs text-gray-400 mt-0.5">Tasks completed</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-semibold text-gray-800">
              {project.deadline
                ? new Date(project.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                : '—'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Deadline</p>
          </div>
        </div>

        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: progress >= 100 ? '#43a047' : progress >= 50 ? '#1a3a6b' : '#fb8c00'
            }} />
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white border border-gray-100 rounded-xl mb-5 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Milestones & tasks</h2>
            <p className="text-xs text-gray-400 mt-0.5">{project.milestones?.length || 0} milestones</p>
          </div>
          {isStaffOrAdmin && (
            <button onClick={() => setShowMilestoneForm(!showMilestoneForm)}
              className="text-xs font-medium text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition">
              + Add milestone
            </button>
          )}
        </div>

        {showMilestoneForm && (
          <form onSubmit={addMilestone} className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex gap-3">
            <input required value={milestoneForm.title}
              onChange={e => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
              className="flex-1 border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              placeholder="Milestone title..." />
            <input type="date" value={milestoneForm.due_date}
              onChange={e => setMilestoneForm({ ...milestoneForm, due_date: e.target.value })}
              className="border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
            <button type="submit" className="text-white text-sm px-4 py-2 rounded-lg font-medium" style={{ background: '#1a3a6b' }}>
              Add
            </button>
            <button type="button" onClick={() => setShowMilestoneForm(false)}
              className="text-gray-500 text-sm px-3 py-2 hover:bg-blue-100 rounded-lg transition">
              Cancel
            </button>
          </form>
        )}

        {!project.milestones?.length ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">🚩</p>
            <p className="text-sm">No milestones yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {project.milestones.map(m => {
              const mTasks = m.tasks || [];
              const mDone = mTasks.filter(t => t.status === 'completed').length;
              const mProgress = mTasks.length ? Math.round((mDone / mTasks.length) * 100) : 0;

              return (
                <div key={m.id} className="px-5 py-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.status === 'completed' ? 'bg-green-500' : m.status === 'in_progress' ? 'bg-yellow-400' : 'bg-gray-300'}`} />
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">{m.title}</h3>
                        {m.due_date && (
                          <p className="text-xs text-gray-400">Due {new Date(m.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${milestoneStatus[m.status]}`}>
                        {m.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">{mDone}/{mTasks.length} tasks</span>
                      {isStaffOrAdmin && (
                        <select value={m.status}
                          onChange={e => updateMilestoneStatus(m.id, e.target.value, m.title)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50">
                          {['pending', 'in_progress', 'completed'].map(s => (
                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                          ))}
                        </select>
                      )}
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => deleteMilestone(m.id, m.title)}
                          className="text-xs text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 rounded-lg px-2.5 py-1 hover:bg-red-50 transition">
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {mTasks.length > 0 && (
                    <div className="h-1 bg-gray-100 rounded-full mb-3 ml-5">
                      <div className="h-full rounded-full bg-blue-400 transition-all" style={{ width: `${mProgress}%` }} />
                    </div>
                  )}

                  <div className="ml-5 space-y-2">
                    {mTasks.map(t => (
                      <div key={t.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" disabled={!isStaffOrAdmin}
                            checked={t.status === 'completed'}
                            onChange={e => updateTaskStatus(t.id, e.target.checked ? 'completed' : 'todo')}
                            className="rounded accent-blue-700" />
                          <span className={`text-sm ${t.status === 'completed' ? 'line-through text-gray-300' : 'text-gray-700'}`}>
                            {t.title}
                          </span>
                          {t.assigned_name && (
                            <span className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                              {t.assigned_name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${taskStatus[t.status]}`}>
                            {t.status?.replace('_', ' ')}
                          </span>
                          {isStaffOrAdmin && (
                            <select value={t.status}
                              onChange={e => updateTaskStatus(t.id, e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white">
                              {['todo', 'in_progress', 'completed'].map(s => (
                                <option key={s} value={s}>{s.replace('_', ' ')}</option>
                              ))}
                            </select>
                          )}
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => deleteTask(t.id, t.title)}
                              className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 border border-red-100 hover:border-red-300 rounded px-2 py-1 transition">
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {isStaffOrAdmin && (
                      <form onSubmit={e => addTask(m.id, e)} className="flex gap-2 mt-2">
                        <input
                          value={taskForms[m.id]?.title || ''}
                          required
                          onChange={e => setTaskForms(prev => ({ ...prev, [m.id]: { ...prev[m.id], title: e.target.value } }))}
                          className="flex-1 border border-dashed border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white placeholder-gray-300"
                          placeholder="Add a task..." />
                        <button type="submit" className="text-white text-xs px-3 py-2 rounded-lg font-medium" style={{ background: '#1a3a6b' }}>
                          Add
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Files */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Files & deliverables</h2>
            <p className="text-xs text-gray-400 mt-0.5">{files.length} {files.length === 1 ? 'file' : 'files'} uploaded</p>
          </div>
          {isStaffOrAdmin && (
            <>
              <button onClick={() => fileRef.current.click()} disabled={uploading}
                className="text-xs font-medium text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition disabled:opacity-50">
                {uploading ? 'Uploading...' : '+ Upload file'}
              </button>
              <input ref={fileRef} type="file" className="hidden" onChange={uploadFile} />
            </>
          )}
        </div>

        {!files.length ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">📄</p>
            <p className="text-sm">No files uploaded yet</p>
            {isStaffOrAdmin && (
              <p className="text-xs mt-1 text-gray-300">Accepted: pdf, doc, docx, xls, xlsx, png, jpg, zip, txt (max 10MB)</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {files.map(f => (
              <div key={f.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-lg">📄</div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{f.filename}</p>
                    <p className="text-xs text-gray-400">
                      Uploaded by {f.uploaded_by_name} · {new Date(f.upload_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`/uploads/${f.filepath}`} download={f.filename}
                    className="text-xs font-medium text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition">
                    Download
                  </a>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => deleteFile(f.id, f.filename)}
                      disabled={deletingFileId === f.id}
                      className="text-xs font-medium text-red-500 border border-red-100 rounded-lg px-3 py-1.5 hover:bg-red-50 transition disabled:opacity-50">
                      {deletingFileId === f.id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}