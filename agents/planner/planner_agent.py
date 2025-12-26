"""
Task Planner Agent - AI-powered task orchestration
Python 3.13+ with async/await and type hints
"""

from __future__ import annotations
import asyncio
import json
import logging
from typing import Any
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass, asdict, field
from pathlib import Path
import glob as glob_module
from anthropic import Anthropic

logger = logging.getLogger(__name__)

class TaskStatus(str, Enum):
    """Task status types"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"

class TaskPriority(str, Enum):
    """Task priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class Task:
    """Task data model"""
    id: str
    title: str
    description: str
    status: TaskStatus = TaskStatus.PENDING
    priority: TaskPriority = TaskPriority.MEDIUM
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())
    due_date: str | None = None
    assigned_to: str | None = None
    tags: list[str] = field(default_factory=list)
    subtasks: list[Task] = field(default_factory=list)
    error_message: str | None = None
    completion_time: str | None = None
    dependencies: list[str] = field(default_factory=list)
    estimated_hours: float | None = None
    actual_hours: float | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> dict:
        """Convert to dictionary"""
        data = asdict(self)
        data['status'] = self.status.value
        data['priority'] = self.priority.value
        data['subtasks'] = [st.to_dict() for st in self.subtasks]
        return data
    
    @classmethod
    def from_dict(cls, data: dict) -> Task:
        """Create from dictionary"""
        data['status'] = TaskStatus(data.get('status', 'pending'))
        data['priority'] = TaskPriority(data.get('priority', 'medium'))
        data['subtasks'] = [cls.from_dict(st) for st in data.get('subtasks', [])]
        return cls(**data)

@dataclass
class TaskPlan:
    """Task plan/project"""
    id: str
    name: str
    description: str
    tasks: list[Task] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())
    status: TaskStatus = TaskStatus.PENDING
    owner: str | None = None
    
    def to_dict(self) -> dict:
        """Convert to dictionary"""
        data = asdict(self)
        data['tasks'] = [t.to_dict() for t in self.tasks]
        data['status'] = self.status.value
        return data

class TaskStorage:
    """In-memory task storage"""
    
    def __init__(self):
        self.plans: dict[str, TaskPlan] = {}
        self.tasks: dict[str, Task] = {}
    
    async def save_task(self, task: Task) -> None:
        """Save task"""
        self.tasks[task.id] = task
        task.updated_at = datetime.now().isoformat()
    
    async def get_task(self, task_id: str) -> Task | None:
        """Get task by ID"""
        return self.tasks.get(task_id)
    
    async def list_tasks(self, status: TaskStatus | None = None, priority: TaskPriority | None = None) -> list[Task]:
        """List tasks with filters"""
        tasks = list(self.tasks.values())
        
        if status:
            tasks = [t for t in tasks if t.status == status]
        if priority:
            tasks = [t for t in tasks if t.priority == priority]
        
        return sorted(tasks, key=lambda t: (t.priority.value, t.created_at), reverse=True)
    
    async def delete_task(self, task_id: str) -> bool:
        """Delete task"""
        if task_id in self.tasks:
            del self.tasks[task_id]
            return True
        return False
    
    async def save_plan(self, plan: TaskPlan) -> None:
        """Save plan"""
        self.plans[plan.id] = plan
        plan.updated_at = datetime.now().isoformat()
    
    async def get_plan(self, plan_id: str) -> TaskPlan | None:
        """Get plan"""
        return self.plans.get(plan_id)

