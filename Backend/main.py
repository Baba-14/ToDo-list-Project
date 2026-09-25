from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Step 2.3: Pydantic model representing one todo item
class Todo(BaseModel):
    id: int
    title: str
    description: str
    completed: bool

# Sample todo list initialized with the Todo Pydantic model
todos_db: List[Todo] = [
    Todo(id=1, title="Databloom online class", description="Join the Databloom online class to learn web development.", completed=True),
    Todo(id=2, title="Prepare Guard presentation", description="Prepare slides and content for upcoming presentation.", completed=False),
    Todo(id=3, title="Build Guard app", description="Develop core functionality of the Guard application.", completed=False)
]

@app.get("/")
def read_root():
    return {"message": "Welcome to the Todo App Backend!"}

@app.get("/todos", response_model=List[Todo])
def get_todos():
    return todos_db

@app.post("/todos", response_model=Todo)
def create_todo(todo: Todo):
    todos_db.append(todo)
    return todo

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    global todos_db
    todos_db = [t for t in todos_db if t.id != todo_id]
    return {"message": f"Todo {todo_id} deleted successfully"}
