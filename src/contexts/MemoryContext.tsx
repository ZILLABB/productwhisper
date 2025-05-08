import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Memory } from '../components/common/MemoryBank';
import { initialMemories, initializeMemories } from '../utils/initialMemories';

interface MemoryContextType {
  memories: Memory[];
  addMemory: (content: string, category?: string) => void;
  updateMemory: (id: string, content: string, category?: string) => void;
  deleteMemory: (id: string) => void;
  clearMemories: () => void;
  getMemoriesByCategory: (category: string) => Memory[];
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

interface MemoryProviderProps {
  children: ReactNode;
  initialMemories?: Memory[];
}

export const MemoryProvider: React.FC<MemoryProviderProps> = ({
  children,
  initialMemories = []
}) => {
  const [memories, setMemories] = useState<Memory[]>(initialMemories);

  // Load memories from localStorage on component mount
  useEffect(() => {
    // Initialize memories if they don't exist
    initializeMemories();

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
        setMemories(memories);
      } catch (error) {
        console.error('Failed to parse stored memories:', error);
        // If parsing fails, use initial memories
        setMemories(initialMemories);
      }
    } else {
      // If no memories in localStorage, use initial memories
      setMemories(initialMemories);
    }
  }, []);

  // Save memories to localStorage when they change
  useEffect(() => {
    localStorage.setItem('productWhisperMemories', JSON.stringify(memories));
  }, [memories]);

  const addMemory = (content: string, category: string = 'Other') => {
    if (!content.trim()) return;

    const memory: Memory = {
      id: Date.now().toString(),
      content: content.trim(),
      category,
      createdAt: new Date()
    };

    setMemories(prevMemories => [...prevMemories, memory]);
  };

  const updateMemory = (id: string, content: string, category?: string) => {
    if (!content.trim()) return;

    setMemories(prevMemories =>
      prevMemories.map(memory =>
        memory.id === id
          ? {
              ...memory,
              content: content.trim(),
              category: category || memory.category,
              updatedAt: new Date()
            }
          : memory
      )
    );
  };

  const deleteMemory = (id: string) => {
    setMemories(prevMemories => prevMemories.filter(memory => memory.id !== id));
  };

  const clearMemories = () => {
    setMemories([]);
  };

  const getMemoriesByCategory = (category: string) => {
    return memories.filter(memory => memory.category === category);
  };

  return (
    <MemoryContext.Provider
      value={{
        memories,
        addMemory,
        updateMemory,
        deleteMemory,
        clearMemories,
        getMemoriesByCategory
      }}
    >
      {children}
    </MemoryContext.Provider>
  );
};

export const useMemory = (): MemoryContextType => {
  const context = useContext(MemoryContext);
  if (context === undefined) {
    throw new Error('useMemory must be used within a MemoryProvider');
  }
  return context;
};

export default MemoryContext;
