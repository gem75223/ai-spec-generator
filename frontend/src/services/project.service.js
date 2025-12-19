import api from './api';

const getAllProjects = () => {
    return api.get('/projects');
};

const createProject = (name, description) => {
    return api.post('/projects', {
        name,
        description
    });
};

const getProjectById = (id) => {
    return api.get(`/projects/${id}`);
};

const updateProject = (id, name, description) => {
    return api.put(`/projects/${id}`, {
        name,
        description
    });
};

const deleteProject = (id) => {
    return api.delete(`/projects/${id}`);
};

const ProjectService = {
    getAllProjects,
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
};

export default ProjectService;
