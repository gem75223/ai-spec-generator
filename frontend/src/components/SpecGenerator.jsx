import React, { useState, useEffect } from 'react';
import SpecService from '../services/spec.service';
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';
import { FileText, Database, GitBranch, Code } from 'lucide-react';

mermaid.initialize({ startOnLoad: true });

const SpecGenerator = ({ project }) => {
    const [requirement, setRequirement] = useState('');
    const [specs, setSpecs] = useState([]);
    const [currentSpec, setCurrentSpec] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('api'); // api, db, sequence, mock

    useEffect(() => {
        loadSpecs();
    }, [project]);

    useEffect(() => {
        if (activeTab === 'sequence' && currentSpec?.sequenceDiagram) {
            setTimeout(() => {
                mermaid.contentLoaded();
            }, 100);
        }
    }, [activeTab, currentSpec]);

    const loadSpecs = () => {
        SpecService.getSpecsByProject(project.id).then(
            (response) => {
                setSpecs(response.data);
                if (response.data.length > 0) {
                    setCurrentSpec(response.data[response.data.length - 1]);
                } else {
                    setCurrentSpec(null);
                }
            },
            (error) => {
                console.log("Error loading specs", error);
            }
        );
    };

    const handleGenerate = () => {
        if (!requirement.trim()) return;

        setLoading(true);
        SpecService.generateSpec(project.id, requirement).then(
            (response) => {
                setSpecs([...specs, response.data]);
                setCurrentSpec(response.data);
                setLoading(false);
            },
            (error) => {
                console.log("Error generating spec", error);
                setLoading(false);
            }
        );
    };

    const renderTabContent = () => {
        if (!currentSpec) return <div className="p-4 text-gray-400">No spec generated yet.</div>;

        switch (activeTab) {
            case 'api':
                return (
                    <div className="p-4 bg-gray-50 h-full overflow-auto font-mono text-sm whitespace-pre-wrap">
                        {currentSpec.apiSpec}
                    </div>
                );
            case 'db':
                return (
                    <div className="p-4 bg-gray-50 h-full overflow-auto font-mono text-sm whitespace-pre-wrap">
                        {currentSpec.dbSchema}
                    </div>
                );
            case 'sequence':
                return (
                    <div className="p-4 h-full overflow-auto flex justify-center">
                        <div className="mermaid">
                            {currentSpec.sequenceDiagram}
                        </div>
                    </div>
                );
            case 'mock':
                return (
                    <div className="p-4 bg-gray-50 h-full overflow-auto font-mono text-sm whitespace-pre-wrap">
                        {currentSpec.mockData}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex h-full">
            {/* Left Panel: Input */}
            <div className="w-1/3 border-r flex flex-col bg-white">
                <div className="p-4 border-b bg-gray-50">
                    <h2 className="font-semibold text-gray-700">Requirements / Storyboard</h2>
                </div>
                <div className="flex-1 p-4">
                    <textarea
                        className="w-full h-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Describe your requirement here... e.g., 'User logs in with username and password, system validates credentials and returns a JWT token.'"
                        value={requirement}
                        onChange={(e) => setRequirement(e.target.value)}
                    />
                </div>
                <div className="p-4 border-t bg-gray-50">
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !requirement.trim()}
                        className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${loading || !requirement.trim()
                                ? 'bg-blue-300 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {loading ? 'Generating...' : 'Generate Specs'}
                    </button>
                </div>
            </div>

            {/* Right Panel: Output */}
            <div className="w-2/3 flex flex-col bg-white">
                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('api')}
                        className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'api'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <FileText size={16} className="mr-2" /> API Spec
                    </button>
                    <button
                        onClick={() => setActiveTab('db')}
                        className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'db'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Database size={16} className="mr-2" /> DB Schema
                    </button>
                    <button
                        onClick={() => setActiveTab('sequence')}
                        className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sequence'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <GitBranch size={16} className="mr-2" /> Sequence
                    </button>
                    <button
                        onClick={() => setActiveTab('mock')}
                        className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'mock'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Code size={16} className="mr-2" /> Mock Data
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative">
                    {renderTabContent()}
                </div>

                {/* History / Version selector could go here */}
                {specs.length > 1 && (
                    <div className="p-2 border-t bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
                        <span>Version History ({specs.length} versions)</span>
                        <select
                            className="border rounded p-1"
                            onChange={(e) => setCurrentSpec(specs.find(s => s.id === parseInt(e.target.value)))}
                            value={currentSpec?.id || ''}
                        >
                            {specs.map((s, idx) => (
                                <option key={s.id} value={s.id}>v{idx + 1} - {new Date(s.createdAt).toLocaleTimeString()}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpecGenerator;
