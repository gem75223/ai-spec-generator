import React, { useState, useEffect } from 'react';
import SpecService from '../services/spec.service';
import mermaid from 'mermaid';
import { FileText, Database, GitBranch, Code, Download, Trash2, Edit, Save, FileJson, Wand2 } from 'lucide-react';

mermaid.initialize({ startOnLoad: true });

const SpecGenerator = ({ project }) => {
    const [requirement, setRequirement] = useState('');
    const [specs, setSpecs] = useState([]);
    const [currentSpec, setCurrentSpec] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('api'); // api, db, sequence, mock
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [isRefining, setIsRefining] = useState(false);
    const [refineInstruction, setRefineInstruction] = useState('');
    const [refiningLoading, setRefiningLoading] = useState(false);

    useEffect(() => {
        loadSpecs();
    }, [project]);

    useEffect(() => {
        if (currentSpec) {
            setEditContent(getCurrentTabContent());
            setIsEditing(false);
            setIsRefining(false);
        }
    }, [currentSpec, activeTab]);

    useEffect(() => {
        if (activeTab === 'sequence' && currentSpec?.sequenceDiagram && !isEditing) {
            setTimeout(() => {
                const element = document.querySelector(".mermaid");
                if (element) {
                    element.removeAttribute("data-processed");
                    mermaid.contentLoaded();
                }
            }, 100);
        }
    }, [activeTab, currentSpec, isEditing]);

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

    const handleDeleteSpec = () => {
        if (!currentSpec || !window.confirm("確定要刪除此版本規格嗎？")) return;

        SpecService.deleteSpec(currentSpec.id).then(
            () => {
                const newSpecs = specs.filter(s => s.id !== currentSpec.id);
                setSpecs(newSpecs);
                setCurrentSpec(newSpecs.length > 0 ? newSpecs[newSpecs.length - 1] : null);
            },
            (error) => {
                console.log("Error deleting spec", error);
            }
        );
    };

    const handleDownload = (format) => {
        if (!currentSpec) return;

        let content = "";
        let filename = `spec-${project.name}-v${currentSpec.id}`;
        let type = "";

        if (format === 'json') {
            content = JSON.stringify(currentSpec, null, 2);
            filename += ".json";
            type = "application/json";
        } else {
            content = `# Spec for ${project.name}\n\n`;
            content += `## Requirement\n${currentSpec.requirementDescription}\n\n`;
            content += `## API Spec\n\`\`\`json\n${currentSpec.apiSpec}\n\`\`\`\n\n`;
            content += `## DB Schema\n\`\`\`sql\n${currentSpec.dbSchema}\n\`\`\`\n\n`;
            content += `## Sequence Diagram\n\`\`\`mermaid\n${currentSpec.sequenceDiagram}\n\`\`\`\n\n`;
            content += `## Mock Data\n\`\`\`json\n${currentSpec.mockData}\n\`\`\`\n\n`;
            filename += ".md";
            type = "text/markdown";
        }

        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel edit
            setIsEditing(false);
            setEditContent(getCurrentTabContent());
        } else {
            // Start edit
            setIsEditing(true);
            setEditContent(getCurrentTabContent());
            setIsRefining(false); // Close refine if open
        }
    };

    const handleRefineToggle = () => {
        setIsRefining(!isRefining);
        setIsEditing(false); // Close edit if open
        setRefineInstruction('');
    };

    const handleRefine = () => {
        if (!refineInstruction.trim()) return;

        setRefiningLoading(true);
        const currentContent = getCurrentTabContent();

        SpecService.refineSpec(activeTab, currentContent, refineInstruction).then(
            (response) => {
                const refinedContent = response.data.refinedContent;

                // Automatically save the refined content
                const updatedSpec = { ...currentSpec };
                switch (activeTab) {
                    case 'api': updatedSpec.apiSpec = refinedContent; break;
                    case 'db': updatedSpec.dbSchema = refinedContent; break;
                    case 'sequence': updatedSpec.sequenceDiagram = refinedContent; break;
                    case 'mock': updatedSpec.mockData = refinedContent; break;
                }

                SpecService.updateSpec(currentSpec.id, updatedSpec).then(
                    (res) => {
                        setCurrentSpec(res.data);
                        setSpecs(specs.map(s => s.id === res.data.id ? res.data : s));
                        setRefiningLoading(false);
                        setIsRefining(false);
                        setRefineInstruction('');
                    },
                    (err) => {
                        console.log("Error saving refined spec", err);
                        setRefiningLoading(false);
                    }
                );
            },
            (error) => {
                console.log("Error refining spec", error);
                setRefiningLoading(false);
            }
        );
    };

    const handleSave = () => {
        const updatedSpec = { ...currentSpec };
        switch (activeTab) {
            case 'api': updatedSpec.apiSpec = editContent; break;
            case 'db': updatedSpec.dbSchema = editContent; break;
            case 'sequence': updatedSpec.sequenceDiagram = editContent; break;
            case 'mock': updatedSpec.mockData = editContent; break;
        }

        SpecService.updateSpec(currentSpec.id, updatedSpec).then(
            (response) => {
                setCurrentSpec(response.data);
                setSpecs(specs.map(s => s.id === response.data.id ? response.data : s));
                setIsEditing(false);
            },
            (error) => {
                console.log("Error updating spec", error);
            }
        );
    };

    const getCurrentTabContent = () => {
        if (!currentSpec) return "";
        switch (activeTab) {
            case 'api': return currentSpec.apiSpec;
            case 'db': return currentSpec.dbSchema;
            case 'sequence': return currentSpec.sequenceDiagram;
            case 'mock': return currentSpec.mockData;
            default: return "";
        }
    };

    const renderTabContent = () => {
        if (!currentSpec) return <div className="p-8 text-stone-400 text-center text-lg">尚未產生規格，請在左側輸入需求。</div>;

        if (isEditing) {
            return (
                <div className="h-full flex flex-col">
                    <textarea
                        className="flex-1 p-6 font-mono text-sm resize-none focus:outline-none bg-stone-50 border-none"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                    />
                    <div className="p-4 border-t border-stone-200 bg-white flex justify-end space-x-3">
                        <button onClick={handleEditToggle} className="px-4 py-2 text-stone-600 border border-stone-300 rounded-xl hover:bg-stone-50 font-medium">取消</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-bold shadow-sm">儲存變更</button>
                    </div>
                </div>
            );
        }

        switch (activeTab) {
            case 'api':
                return (
                    <div className="p-6 bg-stone-50 h-full overflow-auto font-mono text-sm whitespace-pre-wrap text-stone-800">
                        {currentSpec.apiSpec}
                    </div>
                );
            case 'db':
                return (
                    <div className="p-6 bg-stone-50 h-full overflow-auto font-mono text-sm whitespace-pre-wrap text-stone-800">
                        {currentSpec.dbSchema}
                    </div>
                );
            case 'sequence':
                return (
                    <div className="p-6 h-full overflow-auto flex justify-center bg-white">
                        <div className="mermaid">
                            {currentSpec.sequenceDiagram}
                        </div>
                    </div>
                );
            case 'mock':
                return (
                    <div className="p-6 bg-stone-50 h-full overflow-auto font-mono text-sm whitespace-pre-wrap text-stone-800">
                        {currentSpec.mockData}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex h-full flex-col md:flex-row bg-white">
            {/* Left Panel: Input */}
            <div className="w-full md:w-1/3 border-r border-stone-200 flex flex-col bg-white h-1/3 md:h-full border-b md:border-b-0">
                <div className="p-5 border-b border-stone-200 bg-white flex justify-between items-center">
                    <h2 className="font-bold text-stone-800 text-lg">需求描述</h2>
                    <span className="text-xs text-stone-400 md:hidden bg-stone-100 px-2 py-1 rounded">Step 1</span>
                </div>
                <div className="flex-1 p-5 bg-stone-50">
                    <textarea
                        className="w-full h-full p-4 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none text-stone-700 bg-white shadow-sm"
                        placeholder="請詳細描述您的需求... 
例如：'設計一個線上書店系統，使用者可以瀏覽書籍、加入購物車並結帳。需要會員系統與後台管理。'"
                        value={requirement}
                        onChange={(e) => setRequirement(e.target.value)}
                    />
                </div>
                <div className="p-5 border-t border-stone-200 bg-white">
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !requirement.trim()}
                        className={`w-full py-3 px-6 rounded-xl text-white font-bold text-lg shadow-md transition-all transform hover:-translate-y-0.5 ${loading || !requirement.trim()
                            ? 'bg-stone-300 cursor-not-allowed shadow-none'
                            : 'bg-orange-500 hover:bg-orange-600 hover:shadow-orange-200'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                                AI 生成中...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center">
                                <Wand2 className="mr-2" size={20} />
                                開始產生規格
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Right Panel: Output */}
            <div className="w-full md:w-2/3 flex flex-col bg-white h-2/3 md:h-full">
                {/* Tabs */}
                <div className="flex border-b border-stone-200 justify-between items-center pr-4 overflow-x-auto bg-white pt-2 px-2">
                    <div className="flex shrink-0 space-x-2">
                        <button
                            onClick={() => setActiveTab('api')}
                            className={`flex items-center px-4 py-3 text-sm font-bold rounded-t-xl transition-all whitespace-nowrap ${activeTab === 'api'
                                ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500'
                                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                                }`}
                        >
                            <FileText size={18} className="mr-2" /> API 規格
                        </button>
                        <button
                            onClick={() => setActiveTab('db')}
                            className={`flex items-center px-4 py-3 text-sm font-bold rounded-t-xl transition-all whitespace-nowrap ${activeTab === 'db'
                                ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500'
                                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                                }`}
                        >
                            <Database size={18} className="mr-2" /> 資料庫
                        </button>
                        <button
                            onClick={() => setActiveTab('sequence')}
                            className={`flex items-center px-4 py-3 text-sm font-bold rounded-t-xl transition-all whitespace-nowrap ${activeTab === 'sequence'
                                ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500'
                                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                                }`}
                        >
                            <GitBranch size={18} className="mr-2" /> 時序圖
                        </button>
                        <button
                            onClick={() => setActiveTab('mock')}
                            className={`flex items-center px-4 py-3 text-sm font-bold rounded-t-xl transition-all whitespace-nowrap ${activeTab === 'mock'
                                ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500'
                                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                                }`}
                        >
                            <Code size={18} className="mr-2" /> 模擬資料
                        </button>
                    </div>
                    {currentSpec && (
                        <div className="flex space-x-1 items-center shrink-0 ml-4 pb-1">
                            <div className="relative">
                                <button onClick={handleRefineToggle} className={`p-2 rounded-xl border transition-all ${isRefining ? 'text-purple-600 bg-purple-50 border-purple-200 shadow-sm' : 'text-stone-500 border-transparent hover:bg-stone-100'}`} title="AI 微調">
                                    <Wand2 size={20} />
                                </button>
                                {isRefining && (
                                    <div className="absolute right-0 top-12 bg-white border border-stone-200 shadow-xl rounded-2xl p-4 w-96 z-50">
                                        <h3 className="text-base font-bold text-stone-800 mb-3 flex items-center">
                                            <Wand2 size={16} className="mr-2 text-purple-500" />
                                            AI 微調 ({activeTab.toUpperCase()})
                                        </h3>
                                        <textarea
                                            className="w-full text-sm border border-stone-300 p-3 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-purple-200 h-32 resize-none"
                                            placeholder="請輸入修改指令... 
例如：'將 created_at 欄位加上預設值' 或 '將 API 路徑改為 /v1/users'"
                                            value={refineInstruction}
                                            onChange={(e) => setRefineInstruction(e.target.value)}
                                            autoFocus
                                        />
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => setIsRefining(false)} className="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700 font-medium">取消</button>
                                            <button
                                                onClick={handleRefine}
                                                disabled={refiningLoading || !refineInstruction.trim()}
                                                className={`px-4 py-1.5 text-sm text-white rounded-lg font-bold shadow-sm ${refiningLoading ? 'bg-purple-300' : 'bg-purple-600 hover:bg-purple-700'}`}
                                            >
                                                {refiningLoading ? '處理中...' : '執行修正'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="h-6 w-px bg-stone-200 mx-2"></div>
                            <button onClick={handleEditToggle} className={`p-2 rounded-xl transition-all ${isEditing ? 'text-blue-600 bg-blue-50 border border-blue-200' : 'text-stone-500 hover:bg-stone-100'}`} title="手動編輯">
                                <Edit size={20} />
                            </button>
                            <button onClick={() => handleDownload('md')} className="p-2 text-stone-500 rounded-xl hover:bg-stone-100 transition-all" title="匯出 Markdown">
                                <Download size={20} />
                            </button>
                            <button onClick={handleDeleteSpec} className="p-2 text-red-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all" title="刪除此版本">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative bg-stone-50">
                    {renderTabContent()}
                </div>

                {/* History / Version selector */}
                {specs.length > 0 && (
                    <div className="p-3 border-t border-stone-200 bg-white flex justify-between items-center shrink-0">
                        <span className="text-sm font-medium text-stone-500 ml-2">版本歷史 ({specs.length})</span>
                        <select
                            className="border border-stone-300 rounded-lg p-1.5 text-sm text-stone-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
                            onChange={(e) => setCurrentSpec(specs.find(s => s.id === parseInt(e.target.value)))}
                            value={currentSpec?.id || ''}
                        >
                            {specs.map((s, idx) => (
                                <option key={s.id} value={s.id}>v{idx + 1} - {new Date(s.createdAt).toLocaleString()}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpecGenerator;
