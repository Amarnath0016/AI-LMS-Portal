export const quizzesByLeague = {
  101: {
    title: "Python Sprint League",
    parts: [
      {
        partId: 1,
        title: "Part 1: Basic Syntax & Variables",
        xpAward: 400,
        questions: [
          {
            question: "Which of the following is an invalid variable name in Python?",
            options: ["my_var", "_myvar", "2myvar", "myVar"],
            correctIndex: 2,
            explanation: "Variable names in Python cannot start with a digit."
          },
          {
            question: "What is the output of print(2 ** 3) in Python?",
            options: ["6", "8", "9", "5"],
            correctIndex: 1,
            explanation: "The double asterisk ** operator is used for exponentiation. 2 to the power of 3 is 8."
          },
          {
            question: "What function is used to get the length of a list in Python?",
            options: ["len()", "length()", "size()", "count()"],
            correctIndex: 0,
            explanation: "The len() function returns the number of items in an object."
          },
          {
            question: "How do you insert comments in Python code?",
            options: ["// comment", "/* comment */", "# comment", "<!-- comment -->"],
            correctIndex: 2,
            explanation: "Python uses the hash character # to start a line comment."
          },
          {
            question: "What is the output of print(type([]))?",
            options: ["<class 'list'>", "<class 'tuple'>", "<class 'dict'>", "<class 'set'>"],
            correctIndex: 0,
            explanation: "An empty brackets pair [] denotes a list type in Python."
          }
        ]
      },
      {
        partId: 2,
        title: "Part 2: Loops & Lists",
        xpAward: 400,
        questions: [
          {
            question: "Which method is used to add an item to the end of a list?",
            options: ["add()", "insert()", "append()", "push()"],
            correctIndex: 2,
            explanation: "The append() method adds a single item to the end of a list."
          },
          {
            question: "What is the output of [x for x in range(3)]?",
            options: ["[1, 2, 3]", "[0, 1, 2]", "[0, 1, 2, 3]", "Error"],
            correctIndex: 1,
            explanation: "range(3) yields numbers starting from 0 up to (but not including) 3."
          },
          {
            question: "Which keyword is used to exit a loop early?",
            options: ["exit", "stop", "break", "continue"],
            correctIndex: 2,
            explanation: "The break statement terminates the current loop immediately."
          },
          {
            question: "What is the output of 'hello'[1:3] in Python?",
            options: ["hel", "el", "ell", "he"],
            correctIndex: 1,
            explanation: "Slicing indices start at 1 ('e') and stop before 3 ('l'), returning 'el'."
          },
          {
            question: "Which loop is used when you want to execute a block of code while a condition is True?",
            options: ["for", "while", "do-while", "foreach"],
            correctIndex: 1,
            explanation: "Python supports 'while' loops to run code repeatedly as long as a condition is satisfied."
          }
        ]
      },
      {
        partId: 3,
        title: "Part 3: Dictionaries & Functions",
        xpAward: 400,
        questions: [
          {
            question: "Which data structure stores key-value pairs in Python?",
            options: ["List", "Tuple", "Dictionary", "Set"],
            correctIndex: 2,
            explanation: "Dictionaries store data in key:value pairs enclosed in curly braces {}."
          },
          {
            question: "How do you define a function in Python?",
            options: ["func myFunc():", "def myFunc():", "function myFunc():", "define myFunc():"],
            correctIndex: 1,
            explanation: "The 'def' keyword is used to define functions in Python."
          },
          {
            question: "What is the output of def f(a, b=2): return a*b; print(f(3))?",
            options: ["6", "3", "5", "Error"],
            correctIndex: 0,
            explanation: "Since parameter b has a default value of 2, calling f(3) computes 3 * 2 = 6."
          },
          {
            question: "Which keyword is used to return a value from a function?",
            options: ["give", "send", "return", "output"],
            correctIndex: 2,
            explanation: "The 'return' statement exits a function and optionally returns a value."
          },
          {
            question: "What exception is raised when you try to access a non-existent dictionary key directly?",
            options: ["IndexError", "ValueError", "KeyError", "TypeError"],
            correctIndex: 2,
            explanation: "Python raises a KeyError when a dictionary key is not found."
          }
        ]
      }
    ]
  },
  102: {
    title: "JavaScript DOM League",
    parts: [
      {
        partId: 1,
        title: "Part 1: Document Query & Manipulation",
        xpAward: 350,
        questions: [
          {
            question: "Which method is used to select an element by its ID?",
            options: ["querySelector()", "getElementById()", "getElementsByClassName()", "Both A and B"],
            correctIndex: 3,
            explanation: "Both querySelector('#id') and getElementById('id') can select an element by ID."
          },
          {
            question: "How do you change the text content of an HTML element?",
            options: ["element.text = 'hello'", "element.innerHTML = 'hello'", "element.textContent = 'hello'", "Both B and C"],
            correctIndex: 3,
            explanation: "Both innerHTML and textContent are valid ways to change text, although innerHTML parses HTML tags."
          },
          {
            question: "Which method creates a new HTML element programmatically?",
            options: ["newElement()", "createElement()", "makeElement()", "appendElement()"],
            correctIndex: 1,
            explanation: "document.createElement(tagName) creates a new HTML element."
          },
          {
            question: "How do you add a CSS class to an element's class list?",
            options: ["element.classes.add()", "element.classList.add()", "element.addClass()", "element.style.add()"],
            correctIndex: 1,
            explanation: "element.classList.add('className') is the correct DOM API."
          },
          {
            question: "What DOM property returns the parent element of a node?",
            options: ["parentNode", "parentElement", "superNode", "Both A and B"],
            correctIndex: 3,
            explanation: "Both parentNode and parentElement return the parent node, with parentElement returning null if it is not an Element."
          }
        ]
      },
      {
        partId: 2,
        title: "Part 2: Events & Bubbling",
        xpAward: 350,
        questions: [
          {
            question: "Which method attaches an event handler to an element?",
            options: ["attachEvent()", "addEventListener()", "bindEvent()", "listen()"],
            correctIndex: 1,
            explanation: "addEventListener() registers the specified listener on the element."
          },
          {
            question: "What method prevents the default browser action of an event (like a form submit)?",
            options: ["event.stopPropagation()", "event.preventDefault()", "event.stopDefault()", "return false"],
            correctIndex: 1,
            explanation: "event.preventDefault() cancels the event if it is cancelable, without stopping further propagation."
          },
          {
            question: "What is event bubbling?",
            options: ["Events propagating from parent to child", "Events propagating from child to parent up the DOM tree", "Events running in parallel", "Events creating bubble animations"],
            correctIndex: 1,
            explanation: "Event bubbling means the event starts at the target element and triggers handlers on its ancestors."
          },
          {
            question: "How do you stop an event from bubbling up to parent elements?",
            options: ["event.preventDefault()", "event.stopPropagation()", "event.cancel()", "event.freeze()"],
            correctIndex: 1,
            explanation: "event.stopPropagation() stops the event from propagating further up the DOM tree."
          },
          {
            question: "Which property tells you which element triggered the event?",
            options: ["event.currentTarget", "event.target", "event.source", "event.element"],
            correctIndex: 1,
            explanation: "event.target refers to the exact element that dispatched the event, whereas currentTarget refers to the element handling it."
          }
        ]
      },
      {
        partId: 3,
        title: "Part 3: Advanced DOM & Async",
        xpAward: 400,
        questions: [
          {
            question: "Which API is used to perform asynchronous network requests in modern JS?",
            options: ["XMLHttpRequest", "Fetch API", "DOMRequest", "JSONRequest"],
            correctIndex: 1,
            explanation: "The Fetch API provides a modern, Promise-based interface for fetching resources."
          },
          {
            question: "What does DOMContentLoaded event guarantee?",
            options: ["Images are loaded", "CSS and assets are fully loaded", "The basic HTML document has been parsed", "Nothing"],
            correctIndex: 2,
            explanation: "DOMContentLoaded fires when the HTML document has been parsed, without waiting for stylesheets and images."
          },
          {
            question: "What is the return type of document.querySelectorAll()?",
            options: ["Array", "HTMLCollection", "NodeList", "Collection"],
            correctIndex: 2,
            explanation: "querySelectorAll returns a static NodeList, which can be iterated with forEach."
          },
          {
            question: "Which of the following is true about HTMLCollection vs NodeList?",
            options: ["HTMLCollection is always live", "NodeList can contain text nodes", "Both are array-like objects", "All of the above"],
            correctIndex: 3,
            explanation: "All are true. HTMLCollection is live, NodeList contains nodes (text, attributes), and both are array-like."
          },
          {
            question: "Which method removes an element from the DOM?",
            options: ["element.delete()", "element.remove()", "element.destroy()", "element.hide()"],
            correctIndex: 1,
            explanation: "element.remove() removes the element from the document tree."
          }
        ]
      }
    ]
  },
  103: {
    title: "React Battle League",
    parts: [
      {
        partId: 1,
        title: "Part 1: JSX & Component State",
        xpAward: 600,
        questions: [
          {
            question: "What is JSX?",
            options: ["A JS-like database format", "JavaScript XML, a syntax extension for React", "A styling compiler", "A state manager"],
            correctIndex: 1,
            explanation: "JSX is a syntax extension to JavaScript that describes what the UI should look like."
          },
          {
            question: "Which hook is used to maintain local state in a function component?",
            options: ["useLocal", "useState", "useRef", "useReducer"],
            correctIndex: 1,
            explanation: "useState declares a state variable that persists between renders."
          },
          {
            question: "What does useState return?",
            options: ["The current state value", "A function to update state", "An array with [currentState, setterFunction]", "An object with {state, set}"],
            correctIndex: 2,
            explanation: "useState returns a stateful value and a function to update it, bundled as a pair."
          },
          {
            question: "How do you pass data from a parent component to a child component?",
            options: ["Using Context", "Using Props", "Using State", "Using Refs"],
            correctIndex: 1,
            explanation: "Props (properties) are passed down from parent to child components in React."
          },
          {
            question: "React component names must start with...",
            options: ["An uppercase letter", "A lowercase letter", "A dollar sign ($)", "Any character"],
            correctIndex: 0,
            explanation: "React capitalizes custom component names to distinguish them from standard HTML tags."
          }
        ]
      },
      {
        partId: 2,
        title: "Part 2: Effects & Lifecycle",
        xpAward: 600,
        questions: [
          {
            question: "Which hook performs side effects in function components?",
            options: ["useSideEffect", "useEffect", "useMemo", "useLayoutEffect"],
            correctIndex: 1,
            explanation: "useEffect lets you synchronize a component with an external system (data fetching, subscriptions, DOM manipulation)."
          },
          {
            question: "If useEffect has an empty dependency array [], when does it run?",
            options: ["On every render", "Only once after the initial render (mount)", "Never", "Only on component unmount"],
            correctIndex: 1,
            explanation: "An empty array tells React that the effect doesn't depend on any props or state, so it runs only once at mount."
          },
          {
            question: "How do you perform cleanup in a useEffect hook?",
            options: ["Call element.cleanup()", "Return a cleanup function from the effect", "Pass clean: true in options", "Use the useCleanup hook"],
            correctIndex: 1,
            explanation: "Returning a function from your effect acts as the cleanup phase, executed before the component unmounts or re-runs the effect."
          },
          {
            question: "What is the difference between useMemo and useCallback?",
            options: ["useMemo caches a value, useCallback caches a function", "useMemo caches a function, useCallback caches a value", "There is no difference", "useMemo is for state, useCallback is for effects"],
            correctIndex: 0,
            explanation: "useMemo returns a memoized value; useCallback returns a memoized callback function."
          },
          {
            question: "Which hook returns a mutable ref object whose .current property persists?",
            options: ["useCurrent", "useRef", "useState", "useMemo"],
            correctIndex: 1,
            explanation: "useRef returns a mutable ref object that can store values or point to DOM elements without triggering re-renders."
          }
        ]
      },
      {
        partId: 3,
        title: "Part 3: Rules of Hooks & Context",
        xpAward: 600,
        questions: [
          {
            question: "Which of the following is a rule of React Hooks?",
            options: ["Only call hooks from React function components or custom hooks", "Only call hooks at the top level", "Do not call hooks inside loops, conditions, or nested functions", "All of the above"],
            correctIndex: 3,
            explanation: "All are strict rules of hooks. Call them at the top level, and only from React functions or custom hooks."
          },
          {
            question: "Which React API solves the prop-drilling problem by sharing data globally?",
            options: ["Redux", "Context API", "useState", "Refs"],
            correctIndex: 1,
            explanation: "The Context API lets you pass data deeply through the component tree without manually passing props."
          },
          {
            question: "How do you consume a Context in a function component?",
            options: ["useContext()", "Context.Consumer", "contextValue()", "Both A and B"],
            correctIndex: 3,
            explanation: "In functional components, you can use the useContext hook, or the <Context.Consumer> component wrapper."
          },
          {
            question: "What is the custom hook naming convention in React?",
            options: ["Starts with 'get'", "Starts with 'use'", "Starts with 'react'", "Ends with 'Hook'"],
            correctIndex: 1,
            explanation: "React expects custom hooks to start with the word 'use' (e.g. useAuth, useFetch) to enforce rules of hooks."
          },
          {
            question: "What happens when a component's key prop changes?",
            options: ["The component is updated", "The component is unmounted and remounted with fresh state", "Nothing", "The key is ignored"],
            correctIndex: 1,
            explanation: "A new key tells React to destroy the old component instances and mount a brand new component instance with fresh state."
          }
        ]
      }
    ]
  },
  104: {
    title: "Node API League",
    parts: [
      {
        partId: 1,
        title: "Part 1: HTTP & Routing",
        xpAward: 550,
        questions: [
          {
            question: "Which core Node.js module is used to spin up a web server?",
            options: ["fs", "path", "http", "url"],
            correctIndex: 2,
            explanation: "The http module allows Node.js to transfer data over HTTP."
          },
          {
            question: "In Express.js, how do you define a route parameter for 'id'?",
            options: ["/users/{id}", "/users/:id", "/users/id", "/users?id"],
            correctIndex: 1,
            explanation: "Express route parameters are prefixed with a colon (e.g., :id) and accessed via req.params."
          },
          {
            question: "Which HTTP method is most appropriate for updating an existing resource fully?",
            options: ["GET", "POST", "PUT", "DELETE"],
            correctIndex: 2,
            explanation: "PUT is designed for full replacement, while PATCH is used for partial modifications."
          },
          {
            question: "What does the code res.json({ status: 'ok' }) do in Express?",
            options: ["Converts a JSON file to a Javascript object", "Sends a JSON response with correct content-type header", "Loads a JSON template", "Crashes the server"],
            correctIndex: 1,
            explanation: "res.json() sends a JSON response with application/json headers, serializing the passed object."
          },
          {
            question: "How do you access JSON request body data in an Express route handler?",
            options: ["req.body", "req.json", "req.data", "req.query"],
            correctIndex: 0,
            explanation: "Express body-parsing middleware (like express.json()) parses client requests and attaches them to req.body."
          }
        ]
      },
      {
        partId: 2,
        title: "Part 2: Middleware & Authentication",
        xpAward: 550,
        questions: [
          {
            question: "What is middleware in Express?",
            options: ["Software that connects databases", "Functions that run in the middle of request-response cycles", "Styling sheets", "Admin panels"],
            correctIndex: 1,
            explanation: "Middleware functions have access to the request, response, and the next middleware function."
          },
          {
            question: "What parameter must you call inside middleware to hand off execution to the next handler?",
            options: ["done()", "next()", "continue()", "res.send()"],
            correctIndex: 1,
            explanation: "Invoking next() transfers control to the next middleware/route handler in the stack."
          },
          {
            question: "What does JWT stand for in token-based authentication?",
            options: ["Java Web Token", "JSON Web Token", "Joint Web Team", "Just Write Text"],
            correctIndex: 1,
            explanation: "JWT is JSON Web Token, a compact, URL-safe means of representing claims between two parties."
          },
          {
            question: "Where are JWTs usually placed in authorization headers?",
            options: ["Body: JWT <token>", "Authorization: Bearer <token>", "Cookie: token=<token>", "Query: ?token=<token>"],
            correctIndex: 1,
            explanation: "The standard header format is 'Authorization: Bearer <token>'."
          },
          {
            question: "Which status code represents unauthorized access?",
            options: ["400", "401", "403", "404"],
            correctIndex: 1,
            explanation: "401 Unauthorized means the request lacks valid authentication credentials."
          }
        ]
      },
      {
        partId: 3,
        title: "Part 3: Databases & Optimization",
        xpAward: 600,
        questions: [
          {
            question: "What package is popular for managing schemas in MongoDB using Node?",
            options: ["mysql", "mongoose", "pg", "sqlite"],
            correctIndex: 1,
            explanation: "Mongoose is an elegant MongoDB object modeling tool for Node.js."
          },
          {
            question: "Which of the following is true about Node's event loop?",
            options: ["It runs on multiple threads", "It is single-threaded and handles async I/O tasks", "It is written in Python", "It blocks all disk reads"],
            correctIndex: 1,
            explanation: "Node.js runs on a single-threaded event loop, delegating slow block operations to system threads."
          },
          {
            question: "What does CORS stand for in API development?",
            options: ["Common Object Resource Share", "Cross-Origin Resource Sharing", "Centralized Open Request Service", "None of the above"],
            correctIndex: 1,
            explanation: "CORS (Cross-Origin Resource Sharing) is a mechanism that permits resource requests from foreign domains."
          },
          {
            question: "How do you handle unhandled promise rejections in Node?",
            options: ["process.on('unhandledRejection', ...)", "window.onerror", "try-catch blocks only", "Node handles them automatically without crash"],
            correctIndex: 0,
            explanation: "Listening to the 'unhandledRejection' process event allows catching unhandled Promises globally."
          },
          {
            question: "Which tool is commonly used to auto-restart Node servers during development?",
            options: ["npm", "nodemon", "pm2", "vite"],
            correctIndex: 1,
            explanation: "Nodemon monitors changes in your code directory and automatically restarts your node application."
          }
        ]
      }
    ]
  },
  105: {
    title: "DSA Arena League",
    parts: [
      {
        partId: 1,
        title: "Part 1: Complexity & Arrays",
        xpAward: 800,
        questions: [
          {
            question: "What is the time complexity of searching in a sorted array using Binary Search?",
            options: ["O(N)", "O(log N)", "O(N log N)", "O(1)"],
            correctIndex: 1,
            explanation: "Binary search cuts the search space in half each step, running in logarithmic time, O(log N)."
          },
          {
            question: "What is the space complexity of a standard recursive Fibonacci function?",
            options: ["O(1)", "O(N) due to recursion stack", "O(2^N)", "O(log N)"],
            correctIndex: 1,
            explanation: "The recursion stack grows linearly with input N, requiring O(N) space."
          },
          {
            question: "Which of the following operations on a Hash Table has an average case complexity of O(1)?",
            options: ["Insert", "Delete", "Search", "All of the above"],
            correctIndex: 3,
            explanation: "Average-case operations (insert, delete, lookup) in hash tables are O(1)."
          },
          {
            question: "What is the worst-case time complexity of Quick Sort?",
            options: ["O(N log N)", "O(N^2)", "O(N)", "O(2^N)"],
            correctIndex: 1,
            explanation: "If the pivot consistently splits the array unevenly (e.g. sorted input), Quick Sort degrades to O(N^2)."
          },
          {
            question: "Which data structure follows the LIFO (Last In First Out) principle?",
            options: ["Queue", "Stack", "Linked List", "Heap"],
            correctIndex: 1,
            explanation: "Stacks add and retrieve items from the same end (Last In, First Out)."
          }
        ]
      },
      {
        partId: 2,
        title: "Part 2: Graphs & Trees",
        xpAward: 900,
        questions: [
          {
            question: "Which graph traversal uses a queue to find the shortest path in unweighted graphs?",
            options: ["Depth First Search (DFS)", "Breadth First Search (BFS)", "Dijkstra's Algorithm", "Kruskal's Algorithm"],
            correctIndex: 1,
            explanation: "BFS explores level by level using a Queue, making it ideal for shortest paths on unweighted graphs."
          },
          {
            question: "What is the maximum number of children a node can have in a Binary Tree?",
            options: ["1", "2", "3", "Unlimited"],
            correctIndex: 1,
            explanation: "Binary trees constrain each node to at most two children (left and right)."
          },
          {
            question: "In a Binary Search Tree (BST), values in the left subtree of a node are always...",
            options: ["Greater than the node's value", "Less than the node's value", "Equal to the node's value", "Unordered"],
            correctIndex: 1,
            explanation: "By definition, left descendants must be smaller and right descendants must be larger than parent node."
          },
          {
            question: "Which tree traversal visited nodes in the order Left-Root-Right?",
            options: ["Pre-order", "Post-order", "In-order", "Level-order"],
            correctIndex: 2,
            explanation: "In-order traversal visits left subtree, then the root, then the right subtree."
          },
          {
            question: "What data structure is used to implement a Min-Heap efficiently?",
            options: ["Graph", "Array", "Linked List", "Stack"],
            correctIndex: 1,
            explanation: "Heaps are complete binary trees, which map perfectly into flat arrays where children are at 2i+1 and 2i+2."
          }
        ]
      },
      {
        partId: 3,
        title: "Part 3: Dynamic Programming & Recursion",
        xpAward: 900,
        questions: [
          {
            question: "What is memoization in Dynamic Programming?",
            options: ["Reading memory directly", "Storing results of expensive function calls to avoid redundant checks", "Sorting keys", "Freeing up unused variables"],
            correctIndex: 1,
            explanation: "Memoization caches computed subproblem solutions in top-down DP."
          },
          {
            question: "What defines a base case in a recursive function?",
            options: ["The starting condition", "The terminating condition that stops the recursion", "The average value calculation", "The line that calls the function itself"],
            correctIndex: 1,
            explanation: "Without a base case that returns without recurring, recursion would run infinitely causing stack overflow."
          },
          {
            question: "Which algorithm solves the Single Source Shortest Path problem on graphs with negative weights?",
            options: ["Dijkstra's", "Bellman-Ford", "Floyd-Warshall", "Prim's"],
            correctIndex: 1,
            explanation: "Bellman-Ford can handle negative weight edges, unlike Dijkstra's algorithm."
          },
          {
            question: "What is the time complexity of the Knapsack 0/1 problem solved with Dynamic Programming?",
            options: ["O(N*W)", "O(2^N)", "O(N log N)", "O(N^2)"],
            correctIndex: 0,
            explanation: "DP computes solutions in a table of size N (items) * W (capacity), yielding O(N*W) pseudo-polynomial time."
          },
          {
            question: "Which sorting algorithm is stable and uses divide-and-conquer, requiring O(N) extra space?",
            options: ["Quick Sort", "Merge Sort", "Bubble Sort", "Heap Sort"],
            correctIndex: 1,
            explanation: "Merge sort is stable and requires auxiliary arrays of size O(N) to merge sublists."
          }
        ]
      }
    ]
  },
  106: {
    title: "Machine Learning League",
    parts: [
      {
        partId: 1,
        title: "Part 1: Regression & Classification",
        xpAward: 800,
        questions: [
          {
            question: "What loss function is commonly used for Linear Regression?",
            options: ["Cross-Entropy", "Mean Squared Error (MSE)", "Hinge Loss", "Log Loss"],
            correctIndex: 1,
            explanation: "MSE measures the average of squared errors between predictions and actual targets."
          },
          {
            question: "Which model uses a sigmoid function to map predictions to probability values?",
            options: ["Linear Regression", "Logistic Regression", "K-Means", "Decision Trees"],
            correctIndex: 1,
            explanation: "Logistic regression fits probabilities between 0 and 1 using the Sigmoid activation."
          },
          {
            question: "What metric is most reliable for evaluation when classes are highly imbalanced?",
            options: ["Accuracy", "F1-Score", "R-Squared", "Mean Absolute Error"],
            correctIndex: 1,
            explanation: "F1-Score balances Precision and Recall, making it ideal for skewed datasets."
          },
          {
            question: "What does the 'K' stand for in KNN?",
            options: ["Kilo", "Number of clusters", "Number of nearest neighbors to query", "Kernels"],
            correctIndex: 2,
            explanation: "KNN (K-Nearest Neighbors) classifies points based on the 'k' nearest neighbors."
          },
          {
            question: "What is overfitting?",
            options: ["Model performs well on training data but poorly on test data", "Model performs poorly on both training and test data", "Model training is too fast", "Model is under-parameterized"],
            correctIndex: 0,
            explanation: "Overfitting happens when a model learns noise in the training set and fails to generalize."
          }
        ]
      },
      {
        partId: 2,
        title: "Part 2: Unsupervised Learning & Networks",
        xpAward: 800,
        questions: [
          {
            question: "Which algorithm is a popular centroid-based clustering method?",
            options: ["Linear Regression", "Support Vector Machines", "K-Means", "Random Forest"],
            correctIndex: 2,
            explanation: "K-Means groups data into K distinct clusters by minimizing distance to centroids."
          },
          {
            question: "What technique is used to reduce high-dimensionality while preserving variance?",
            options: ["Principal Component Analysis (PCA)", "Gradient Descent", "Cross Validation", "Lasso Regularization"],
            correctIndex: 0,
            explanation: "PCA projects high-dimensional data onto orthogonal axes that maximize variance."
          },
          {
            question: "What activation function is defined as f(x) = max(0, x)?",
            options: ["Sigmoid", "Tanh", "ReLU", "Softmax"],
            correctIndex: 2,
            explanation: "ReLU (Rectified Linear Unit) output is 0 for negative x, and x for positive values."
          },
          {
            question: "Which layer in a Convolutional Neural Network (CNN) reduces spatial size?",
            options: ["Fully Connected Layer", "Pooling Layer", "Activation Layer", "Convolutional Layer"],
            correctIndex: 1,
            explanation: "Pooling layers (e.g. Max Pooling) downsample features to reduce parameters and combat overfitting."
          },
          {
            question: "What optimizer adjusts weights based on adaptive learning rates (using running averages)?",
            options: ["SGD", "Adam", "Momentum", "RMSprop"],
            correctIndex: 1,
            explanation: "Adam (Adaptive Moment Estimation) combines ideas from RMSprop and momentum optimization."
          }
        ]
      },
      {
        partId: 3,
        title: "Part 3: Advanced ML & Deep Learning",
        xpAward: 800,
        questions: [
          {
            question: "What kind of network is best suited for sequential data like text or time-series?",
            options: ["CNN", "Recurrent Neural Network (RNN)", "Linear Network", "K-Means"],
            correctIndex: 1,
            explanation: "RNNs process sequential inputs by passing hidden state vectors through time loops."
          },
          {
            question: "Which neural network architecture introduced the Attention mechanism for NLP?",
            options: ["ResNet", "AlexNet", "Transformer", "GAN"],
            correctIndex: 2,
            explanation: "Transformers rely purely on Self-Attention layers to capture global context."
          },
          {
            question: "What does regularization (like L1/L2) aim to prevent in machine learning?",
            options: ["Underfitting", "Overfitting", "Slow training times", "High bias"],
            correctIndex: 1,
            explanation: "Regularization penalizes large weights to restrict model complexity and reduce overfitting."
          },
          {
            question: "In neural networks, what computes gradients of loss with respect to weights?",
            options: ["Forward propagation", "Backpropagation", "Clustering", "Normalization"],
            correctIndex: 1,
            explanation: "Backpropagation applies the chain rule of calculus to propagate errors backward."
          },
          {
            question: "What model consists of a Generator and a Discriminator competing in a game?",
            options: ["Autoencoder", "Generative Adversarial Network (GAN)", "LSTM", "Decision Forest"],
            correctIndex: 1,
            explanation: "GANs pit a generator (creating fakes) against a discriminator (detecting fakes)."
          }
        ]
      }
    ]
  },
  107: {
    title: "Cyber Defense League",
    parts: [
      {
        partId: 1,
        title: "Part 1: Security Fundamentals",
        xpAward: 400,
        questions: [
          {
            question: "What does the CIA triad stand for in security?",
            options: ["Central Intelligence Agency", "Confidentiality, Integrity, Availability", "Computing, Internet, Access", "Control, Identity, Authentication"],
            correctIndex: 1,
            explanation: "Confidentiality, Integrity, and Availability are the core tenets of information security."
          },
          {
            question: "Which protocol provides secure encrypted web traffic?",
            options: ["HTTP", "HTTPS", "FTP", "SMTP"],
            correctIndex: 1,
            explanation: "HTTPS encrypts communications using TLS/SSL over standard HTTP port 443."
          },
          {
            question: "What is phishing?",
            options: ["Scanning open network ports", "Social engineering attacks to steal sensitive data via deceptive emails", "Cracking passwords using dictionaries", "Injecting scripts into text forms"],
            correctIndex: 1,
            explanation: "Phishing attempts to trick victims into sharing credentials or secrets via fraudulent communications."
          },
          {
            question: "Which type of malware locks a user's files and demands payment?",
            options: ["Spyware", "Adware", "Ransomware", "Trojan"],
            correctIndex: 2,
            explanation: "Ransomware encrypts target data, demanding financial payment in exchange for decryption keys."
          },
          {
            question: "What is a Firewall's main job?",
            options: ["Destroy malware", "Scan downloads", "Monitor and filter network traffic based on rules", "Store passwords"],
            correctIndex: 2,
            explanation: "Firewalls establish barriers between trusted internal networks and untrusted external traffic."
          }
        ]
      },
      {
        partId: 2,
        title: "Part 2: Authentication & Threats",
        xpAward: 450,
        questions: [
          {
            question: "What does MFA stand for?",
            options: ["Multiple File Access", "Multi-Factor Authentication", "Mobile Firewall Access", "Main Frame Admin"],
            correctIndex: 1,
            explanation: "Multi-Factor Authentication requires two or more verification factors to grant access."
          },
          {
            question: "Which attack tries every possible character combination to guess passwords?",
            options: ["Phishing", "Brute Force", "SQL Injection", "DDoS"],
            correctIndex: 1,
            explanation: "Brute force testing systematically checks all alphanumeric variations until the match is found."
          },
          {
            question: "What is a SQL Injection (SQLi) attack?",
            options: ["Flooding database channels with dummy requests", "Injecting malicious SQL commands into data inputs to exploit database queries", "Stealing local storage cookies", "None of the above"],
            correctIndex: 1,
            explanation: "SQLi embeds code in inputs to manipulate SQL queries executed by backends."
          },
          {
            question: "What is a zero-day vulnerability?",
            options: ["A bug patched in zero days", "A security flaw unknown to the vendor with no patch yet available", "An attack launched by admins", "A vulnerability in outdated software"],
            correctIndex: 1,
            explanation: "Zero-day bugs are flaws active in the wild before creators create patches or fixes."
          },
          {
            question: "What does DDoS stand for?",
            options: ["Distributed Denial of Service", "Direct Device Operating System", "Database Data Operating System", "Distributed Device Server"],
            correctIndex: 0,
            explanation: "DDoS (Distributed Denial of Service) floods target systems with distributed botnet traffic."
          }
        ]
      },
      {
        partId: 3,
        title: "Part 3: Network Security & Cryptography",
        xpAward: 450,
        questions: [
          {
            question: "What is the difference between symmetric and asymmetric encryption?",
            options: ["Symmetric uses two keys, asymmetric uses one", "Symmetric uses one key for both encryption/decryption, asymmetric uses public/private keys", "Symmetric is only for networks", "Symmetric is slower than asymmetric"],
            correctIndex: 1,
            explanation: "Symmetric shares a single key. Asymmetric pairs a public key for locking and private key for unlocking."
          },
          {
            question: "What is a VPN?",
            options: ["Virtual Private Network", "Virtual Public Node", "Variable Port Network", "Vector Path Node"],
            correctIndex: 0,
            explanation: "VPNs tunnel network traffic securely over public systems, hiding IP addresses and encrypting data."
          },
          {
            question: "Which port does SSH (Secure Shell) use by default?",
            options: ["21", "22", "80", "443"],
            correctIndex: 1,
            explanation: "SSH defaults to TCP port 22."
          },
          {
            question: "What is hashing in cryptography?",
            options: ["Reversible encryption", "Converting data into fixed-length string that cannot be easily reversed", "Compacting file sizes", "Dividing disk space"],
            correctIndex: 1,
            explanation: "Hashing is a one-way mathematical process transforming inputs into consistent digests."
          },
          {
            question: "What does XSS stand for?",
            options: ["XML Server Script", "Cross-Site Scripting", "Extended Security Shell", "X-Server Shield"],
            correctIndex: 1,
            explanation: "XSS (Cross-Site Scripting) injects malicious client-side scripts into web applications."
          }
        ]
      }
    ]
  },
  108: {
    title: "Cloud Architect League",
    parts: [
      {
        partId: 1,
        title: "Part 1: Cloud Concepts & Services",
        xpAward: 700,
        questions: [
          {
            question: "What type of service model is AWS EC2 or Google Compute Engine?",
            options: ["SaaS (Software as a Service)", "PaaS (Platform as a Service)", "IaaS (Infrastructure as a Service)", "Serverless"],
            correctIndex: 2,
            explanation: "EC2 provides raw virtual machines and storage (IaaS)."
          },
          {
            question: "Which cloud service model lets you run code without provisioning servers?",
            options: ["IaaS", "SaaS", "Serverless (FaaS)", "PaaS"],
            correctIndex: 2,
            explanation: "Serverless (like AWS Lambda, Google Cloud Functions) handles scaling and hosting dynamically."
          },
          {
            question: "What does 'Elasticity' mean in cloud computing?",
            options: ["Stretching local disks", "The ability to scale resources up and down dynamically based on demand", "Securing access", "Storing files indefinitely"],
            correctIndex: 1,
            explanation: "Elasticity permits infrastructure to scale up or down dynamically, matching consumption patterns."
          },
          {
            question: "Which service offers high-performance, object-based storage in AWS?",
            options: ["EBS", "S3", "EFS", "RDS"],
            correctIndex: 1,
            explanation: "Simple Storage Service (S3) provides highly durable, scalable object storage."
          },
          {
            question: "What cloud concept ensures resources remain active even if an entire datacenter fails?",
            options: ["Scalability", "High Availability / Multi-AZ deployment", "Elasticity", "Serverless"],
            correctIndex: 1,
            explanation: "Deploying resources across multiple Availability Zones protects applications against single datacenter failures."
          }
        ]
      },
      {
        partId: 2,
        title: "Part 2: Networking & Security",
        xpAward: 700,
        questions: [
          {
            question: "What isolated network space can you provision in the cloud?",
            options: ["VPC (Virtual Private Cloud)", "VPN", "WAN", "Cloud subnet only"],
            correctIndex: 0,
            explanation: "VPCs let you launch resources in a logically isolated virtual network."
          },
          {
            question: "What is a Security Group in cloud networking?",
            options: ["A group of security guards", "A virtual firewall controlling inbound/outbound traffic to instances", "A user permissions folder", "An encrypted storage group"],
            correctIndex: 1,
            explanation: "Security Groups act as firewalls at the instance level, defining allow rules."
          },
          {
            question: "What service is used to create and manage user identities and access keys in AWS?",
            options: ["KMS", "IAM", "CloudTrail", "Cognito"],
            correctIndex: 1,
            explanation: "IAM (Identity and Access Management) grants fine-grained permissions to users and systems."
          },
          {
            question: "Which load balancer routes traffic based on application-level routing (HTTP/HTTPS)?",
            options: ["Network Load Balancer (NLB)", "Application Load Balancer (ALB)", "Classic Load Balancer", "Route 53"],
            correctIndex: 1,
            explanation: "ALBs operate at Layer 7, routing requests based on headers, URLs, and paths."
          },
          {
            question: "What is a Content Delivery Network (CDN) service?",
            options: ["Database backup", "CloudFront / Cloud CDN (caches files globally near users)", "Virtual machine", "Private network tunnel"],
            correctIndex: 1,
            explanation: "CDNs cache assets at edge locations worldwide to reduce load times for end users."
          }
        ]
      },
      {
        partId: 3,
        title: "Part 3: Architecture & Scaling",
        xpAward: 700,
        questions: [
          {
            question: "What does Infrastructure as Code (IaC) allow you to do?",
            options: ["Code inside VMs", "Provision and manage infrastructure using config files (e.g. Terraform)", "Write software faster", "Run databases locally"],
            correctIndex: 1,
            explanation: "IaC tools manage infrastructure setups using version-controlled code templates."
          },
          {
            question: "What is the difference between horizontal and vertical scaling?",
            options: ["Horizontal adds more machines, vertical increases capacity of existing machines", "Horizontal increases machine size, vertical adds more machines", "There is no difference", "Horizontal is for DBs, vertical is for APIs"],
            correctIndex: 0,
            explanation: "Scaling out (horizontal) adds server nodes. Scaling up (vertical) adds CPU/RAM to current nodes."
          },
          {
            question: "Which database type is designed for flexible schemas and key-value/document structures?",
            options: ["Relational (SQL)", "Non-relational (NoSQL like DynamoDB)", "Warehouse", "Graph only"],
            correctIndex: 1,
            explanation: "NoSQL databases support key-value pairs, documents, and scale horizontally easily."
          },
          {
            question: "What does AWS CloudTrail monitor?",
            options: ["Server CPU usage", "API actions and user activities in the AWS account", "Network load", "Database query speeds"],
            correctIndex: 1,
            explanation: "CloudTrail tracks API invocations, providing detailed event logs for governance and compliance."
          },
          {
            question: "What strategy deploys identical environments in different regions to achieve disaster recovery?",
            options: ["Single-region", "Multi-region deployment", "Hybrid cloud", "Auto scaling"],
            correctIndex: 1,
            explanation: "Multi-region setups protect applications against whole geographical outages."
          }
        ]
      }
    ]
  },
  109: {
    title: "DevOps Reliability League",
    parts: [
      {
        partId: 1,
        title: "Part 1: CI/CD Pipelines & Git",
        xpAward: 750,
        questions: [
          {
            question: "What is the purpose of Continuous Integration (CI)?",
            options: ["Deploying to production directly", "Merging developer code frequently and running automated tests", "Writing documentation", "Managing cloud keys"],
            correctIndex: 1,
            explanation: "CI automates building, packaging, and testing code whenever changes are committed."
          },
          {
            question: "What file format is commonly used to write pipeline configurations (like GitHub Actions)?",
            options: ["JSON", "XML", "YAML", "TXT"],
            correctIndex: 2,
            explanation: "YAML is widely favored for pipeline definitions due to its human-readable structure."
          },
          {
            question: "In git, what command integrates changes from another branch?",
            options: ["git commit", "git checkout", "git merge", "git push"],
            correctIndex: 2,
            explanation: "git merge combines changes from a source branch into the active branch."
          },
          {
            question: "What pipeline step checks code syntax and formatting rules?",
            options: ["Build", "Test", "Lint", "Deploy"],
            correctIndex: 2,
            explanation: "Linting analyzes code statically, flagging code formatting or syntactic errors early."
          },
          {
            question: "Which pipeline concept stops execution immediately if a test fails?",
            options: ["Fail-fast", "Rollback", "Canary", "Continuous delivery"],
            correctIndex: 0,
            explanation: "Fail-fast stops pipeline execution upon the first error, avoiding wasting resources on bad builds."
          }
        ]
      },
      {
        partId: 2,
        title: "Part 2: Containers & Orchestration",
        xpAward: 800,
        questions: [
          {
            question: "What is Docker?",
            options: ["A virtual machine hypervisor", "A platform to package applications with their dependencies inside containers", "A database engine", "A code editor"],
            correctIndex: 1,
            explanation: "Docker isolates applications in containers that share the host OS kernel, making them lightweight."
          },
          {
            question: "What file contains instructions to build a Docker image?",
            options: ["docker.config", "Dockerfile", "docker-compose.yml", "package.json"],
            correctIndex: 1,
            explanation: "The Dockerfile defines the commands needed to compile a reusable container image."
          },
          {
            question: "What tool orchestrates clusters of containerized applications?",
            options: ["Docker Engine", "Kubernetes", "Ansible", "Terraform"],
            correctIndex: 1,
            explanation: "Kubernetes (K8s) automates deployment, scaling, and management of containerized apps."
          },
          {
            question: "What is the smallest deployable unit in Kubernetes?",
            options: ["Container", "Pod", "Node", "Service"],
            correctIndex: 1,
            explanation: "A Pod represents a single instance of a running process, wrapping one or more containers."
          },
          {
            question: "What is the role of docker-compose?",
            options: ["Building images in cloud", "Defining and running multi-container Docker applications", "Editing code", "Creating host networks"],
            correctIndex: 1,
            explanation: "Docker Compose allows configuring and starting multi-container applications with a single YAML config."
          }
        ]
      },
      {
        partId: 3,
        title: "Part 3: Observability & Deployments",
        xpAward: 800,
        questions: [
          {
            question: "Which deployment strategy directs traffic to new code gradually (e.g. 10%, then 50%)?",
            options: ["Blue-Green", "Recreate", "Canary Deployment", "All-at-once"],
            correctIndex: 2,
            explanation: "Canary releases route small subsets of traffic to check stability before full rollouts."
          },
          {
            question: "What do the 'Three Pillars of Observability' include?",
            options: ["CPU, RAM, Disk", "Logs, Metrics, Traces", "Servers, Databases, APIs", "Git, Docker, Jenkins"],
            correctIndex: 1,
            explanation: "Logs (events), Metrics (numbers), and Traces (request journeys) form the basis of observability."
          },
          {
            question: "What does 'SLA' stand for in reliability engineering?",
            options: ["Service Level Agreement", "System Logic Allocation", "Service Line Audit", "Standard Load Agent"],
            correctIndex: 0,
            explanation: "SLA is the formal commitment contract between service providers and customers regarding uptime."
          },
          {
            question: "Which open-source tool is widely used to visualize metrics on dynamic dashboards?",
            options: ["Prometheus", "Grafana", "Elasticsearch", "Logstash"],
            correctIndex: 1,
            explanation: "Grafana aggregates and presents visual charts from databases like Prometheus."
          },
          {
            question: "What does 'Rollback' mean in deployment pipelines?",
            options: ["Deleting code files", "Reverting back to the previous stable software version after a failure", "Restarting databases", "Re-running pipeline steps"],
            correctIndex: 1,
            explanation: "Rollbacks instantly restore previous working deployments when bugs occur in fresh releases."
          }
        ]
      }
    ]
  },
  110: {
    title: "Product Thinking League",
    parts: [
      {
        partId: 1,
        title: "Part 1: Customer Discovery & Fit",
        xpAward: 350,
        questions: [
          {
            question: "What is the primary goal of Customer Discovery?",
            options: ["Building a backend", "Understanding user pain points and validating problems before coding", "Writing press releases", "Designing landing page mockups"],
            correctIndex: 1,
            explanation: "Customer Discovery validates that a real problem exists for target users."
          },
          {
            question: "What does 'MVP' stand for in product development?",
            options: ["Most Valued Player", "Minimum Viable Product", "Maximum Visual Presentation", "Model View Controller"],
            correctIndex: 1,
            explanation: "An MVP is the simplest version of a product that can be released to test customer response."
          },
          {
            question: "What is Product-Market Fit (PMF)?",
            options: ["When a product fits in a shipping box", "When a product satisfies a strong market demand in a large user pool", "When the code compiles successfully", "When marketing budgets are depleted"],
            correctIndex: 1,
            explanation: "PMF occurs when a product solves real user needs, driving organic growth."
          },
          {
            question: "Which framework is used to map out user tasks, pains, and gains?",
            options: ["Agile Kanban", "Value Proposition Canvas", "Gantt Chart", "Git branch model"],
            correctIndex: 1,
            explanation: "The Value Proposition Canvas helps align features directly with customer profile needs."
          },
          {
            question: "What is a 'User Persona'?",
            options: ["An employee biography", "A fictional profile representing a key segment of target customers", "A database record", "A user's profile picture"],
            correctIndex: 1,
            explanation: "User Personas guide design decisions by modeling core target customer traits."
          }
        ]
      },
      {
        partId: 2,
        title: "Part 2: Metrics & Priority",
        xpAward: 350,
        questions: [
          {
            question: "What metric tracks the percentage of users who stop using a product over time?",
            options: ["Retention Rate", "Churn Rate", "Conversion Rate", "Bounce Rate"],
            correctIndex: 1,
            explanation: "Churn rate measures customer attrition - the speed at which users stop paying/using."
          },
          {
            question: "What does the 'North Star Metric' represent?",
            options: ["Daily login count", "The single key metric that best captures the core value your product delivers to customers", "Company revenue only", "App download speeds"],
            correctIndex: 1,
            explanation: "The North Star Metric aligns product teams toward long-term customer value delivery."
          },
          {
            question: "Which prioritization framework evaluates features by Reach, Impact, Confidence, and Effort?",
            options: ["MoSCoW", "RICE", "Kano Model", "Eisenhower Matrix"],
            correctIndex: 1,
            explanation: "RICE scoring helps score and sequence features based on logical quantitative metrics."
          },
          {
            question: "What is 'A/B Testing'?",
            options: ["Testing two databases", "Comparing two versions of a webpage to see which performs better", "Running unit tests", "Testing UI on two monitors"],
            correctIndex: 1,
            explanation: "A/B testing splits user groups to compare variant changes scientifically."
          },
          {
            question: "Which metric measures the likelihood of users recommending your product?",
            options: ["Net Promoter Score (NPS)", "Customer Lifetime Value (LTV)", "Customer Acquisition Cost (CAC)", "Retention Rate"],
            correctIndex: 0,
            explanation: "NPS gauges customer loyalty and recommendation tendencies via a standard -100 to 100 index."
          }
        ]
      },
      {
        partId: 3,
        title: "Part 3: Roadmapping & Execution",
        xpAward: 400,
        questions: [
          {
            question: "What is a Product Roadmap?",
            options: ["A roadmap driving directions", "A high-level visual summary that maps out product direction and priorities over time", "A list of bug tickets", "A codebase map"],
            correctIndex: 1,
            explanation: "Roadmaps define product priorities, goals, and strategies for stakeholders."
          },
          {
            question: "What is the difference between outputs and outcomes?",
            options: ["Outputs are features shipped; outcomes are the actual value/impact created for users", "Outputs are database queries; outcomes are UI styles", "There is no difference", "Outputs are sales numbers; outcomes are user numbers"],
            correctIndex: 0,
            explanation: "DevOps/teams build outputs (features), but product success is measured by outcomes (behavior change/value)."
          },
          {
            question: "Which framework categorizes features into Must-haves, Should-haves, Could-haves, and Won't-haves?",
            options: ["RICE", "MoSCoW", "Kano", "Lean"],
            correctIndex: 1,
            explanation: "MoSCoW helps stakeholders categorize project requirements under fixed timelines."
          },
          {
            question: "What is the primary role of a Product Manager?",
            options: ["Writing frontend code", "Defining the 'what' and 'why' of a product, alignment, and value delivery", "Testing security databases", "Approving engineering hires"],
            correctIndex: 1,
            explanation: "PMs connect engineering, design, and business, validating what to build next and why."
          },
          {
            question: "What is a 'Pivot' in lean startup terminology?",
            options: ["Rotating a database table", "Changing the strategic direction of the product without changing the core vision", "Re-factoring React files", "Hiring a new CEO"],
            correctIndex: 1,
            explanation: "A pivot redirects strategies based on customer feedback while maintaining the overarching vision."
          }
        ]
      }
    ]
  }
};
