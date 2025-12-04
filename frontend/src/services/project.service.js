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

const ProjectService = {
    getAllProjects,
    createProject,
    getProjectById,
};

export default ProjectService;
