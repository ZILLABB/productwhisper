import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBookOpen, FiX, FiPlus, FiEdit2, FiTrash2, FiSave, FiCheck } from 'react-icons/fi';

// Define CSS classes for consistent styling
const STYLE = {
  primaryBg: 'bg-blue-600',
  primaryHoverBg: 'hover:bg-blue-700',
  primaryLightBg: 'bg-blue-100',
  primaryLightText: 'text-blue-800',
  primaryText: 'text-blue-600',
  primaryDarkText: 'text-blue-800',
  primaryRing: 'focus:ring-blue-500',
  primaryLightestBg: 'bg-blue-50',
};

export interface Memory {
  id: string;
  content: string;
  category?: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface MemoryBankProps {
  initialMemories?: Memory[];
  onSave?: (memories: Memory[]) => void;
  onLoad?: () => Memory[];
  categories?: string[];
}

const MemoryBank: React.FC<MemoryBankProps> = ({
  initialMemories = [],
  onSave,
  onLoad,
  categories = ['Product', 'Feature', 'Design', 'Backend', 'Frontend', 'Other']
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [memories, setMemories] = useState<Memory[]>(initialMemories);
  const [newMemory, setNewMemory] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [filter, setFilter] = useState<string | null>(null);

  // Load memories from localStorage on component mount
  useEffect(() => {
    const loadMemories = () => {
      if (onLoad) {
        return onLoad();
      }

      const storedMemories = localStorage.getItem('productWhisperMemories');
      if (storedMemories) {
        try {
          const parsed = JSON.parse(storedMemories);
          // Convert string dates back to Date objects
          const memories = parsed.map((memory: any) => ({
            ...memory,
            createdAt: new Date(memory.createdAt),
            updatedAt: memory.updatedAt ? new Date(memory.updatedAt) : undefined
          }));
          return memories;
        } catch (error) {
          console.error('Failed to parse stored memories:', error);
        }
      }
      return initialMemories;
    };

    setMemories(loadMemories());
  }, [initialMemories, onLoad]);

  // Save memories to localStorage when they change
  useEffect(() => {
    if (onSave) {
      onSave(memories);
    } else {
      localStorage.setItem('productWhisperMemories', JSON.stringify(memories));
    }
  }, [memories, onSave]);

  const addMemory = () => {
    if (!newMemory.trim()) return;

    const memory: Memory = {
      id: Date.now().toString(),
      content: newMemory.trim(),
      category: newCategory,
      createdAt: new Date()
    };

    setMemories([...memories, memory]);
    setNewMemory('');
  };

  const updateMemory = (id: string) => {
    if (!editContent.trim()) return;

    setMemories(memories.map(memory =>
      memory.id === id
        ? {
            ...memory,
            content: editContent.trim(),
            category: editCategory,
            updatedAt: new Date()
          }
        : memory
    ));

    setEditingId(null);
  };

  const deleteMemory = (id: string) => {
    setMemories(memories.filter(memory => memory.id !== id));
  };

  const startEditing = (memory: Memory) => {
    setEditingId(memory.id);
    setEditContent(memory.content);
    setEditCategory(memory.category || categories[0]);
  };

  const filteredMemories = filter
    ? memories.filter(memory => memory.category === filter)
    : memories;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 ${STYLE.primaryBg} text-white p-3 rounded-full shadow-lg ${STYLE.primaryHoverBg} transition-colors z-50`}
        aria-label="Toggle Memory Bank"
      >
        <FiBookOpen size={24} />
      </button>

      {/* Memory Bank Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 flex flex-col"
          >
            <div className={`p-4 border-b flex justify-between items-center ${STYLE.primaryBg} text-white`}>
              <h2 className="text-xl font-semibold flex items-center">
                <FiBookOpen className="mr-2" /> Memory Bank
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
                aria-label="Close Memory Bank"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Category Filter */}
            <div className="p-4 border-b">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter(null)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    filter === null
                      ? `${STYLE.primaryLightBg} ${STYLE.primaryLightText} font-medium`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setFilter(category)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filter === category
                        ? `${STYLE.primaryLightBg} ${STYLE.primaryLightText} font-medium`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Memories List */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredMemories.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {filter ? `No memories in the "${filter}" category` : 'No memories saved yet'}
                </p>
              ) : (
                <ul className="space-y-3">
                  {filteredMemories.map(memory => (
                    <li
                      key={memory.id}
                      className="bg-white border rounded-lg p-3 shadow-sm"
                    >
                      {editingId === memory.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className={`w-full p-2 border rounded-md focus:ring-2 ${STYLE.primaryRing} focus:border-transparent`}
                            rows={3}
                          />
                          <div className="flex justify-between items-center">
                            <select
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value)}
                              className="p-2 border rounded-md text-sm"
                            >
                              {categories.map(category => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1 text-gray-500 hover:text-gray-700"
                                aria-label="Cancel"
                              >
                                <FiX />
                              </button>
                              <button
                                onClick={() => updateMemory(memory.id)}
                                className="p-1 text-green-600 hover:text-green-800"
                                aria-label="Save"
                              >
                                <FiSave />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className={`text-xs font-medium px-2 py-1 ${STYLE.primaryLightestBg} ${STYLE.primaryText} rounded-full`}>
                              {memory.category}
                            </span>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => startEditing(memory)}
                                className="p-1 text-gray-500 hover:text-gray-700"
                                aria-label="Edit"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button
                                onClick={() => deleteMemory(memory.id)}
                                className="p-1 text-red-500 hover:text-red-700"
                                aria-label="Delete"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <p className="mt-2 text-gray-700">{memory.content}</p>
                          <div className="mt-2 text-xs text-gray-500">
                            {memory.updatedAt ? (
                              <span>Updated: {memory.updatedAt.toLocaleDateString()}</span>
                            ) : (
                              <span>Created: {memory.createdAt.toLocaleDateString()}</span>
                            )}
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Add New Memory */}
            <div className="p-4 border-t">
              <div className="flex space-x-2 mb-2">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="p-2 border rounded-md text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={newMemory}
                  onChange={(e) => setNewMemory(e.target.value)}
                  placeholder="Add a new memory..."
                  className={`flex-1 p-2 border rounded-l-md focus:ring-2 ${STYLE.primaryRing} focus:border-transparent`}
                  onKeyDown={(e) => e.key === 'Enter' && addMemory()}
                />
                <button
                  onClick={addMemory}
                  className={`${STYLE.primaryBg} text-white p-2 rounded-r-md ${STYLE.primaryHoverBg}`}
                  aria-label="Add Memory"
                >
                  <FiPlus />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MemoryBank;
