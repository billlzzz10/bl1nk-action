# 🔗 Mermaid Integration Guide for Agents

How to integrate the Mermaid system prompt with each agent for automatic diagram generation.

## Quick Integration

### Step 1: Load System Prompt

```python
from pathlib import Path

def load_mermaid_system_prompt():
    """Load the unified Mermaid system prompt"""
    prompt_path = Path(__file__).parent / "SYSTEM_PROMPT.md"
    return prompt_path.read_text()

# Use in any agent
MERMAID_SYSTEM_PROMPT = load_mermaid_system_prompt()
```

### Step 2: Add to Claude Calls

```python
from anthropic import Anthropic

client = Anthropic()

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=2048,
    system=MERMAID_SYSTEM_PROMPT,  # Add Mermaid prompt here
    messages=[
        {
            "role": "user",
            "content": "Create a diagram of the task workflow"
        }
    ]
)
```

### Step 3: Extract Diagrams

```python
def extract_mermaid_diagram(response_text):
    """Extract Mermaid diagram from response"""
    import re
    
    # Find mermaid code blocks
    pattern = r'```mermaid\n(.*?)\n```'
    matches = re.findall(pattern, response_text, re.DOTALL)
    
    return matches

# Use it
diagrams = extract_mermaid_diagram(response.content[0].text)
for diagram in diagrams:
    print(diagram)
```

## Per-Agent Integration

### Task Planner Agent

```python
# In task-planner/planner.py

class TaskPlannerAgent:
    def __init__(self):
        self.mermaid_prompt = self.load_mermaid_prompt()
        self.client = Anthropic()
    
    def load_mermaid_prompt(self):
        """Load Mermaid system prompt"""
        prompt_path = Path(__file__).parent.parent / "mermaid-system" / "SYSTEM_PROMPT.md"
        return prompt_path.read_text()
    
    async def generate_diagram(self, plan_id: str) -> str:
        """Generate Mermaid diagram for task plan"""
        
        plan = await self.get_plan(plan_id)
        
        response = self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2048,
            system=self.mermaid_prompt,
            messages=[
                {
                    "role": "user",
                    "content": f"""Create a Mermaid flowchart showing:
                    
Title: {plan.title}
Description: {plan.description}
Tasks: {len(plan.tasks)}

Create a clear flowchart showing the task dependencies and workflow.
Use colors to indicate priority:
- Red for high priority
- Yellow for medium
- Green for low
                    """
                }
            ]
        )
        
        return response.content[0].text
```

### Code Review Agent

```python
# In code-review/reviewer.py

async def generate_review_diagram(self, review_data: dict):
    """Generate diagram showing review findings"""
    
    response = self.client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=2048,
        system=self.mermaid_prompt,
        messages=[
            {
                "role": "user",
                "content": f"""Create a Mermaid diagram of the code review results:

Issues Found: {len(review_data['issues'])}
Quality Score: {review_data['quality_score']}
High Priority: {review_data['high_priority_count']}

Create a flowchart showing the decision tree for the review process
and highlight critical issues.
                """
            }
        ]
    )
    
    return response.content[0].text
```

### Forecast Agent

```python
# In forecast/forecaster.py

def generate_forecast_timeline(self, forecasts: list):
    """Generate Gantt chart for forecast timeline"""
    
    response = self.client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=2048,
        system=self.mermaid_prompt,
        messages=[
            {
                "role": "user",
                "content": f"""Create a Mermaid Gantt chart for the following forecasts:

{json.dumps(forecasts, indent=2)}

Show timeline with confidence intervals.
                """
            }
        ]
    )
    
    return response.content[0].text
```

### Cursor Integration Agent

```python
# In cursor-integration/skills.py

async def generate_architecture_diagram(self, code: str):
    """Generate architecture diagram from code"""
    
    response = self.client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=2048,
        system=self.mermaid_prompt,
        messages=[
            {
                "role": "user",
                "content": f"""Analyze this code and create a Mermaid class diagram:

{code}

Show all classes, methods, and relationships.
                """
            }
        ]
    )
    
    return response.content[0].text
```

## Common Use Cases

### 1. Task Hierarchy Diagram

```python
async def create_task_hierarchy(self, tasks: list):
    """Create visual hierarchy of tasks"""
    
    task_list = "\n".join([
        f"- {t['title']} (priority: {t['priority']})"
        for t in tasks
    ])
    
    response = self.client.messages.create(
        model="claude-3-5-sonnet-20241022",
        system=self.mermaid_prompt,
        messages=[{
            "role": "user",
            "content": f"""Create a Mermaid flowchart showing task hierarchy:

{task_list}

Use proper hierarchy and dependencies.
            """
        }]
    )
    
    return response.content[0].text
```

