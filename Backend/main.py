import sqlite3
from typing import List, AsyncGenerator
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DB_FILE = "todos.db"

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Table creation query
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            completed INTEGER NOT NULL DEFAULT 0
        );
    """)
    
    # Check existing record count
    cursor.execute("SELECT COUNT(*) FROM todos;")
    count = cursor.fetchone()[0]
    
    # Insert at least 5 todo records if table is empty
    if count == 0:
        initial_todos = [
            ("Databloom online class", "Join the Databloom online class to learn web development.", 1),
            ("Prepare Guard presentation", "Prepare slides and content for your upcoming presentation.", 0),
            ("Build Guard app", "Develop the core functionality of the Guard application.", 0),
            ("Read a Book", "Read at least 20 pages of a personal development book.", 1),
            ("Go for a Walk", "Take a 30-minute walk in the evening.", 0)
        ]
        cursor.executemany(
            "INSERT INTO todos (title, description, completed) VALUES (?, ?, ?);",
            initial_todos
        )
        conn.commit()
        
    conn.close()

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    init_db()
    yield

app = FastAPI(title="Todo List App API", lifespan=lifespan)

# Configure CORS (IMPORTANT for frontend-backend communication)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Step 2.3: Create Pydantic model representing one todo item
class Todo(BaseModel):
    id: int
    title: str
    description: str
    completed: bool

class TodoCreate(BaseModel):
    title: str
    description: str
    completed: bool = False

@app.get("/")
def read_root():
    return {"message": "Welcome to the Todo App API"}

# Step 2.5: Create the /todos GET endpoint
@app.get("/todos", response_model=List[Todo])
def get_todos():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, description, completed FROM todos;")
    rows = cursor.fetchall()
    
    # Convert DB rows into Todo objects with boolean completed field
    todo_list = [
        Todo(
            id=row["id"],
            title=row["title"],
            description=row["description"],
            completed=bool(row["completed"])
        )
        for row in rows
    ]
    
    conn.close()
    return todo_list

@app.post("/todos", response_model=Todo)
def create_todo(todo_in: TodoCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO todos (title, description, completed) VALUES (?, ?, ?);",
        (todo_in.title, todo_in.description, 1 if todo_in.completed else 0)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return Todo(
        id=new_id,
        title=todo_in.title,
        description=todo_in.description,
        completed=todo_in.completed
    )

@app.put("/todos/{todo_id}", response_model=Todo)
def update_todo(todo_id: int, todo_in: TodoCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE todos SET title = ?, description = ?, completed = ? WHERE id = ?;",
        (todo_in.title, todo_in.description, 1 if todo_in.completed else 0, todo_id)
    )
    conn.commit()
    conn.close()
    return Todo(
        id=todo_id,
        title=todo_in.title,
        description=todo_in.description,
        completed=todo_in.completed
    )

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM todos WHERE id = ?;", (todo_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "message": f"Todo {todo_id} deleted"}

