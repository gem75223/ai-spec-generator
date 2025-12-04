import api from './api';

const getSpecsByProject = (projectId) => {
    return api.get(`/specs/project/${projectId}`);
};

const generateSpec = (projectId, requirement) => {
    return api.post('/specs/generate', {
        projectId,
        requirement
    });
};

const SpecService = {
    getSpecsByProject,
    generateSpec,
};

export default SpecService;
