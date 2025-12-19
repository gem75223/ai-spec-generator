import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import ProjectService from '../services/project.service';
import SpecGenerator from './SpecGenerator';
import Profile from './Profile';
import { User, LogOut, Layout, Plus, Pencil, Trash2, X, Check, Menu } from 'lucide-react';

const Dashboard = () => {
    const [currentUser, setCurrentUser] = useState(undefined);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [view, setView] = useState('project'); // project, profile
    const [editingProject, setEditingProject] = useState(null);
    const [editName, setEditName] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
            loadProjects();
        } else {
            navigate('/login');
        }
    }, []);

    const loadProjects = () => {
        ProjectService.getAllProjects().then(
            (response) => {
                setProjects(response.data);
            },
            (error) => {
                console.log("Error loading projects", error);
                if (error.response && error.response.status === 401) {
                    AuthService.logout();
                    navigate('/login');
                }
            }
        );
    };

    const handleCreateProject = (e) => {
        e.preventDefault();
        ProjectService.createProject(newProjectName, "Description").then(
            (response) => {
                setProjects([...projects, response.data]);
                setIsCreatingProject(false);
                setNewProjectName('');
            },
            (error) => {
                console.log("Error creating project", error);
                alert("無法建立專案，請稍後再試。");
            }
        );
    };

    const handleUpdateProject = (id) => {
        ProjectService.updateProject(id, editName, "Description").then(
            (response) => {
                setProjects(projects.map(p => p.id === id ? response.data : p));
                setEditingProject(null);
                setEditName('');
            },
            (error) => {
                console.log("Error updating project", error);
            }
        );
    };

    const handleDeleteProject = (id, e) => {
        e.stopPropagation();
        if (window.confirm("確定要刪除此專案嗎？此動作無法復原。")) {
            ProjectService.deleteProject(id).then(
                () => {
                    setProjects(projects.filter(p => p.id !== id));
                    if (selectedProject?.id === id) {
                        setSelectedProject(null);
                    }
                },
                (error) => {
                    console.log("Error deleting project", error);
                }
            );
        }
    };

    const startEditing = (project, e) => {
        e.stopPropagation();
        setEditingProject(project);
        setEditName(project.name);
    };

    const cancelEditing = (e) => {
        e?.stopPropagation();
        setEditingProject(null);
        setEditName('');
    };

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    const handleProjectSelect = (project) => {
        setSelectedProject(project);
        setView('project');
        setIsSidebarOpen(false); // Close sidebar on mobile when project selected
    };

    return (
        <div className="flex h-screen bg-stone-50 flex-col md:flex-row font-sans">
            {/* Mobile Header */}
            <div className="md:hidden bg-stone-50 p-4 border-b border-stone-200 flex justify-between items-center shadow-sm z-20">
                <h1 className="text-xl font-bold text-stone-800">規格產生器</h1>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-stone-600 bg-white p-2 rounded-lg shadow-sm border border-stone-200">
                    <Menu />
                </button>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`
                fixed md:static inset-y-0 left-0 bg-stone-50 border-r border-stone-200 flex flex-col z-40 w-72 transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
            `}>
                <div className="p-6 border-b border-stone-200 hidden md:block">
                    <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                        <Layout className="text-orange-500" />
                        規格產生器
                    </h1>
                    <div className="text-sm text-stone-500 mt-2 font-medium bg-stone-100 px-3 py-1 rounded-full inline-block">
                        歡迎，{currentUser?.username}
                    </div>
                </div>

                {/* Mobile version of User Info inside drawer */}
                <div className="p-4 border-b border-stone-200 md:hidden bg-stone-100">
                    <div className="text-sm font-bold text-stone-600">歡迎，{currentUser?.username}</div>
                    <div className="flex justify-end mt-2">
                        <button onClick={() => setIsSidebarOpen(false)} className="bg-white p-1 rounded-full shadow-sm">
                            <X className="text-stone-500" />
                        </button>
                    </div>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider">我的專案</h2>
                        <button
                            onClick={() => setIsCreatingProject(true)}
                            className="bg-orange-100 text-orange-600 hover:bg-orange-200 p-1.5 rounded-lg transition-colors"
                            title="新增專案"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {isCreatingProject && (
                        <form onSubmit={handleCreateProject} className="mb-4 px-2">
                            <div className="flex items-center px-4 py-3 rounded-xl bg-white border-2 border-orange-300 shadow-md">
                                <input
                                    type="text"
                                    className="w-full text-base border-none bg-transparent focus:outline-none text-stone-800 font-medium"
                                    placeholder="輸入新專案名稱..."
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    autoFocus
                                    required
                                />
                                <button type="submit" className="text-green-600 ml-2 p-1.5 hover:bg-green-100 rounded-lg transition-colors">
                                    <Check size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingProject(false)}
                                    className="text-red-500 ml-1 p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </form>
                    )}

                    <ul className="space-y-3 px-2">
                        {projects.map((project) => (
                            <li key={project.id} className="group relative">
                                {editingProject?.id === project.id ? (
                                    <div className="flex items-center px-4 py-3 rounded-xl bg-white border-2 border-orange-300 shadow-md">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full text-base border-none bg-transparent focus:outline-none text-stone-800 font-medium"
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleUpdateProject(project.id);
                                                if (e.key === 'Escape') cancelEditing();
                                            }}
                                        />
                                        <button onClick={() => handleUpdateProject(project.id)} className="text-green-600 ml-2 p-1.5 hover:bg-green-100 rounded-lg transition-colors">
                                            <Check size={18} />
                                        </button>
                                        <button onClick={cancelEditing} className="text-red-500 ml-1 p-1.5 hover:bg-red-100 rounded-lg transition-colors">
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative group/item">
                                        <button
                                            onClick={() => handleProjectSelect(project)}
                                            className={`grid grid-cols-[auto,1fr] gap-3 items-center w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 border ${selectedProject?.id === project.id && view === 'project'
                                                ? 'bg-orange-100 border-orange-200 text-orange-900 font-bold shadow-md transform scale-[1.02]'
                                                : 'bg-white border-transparent text-stone-600 hover:bg-stone-100 hover:border-stone-200 hover:shadow-sm'
                                                }`}
                                        >
                                            <Layout size={20} className={`flex-shrink-0 ${selectedProject?.id === project.id ? 'text-orange-600' : 'text-stone-400 group-hover/item:text-stone-500'}`} />
                                            <span className="truncate text-base font-medium">{project.name}</span>
                                        </button>

                                        {/* Edit/Delete Actions - visible on hover */}
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover/item:flex bg-white shadow-lg rounded-lg border border-stone-200 overflow-hidden divide-x divide-stone-100 z-10">
                                            <button
                                                onClick={(e) => startEditing(project, e)}
                                                className="p-2 text-stone-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                title="編輯"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteProject(project.id, e)}
                                                className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                title="刪除"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="p-4 border-t border-stone-200 space-y-3 bg-stone-50">
                    <button
                        onClick={() => { setView('profile'); setIsSidebarOpen(false); }}
                        className={`w-full px-4 py-3 text-base font-medium rounded-xl flex items-center justify-center transition-all ${view === 'profile'
                            ? 'bg-stone-200 text-stone-900 shadow-inner'
                            : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100 shadow-sm'}`}
                    >
                        <User size={18} className="mr-2" />
                        個人資料
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-base font-medium text-stone-500 border border-stone-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center justify-center transition-all bg-white shadow-sm"
                    >
                        <LogOut size={18} className="mr-2" />
                        登出
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden h-[calc(100vh-65px)] md:h-screen bg-stone-50 relative">
                {view === 'project' ? (
                    selectedProject ? (
                        <div className="h-full">
                            <SpecGenerator project={selectedProject} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-stone-400 p-8 text-center">
                            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-6">
                                <Layout size={48} className="text-stone-300" />
                            </div>
                            <h2 className="text-2xl font-bold text-stone-600 mb-2">還沒有選擇專案</h2>
                            <p className="text-lg">請從左側列表選擇一個專案，或建立新專案以開始使用。</p>
                        </div>
                    )
                ) : (
                    <div className="h-full overflow-y-auto p-4 md:p-8">
                        <div className="max-w-4xl mx-auto">
                            <Profile />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
