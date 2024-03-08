import * as inquirer from 'inquirer';
import { promises as fs } from 'fs';


interface Todo {
    task: string;
    completed: boolean;
}

const todoFilePath = 'todos.json';

async function loadTodos(): Promise<Todo[]> {
    try {
        const data = await fs.readFile(todoFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function saveTodos(todos: Todo[]): Promise<void> {
    await fs.writeFile(todoFilePath, JSON.stringify(todos, null, 2), 'utf-8');
}

async function listTodos(): Promise<void> {
    const todos = await loadTodos();
    if (todos.length === 0) {
        console.log('No todos found.');
    } else {
        todos.forEach((todo, index) => {
            console.log(`${index + 1}. [${todo.completed ? 'x' : ' '}] ${todo.task}`);
        });
    }
}

async function addTodo(): Promise<void> {
    const { task } = await inquirer.prompt<{ task: string }>([
        {
            type: 'input',
            name: 'task',
            message: 'Enter a new task:'
        }
    ]);

    const todos = await loadTodos();
    todos.push({ task, completed: false });
    await saveTodos(todos);
    console.log('Todo added successfully.');
}

async function toggleTodo(): Promise<void> {
    const todos = await loadTodos();
    const choices = todos.map((todo, index) => ({
        name: todo.task,
        value: index
    }));
    const { todoIndex } = await inquirer.prompt<{ todoIndex: number }>([
        {
            type: 'list',
            name: 'todoIndex',
            message: 'Select a todo to toggle:',
            choices
        }
    ]);
    todos[todoIndex].completed = !todos[todoIndex].completed;
    await saveTodos(todos);
    console.log('Todo toggled successfully.');
}

async function main(): Promise<void> {
    while (true) {
        const { action } = await inquirer.prompt<{ action: 'List Todos' | 'Add Todo' | 'Toggle Todo' | 'Quit' }>([
            {
                type: 'list',
                name: 'action',
                message: 'Select an action:',
                choices: ['List Todos', 'Add Todo', 'Toggle Todo', 'Quit']
            }
        ]);

        switch (action) {
            case 'List Todos':
                await listTodos();
                break;
            case 'Add Todo':
                await addTodo();
                break;
            case 'Toggle Todo':
                await toggleTodo();
                break;
            case 'Quit':
                return;
        }
    }
}

main().catch(error => console.error(error));
