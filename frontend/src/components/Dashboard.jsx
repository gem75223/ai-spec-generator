import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import ProjectService from '../services/project.service';
import SpecGenerator from './SpecGenerator';

const Dashboard = () => {
    const [currentUser, setCurrentUser] = useState(undefined);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
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
            }
        );
    };

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-4 border-b">
                    <h1 className="text-xl font-bold text-gray-800">Spec Generator</h1>
                    <div className="text-sm text-gray-500 mt-1">Welcome, {currentUser?.username}</div>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-semibold text-gray-600 uppercase">Projects</h2>
                        <button
                            onClick={() => setIsCreatingProject(true)}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            + New
                        </button>
                    </div>

                    {isCreatingProject && (
                        <form onSubmit={handleCreateProject} className="mb-4">
                            <input
                                type="text"
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="Project Name"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                autoFocus
                            />
                        </form>
                    )}

                    <ul className="space-y-2">
                        {projects.map((project) => (
                            <li key={project.id}>
                                <button
                                    onClick={() => setSelectedProject(project)}
                                    className={`w-full text-left px-3 py-2 rounded text-sm ${selectedProject?.id === project.id
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {project.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                {selectedProject ? (
                    <SpecGenerator project={selectedProject} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        Select a project to start generating specs
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