class TaskPlannerAgent:
    """Main task planner agent"""
    
    def __init__(self, storage: TaskStorage | None = None):
        self.storage = storage or TaskStorage()
        self.anthropic = Anthropic()
        self.model = "claude-3-5-sonnet-20241022"
        self.conversation_history: list[dict] = []
    
    async def plan_from_analysis(
        self,
        analysis: dict,
        repo_url: str
    ) -> TaskPlan:
        """Create task plan from code analysis"""
        
        plan_id = f"plan-{hash(repo_url) % (2**31)}"
        
        tasks: list[Task] = []
        
        # Create tasks from analysis
        for idx, task_data in enumerate(analysis.get('tasks', []), 1):
            task = Task(
                id=f"{plan_id}-task-{idx}",
                title=task_data.get('title', f'Task {idx}'),
                description=task_data.get('description', ''),
                priority=TaskPriority(task_data.get('priority', 'medium')),
                estimated_hours=float(task_data.get('effort', '0').split()[0]) if task_data.get('effort') else None,
                tags=['auto-generated', 'code-review'],
                metadata={
                    'repo_url': repo_url,
                    'analysis': analysis.get('review', '')
                }
            )
            tasks.append(task)
            await self.storage.save_task(task)
        
        plan = TaskPlan(
            id=plan_id,
            name=f"Review: {repo_url.split('/')[-1]}",
            description=analysis.get('summary', 'Auto-generated from code analysis'),
            tasks=tasks,
            status=TaskStatus.PENDING
        )
        
        await self.storage.save_plan(plan)
        return plan
    
    async def create_task(
        self,
        title: str,
        description: str,
        priority: str = 'medium',
        due_date: str | None = None,
        tags: list[str] | None = None,
        estimated_hours: float | None = None
    ) -> Task:
        """Create new task"""
        
        task_id = f"task-{datetime.now().timestamp()}"
        
        task = Task(
            id=task_id,
            title=title,
            description=description,
            priority=TaskPriority(priority),
            due_date=due_date,
            tags=tags or [],
            estimated_hours=estimated_hours
        )
        
        await self.storage.save_task(task)
        logger.info(f"Created task: {task_id}")
        return task
    
    async def update_task_status(
        self,
        task_id: str,
        status: str
    ) -> Task | None:
        """Update task status"""
        
        task = await self.storage.get_task(task_id)
        if not task:
            return None
        
        try:
            task.status = TaskStatus(status)
        except ValueError:
            logger.error(f"Invalid status value: {status}")
            return None
            
        task.updated_at = datetime.now().isoformat()
        
        if status == TaskStatus.COMPLETED.value:
            task.completion_time = datetime.now().isoformat()
        
        await self.storage.save_task(task)
        logger.info(f"Updated task {task_id} to {status}")
        return task
    
    async def mark_task_error(
        self,
        task_id: str,
        error_message: str
    ) -> Task | None:
        """Mark task as failed with error"""
        
        task = await self.storage.get_task(task_id)
        if not task:
            return None
        
        task.status = TaskStatus.FAILED
        task.error_message = error_message
        task.updated_at = datetime.now().isoformat()
        
        await self.storage.save_task(task)
        logger.error(f"Task {task_id} failed: {error_message}")
        return task
    
    async def complete_task(
        self,
        task_id: str,
        actual_hours: float | None = None
    ) -> Task | None:
        """Mark task as complete"""
        
        task = await self.storage.get_task(task_id)
        if not task:
            return None
        
        task.status = TaskStatus.COMPLETED
        task.completion_time = datetime.now().isoformat()
        if actual_hours:
            task.actual_hours = actual_hours
        
        await self.storage.save_task(task)
        logger.info(f"Completed task: {task_id}")
        return task
    
    async def list_tasks_by_pattern(
        self,
        pattern: str | None = None,
        status: str | None = None
    ) -> list[Task]:
        """List tasks matching glob pattern in title/description"""
        
        tasks = await self.storage.list_tasks(
            status=TaskStatus(status) if status else None
        )
        
        if not pattern:
            return tasks
        
        # Match against title and description
        filtered = []
        for task in tasks:
            if glob_module.fnmatch.fnmatch(task.title.lower(), pattern.lower()):
                filtered.append(task)
            elif glob_module.fnmatch.fnmatch(task.description.lower(), pattern.lower()):
                filtered.append(task)
        
        return filtered
    
    async def generate_markdown_report(
        self,
        plan_id: str | None = None
    ) -> str:
        """Generate markdown report of tasks"""
        
        markdown = []
        markdown.append("# Task Report\n")
        markdown.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        if plan_id:
            plan = await self.storage.get_plan(plan_id)
            if plan:
                markdown.append(f"## Plan: {plan.name}\n")
                markdown.append(f"{plan.description}\n\n")
                tasks = plan.tasks
            else:
                tasks = []
        else:
            tasks = await self.storage.list_tasks()
        
        # Group by status
        by_status = {}
        for task in tasks:
            status = task.status.value
            if status not in by_status:
                by_status[status] = []
            by_status[status].append(task)
        
        # Generate sections
        for status in [TaskStatus.IN_PROGRESS.value, TaskStatus.PENDING.value, 
                      TaskStatus.COMPLETED.value, TaskStatus.FAILED.value]:
            if status not in by_status:
                continue
            
            status_tasks = by_status[status]
            markdown.append(f"### {status.replace('_', ' ').title()} ({len(status_tasks)})\n\n")
            
            for task in status_tasks:
                markdown.append(f"- **{task.title}** [{task.priority.value}]\n")
                markdown.append(f"  - Status: {task.status.value}\n")
                markdown.append(f"  - Description: {task.description}\n")
                
                if task.estimated_hours:
                    markdown.append(f"  - Estimated: {task.estimated_hours}h\n")
                
                if task.actual_hours:
                    markdown.append(f"  - Actual: {task.actual_hours}h\n")
                
                if task.due_date:
                    markdown.append(f"  - Due: {task.due_date}\n")
                
                if task.error_message:
                    markdown.append(f"  - Error: {task.error_message}\n")
                
                if task.tags:
                    markdown.append(f"  - Tags: {', '.join(task.tags)}\n")
                
                markdown.append("\n")
        
        # Summary
        markdown.append("## Summary\n\n")
        markdown.append(f"- Total Tasks: {len(tasks)}\n")
        markdown.append(f"- Completed: {len(by_status.get(TaskStatus.COMPLETED.value, []))}\n")
        markdown.append(f"- In Progress: {len(by_status.get(TaskStatus.IN_PROGRESS.value, []))}\n")
        markdown.append(f"- Pending: {len(by_status.get(TaskStatus.PENDING.value, []))}\n")
        markdown.append(f"- Failed: {len(by_status.get(TaskStatus.FAILED.value, []))}\n")
        
        return "".join(markdown)
    
    async def chat(self, user_message: str) -> str:
        """Chat with agent for task management"""
        
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })
        
        system_prompt = """You are a task planning assistant. Help users manage their tasks.
        You can:
        - Create tasks with descriptions and priorities
        - Update task status (pending, in_progress, completed, failed)
        - Generate task reports
        - Organize tasks by priority and due date
        
        Respond in a helpful, structured way. When suggesting tasks, include estimated effort."""
        
        response = self.anthropic.messages.create(
            model=self.model,
            max_tokens=1000,
            system=system_prompt,
            messages=self.conversation_history
        )
        
        assistant_message = response.content[0].text
        
        self.conversation_history.append({
            "role": "assistant",
            "content": assistant_message
        })
        
        return assistant_message
    
    async def process_webhook(
        self,
        event_type: str,
        payload: dict
    ) -> dict:
        """Process webhook events"""
        
        if event_type == 'task.create':
            task = await self.create_task(
                title=payload.get('title'),
                description=payload.get('description'),
                priority=payload.get('priority', 'medium'),
                due_date=payload.get('due_date'),
                tags=payload.get('tags', []),
                estimated_hours=payload.get('estimated_hours')
            )
            return {
                'status': 'created',
                'task': task.to_dict()
            }
        
        elif event_type == 'task.complete':
            task = await self.complete_task(
                task_id=payload.get('task_id'),
                actual_hours=payload.get('actual_hours')
            )
            return {
                'status': 'completed',
                'task': task.to_dict() if task else None
            }
        
        elif event_type == 'task.error':
            task = await self.mark_task_error(
                task_id=payload.get('task_id'),
                error_message=payload.get('error_message')
            )
            return {
                'status': 'failed',
                'task': task.to_dict() if task else None
            }
        
        elif event_type == 'task.status':
            task = await self.update_task_status(
                task_id=payload.get('task_id'),
                status=payload.get('status')
            )
            return {
                'status': 'updated',
                'task': task.to_dict() if task else None
            }
        
        elif event_type == 'report.generate':
            plan_id = payload.get('plan_id')
            markdown = await self.generate_markdown_report(plan_id)
            return {
                'status': 'generated',
                'report': markdown
            }
        
        else:
            return {
                'status': 'unknown_event',
                'error': f'Unknown event type: {event_type}'
            }

