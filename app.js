const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

module.exports = app;

let database = null;

databasePath = path.join(__dirname, "todoApplication.db");

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server running at https://localhost:3000/`);
    });
  } catch (error) {
    console.log(`DB error: "${error.message}"`);
    process.exit(1);
  }
};

initializeDbAndServer();

const havePriorityAndStatus = (requestObject) => {
  return (
    requestObject.priority !== undefined && requestObject.status !== undefined
  );
};

const havePriority = (requestObject) => {
  return requestObject.priority !== undefined;
};

const haveStatus = (requestObject) => {
  return requestObject.status !== undefined;
};

//API for list of todos
app.get("/todos/", async (request, response) => {
  const { priority, status, search_q = "" } = request.query;
  let getTodosQuery;
  switch (true) {
    case havePriorityAndStatus(request.query):
      getTodosQuery = `
            SELECT 
              *
            FROM
              todo
            WHERE
              priority = '${priority}' AND
              status = '${status}';`;
      break;
    case havePriority(request.query):
      getTodosQuery = `
            SELECT 
              *
            FROM
              todo
            WHERE
              priority = '${priority}';`;
      break;
    case haveStatus(request.query):
      getTodosQuery = `
            SELECT 
              *
            FROM
              todo
            WHERE
              status = '${status}';`;
      break;
    default:
      getTodosQuery = `
            SELECT 
              *
            FROM
              todo
            WHERE
              todo LIKE '${search_q}';`;
      break;
  }
  const todosArray = await database.all(getTodosQuery);
  response.send(todosArray);
});

//API to get specific todo based on todoId
app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT *
    FROM todo
    WHERE id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(todo);
});

//API to create todo
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const createTodoQuery = `
    INSERT INTO 
      todo(id,todo, priority, status)
    VALUES(${id}, '${todo}', '${priority}', '${status}');`;
  await database.run(createTodoQuery);
  response.send(`Todo Successfully Added`);
});

//API to update a todo based on todoId
app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const { todo, priority, status } = request.body;
  let updateTodoQuery;
  switch (true) {
    case status !== undefined:
      updateTodoQuery = `
          UPDATE todo
          SET status = '${status}'
          WHERE id = ${todoId};`;
      await database.run(updateTodoQuery);
      response.send(`Status Updated`);
      break;
    case priority !== undefined:
      updateTodoQuery = `
          UPDATE todo
          SET priority = '${priority}'
          WHERE id = ${todoId};`;
      await database.run(updateTodoQuery);
      response.send(`Priority Updated`);
      break;
    default:
      updateTodoQuery = `
          UPDATE todo
          SET todo = '${todo}'
          WHERE id = ${todoId};`;
      await database.run(updateTodoQuery);
      response.send(`Todo Updated`);
      break;
  }
});

//API to delete a todo
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todo
    WHERE id = ${todoId};`;
  await database.run(deleteTodoQuery);
  response.send(`Todo Deleted`);
});
