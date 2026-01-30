
import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, Check } from 'lucide-react';

interface Todo {
    id: string;
    text: string;
    completed: boolean;
}

const TodoWidget: React.FC = () => {
    const [todos, setTodos] = useState<Todo[]>(() => {
        const saved = localStorage.getItem('personal_board_todos');
        return saved ? JSON.parse(saved) : [];
    });
    const [input, setInput] = useState('');

    useEffect(() => {
        localStorage.setItem('personal_board_todos', JSON.stringify(todos));
    }, [todos]);

    const addTodo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        setTodos([...todos, { id: Date.now().toString(), text: input, completed: false }]);
        setInput('');
    };

    const toggleTodo = (id: string) => {
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTodo = (id: string) => {
        setTodos(todos.filter(t => t.id !== id));
    };

    const remaining = todos.filter(t => !t.completed).length;

    return (
        <div className="bg-white/90 dark:bg-[#252525]/90 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-[#333] h-full flex flex-col group hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
                        <CheckSquare className="w-5 h-5 text-green-500 dark:text-green-400" />
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-white">To-Do</h3>
                </div>
                <span className="text-xs font-bold bg-gray-100 dark:bg-[#333] text-gray-500 rounded-full px-3 py-1">
                    {remaining} left
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 mb-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 pr-2">
                {todos.length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-4 italic">
                        No tasks yet. Take a breath.
                    </div>
                )}
                {todos.map(todo => (
                    <div key={todo.id} className="flex items-center gap-2 group/item">
                        <button
                            onClick={() => toggleTodo(todo.id)}
                            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${todo.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-500'
                                }`}
                        >
                            {todo.completed && <Check className="w-3 h-3" />}
                        </button>
                        <span className={`flex-1 text-sm ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                            {todo.text}
                        </span>
                        <button onClick={() => deleteTodo(todo.id)} className="opacity-0 group-hover/item:opacity-100 text-red-400 hover:text-red-500 transition-opacity">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <form onSubmit={addTodo} className="relative mt-auto">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Add a new task..."
                    className="w-full bg-gray-50 dark:bg-[#333] border-none rounded-2xl py-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-green-500/20 text-gray-800 dark:text-white placeholder:text-gray-400"
                />
                <button type="submit" className="absolute right-2 top-2 p-1.5 bg-white dark:bg-[#444] rounded-xl shadow-sm hover:scale-105 transition-transform">
                    <Plus className="w-4 h-4 text-green-500" />
                </button>
            </form>
        </div>
    );
};

export default TodoWidget;
