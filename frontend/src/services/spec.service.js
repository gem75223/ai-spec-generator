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

const updateSpec = (id, data) => {
    return api.put(`/specs/${id}`, data);
};

const deleteSpec = (id) => {
    return api.delete(`/specs/${id}`);
};

const refineSpec = (section, currentContent, instruction) => {
    return api.post('/specs/refine', {
        section,
        currentContent,
        instruction
    });
};

const SpecService = {
    getSpecsByProject,
    generateSpec,
    updateSpec,
    deleteSpec,
    refineSpec,
};

export default SpecService;