### 2. Timeline/Gantt Chart

```python
async def create_timeline(self, schedule: dict):
    """Create project timeline"""
    
    response = self.client.messages.create(
        model="claude-3-5-sonnet-20241022",
        system=self.mermaid_prompt,
        messages=[{
            "role": "user",
            "content": f"""Create a Mermaid Gantt chart for this schedule:

{json.dumps(schedule, indent=2)}

Include milestones and critical path.
            """
        }]
    )
    
    return response.content[0].text
```

### 3. State Machine Diagram

```python
async def create_state_diagram(self, states: list, transitions: list):
    """Create state machine visualization"""
    
    response = self.client.messages.create(
        model="claude-3-5-sonnet-20241022",
        system=self.mermaid_prompt,
        messages=[{
            "role": "user",
            "content": f"""Create a Mermaid state diagram:

States: {states}
Transitions: {transitions}

Show entry/exit conditions.
            """
        }]
    )
    
    return response.content[0].text
```

### 4. Architecture Diagram

```python
async def create_architecture(self, components: list):
    """Create system architecture diagram"""
    
    response = self.client.messages.create(
        model="claude-3-5-sonnet-20241022",
        system=self.mermaid_prompt,
        messages=[{
            "role": "user",
            "content": f"""Create a Mermaid diagram showing system architecture:

Components: {json.dumps(components, indent=2)}

Show all relationships and data flows.
            """
        }]
    )
    
    return response.content[0].text
```

## Helper Functions

```python
# agents/mermaid_utils.py

from pathlib import Path
import re

class MermaidHelper:
    @staticmethod
    def load_system_prompt():
        """Load Mermaid system prompt"""
        path = Path(__file__).parent / "mermaid-system" / "SYSTEM_PROMPT.md"
        return path.read_text()
    
    @staticmethod
    def extract_diagrams(text: str) -> list[str]:
        """Extract Mermaid diagrams from text"""
        pattern = r'```mermaid\n(.*?)\n```'
        return re.findall(pattern, text, re.DOTALL)
    
    @staticmethod
    def save_diagram(diagram: str, filename: str):
        """Save diagram to file"""
        with open(filename, 'w') as f:
            f.write(f"```mermaid\n{diagram}\n```")
    
    @staticmethod
    def validate_diagram(diagram: str) -> bool:
        """Basic validation of Mermaid syntax"""
        lines = diagram.strip().split('\n')
        if not lines:
            return False
        
        # Check for valid diagram type
        valid_types = ['graph', 'flowchart', 'sequenceDiagram', 
                      'classDiagram', 'stateDiagram', 'gantt', 'pie']
        
        first_line = lines[0].lower()
        return any(dt in first_line for dt in valid_types)
```

## Testing Diagrams

```python
import pytest

@pytest.mark.asyncio
async def test_task_diagram_generation():
    """Test task diagram generation"""
    planner = TaskPlannerAgent()
    
    tasks = [
        {"title": "Design", "priority": "high"},
        {"title": "Develop", "priority": "medium"},
        {"title": "Test", "priority": "medium"}
    ]
    
    diagram = await planner.generate_diagram(tasks)
    
    assert "```mermaid" in diagram
    assert "graph" in diagram or "flowchart" in diagram
```

## Best Practices

✅ **Do:**

- Always include Mermaid system prompt
- Validate diagram syntax
- Store diagrams in files
- Test diagram generation
- Use appropriate diagram types
- Include styling/colors
- Document diagram purpose

❌ **Don't:**

- Skip Mermaid prompt
- Generate invalid diagrams
- Create overly complex diagrams
- Forget to extract diagrams
- Mix diagram types inappropriately
- Ignore Claude's suggestions
- Hardcode diagram content

## Troubleshooting

### Claude Not Generating Diagrams

1. Check Mermaid system prompt is loaded correctly
2. Verify request asks for specific diagram type
3. Check response has proper formatting (```mermaid)
4. Try simpler diagram request first

### Invalid Diagram Syntax

1. Use validator function from MermaidHelper
2. Check against SYSTEM_PROMPT.md examples
3. Verify node IDs don't have special chars
4. Test in Mermaid Live Editor

### Diagrams Not Rendering

1. Ensure correct markdown syntax (```mermaid)
2. Check for special characters
3. Validate with MermaidHelper.validate_diagram()
4. Try simpler diagram first

---

**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Last Updated**: 2024-12-17