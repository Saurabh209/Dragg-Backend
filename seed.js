import dotenv from 'dotenv';
import { connectDB, createBoard, updateBoard } from './db.js';
import mongoose from 'mongoose';

// Load environmental variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dragg';

const seedData = {
  name: 'JavaScript Core Concepts',
  pan: { x: 300, y: 150 },
  zoom: 0.85,
  drawings: [],
  cards: [
    {
      id: 'js-lexical-scope',
      x: -400,
      y: 100,
      width: 320,
      height: 250,
      title: '1. Lexical Scope',
      content: `Lexical scope defines how variable names are resolved in nested functions.\n\nInner functions contain the scope of parent functions even if the parent function has finished executing. JavaScript uses a scope chain lookup to find variables in parent scopes.`,
      code: `const globalVar = 'global';\n\nfunction parent() {\n  const parentVar = 'parent';\n  function child() {\n    console.log(globalVar, parentVar);\n  }\n  child();\n}\nparent();`,
      tags: ['scope', 'chain', 'context'],
      color: 'slate',
      type: 'note',
      cardMode: 'notes'
    },
    {
      id: 'js-closures',
      x: 50,
      y: 100,
      width: 320,
      height: 250,
      title: '2. Closures',
      content: `A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment).\n\nIn other words, a closure gives an inner function access to the outer function's scope even after the outer function has returned. Perfect for data encapsulation and private variables.`,
      code: `function outer() {\n  let count = 0;\n  return function inner() {\n    count++;\n    console.log(count);\n  };\n}\n\nconst counter = outer();\ncounter(); // 1\ncounter(); // 2`,
      tags: ['scope', 'lexical', 'closures'],
      color: 'indigo',
      type: 'note',
      cardMode: 'notes'
    },
    {
      id: 'js-prototypes',
      x: 50,
      y: 480,
      width: 320,
      height: 250,
      title: '3. Prototypes & Inheritance',
      content: `JavaScript is a prototype-based language. Each object has a private property holding a link to another object called its prototype.\n\nThat prototype object has a prototype of its own, and so on until null is reached. Methods defined on prototypes are inherited and shared across instances without copy overhead.`,
      code: `const animal = { eats: true };\nconst rabbit = Object.create(animal);\n\nconsole.log(rabbit.eats); // true\nconsole.log(rabbit.__proto__ === animal); // true`,
      tags: ['prototype', 'oop', 'inheritance'],
      color: 'amber',
      type: 'note',
      cardMode: 'notes'
    },
    {
      id: 'js-promises',
      x: 500,
      y: 100,
      width: 320,
      height: 250,
      title: '4. Promises & Async',
      content: `A Promise is a placeholder for a value that is asynchronously computed. It associates handlers with an async action's eventual success value or failure reason.\n\nStates: Pending, Fulfilled, Rejected. It resolves callstack blocking issues and eliminates callback hell.`,
      code: `const fetchData = () => {\n  return new Promise((resolve) => {\n    setTimeout(() => resolve('Data loaded!'), 1000);\n  });\n};\n\nfetchData().then(console.log);`,
      tags: ['async', 'promises', 'callbacks'],
      color: 'cyan',
      type: 'note',
      cardMode: 'notes'
    },
    {
      id: 'js-async-await',
      x: 950,
      y: 100,
      width: 320,
      height: 250,
      title: '5. Async / Await',
      content: `Async/Await is syntactic sugar built on top of Promises. Async functions always return a promise automatically.\n\nThe await keyword pauses the execution of the async function until the promise settles. It allows writing clean, synchronous-looking asynchronous code.`,
      code: `async function main() {\n  try {\n    const data = await fetchData();\n    console.log(data);\n  } catch (err) {\n    console.error(err);\n  }\n}\nmain();`,
      tags: ['async', 'await', 'es6'],
      color: 'emerald',
      type: 'note',
      cardMode: 'notes'
    }
  ],
  connections: [
    {
      id: 'conn-scope-to-closures',
      fromCardId: 'js-lexical-scope',
      fromSide: 'right',
      toCardId: 'js-closures',
      toSide: 'left',
      label: 'Encloses Lexical'
    },
    {
      id: 'conn-closures-to-prototypes',
      fromCardId: 'js-closures',
      fromSide: 'bottom',
      toCardId: 'js-prototypes',
      toSide: 'top',
      label: 'Inherits Scope'
    },
    {
      id: 'conn-closures-to-promises',
      fromCardId: 'js-closures',
      fromSide: 'right',
      toCardId: 'js-promises',
      toSide: 'left',
      label: 'Handles Deferred'
    },
    {
      id: 'conn-promises-to-async',
      fromCardId: 'js-promises',
      fromSide: 'right',
      toCardId: 'js-async-await',
      toSide: 'left',
      label: 'Syntactic Sugar'
    }
  ]
};

const runSeeder = async () => {
  console.log('Connecting to database...');
  await connectDB(MONGO_URI);

  try {
    console.log('Creating seeded board...');
    const board = await createBoard(seedData.name);
    
    console.log('Populating board nodes & lines...');
    await updateBoard(board._id, seedData);

    console.log('Successfully seeded "JavaScript Core Concepts" board!');
  } catch (err) {
    console.error('Failed to seed database:', err);
  } finally {
    // Terminate DB connections
    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

runSeeder();
