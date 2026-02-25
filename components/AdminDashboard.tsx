
import React, { useState, useRef, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import { ADMIN_STATS, ADMIN_USERS, ADMIN_NOTIFICATIONS, MOCK_MODERATORS, MOCK_SYSTEM_LOGS } from '../constants';
import { UserReview, UserProfile, Moderator, PremiumFeature, PremiumPlan, PremiumPermissions, SiteConfig, SystemLog, AboutPageConfig, Report, AppEvent } from '../types';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSiteConfig } from '../SiteConfigContext';
import { useReports } from '../ReportContext';
import { useEvents } from '../EventContext';
import { useModeration } from '../ModerationContext';
import { useSupport } from '../SupportContext';

// --- Charts Data ---
const dataMatch = [
  { name: 'Mon', matches: 650 },
  { name: 'Tue', matches: 590 },
  { name: 'Wed', matches: 800 },
  { name: 'Thu', matches: 810 },
  { name: 'Fri', matches: 560 },
  { name: 'Sat', matches: 950 },
  { name: 'Sun', matches: 842 },
];

const dataUser = [
  { name: 'Male', value: 65 },
  { name: 'Female', value: 35 },
];

const dataRevenue = [
  { name: 'Jan', free: 4000, premium: 2400 },
  { name: 'Feb', free: 3000, premium: 1398 },
  { name: 'Mar', free: 2000, premium: 9800 },
  { name: 'Apr', free: 2780, premium: 3908 },
  { name: 'May', free: 1890, premium: 4800 },
  { name: 'Jun', free: 2390, premium: 3800 },
  { name: 'Jul', free: 3490, premium: 4300 },
];

const COLORS = ['#3B82F6', '#EC4899'];

// --- Sub-components ---

// Rich Text Editor Component
const RichTextEditor: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <div className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 flex-wrap">
        <button onClick={() => execCmd('bold')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200" title="Bold">
          <span className="material-icons-round text-lg">format_bold</span>
        </button>
        <button onClick={() => execCmd('italic')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200" title="Italic">
          <span className="material-icons-round text-lg">format_italic</span>
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>
        <button onClick={() => execCmd('insertUnorderedList')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200" title="Bullet List">
          <span className="material-icons-round text-lg">format_list_bulleted</span>
        </button>
        <button onClick={() => execCmd('insertOrderedList')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200" title="Numbered List">
          <span className="material-icons-round text-lg">format_list_numbered</span>
        </button>
      </div>
      <div
        ref={editorRef}
        className="p-4 min-h-[200px] outline-none prose prose-sm dark:prose-invert max-w-none"
        contentEditable
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
      />
    </div>
  );
};

const OverviewTab: React.FC = () => {
  const { reports, updateReportStatus } = useReports();

  const handleResolve = (id: string) => {
    updateReportStatus(id, 'Resolved');
  };

  const handleBan = (report: Report) => {
    if (window.confirm(`Are you sure you want to BAN ${report.user}? This will also resolve the report.`)) {
        updateReportStatus(report.id, 'Resolved');
        alert(`User ${report.user} banned successfully.`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
       {/* Stats Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ADMIN_STATS.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{stat.value}</h3>
                </div>
                <div className={`p-2 rounded-lg text-${stat.color}-600 bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                  <span className="material-icons-round">{stat.icon}</span>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <span className={`flex items-center font-medium ${stat.trendDirection === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  <span className="material-icons-round text-base mr-0.5">{stat.trendDirection === 'up' ? 'trending_up' : 'trending_down'}</span>
                  {stat.trend}
                </span>
                <span className="text-gray-400 ml-2">vs last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Match Activity</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataMatch}>
                  <defs>
                    <linearGradient id="colorMatches" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="matches" stroke="#F59E0B" fillOpacity={1} fill="url(#colorMatches)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">User Demographics</h3>
            <div className="h-64 relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dataUser} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {dataUser.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <span className="text-2xl font-bold text-gray-700 dark:text-gray-200">Total</span>
                  <span className="text-sm text-gray-500">Active</span>
               </div>
            </div>
          </div>
        </div>

        {/* Recent Reports Summary */}
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Recent Reports</h3>
            </div>
            <Link to="#" className="text-sm text-primary font-bold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">User</th>
                  <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Reason</th>
                  <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Status</th>
                  <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {reports.slice(0, 3).map((report) => (
                  <tr key={report.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${report.status === 'Resolved' ? 'opacity-50 grayscale bg-gray-50/50 dark:bg-black/10' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={report.userImage} alt="" className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{report.user}</p>
                          <p className="text-xs text-gray-500">{report.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        report.reason === 'Harassment' ? 'bg-red-100 text-red-700' : 
                        report.reason === 'Spam' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {report.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center w-fit gap-1 ${
                           report.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                           report.status === 'Reviewing' ? 'bg-blue-100 text-blue-700' :
                           'bg-green-100 text-green-700'
                       }`}>
                           <span className={`w-1.5 h-1.5 rounded-full ${
                               report.status === 'Pending' ? 'bg-yellow-500' :
                               report.status === 'Reviewing' ? 'bg-blue-500' :
                               'bg-green-500'
                           }`}></span>
                           {report.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {report.status !== 'Resolved' ? (
                        <>
                            <button 
                                onClick={() => handleResolve(report.id)}
                                className="text-green-600 hover:bg-green-100 p-1.5 rounded-lg transition-colors"
                                title="Resolve Report"
                            >
                                <span className="material-icons-round text-lg">check_circle</span>
                            </button>
                            <button 
                                onClick={() => handleBan(report)}
                                className="text-red-600 hover:bg-red-100 p-1.5 rounded-lg transition-colors"
                                title="Ban User"
                            >
                                <span className="material-icons-round text-lg">gavel</span>
                            </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium italic">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                    <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                            No active reports.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
};

// --- NEW FEATURE: Moderation Queue Tab ---
const ModerationQueueTab: React.FC = () => {
  const { queue, approveItem, rejectItem } = useModeration();

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    if (action === 'approve') {
        approveItem(id);
    } else {
        rejectItem(id);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <div>
           <h3 className="text-lg font-bold text-gray-800 dark:text-white">Moderation Queue</h3>
           <p className="text-sm text-gray-500">Review pending user content</p>
        </div>
        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
          {queue.length} Pending
        </span>
      </div>

      <div className="p-6 overflow-y-auto">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <span className="material-icons-round text-6xl mb-4 opacity-20">check_circle</span>
            <p>All caught up! No images to review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {queue.map(img => (
              <div key={img.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-shadow">
                <div className="relative aspect-square">
                  <img src={img.image} alt="Review" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md">
                    {img.type}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-white text-sm">{img.user}</h4>
                      <p className="text-xs text-gray-500">{img.time}</p>
                    </div>
                    <Link to="#" className="text-primary text-xs hover:underline">View Profile</Link>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAction(img.id, 'reject')}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <span className="material-icons-round text-lg">close</span> Reject
                    </button>
                    <button 
                      onClick={() => handleAction(img.id, 'approve')}
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-600 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <span className="material-icons-round text-lg">check</span> Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- NEW FEATURE: Events Management Tab ---
const EventsManagementTab: React.FC = () => {
  const { events, addEvent, deleteEvent, updateEvent } = useEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Custom Delete Modal State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const initialEventState: Partial<AppEvent> = {
    title: '', 
    date: '', 
    time: '',
    location: '', 
    description: '',
    category: 'Meetup',
    price: 'Free',
    image: '',
    status: 'Draft',
    attendees: 0
  };
  const [formData, setFormData] = useState<Partial<AppEvent>>(initialEventState);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialEventState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event: AppEvent) => {
    setEditingId(event.id);
    setFormData(event);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Default image if none provided
    const imageToUse = formData.image || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=60';

    if (editingId) {
      updateEvent({ ...formData, id: editingId, image: imageToUse } as AppEvent);
    } else {
      addEvent({ 
        ...formData, 
        id: Date.now().toString(),
        image: imageToUse,
        attendees: 0 
      } as AppEvent);
    }
    setIsModalOpen(false);
  };

  // Improved Delete handling
  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
        deleteEvent(deleteConfirmId);
        setDeleteConfirmId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col relative">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <div>
           <h3 className="text-lg font-bold text-gray-800 dark:text-white">Community Events</h3>
           <p className="text-sm text-gray-500">Manage meetups and special events</p>
        </div>
        <button onClick={handleOpenAdd} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg">
            <span className="material-icons-round text-sm">add</span> Create Event
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-4">
          {events.map(event => (
            <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex flex-col items-center justify-center font-bold overflow-hidden">
                   {/* Thumbnail if available */}
                   {event.image ? (
                        <img src={event.image} className="w-full h-full object-cover" alt="" />
                   ) : (
                        <>
                            <span className="text-xs uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-lg leading-none">{new Date(event.date).getDate() || '??'}</span>
                        </>
                   )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white">{event.title}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="material-icons-round text-[10px]">place</span> {event.location} • {event.category}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    event.status === 'Upcoming' ? 'bg-green-100 text-green-700' :
                    event.status === 'Draft' ? 'bg-gray-200 text-gray-600' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {event.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{event.attendees} Going</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenEdit(event)} className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <span className="material-icons-round">edit</span>
                  </button>
                  <button onClick={() => handleDeleteClick(event.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
                    <span className="material-icons-round">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                 <h3 className="font-bold text-lg text-gray-800 dark:text-white">{editingId ? 'Edit Event' : 'Create Event'}</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500">
                    <span className="material-icons-round">close</span>
                 </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                  <form id="eventForm" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Event Title</label>
                      <input type="text" required className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                          <input type="date" required className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-white" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Time</label>
                          <input type="text" required placeholder="e.g. 4:00 PM" className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-white" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                        </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                      <input type="text" required className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-white" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                        <textarea rows={4} className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-white resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Event details..."></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                            <select className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                <option value="Meetup">Meetup</option>
                                <option value="Party">Party</option>
                                <option value="Festival">Festival</option>
                                <option value="Music">Music</option>
                                <option value="Workshop">Workshop</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Price</label>
                            <input type="text" placeholder="Free or ৳500" className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-white" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
                        <input type="text" className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-white" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                        <select className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                            <option value="Upcoming">Upcoming</option>
                            <option value="Past">Past</option>
                            <option value="Draft">Draft</option>
                        </select>
                    </div>
                  </form>
              </div>

              <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Cancel</button>
                  <button type="submit" form="eventForm" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow hover:bg-primary-dark">{editingId ? 'Save Changes' : 'Create Event'}</button>
              </div>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-icons-round text-3xl text-red-500">delete_forever</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Delete Event?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Are you sure you want to remove this event? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setDeleteConfirmId(null)}
                        className="flex-1 py-3 font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="flex-1 py-3 font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors"
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

// --- NEW FEATURE: Support Tickets Tab ---
const SupportTicketsTab: React.FC = () => {
  const { tickets, updateTicketStatus } = useSupport();

  const closeTicket = (id: string) => {
    updateTicketStatus(id, 'Closed');
  };

  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <div>
           <h3 className="text-lg font-bold text-gray-800 dark:text-white">Support Help Desk</h3>
           <p className="text-sm text-gray-500">Manage user inquiries</p>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-bold flex items-center gap-1">
             <span className="w-2 h-2 bg-red-500 rounded-full"></span> {tickets.filter(t => t.priority === 'High' && t.status === 'Open').length} High Priority
           </span>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Ticket ID</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">User</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Subject</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Priority</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Status</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-gray-500">{ticket.id}</td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800 dark:text-white text-sm">{ticket.name}</div>
                  <div className="text-xs text-gray-400">{ticket.email}</div>
                  {ticket.username && <div className="text-[10px] text-primary">@{ticket.username}</div>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <div className="font-bold">{ticket.issue}</div>
                    {ticket.suggestion && <div className="text-xs italic text-gray-500 mt-1">Suggestion: {ticket.suggestion}</div>}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    ticket.priority === 'High' ? 'bg-red-100 text-red-700' :
                    ticket.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                   {ticket.status === 'Open' ? (
                     <span className="text-green-600 font-bold text-sm flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Open</span>
                   ) : (
                     <span className="text-gray-400 font-bold text-sm flex items-center gap-1"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span> Closed</span>
                   )}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-gray-400 hover:text-primary p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" title="Reply">
                    <span className="material-icons-round">reply</span>
                  </button>
                  {ticket.status === 'Open' && (
                    <button onClick={() => closeTicket(ticket.id)} className="text-gray-400 hover:text-green-600 p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors" title="Mark as Resolved">
                      <span className="material-icons-round">check</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ReportsTab: React.FC = () => {
  const { reports, updateReportStatus } = useReports();
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Resolved'>('All');

  const filteredReports = reports.filter(r => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return r.status === 'Pending' || r.status === 'Reviewing';
    if (filter === 'Resolved') return r.status === 'Resolved';
    return true;
  });

  const handleResolve = (id: string) => {
    updateReportStatus(id, 'Resolved');
  };

  const handleBan = (report: Report) => {
    if (window.confirm(`Are you sure you want to BAN ${report.user}? This will also resolve the report.`)) {
        updateReportStatus(report.id, 'Resolved');
        alert(`User ${report.user} banned successfully.`);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-full flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <div>
           <h3 className="text-lg font-bold text-gray-800 dark:text-white">Reports & Abuse</h3>
           <p className="text-sm text-gray-500">Manage user reports and safety</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {['All', 'Pending', 'Resolved'].map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${filter === f ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    {f}
                </button>
            ))}
        </div>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0">
            <tr>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">User</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Reason</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Date</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Severity</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Status</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={report.userImage} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{report.user}</p>
                      <p className="text-xs text-gray-500">{report.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{report.reason}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{report.date}</td>
                <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        report.severity === 'high' ? 'bg-red-100 text-red-700' :
                        report.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                        {report.severity}
                    </span>
                </td>
                <td className="px-6 py-4">
                   <span className={`flex items-center gap-1 text-sm font-bold ${
                       report.status === 'Resolved' ? 'text-green-600' : 
                       report.status === 'Reviewing' ? 'text-blue-600' : 'text-yellow-600'
                   }`}>
                       {report.status}
                   </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {report.status !== 'Resolved' && (
                    <>
                        <button onClick={() => handleResolve(report.id)} className="text-green-600 hover:bg-green-100 p-2 rounded-lg transition-colors" title="Mark as Resolved">
                            <span className="material-icons-round text-lg">check</span>
                        </button>
                        <button onClick={() => handleBan(report)} className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Ban User">
                            <span className="material-icons-round text-lg">block</span>
                        </button>
                    </>
                  )}
                  {report.status === 'Resolved' && (
                      <span className="text-gray-400 text-xs">No actions</span>
                  )}
                </td>
              </tr>
            ))}
            {filteredReports.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No reports found in this category.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const AnalyticsTab: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
       {/* Revenue Chart */}
       <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Revenue Analytics</h3>
          <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataRevenue}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Legend />
                      <Bar dataKey="free" fill="#9CA3AF" radius={[4, 4, 0, 0]} name="Free Users" />
                      <Bar dataKey="premium" fill="#E63946" radius={[4, 4, 0, 0]} name="Premium Revenue" />
                  </BarChart>
              </ResponsiveContainer>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">User Growth</h3>
               <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={dataMatch}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="matches" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                       </LineChart>
                   </ResponsiveContainer>
               </div>
           </div>

           <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Engagement Stats</h3>
              <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-300">Avg. Session Duration</span>
                      <span className="font-bold text-gray-800 dark:text-white">14m 32s</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-300">Retention Rate</span>
                      <span className="font-bold text-green-500">68%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-300">Messages Sent / User</span>
                      <span className="font-bold text-gray-800 dark:text-white">42</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-300">Match Rate</span>
                      <span className="font-bold text-primary">12%</span>
                  </div>
              </div>
           </div>
       </div>
    </div>
  );
};

const UserManagementTab: React.FC = () => {
  const [users, setUsers] = useState(ADMIN_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingInterests, setEditingInterests] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // States for Credentials Mode
  const [isCredentialMode, setIsCredentialMode] = useState(false);
  const [password, setPassword] = useState('');

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (user: UserProfile) => {
    setEditingUser({ ...user });
    setEditingInterests(user.interests ? user.interests.join(', ') : '');
    setIsAdding(false);
    setIsCredentialMode(!!user.username);
    setPassword('');
  };

  const startAddUser = () => {
    setEditingUser({
        id: Date.now().toString(),
        name: '',
        age: 18,
        location: 'Rajshahi',
        distance: '0 km',
        bio: 'New User',
        image: 'https://i.pravatar.cc/150?u=new_user',
        email: '',
        phoneNumber: '',
        status: 'active',
        joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        isPremium: false,
        isVerified: false,
        interests: [],
        gender: 'Male',
        religion: 'Islam',
        secondaryPhoneNumber: '',
        socialLink: ''
    });
    setEditingInterests('');
    setIsAdding(true);
    setIsCredentialMode(false);
    setPassword('');
  };

  const startAddUserWithCreds = () => {
    setEditingUser({
        id: Date.now().toString(),
        name: '',
        username: '',
        age: 18,
        location: 'Rajshahi',
        distance: '0 km',
        bio: 'New User',
        image: 'https://i.pravatar.cc/150?u=new_user',
        email: '',
        phoneNumber: '',
        status: 'active',
        joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        isPremium: false,
        isVerified: false,
        interests: [],
        gender: 'Male',
        religion: 'Islam',
        secondaryPhoneNumber: '',
        socialLink: ''
    });
    setEditingInterests('');
    setIsAdding(true);
    setIsCredentialMode(true);
    setPassword('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      const updatedUser = {
        ...editingUser,
        interests: editingInterests.split(',').map(s => s.trim()).filter(s => s)
      };

      if (isAdding) {
          setUsers([...users, updatedUser]);
      } else {
          setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
      }
      setEditingUser(null);
      setIsAdding(false);
    }
  };

  const handleBlock = (user: UserProfile) => {
    const isBanned = user.status === 'banned';
    if(window.confirm(`Are you sure you want to ${isBanned ? 'unban' : 'ban'} ${user.name}?`)) {
      setUsers(users.map(u => u.id === user.id ? { ...u, status: isBanned ? 'active' : 'banned' } : u));
    }
  }

  const handleDelete = (userId: string) => {
      if(window.confirm('Are you sure you want to delete this user completely? This cannot be undone.')) {
          setUsers(users.filter(u => u.id !== userId));
          setSelectedUsers(prev => prev.filter(id => id !== userId));
      }
  }

  // Bulk Actions
  const toggleUserSelection = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleBulkBan = () => {
    if (window.confirm(`Are you sure you want to ban ${selectedUsers.length} users?`)) {
      setUsers(users.map(u => selectedUsers.includes(u.id) ? { ...u, status: 'banned' } : u));
      setSelectedUsers([]);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Location', 'Status', 'Joined Date', 'Premium'];
    const csvContent = [
      headers.join(','),
      ...users.map(u => [
        u.id, 
        `"${u.name}"`, 
        u.email || '', 
        u.phoneNumber || '', 
        `"${u.location}"`, 
        u.status, 
        u.joinedDate, 
        u.isPremium ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'users_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-full flex flex-col relative">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h3 className="text-lg font-bold text-gray-800 dark:text-white">User Management</h3>
           <p className="text-sm text-gray-500">Total {users.length} registered users</p>
        </div>
        <div className="flex items-center gap-3">
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg animate-fade-in">
                 <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{selectedUsers.length} Selected</span>
                 <button onClick={handleBulkBan} className="text-red-500 hover:text-red-700 text-xs font-bold px-2 border-l border-gray-300 dark:border-gray-600">Ban Selected</button>
              </div>
            )}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-gray-400">search</span>
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary w-full sm:w-64 text-gray-800 dark:text-white"
              />
            </div>
            <button onClick={handleExportCSV} className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 p-2 rounded-lg transition-colors" title="Export CSV">
               <span className="material-icons-round">download</span>
            </button>
            <button 
                onClick={startAddUser}
                className="bg-primary hover:bg-primary-dark text-white p-2 rounded-lg shadow-lg flex items-center justify-center transition-colors"
                title="Add New User"
            >
                <span className="material-icons-round">add</span>
            </button>
            <button 
                onClick={startAddUserWithCreds}
                className="bg-secondary hover:bg-secondary/90 text-white p-2 rounded-lg shadow-lg flex items-center justify-center transition-colors"
                title="Add User with Username & Password"
            >
                <span className="material-icons-round">person_add</span>
            </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 w-10">
                 <input type="checkbox" onChange={toggleSelectAll} checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length} className="rounded text-primary focus:ring-primary" />
              </th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Name & Contact</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Location</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Status</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Interests</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredUsers.map((user) => (
              <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${selectedUsers.includes(user.id) ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                <td className="px-6 py-4">
                  <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => toggleUserSelection(user.id)} className="rounded text-primary focus:ring-primary" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={user.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <div className="flex items-center gap-1">
                         <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                         {user.isVerified && <span className="material-icons-round text-blue-500 text-[14px]">verified</span>}
                         {user.isPremium && <span className="material-icons-round text-yellow-500 text-[14px]">star</span>}
                      </div>
                      <p className="text-xs text-gray-500">{user.email || user.username || 'No contact'}</p>
                      <p className="text-[10px] text-gray-400">{user.phoneNumber}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{user.location}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    user.status === 'active' ? 'bg-green-100 text-green-700' : 
                    user.status === 'banned' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {user.interests?.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">{tag}</span>
                        ))}
                        {user.interests && user.interests.length > 3 && (
                            <span className="px-1.5 py-0.5 text-[10px] text-gray-400">+{user.interests.length - 3}</span>
                        )}
                    </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(user)} className="text-gray-400 hover:text-primary p-1 transition-colors"><span className="material-icons-round">edit</span></button>
                  <button 
                    onClick={() => handleBlock(user)} 
                    className={`p-1 transition-colors ml-1 ${user.status === 'banned' ? 'text-red-600 bg-red-50 dark:bg-red-900/20 rounded' : 'text-gray-400 hover:text-red-500'}`}
                    title={user.status === 'banned' ? "Unban User" : "Ban User"}
                  >
                    <span className="material-icons-round">block</span>
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="text-gray-400 hover:text-red-600 p-1 transition-colors ml-1" title="Delete User">
                      <span className="material-icons-round">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal Overlay */}
      {editingUser && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                 <h3 className="font-bold text-lg text-gray-800 dark:text-white">{isAdding ? 'Add New User' : 'Edit User'}</h3>
                 <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-red-500">
                    <span className="material-icons-round">close</span>
                 </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                 <form id="editForm" onSubmit={handleSave} className="space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                       <img src={editingUser.image} className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" alt="User" />
                       <div>
                          <p className="font-bold text-gray-800 dark:text-white">{editingUser.name || 'New User'}</p>
                          <p className="text-xs text-gray-500">ID: {editingUser.id}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                          <input 
                             type="text" required
                             value={editingUser.name} 
                             onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                             className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                          />
                       </div>

                       {isCredentialMode && (
                         <>
                           <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Username</label>
                              <input 
                                 type="text" required
                                 value={editingUser.username || ''} 
                                 onChange={e => setEditingUser({...editingUser, username: e.target.value})}
                                 className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                              />
                           </div>
                           <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">{isAdding ? 'Password' : 'Reset Password'}</label>
                              <input 
                                 type="password" 
                                 required={isAdding}
                                 value={password} 
                                 onChange={e => setPassword(e.target.value)}
                                 className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                                 placeholder={isAdding ? "Enter password" : "Leave blank to keep"}
                              />
                           </div>
                         </>
                       )}

                       <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                          <input 
                             type="email" required={!isCredentialMode}
                             value={editingUser.email || ''} 
                             onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                             className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
                          <input 
                             type="tel"
                             value={editingUser.phoneNumber || ''} 
                             onChange={e => setEditingUser({...editingUser, phoneNumber: e.target.value})}
                             className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                          />
                       </div>
                       
                       {/* New Fields */}
                       <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Secondary Mobile</label>
                          <input 
                             type="tel"
                             value={editingUser.secondaryPhoneNumber || ''} 
                             onChange={e => setEditingUser({...editingUser, secondaryPhoneNumber: e.target.value})}
                             className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Gender</label>
                          <select 
                             value={editingUser.gender || 'Male'}
                             onChange={e => setEditingUser({...editingUser, gender: e.target.value as any})}
                             className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                          >
                             <option value="Male">Male</option>
                             <option value="Female">Female</option>
                             <option value="Other">Other</option>
                          </select>
                       </div>
                       <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Religion</label>
                          <select 
                             value={editingUser.religion || 'Islam'}
                             onChange={e => setEditingUser({...editingUser, religion: e.target.value as any})}
                             className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                          >
                             <option value="Islam">Islam</option>
                             <option value="Hindu">Hindu</option>
                             <option value="Buddhist">Buddhist</option>
                             <option value="Christian">Christian</option>
                             <option value="Other">Other</option>
                          </select>
                       </div>
                       <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Age</label>
                          <input 
                             type="number" 
                             value={editingUser.age} 
                             onChange={e => setEditingUser({...editingUser, age: parseInt(e.target.value)})}
                             className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                          />
                       </div>

                       <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                          <input 
                             type="text" 
                             value={editingUser.location} 
                             onChange={e => setEditingUser({...editingUser, location: e.target.value})}
                             className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                          />
                       </div>
                       
                       <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Social Link</label>
                          <input 
                             type="url" 
                             value={editingUser.socialLink || ''} 
                             onChange={e => setEditingUser({...editingUser, socialLink: e.target.value})}
                             placeholder="https://"
                             className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                          />
                       </div>

                       <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Interests (comma separated)</label>
                          <input 
                             type="text" 
                             value={editingInterests} 
                             onChange={e => setEditingInterests(e.target.value)}
                             placeholder="Music, Travel, Food"
                             className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                          />
                       </div>
                    </div>

                    <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                       <select 
                          value={editingUser.status} 
                          onChange={e => setEditingUser({...editingUser, status: e.target.value as any})}
                          className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                       >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="banned">Banned</option>
                       </select>
                    </div>

                    <div className="flex gap-6 pt-2">
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                             type="checkbox" 
                             checked={editingUser.isPremium} 
                             onChange={e => setEditingUser({...editingUser, isPremium: e.target.checked})}
                             className="rounded text-primary focus:ring-primary"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Premium User</span>
                       </label>
                       
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                             type="checkbox" 
                             checked={editingUser.isVerified} 
                             onChange={e => setEditingUser({...editingUser, isVerified: e.target.checked})}
                             className="rounded text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Verified</span>
                       </label>
                    </div>
                 </form>
              </div>
              
              <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                 <button 
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                 >
                    Cancel
                 </button>
                 <button 
                    form="editForm"
                    type="submit"
                    className="px-6 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-dark shadow-lg shadow-primary/30"
                 >
                    {isAdding ? 'Create User' : 'Save Changes'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

const ModeratorsTab: React.FC = () => {
  const [moderators, setModerators] = useState<Moderator[]>(MOCK_MODERATORS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Moderator>>({
    name: '',
    email: '',
    role: 'Moderator',
    status: 'Active',
    image: 'https://i.pravatar.cc/150?u=new_mod'
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
        name: '',
        email: '',
        role: 'Moderator',
        status: 'Active',
        image: `https://i.pravatar.cc/150?u=${Date.now()}`,
        lastActive: 'Never',
        permissions: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mod: Moderator) => {
    setEditingId(mod.id);
    setFormData({ ...mod });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this moderator?')) {
        setModerators(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
        // Update existing
        setModerators(prev => prev.map(m => m.id === editingId ? { ...m, ...formData } as Moderator : m));
    } else {
        // Add new
        const newMod: Moderator = {
            id: Date.now().toString(),
            name: formData.name || 'New Moderator',
            email: formData.email || '',
            role: formData.role as any || 'Moderator',
            status: formData.status as any || 'Active',
            image: formData.image || 'https://i.pravatar.cc/150',
            permissions: ['manage_content'], // Default permission
            lastActive: 'Just now'
        };
        setModerators(prev => [...prev, newMod]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-full flex flex-col relative">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <div>
           <h3 className="text-lg font-bold text-gray-800 dark:text-white">Moderator Team</h3>
           <p className="text-sm text-gray-500">Manage permissions and team access</p>
        </div>
        <button 
            onClick={handleOpenAdd}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-colors flex items-center gap-2"
        >
            <span className="material-icons-round text-sm">add</span> Add Moderator
        </button>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0">
            <tr>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Moderator</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Role</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Status</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Last Active</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {moderators.map((mod) => (
              <tr key={mod.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={mod.image} alt="" className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{mod.name}</p>
                      <p className="text-xs text-gray-500">{mod.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                        mod.role === 'Senior Moderator' ? 'bg-purple-100 text-purple-700' :
                        mod.role === 'Moderator' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                        {mod.role}
                    </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1 text-sm font-medium ${mod.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${mod.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    {mod.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{mod.lastActive}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleOpenEdit(mod)} className="text-gray-400 hover:text-primary p-1 transition-colors"><span className="material-icons-round">edit</span></button>
                  <button onClick={() => handleDelete(mod.id)} className="text-gray-400 hover:text-red-600 p-1 transition-colors ml-1"><span className="material-icons-round">delete</span></button>
                </td>
              </tr>
            ))}
            {moderators.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                        No moderators found. Add one to get started.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                 <h3 className="font-bold text-lg text-gray-800 dark:text-white">{editingId ? 'Edit Moderator' : 'Add Moderator'}</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500">
                    <span className="material-icons-round">close</span>
                 </button>
              </div>
              
              <form id="modForm" onSubmit={handleSubmit} className="p-6 space-y-4">
                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                    <input 
                       type="text" required
                       value={formData.name}
                       onChange={e => setFormData({...formData, name: e.target.value})}
                       className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                       placeholder="e.g. Karim Benzema"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                    <input 
                       type="email" required
                       value={formData.email}
                       onChange={e => setFormData({...formData, email: e.target.value})}
                       className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                       placeholder="moderator@example.com"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                        <select 
                           value={formData.role}
                           onChange={e => setFormData({...formData, role: e.target.value as any})}
                           className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                        >
                           <option value="Moderator">Moderator</option>
                           <option value="Senior Moderator">Senior Moderator</option>
                           <option value="Support">Support</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                        <select 
                           value={formData.status}
                           onChange={e => setFormData({...formData, status: e.target.value as any})}
                           className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                        >
                           <option value="Active">Active</option>
                           <option value="Inactive">Inactive</option>
                        </select>
                     </div>
                 </div>
              </form>

              <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                 <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                 >
                    Cancel
                 </button>
                 <button 
                    form="modForm"
                    type="submit"
                    className="px-6 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-dark shadow-lg shadow-primary/30"
                 >
                    {editingId ? 'Save Changes' : 'Add Moderator'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const CustomizationTab: React.FC = () => {
  const { config, updateConfig, resetConfig } = useSiteConfig();
  const [newInterest, setNewInterest] = useState('');
  const [previewMode, setPreviewMode] = useState<'landing' | 'login' | 'about'>('landing');

  const handleReviewChange = (index: number, field: keyof UserReview, value: any) => {
    const newReviews = [...config.reviews];
    newReviews[index] = { ...newReviews[index], [field]: value };
    updateConfig({ reviews: newReviews });
  };

  const addReview = () => {
    const newReview: UserReview = {
      id: Date.now().toString(),
      name: 'New User',
      role: 'Role',
      image: 'https://i.pravatar.cc/150',
      review: 'Write review here...',
      rating: 5
    };
    updateConfig({ reviews: [...config.reviews, newReview] });
  };

  const removeReview = (index: number) => {
    const newReviews = config.reviews.filter((_, i) => i !== index);
    updateConfig({ reviews: newReviews });
  };

  const handleSocialLinkChange = (key: keyof typeof config.socialLinks, value: string) => {
     updateConfig({
        socialLinks: {
           ...config.socialLinks,
           [key]: value
        }
     });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof SiteConfig) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateConfig({ [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addInterest = () => {
    if (newInterest.trim()) {
        const interestToAdd = newInterest.trim();
        if (!config.interests.includes(interestToAdd)) {
            updateConfig({ interests: [...(config.interests || []), interestToAdd] });
        }
        setNewInterest('');
    }
  }

  const removeInterest = (interest: string) => {
    updateConfig({ interests: config.interests.filter(i => i !== interest) });
  }

  const handleAboutChange = (field: keyof AboutPageConfig, value: any) => {
    updateConfig({
      aboutPage: {
        ...config.aboutPage,
        [field]: value
      }
    });
  }

  const handleWhyUsPointsChange = (text: string) => {
    const points = text.split('\n').filter(line => line.trim() !== '');
    handleAboutChange('whyUsPoints', points);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        
        {/* Branding & Assets (New Section) */}
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
           <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Branding & Assets</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Favicon (.ico, .png)</label>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                       {config.favicon ? (
                          <img src={config.favicon} alt="Favicon" className="w-8 h-8 object-contain" />
                       ) : (
                          <span className="text-2xl">❤️</span>
                       )}
                    </div>
                    <label className="cursor-pointer bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                       Upload File
                       <input type="file" accept=".ico,.png,.jpg,.jpeg" className="hidden" onChange={(e) => handleFileUpload(e, 'favicon')} />
                    </label>
                 </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Heart Icon / Logo</label>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                       {config.brandingIcon ? (
                          <img src={config.brandingIcon} alt="Logo" className="w-8 h-8 object-contain" />
                       ) : (
                          <span className="material-icons-round text-primary text-2xl">favorite</span>
                       )}
                    </div>
                    <label className="cursor-pointer bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                       Upload File
                       <input type="file" accept=".png,.svg,.jpg,.jpeg" className="hidden" onChange={(e) => handleFileUpload(e, 'brandingIcon')} />
                    </label>
                 </div>
              </div>
           </div>
        </div>

        {/* Interests Management */}
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Interests Management</h3>
            <div className="flex gap-2 mb-4">
                <input 
                    type="text" 
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add new interest (e.g. 🎨 Painting)"
                    className="flex-1 rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-white"
                    onKeyDown={(e) => e.key === 'Enter' && addInterest()}
                />
                <button onClick={addInterest} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-bold transition-colors">
                    Add
                </button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {config.interests?.map((interest, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm flex items-center gap-2 group border border-gray-200 dark:border-gray-700">
                        {interest}
                        <button onClick={() => removeInterest(interest)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <span className="material-icons-round text-sm">close</span>
                        </button>
                    </span>
                ))}
            </div>
        </div>

        {/* About Page Customization (New Section) */}
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
           <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">About Page Customization</h3>
           <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page Title</label>
                    <input 
                      type="text" 
                      value={config.aboutPage?.title || ''} 
                      onChange={(e) => handleAboutChange('title', e.target.value)}
                      className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200 p-2 text-sm"
                    />
                 </div>
                 
                 <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page Subtitle</label>
                    <textarea 
                      rows={2}
                      value={config.aboutPage?.subtitle || ''} 
                      onChange={(e) => handleAboutChange('subtitle', e.target.value)}
                      className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200 p-2 text-sm resize-none"
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Story Title</label>
                    <input 
                      type="text" 
                      value={config.aboutPage?.storyTitle || ''} 
                      onChange={(e) => handleAboutChange('storyTitle', e.target.value)}
                      className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200 p-2 text-sm"
                    />
                 </div>

                 <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Story Content</label>
                    <textarea 
                      rows={4}
                      value={config.aboutPage?.storyContent || ''} 
                      onChange={(e) => handleAboutChange('storyContent', e.target.value)}
                      className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200 p-2 text-sm resize-none"
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mission Title</label>
                    <input 
                      type="text" 
                      value={config.aboutPage?.missionTitle || ''} 
                      onChange={(e) => handleAboutChange('missionTitle', e.target.value)}
                      className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200 p-2 text-sm"
                    />
                 </div>

                 <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mission Content</label>
                    <textarea 
                      rows={4}
                      value={config.aboutPage?.missionContent || ''} 
                      onChange={(e) => handleAboutChange('missionContent', e.target.value)}
                      className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200 p-2 text-sm resize-none"
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">"Why Us" Title</label>
                    <input 
                      type="text" 
                      value={config.aboutPage?.whyUsTitle || ''} 
                      onChange={(e) => handleAboutChange('whyUsTitle', e.target.value)}
                      className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200 p-2 text-sm"
                    />
                 </div>

                 <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">"Why Us" Points (One per line)</label>
                    <textarea 
                      rows={5}
                      value={config.aboutPage?.whyUsPoints?.join('\n') || ''} 
                      onChange={(e) => handleWhyUsPointsChange(e.target.value)}
                      className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200 p-2 text-sm resize-none"
                      placeholder="Point 1&#10;Point 2&#10;Point 3"
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Title</label>
                    <input 
                      type="text" 
                      value={config.aboutPage?.contactTitle || ''} 
                      onChange={(e) => handleAboutChange('contactTitle', e.target.value)}
                      className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200 p-2 text-sm"
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
                    <input 
                      type="email" 
                      value={config.aboutPage?.contactEmail || ''} 
                      onChange={(e) => handleAboutChange('contactEmail', e.target.value)}
                      className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200 p-2 text-sm"
                    />
                 </div>

                 <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Subtitle</label>
                    <input 
                      type="text" 
                      value={config.aboutPage?.contactSubtitle || ''} 
                      onChange={(e) => handleAboutChange('contactSubtitle', e.target.value)}
                      className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200 p-2 text-sm"
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* General Settings */}
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">General Info</h3>
          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Name</label>
                <input 
                  type="text" 
                  value={config.appName} 
                  onChange={(e) => updateConfig({ appName: e.target.value })}
                  className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary" 
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User Count Text</label>
                <input 
                  type="text" 
                  value={config.userCountText} 
                  onChange={(e) => updateConfig({ userCountText: e.target.value })}
                  className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary" 
                />
             </div>
          </div>
        </div>

        {/* Theme Colors */}
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
           <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Theme Colors</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Color</label>
                 <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={config.primaryColor} 
                      onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                      className="h-10 w-16 p-1 rounded border border-gray-300 cursor-pointer" 
                    />
                    <input 
                       type="text" 
                       value={config.primaryColor}
                       onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                       className="flex-1 rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 text-sm focus:ring-primary focus:border-primary"
                    />
                 </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Secondary Color</label>
                 <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={config.secondaryColor} 
                      onChange={(e) => updateConfig({ secondaryColor: e.target.value })}
                      className="h-10 w-16 p-1 rounded border border-gray-300 cursor-pointer" 
                    />
                    <input 
                       type="text" 
                       value={config.secondaryColor}
                       onChange={(e) => updateConfig({ secondaryColor: e.target.value })}
                       className="flex-1 rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 text-sm focus:ring-primary focus:border-primary"
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Hero Section</h3>
          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hero Title (Supports HTML)
                  <span className="text-xs text-gray-400 font-normal ml-2">Use &lt;span class="text-primary"&gt; for color</span>
                </label>
                <textarea 
                  rows={3}
                  value={config.heroTitle} 
                  onChange={(e) => updateConfig({ heroTitle: e.target.value })}
                  className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary font-mono text-sm" 
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hero Subtitle</label>
                <textarea 
                  rows={2}
                  value={config.heroSubtitle} 
                  onChange={(e) => updateConfig({ heroSubtitle: e.target.value })}
                  className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary" 
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hero Image URL</label>
                <input 
                  type="text" 
                  value={config.heroImage} 
                  onChange={(e) => updateConfig({ heroImage: e.target.value })}
                  className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary" 
                />
             </div>
          </div>
        </div>

        {/* Section Titles */}
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Section Headers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Features Section Title</label>
                <input 
                  type="text" 
                  value={config.featureTitle} 
                  onChange={(e) => updateConfig({ featureTitle: e.target.value })}
                  className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary" 
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reviews Section Title</label>
                <input 
                  type="text" 
                  value={config.reviewsTitle} 
                  onChange={(e) => updateConfig({ reviewsTitle: e.target.value })}
                  className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary" 
                />
             </div>
          </div>
        </div>

        {/* User Reviews Management */}
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">User Reviews</h3>
              <button 
                onClick={addReview} 
                className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"
              >
                <span className="material-icons-round text-sm">add</span> Add Review
              </button>
           </div>
           
           <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {config.reviews.map((review, index) => (
                 <div key={review.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex justify-between items-start mb-3">
                       <h4 className="font-bold text-gray-700 dark:text-gray-300 text-sm">Review #{index + 1}</h4>
                       <button onClick={() => removeReview(index)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 p-1 rounded-full">
                          <span className="material-icons-round text-lg">delete</span>
                       </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                       <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                          <input 
                            type="text" 
                            value={review.name}
                            onChange={(e) => handleReviewChange(index, 'name', e.target.value)}
                            className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary py-1.5"
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Role/Subtitle</label>
                          <input 
                            type="text" 
                            value={review.role}
                            onChange={(e) => handleReviewChange(index, 'role', e.target.value)}
                            className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary py-1.5"
                          />
                       </div>
                    </div>
                    <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Review Text</label>
                        <textarea 
                          rows={2}
                          value={review.review}
                          onChange={(e) => handleReviewChange(index, 'review', e.target.value)}
                          className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary py-1.5"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
                          <input 
                            type="text" 
                            value={review.image}
                            onChange={(e) => handleReviewChange(index, 'image', e.target.value)}
                            className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary py-1.5"
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Rating (1-5)</label>
                          <select 
                            value={review.rating}
                            onChange={(e) => handleReviewChange(index, 'rating', parseInt(e.target.value))}
                            className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary py-1.5"
                          >
                            {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Stars</option>)}
                          </select>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
        
        {/* Footer Settings */}
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Footer Settings</h3>
            <div className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Copyright/Footer Text</label>
                   <input 
                      type="text"
                      value={config.footerText}
                      onChange={(e) => updateConfig({ footerText: e.target.value })}
                      className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary"
                   />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Developer Page URL</label>
                    <input 
                      type="text"
                      value={config.developerPageUrl}
                      onChange={(e) => updateConfig({ developerPageUrl: e.target.value })}
                      className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Facebook URL</label>
                        <input 
                           type="text"
                           value={config.socialLinks.facebook}
                           onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                           className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Instagram URL</label>
                        <input 
                           type="text"
                           value={config.socialLinks.instagram}
                           onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                           className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Twitter/X URL</label>
                        <input 
                           type="text"
                           value={config.socialLinks.twitter}
                           onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                           className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Terms and Conditions Editor */}
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
           <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Terms & Conditions</h3>
           <p className="text-sm text-gray-500 mb-2">Customize the terms and conditions displayed on the landing page.</p>
           <RichTextEditor 
              value={config.termsAndConditions} 
              onChange={(val) => updateConfig({ termsAndConditions: val })}
           />
           <div className="flex justify-end mt-4">
              <button 
                onClick={() => {alert('Settings Saved Successfully!')}}
                className="bg-primary text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-primary-dark transition-colors"
              >
                Save Changes
              </button>
           </div>
        </div>

      </div>

      <div className="space-y-6">
         {/* Live Preview */}
         <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-6">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-gray-800 dark:text-white">Preview</h3>
               
               {/* Preview Mode Selector */}
               <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button 
                    onClick={() => setPreviewMode('landing')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${previewMode === 'landing' ? 'bg-white dark:bg-surface-dark shadow text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                  >Home</button>
                  <button 
                    onClick={() => setPreviewMode('login')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${previewMode === 'login' ? 'bg-white dark:bg-surface-dark shadow text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                  >Login</button>
                  <button 
                    onClick={() => setPreviewMode('about')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${previewMode === 'about' ? 'bg-white dark:bg-surface-dark shadow text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                  >About</button>
               </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden mb-4 ring-4 ring-gray-100 dark:ring-gray-800 shadow-xl">
               <div className="relative aspect-[9/19] bg-background-light dark:bg-background-dark flex flex-col overflow-hidden">
                   
                   {/* Fake Status Bar */}
                   <div className="h-6 bg-black/10 dark:bg-white/5 w-full flex justify-between items-center px-4 backdrop-blur-sm z-50 absolute top-0 pointer-events-none">
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">9:41</span>
                      <div className="flex gap-1">
                         <div className="w-3 h-3 bg-gray-400 rounded-full opacity-50"></div>
                         <div className="w-3 h-3 bg-gray-400 rounded-full opacity-50"></div>
                      </div>
                   </div>

                   {/* --- LANDING PREVIEW --- */}
                   {previewMode === 'landing' && (
                     <div className="flex flex-col h-full overflow-y-auto no-scrollbar pt-8">
                       <div className="w-full h-12 flex items-center px-4 gap-2 mb-4">
                          <div className="w-6 h-6 flex items-center justify-center">
                             {config.brandingIcon ? (
                                <img src={config.brandingIcon} alt="Logo" className="w-full h-full object-contain" />
                             ) : (
                                <span className="material-icons-round text-primary text-lg">favorite</span>
                             )}
                          </div>
                          <span className="text-primary font-bold text-xs">{config.appName}</span>
                       </div>
                       
                       <div className="px-4 text-center">
                           <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl mb-4 overflow-hidden relative">
                              <img src={config.heroImage} className="w-full h-full object-cover" alt="Hero" />
                              {/* Floating elements simulation */}
                              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-secondary/20 rounded-full blur-xl"></div>
                           </div>
                           <h1 className="text-lg font-bold font-display leading-tight mb-2 text-gray-800 dark:text-white" dangerouslySetInnerHTML={{__html: config.heroTitle}}></h1>
                           <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-6">{config.heroSubtitle}</p>
                       </div>

                       <div className="mt-auto w-full p-4 bg-white dark:bg-surface-dark rounded-t-2xl shadow-lg border-t border-gray-100 dark:border-gray-800">
                         <div className="grid grid-cols-2 gap-2">
                            <button className="bg-secondary text-white text-xs py-3 rounded-xl font-bold">Search</button>
                            <button className="bg-primary text-white text-xs py-3 rounded-xl font-bold">Join</button>
                         </div>
                       </div>
                     </div>
                   )}

                   {/* --- LOGIN PREVIEW --- */}
                   {previewMode === 'login' && (
                     <div className="flex flex-col h-full items-center justify-center p-6 bg-white dark:bg-surface-dark relative">
                        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-[-50px] left-[-50px] w-32 h-32 bg-secondary/10 rounded-full blur-2xl"></div>
                        
                        <div className="w-12 h-12 bg-gradient-to-tr from-primary to-orange-500 rounded-full flex items-center justify-center shadow-lg mb-4 overflow-hidden">
                           {config.brandingIcon ? (
                              <img src={config.brandingIcon} alt="Logo" className="w-8 h-8 object-contain" />
                           ) : (
                              <span className="material-icons-round text-2xl text-white">favorite</span>
                           )}
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">স্বাগতম!</h2>
                        <p className="text-[10px] text-gray-500 mb-6">আপনার একাউন্টে লগ ইন করুন</p>

                        <div className="w-full space-y-3 relative z-10">
                           <div className="h-10 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center px-3">
                              <span className="material-icons-round text-gray-400 text-sm mr-2">email</span>
                              <div className="h-2 w-20 bg-gray-200 dark:bg-gray-600 rounded"></div>
                           </div>
                           <div className="h-10 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center px-3">
                              <span className="material-icons-round text-gray-400 text-sm mr-2">lock</span>
                              <div className="h-2 w-12 bg-gray-200 dark:bg-gray-600 rounded"></div>
                           </div>
                           <button className="w-full h-10 bg-primary text-white rounded-lg text-xs font-bold shadow-lg shadow-primary/30">
                              লগ ইন করুন
                           </button>
                        </div>
                     </div>
                   )}

                   {/* --- ABOUT PREVIEW --- */}
                   {previewMode === 'about' && (
                     <div className="flex flex-col h-full overflow-y-auto no-scrollbar bg-white dark:bg-surface-dark">
                        <div className="h-32 bg-primary/5 flex flex-col justify-center items-center text-center p-4 relative overflow-hidden pt-8">
                           <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl translate-x-1/2 -translate-y-1/2"></div>
                           <h1 className="text-xl font-bold text-primary font-display relative z-10">{config.aboutPage?.title}</h1>
                           <p className="text-[10px] text-gray-500 line-clamp-2 mt-1 relative z-10">{config.aboutPage?.subtitle}</p>
                        </div>
                        <div className="p-4 space-y-4">
                           <div>
                              <h3 className="text-xs font-bold text-gray-800 dark:text-white flex items-center gap-1 mb-1">
                                 <span className="material-icons-round text-primary text-sm">history_edu</span> {config.aboutPage?.storyTitle}
                              </h3>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                                 {config.aboutPage?.storyContent}
                              </p>
                           </div>
                           <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                              <h3 className="text-xs font-bold text-gray-800 dark:text-white mb-2">{config.aboutPage?.whyUsTitle}</h3>
                              <div className="space-y-1">
                                 {config.aboutPage?.whyUsPoints.slice(0, 3).map((p, i) => (
                                    <div key={i} className="flex items-center gap-1">
                                       <span className="material-icons-round text-green-500 text-[10px]">check_circle</span>
                                       <span className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">{p}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                   )}

               </div>
            </div>
            
            <button 
              onClick={resetConfig}
              className="w-full border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold py-2 rounded-lg transition-colors text-sm"
            >
              Reset to Default
            </button>
         </div>
      </div>
    </div>
  );
};

const SettingsTab: React.FC = () => {
  const { config, updateConfig } = useSiteConfig();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Platform Configuration</h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Maintenance Mode</p>
                  <p className="text-sm text-gray-500">Disable app access for users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
             </div>
             <hr className="dark:border-gray-700" />
             <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Allow New Registrations</p>
                  <p className="text-sm text-gray-500">Pause new user signups</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
             </div>
             <hr className="dark:border-gray-700" />
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Global Announcement</label>
                <input type="text" className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary" placeholder="e.g. Server maintenance at midnight..." />
             </div>
          </div>
       </div>

       <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Pricing & Limits</h3>
          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Free Daily Swipes</label>
                <input type="number" defaultValue={20} className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Premium Subscription Price (BDT)</label>
                <div className="relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                   <input type="number" defaultValue={499} className="w-full pl-8 rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary" />
                </div>
             </div>

             {/* Payment Gateway Configuration */}
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Gateway URL</label>
                <div className="relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-gray-400">link</span>
                   <input 
                     type="text" 
                     value={config.paymentGatewayUrl}
                     onChange={(e) => updateConfig({ paymentGatewayUrl: e.target.value })}
                     className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary" 
                     placeholder="https://..."
                   />
                </div>
                <p className="text-xs text-gray-500 mt-1">Users will be redirected here when they click Subscribe.</p>
             </div>

             <button className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-primary-dark transition-colors">Save Changes</button>
          </div>
       </div>
    </div>
  );
}

const AccessibilityTab: React.FC = () => {
  const { accessibility, updateAccessibility } = useSiteConfig();

  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 h-full">
       <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Accessibility Settings</h3>
       <p className="text-gray-500 mb-8 max-w-2xl">
         Customize your dashboard experience. These settings only affect your local session and help improve visibility and usability.
       </p>

       <div className="space-y-8 max-w-2xl">
          {/* High Contrast Mode */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
             <div>
                <h4 className="font-bold text-gray-800 dark:text-white">High Contrast Mode</h4>
                <p className="text-sm text-gray-500">Increases contrast for better readability.</p>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={accessibility.highContrast} 
                  onChange={(e) => updateAccessibility({ highContrast: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
             </label>
          </div>

          {/* Font Size Scaling */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
             <div className="flex justify-between items-center mb-4">
                <div>
                   <h4 className="font-bold text-gray-800 dark:text-white">Font Size Scaling</h4>
                   <p className="text-sm text-gray-500">Adjust the text size of the dashboard.</p>
                </div>
                <span className="font-bold text-primary">{accessibility.fontSize}%</span>
             </div>
             <input 
                type="range" 
                min="80" 
                max="150" 
                step="5"
                value={accessibility.fontSize}
                onChange={(e) => updateAccessibility({ fontSize: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" 
             />
             <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Small (80%)</span>
                <span>Normal (100%)</span>
                <span>Large (150%)</span>
             </div>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
             <div>
                <h4 className="font-bold text-gray-800 dark:text-white">Reduced Motion</h4>
                <p className="text-sm text-gray-500">Minimizes animations and transitions.</p>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={accessibility.reducedMotion} 
                  onChange={(e) => updateAccessibility({ reducedMotion: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
             </label>
          </div>
       </div>
    </div>
  );
};

const PremiumManagementTab: React.FC = () => {
  const { config, updateConfig } = useSiteConfig();
  const [users, setUsers] = useState<UserProfile[]>(ADMIN_USERS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<'existing' | 'new'>('existing');
  
  // State for adding existing user
  const [selectedExistingId, setSelectedExistingId] = useState('');
  
  // State for creating new premium user
  const [newUserData, setNewUserData] = useState<Partial<UserProfile>>({
      name: '', email: '', location: '', age: 18, image: 'https://i.pravatar.cc/150?u=new_prem'
  });

  const premiumUsers = users.filter(u => u.isPremium);
  const nonPremiumUsers = users.filter(u => !u.isPremium);

  // Permission Handlers
  const togglePermission = (key: keyof PremiumPermissions) => {
    updateConfig({
        premiumPermissions: {
            ...config.premiumPermissions,
            [key]: !config.premiumPermissions[key]
        }
    });
  };

  const updatePermissionValue = (key: keyof PremiumPermissions, value: number) => {
    updateConfig({
        premiumPermissions: {
            ...config.premiumPermissions,
            [key]: value
        }
    });
  };

  // Plan Handlers
  const handlePlanChange = (index: number, field: keyof PremiumPlan, value: any) => {
    const newPlans = [...config.premiumPlans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    updateConfig({ premiumPlans: newPlans });
  };

  const setPopularPlan = (index: number) => {
    const newPlans = config.premiumPlans.map((plan, i) => ({
      ...plan,
      popular: i === index
    }));
    updateConfig({ premiumPlans: newPlans });
  };

  // Feature Handlers
  const handleFeatureChange = (index: number, field: keyof PremiumFeature, value: any) => {
    const newFeatures = [...config.premiumFeatures];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    updateConfig({ premiumFeatures: newFeatures });
  };

  const addFeature = () => {
    const newFeature: PremiumFeature = {
      id: Date.now().toString(),
      icon: 'star',
      title: 'New Feature',
      desc: 'Description here'
    };
    updateConfig({ premiumFeatures: [...config.premiumFeatures, newFeature] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = config.premiumFeatures.filter((_, i) => i !== index);
    updateConfig({ premiumFeatures: newFeatures });
  };

  // User Handlers
  const toggleUserPremium = (userId: string) => {
    if(window.confirm('Are you sure you want to revoke premium status for this user?')) {
        setUsers(users.map(u => {
            if (u.id === userId) {
                return {
                    ...u,
                    isPremium: false,
                    premiumExpiryDate: undefined
                }
            }
            return u;
        }));
    }
  };

  const handleAddPremium = (e: React.FormEvent) => {
      e.preventDefault();
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 1); // 1 month default
      const expiryStr = expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      if (addMode === 'existing') {
          if (!selectedExistingId) return;
          setUsers(users.map(u => u.id === selectedExistingId ? { ...u, isPremium: true, premiumExpiryDate: expiryStr } : u));
      } else {
          const newUser: UserProfile = {
              id: Date.now().toString(),
              name: newUserData.name || 'New User',
              email: newUserData.email,
              location: newUserData.location || 'Rajshahi',
              age: newUserData.age || 18,
              image: newUserData.image || 'https://i.pravatar.cc/150',
              status: 'active',
              joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              isPremium: true,
              premiumExpiryDate: expiryStr,
              isVerified: true,
              bio: 'Premium Member',
              distance: '0 km'
          };
          setUsers([...users, newUser]);
      }
      setShowAddModal(false);
      setNewUserData({ name: '', email: '', location: '', age: 18, image: 'https://i.pravatar.cc/150?u=new_prem' });
      setSelectedExistingId('');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
        {/* Premium Access Control Section (New) */}
        <section className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <span className="material-icons-round text-yellow-500">lock_open</span> Premium Access Control
            </h3>
            <p className="text-sm text-gray-500 mb-6">Configure exactly what privileges a user receives when they subscribe to the Premium plan.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                   <div>
                       <p className="font-bold text-sm text-gray-800 dark:text-white">Unlimited Swipes</p>
                       <p className="text-xs text-gray-500">Remove daily limit</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.premiumPermissions.allowUnlimitedSwipes} 
                        onChange={() => togglePermission('allowUnlimitedSwipes')}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                   </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                   <div>
                       <p className="font-bold text-sm text-gray-800 dark:text-white">See Who Likes You</p>
                       <p className="text-xs text-gray-500">Reveal blurred profiles</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.premiumPermissions.allowSeeLikes} 
                        onChange={() => togglePermission('allowSeeLikes')}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                   </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                   <div>
                       <p className="font-bold text-sm text-gray-800 dark:text-white">Priority Likes</p>
                       <p className="text-xs text-gray-500">Your likes are seen first</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.premiumPermissions.allowPriorityLikes} 
                        onChange={() => togglePermission('allowPriorityLikes')}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                   </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                   <div>
                       <p className="font-bold text-sm text-gray-800 dark:text-white">Message Before Match</p>
                       <p className="text-xs text-gray-500">Send notes with Super Likes</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.premiumPermissions.allowMessageBeforeMatch} 
                        onChange={() => togglePermission('allowMessageBeforeMatch')}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                   </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                   <div>
                       <p className="font-bold text-sm text-gray-800 dark:text-white">Read Receipts</p>
                       <p className="text-xs text-gray-500">See when messages are read</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.premiumPermissions.allowReadReceipts} 
                        onChange={() => togglePermission('allowReadReceipts')}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                   </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                   <div>
                       <p className="font-bold text-sm text-gray-800 dark:text-white">Incognito Mode</p>
                       <p className="text-xs text-gray-500">Only show to people I like</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.premiumPermissions.allowIncognitoMode} 
                        onChange={() => togglePermission('allowIncognitoMode')}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                   </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                   <div>
                       <p className="font-bold text-sm text-gray-800 dark:text-white">Passport Mode</p>
                       <p className="text-xs text-gray-500">Change location</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.premiumPermissions.allowPassport} 
                        onChange={() => togglePermission('allowPassport')}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                   </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                   <div>
                       <p className="font-bold text-sm text-gray-800 dark:text-white">Rewind Last Swipe</p>
                       <p className="text-xs text-gray-500">Undo accidental swipes</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.premiumPermissions.allowRewind} 
                        onChange={() => togglePermission('allowRewind')}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                   </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                   <div>
                       <p className="font-bold text-sm text-gray-800 dark:text-white">Remove Ads</p>
                       <p className="text-xs text-gray-500">Ad-free experience</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.premiumPermissions.removeAds} 
                        onChange={() => togglePermission('removeAds')}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                   </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                   <div>
                       <p className="font-bold text-sm text-gray-800 dark:text-white">Advanced Filters</p>
                       <p className="text-xs text-gray-500">Filter by height, education...</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.premiumPermissions.allowAdvancedFilters} 
                        onChange={() => togglePermission('allowAdvancedFilters')}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                   </label>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                   <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-sm text-gray-800 dark:text-white">Super Likes / Month</p>
                      <span className="text-primary font-bold">{config.premiumPermissions.superLikesPerMonth}</span>
                   </div>
                   <input 
                     type="range" 
                     min="0" max="50" step="5"
                     value={config.premiumPermissions.superLikesPerMonth}
                     onChange={(e) => updatePermissionValue('superLikesPerMonth', parseInt(e.target.value))}
                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                   />
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                   <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-sm text-gray-800 dark:text-white">Profile Boosts / Month</p>
                      <span className="text-primary font-bold">{config.premiumPermissions.boostsPerMonth}</span>
                   </div>
                   <input 
                     type="range" 
                     min="0" max="10" step="1"
                     value={config.premiumPermissions.boostsPerMonth}
                     onChange={(e) => updatePermissionValue('boostsPerMonth', parseInt(e.target.value))}
                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                   />
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                   <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-sm text-gray-800 dark:text-white">Daily Top Picks</p>
                      <span className="text-primary font-bold">{config.premiumPermissions.dailyTopPicksCount}</span>
                   </div>
                   <input 
                     type="range" 
                     min="0" max="20" step="1"
                     value={config.premiumPermissions.dailyTopPicksCount}
                     onChange={(e) => updatePermissionValue('dailyTopPicksCount', parseInt(e.target.value))}
                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                   />
                </div>
            </div>
        </section>

        {/* Plans Section */}
        <section>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-icons-round text-yellow-500">price_change</span> Pricing Plans
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {config.premiumPlans.map((plan, index) => (
                    <div key={plan.id} className={`bg-white dark:bg-surface-dark p-6 rounded-xl border-2 transition-colors relative ${plan.popular ? 'border-yellow-500 shadow-lg shadow-yellow-500/10' : 'border-gray-100 dark:border-gray-700'}`}>
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-bold px-3 py-0.5 rounded-full">
                                POPULAR
                            </div>
                        )}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Duration Text</label>
                                <input 
                                    type="text" 
                                    value={plan.duration}
                                    onChange={(e) => handlePlanChange(index, 'duration', e.target.value)}
                                    className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Price (BDT)</label>
                                <input 
                                    type="text" 
                                    value={plan.price}
                                    onChange={(e) => handlePlanChange(index, 'price', e.target.value)}
                                    className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary font-bold text-lg text-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Discount Tag</label>
                                <input 
                                    type="text" 
                                    value={plan.save}
                                    onChange={(e) => handlePlanChange(index, 'save', e.target.value)}
                                    className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-green-600"
                                />
                            </div>
                            <div className="pt-2 flex items-center gap-2">
                                <button 
                                    onClick={() => setPopularPlan(index)}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${plan.popular ? 'bg-yellow-100 text-yellow-700 cursor-default' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    {plan.popular ? 'Selected as Popular' : 'Set as Popular'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* Features Section */}
        <section>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <span className="material-icons-round text-yellow-500">star</span> Premium Features
                </h3>
                <button onClick={addFeature} className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors">
                    <span className="material-icons-round text-sm">add</span> Add Feature
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.premiumFeatures.map((feature, index) => (
                    <div key={feature.id} className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-start gap-3 relative group">
                        <button onClick={() => removeFeature(index)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-icons-round text-lg">close</span>
                        </button>
                        <div className="pt-2">
                             <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                                 <span className="material-icons-round">{feature.icon}</span>
                             </div>
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <input 
                                    type="text" 
                                    value={feature.title}
                                    onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                                    className="text-sm font-bold rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary p-1.5"
                                    placeholder="Title"
                                />
                                <input 
                                    type="text" 
                                    value={feature.icon}
                                    onChange={(e) => handleFeatureChange(index, 'icon', e.target.value)}
                                    className="text-xs font-mono text-gray-500 rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary p-1.5"
                                    placeholder="Icon Name"
                                />
                            </div>
                            <textarea 
                                rows={2}
                                value={feature.desc}
                                onChange={(e) => handleFeatureChange(index, 'desc', e.target.value)}
                                className="w-full text-xs text-gray-600 rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary p-1.5 resize-none"
                                placeholder="Description"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* User Management Section */}
        <section>
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                   <span className="material-icons-round text-yellow-500">group_add</span> Premium Users ({premiumUsers.length})
               </h3>
               <button 
                 onClick={() => setShowAddModal(true)} 
                 className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors shadow-lg shadow-yellow-500/30"
               >
                   <span className="material-icons-round text-sm">add</span> Add Member
               </button>
            </div>
            
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">User</th>
                                <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Email</th>
                                <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Expiry Date</th>
                                <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Status</th>
                                <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {premiumUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={user.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{user.email}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">{user.premiumExpiryDate}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-700 flex items-center w-fit gap-1">
                                            <span className="material-icons-round text-[10px]">star</span> Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => toggleUserPremium(user.id)}
                                            className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-red-200"
                                        >
                                            Revoke
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {premiumUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                                        No active premium users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        {/* Add Premium User Modal */}
        {showAddModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
               <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                     <h3 className="font-bold text-lg text-gray-800 dark:text-white">Add Premium Member</h3>
                     <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-red-500">
                        <span className="material-icons-round">close</span>
                     </button>
                  </div>
                  
                  <form id="addPremiumForm" onSubmit={handleAddPremium} className="p-6 space-y-4">
                     <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-4">
                        <button 
                           type="button"
                           className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${addMode === 'existing' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                           onClick={() => setAddMode('existing')}
                        >
                           Existing User
                        </button>
                        <button 
                           type="button"
                           className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${addMode === 'new' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                           onClick={() => setAddMode('new')}
                        >
                           New User
                        </button>
                     </div>

                     {addMode === 'existing' ? (
                        <div>
                           <label className="block text-xs font-medium text-gray-500 mb-1">Select User</label>
                           <select 
                              className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                              value={selectedExistingId}
                              onChange={(e) => setSelectedExistingId(e.target.value)}
                              required
                           >
                              <option value="">-- Select a user --</option>
                              {nonPremiumUsers.map(u => (
                                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                              ))}
                           </select>
                           {nonPremiumUsers.length === 0 && <p className="text-xs text-red-500 mt-1">All users are already premium.</p>}
                        </div>
                     ) : (
                        <div className="space-y-3">
                           <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                              <input 
                                 type="text" required
                                 value={newUserData.name}
                                 onChange={e => setNewUserData({...newUserData, name: e.target.value})}
                                 className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                              />
                           </div>
                           <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                              <input 
                                 type="email" required
                                 value={newUserData.email}
                                 onChange={e => setNewUserData({...newUserData, email: e.target.value})}
                                 className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                              />
                           </div>
                           <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                              <input 
                                 type="text" required
                                 value={newUserData.location}
                                 onChange={e => setNewUserData({...newUserData, location: e.target.value})}
                                 className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
                              />
                           </div>
                        </div>
                     )}
                  </form>

                  <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                     <button 
                        onClick={() => setShowAddModal(false)}
                        className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                     >
                        Cancel
                     </button>
                     <button 
                        form="addPremiumForm"
                        type="submit"
                        className="px-6 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-dark shadow-lg shadow-primary/30"
                     >
                        Add Member
                     </button>
                  </div>
               </div>
            </div>
        )}
    </div>
  );
};

const SystemLogsTab: React.FC = () => {
  const [logs] = useState<SystemLog[]>(MOCK_SYSTEM_LOGS);

  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-full flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <div>
           <h3 className="text-lg font-bold text-gray-800 dark:text-white">System Audit Logs</h3>
           <p className="text-sm text-gray-500">Track administrative actions and security events</p>
        </div>
        <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
            <span className="material-icons-round text-sm">download</span> Export Logs
        </button>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0">
            <tr>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Action</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Admin</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Target</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">IP Address</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold">Time</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{log.action}</span>
                      <span className="text-xs text-gray-400">{log.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{log.admin}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{log.target}</td>
                <td className="px-6 py-4 text-sm font-mono text-gray-500">{log.ip}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{log.timestamp}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    log.status === 'Success' ? 'bg-green-100 text-green-700' :
                    log.status === 'Warning' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'users' | 'moderators' | 'settings' | 'customization' | 'premium' | 'logs' | 'accessibility' | 'reports' | 'moderation' | 'events' | 'support'>('overview');
  const [notifications, setNotifications] = useState(ADMIN_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { accessibility, isDark, toggleTheme } = useSiteConfig();

  // Determine User Role (Default to 'admin' if not specified)
  const role = location.state?.role || 'admin';

  // Define Menu Items with Role Access
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: 'dashboard', roles: ['admin', 'moderator'] },
    { id: 'users', label: 'User Management', icon: 'group', roles: ['admin', 'moderator'] },
    { id: 'moderation', label: 'Moderation Queue', icon: 'image_search', roles: ['admin', 'moderator'] },
    { id: 'events', label: 'Events', icon: 'event', roles: ['admin', 'moderator'] },
    { id: 'reports', label: 'Reports & Abuse', icon: 'report_problem', roles: ['admin', 'moderator'] },
    { id: 'support', label: 'Support Tickets', icon: 'support_agent', roles: ['admin', 'moderator'] },
    { id: 'analytics', label: 'Analytics', icon: 'insights', roles: ['admin'] },
    { id: 'moderators', label: 'Moderators', icon: 'security', roles: ['admin'] },
    { id: 'premium', label: 'Premium', icon: 'star', roles: ['admin'] },
    { id: 'logs', label: 'System Logs', icon: 'list_alt', roles: ['admin'] },
    { id: 'customization', label: 'Site Customization', icon: 'palette', roles: ['admin'] },
    { id: 'settings', label: 'Settings', icon: 'settings', roles: ['admin'] },
    { id: 'accessibility', label: 'Accessibility', icon: 'accessibility_new', roles: ['admin', 'moderator'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(role));

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Prevent accessing restricted tabs if switched manually or via state persistence
  const currentTabAllowed = filteredMenu.find(m => m.id === activeTab);
  if (!currentTabAllowed && activeTab !== 'overview') {
      setActiveTab('overview');
  }

  return (
    <div 
      className={`flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${accessibility.highContrast ? 'grayscale contrast-125' : ''}`}
      style={{ fontSize: `${accessibility.fontSize}%` }}
    >
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-surface-dark border-r border-gray-200 dark:border-gray-700 flex flex-col z-20 shadow-lg transition-all hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700 gap-2">
           <span className={`material-icons-round text-2xl ${role === 'admin' ? 'text-primary' : 'text-blue-500'}`}>
             {role === 'admin' ? 'admin_panel_settings' : 'security'}
           </span>
           <h1 className="font-bold text-lg font-display truncate">
             {role === 'admin' ? 'Admin Portal' : 'Moderator Panel'}
           </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">Menu</p>
          {filteredMenu.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="material-icons-round">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
             <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
               <span className="material-icons-round">home</span> Back to Site
             </Link>
             <button 
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
             >
                <span className="material-icons-round">{isDark ? 'light_mode' : 'dark_mode'}</span>
                {isDark ? 'Light Mode' : 'Dark Mode'}
             </button>
             <button 
                onClick={() => navigate('/admin-login')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
             >
               <span className="material-icons-round">logout</span> Logout
             </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
             <img src="https://i.pravatar.cc/150?u=admin" className="w-9 h-9 rounded-full border border-gray-200" alt="User" />
             <div>
                <p className="text-sm font-bold text-gray-800 dark:text-white capitalize">{role}</p>
                <p className="text-xs text-green-500 flex items-center gap-1">
                   <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                </p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative transition-all">
        {/* Header */}
        <header className="bg-white dark:bg-surface-dark h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-8 z-30">
           <div className="flex items-center gap-3 md:hidden">
                <h2 className="font-bold text-xl text-gray-800 dark:text-white capitalize truncate">{activeTab.replace('-', ' ')}</h2>
           </div>
           <h2 className="hidden md:block text-xl font-bold font-display text-gray-800 dark:text-white capitalize">
             {activeTab === 'overview' ? 'Dashboard Overview' : activeTab.replace('-', ' ')}
           </h2>
           <div className="flex items-center gap-4 relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full relative transition-colors"
              >
                 <span className="material-icons-round">notifications</span>
                 {unreadCount > 0 && (
                   <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                 )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up origin-top-right z-50">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-gray-800 dark:text-white text-sm">Notifications</h3>
                    <button onClick={markAllAsRead} className="text-xs text-primary font-medium hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-sm">No notifications</div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className={`p-4 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}>
                          <div className="flex gap-3">
                            <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              notif.type === 'user' ? 'bg-blue-100 text-blue-600' :
                              notif.type === 'premium' ? 'bg-yellow-100 text-yellow-600' :
                              notif.type === 'report' ? 'bg-red-100 text-red-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              <span className="material-icons-round text-sm">
                                {notif.type === 'user' ? 'person_add' :
                                 notif.type === 'premium' ? 'star' :
                                 notif.type === 'report' ? 'gavel' : 'info'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-800 dark:text-white mb-0.5">{notif.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 leading-relaxed">{notif.message}</p>
                              <p className="text-[10px] text-gray-400 font-medium">{notif.time}</p>
                            </div>
                            {!notif.isRead && (
                              <div className="mt-2 w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
           </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
           {activeTab === 'overview' && <OverviewTab />}
           {activeTab === 'reports' && <ReportsTab />}
           {activeTab === 'moderation' && <ModerationQueueTab />}
           {activeTab === 'events' && <EventsManagementTab />}
           {activeTab === 'support' && <SupportTicketsTab />}
           {/* Restrict Components Rendering based on Role */}
           {activeTab === 'analytics' && role === 'admin' && <AnalyticsTab />}
           {activeTab === 'users' && <UserManagementTab />}
           {activeTab === 'moderators' && role === 'admin' && <ModeratorsTab />}
           {activeTab === 'premium' && role === 'admin' && <PremiumManagementTab />}
           {activeTab === 'logs' && role === 'admin' && <SystemLogsTab />}
           {activeTab === 'customization' && role === 'admin' && <CustomizationTab />}
           {activeTab === 'settings' && role === 'admin' && <SettingsTab />}
           {activeTab === 'accessibility' && <AccessibilityTab />}
        </main>

        {/* Mobile Bottom Nav for Admin */}
        <div className="md:hidden bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700 p-2 flex justify-between items-center overflow-x-auto no-scrollbar">
             {filteredMenu.map(item => (
                 <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`p-3 rounded-lg flex flex-col items-center justify-center min-w-[60px] ${activeTab === item.id ? 'text-primary' : 'text-gray-400'}`}
                 >
                    <span className="material-icons-round text-2xl">{item.icon}</span>
                 </button>
             ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
