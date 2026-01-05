# 🤖 Unified Agents System

Centralized agent management for the GitHub AI Review Application with integrated Mermaid system prompts and visualizations.

## 📁 Directory Structure

```
agents/
├── README.md                          # This file
├── mermaid-system/                    # Mermaid visualization system
│   ├── SYSTEM_PROMPT.md              # Complete Mermaid system prompt
│   ├── diagram-templates.md          # Diagram templates library
│   └── integration-guide.md           # How to use Mermaid in agents
├── code-review/                       # Code review agent
│   ├── reviewer.py                   # Review logic
│   ├── config.yaml                   # Review settings
│   └── rules/
├── task-planner/                      # Task planning agent
│   ├── planner.py                    # Task planning logic
│   ├── models.py                     # Data models
│   └── report_generator.py           # Report generation
├── forecast/                          # Forecast agent
│   ├── forecaster.py                 # Forecasting logic
│   ├── metrics.py                    # Metrics calculation
│   └── badges.py                     # Badge generation
└── cursor-integration/                # Cursor IDE integration
    ├── skills.py                     # Cursor skills
    ├── rules.py                      # Cursor rules
    └── tokenizer.py                  # Token management
```

## 🎨 Mermaid System Prompt

The unified Mermaid system prompt enables all agents to:

- 📊 Generate architecture diagrams
- 🔄 Create workflow visualizations
- 📈 Visualize task hierarchies
- 🗓️ Show timelines and Gantt charts
- 🎯 Display decision trees
- 💻 Generate code flow diagrams

### Quick Start

```python
from mermaid_system import MermaidSystemPrompt

# Initialize Mermaid prompt
mermaid = MermaidSystemPrompt()

# Get system prompt
prompt = mermaid.get_system_prompt()

# Add to Claude messages
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    system=prompt,
    messages=[...]
)
```

## 🚀 Agent Overview

### 1. Code Review Agent

**Purpose**: Analyze code quality, security, and best practices

- Reviews pull requests
- Identifies issues and improvements
- Generates structured feedback
- Creates actionable tasks

### 2. Task Planner Agent

**Purpose**: Plan, organize, and track development tasks

- Creates task hierarchies
- Estimates effort (hours)
- Tracks status and progress
- Generates reports with Mermaid diagrams

### 3. Forecast Agent

**Purpose**: Predict issues, timelines, and quality

- Predicts future issues
- Estimates completion times
- Forecasts quality metrics
- Generates confidence intervals

### 4. Cursor Integration Agent

**Purpose**: Cursor IDE integration and skills

- Code generation from comments
- Code editing and refactoring
- Documentation generation
- Test case generation

## 💡 Key Features

✅ **Unified System Prompt**: All agents use consistent Mermaid prompt  
✅ **Diagram Generation**: Built-in Mermaid diagram support  
✅ **Async Operations**: Full async/await support  
✅ **Error Handling**: Comprehensive error management  
✅ **Configuration**: YAML-based configuration  
✅ **Integration**: Works with GitHub, Cursor, and Claude API  

## 📚 Usage Examples

### Using Mermaid in Agents

```python
# In any agent
system_prompt = MermaidSystemPrompt.get_full_prompt()

# Ask Claude to generate diagrams
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    system=system_prompt,
    messages=[{
        "role": "user",
        "content": "Create a Mermaid diagram of the task flow"
    }]
)

# Extract and use diagram
diagram = response.content[0].text
```

### Code Review Agent

```python
from code_review.reviewer import CodeReviewAgent

reviewer = CodeReviewAgent()
review = await reviewer.review_pull_request(
    repo="owner/repo",
    pr_number=123,
    files=[...]
)
```

### Task Planner Agent

```python
from task_planner.planner import TaskPlannerAgent

planner = TaskPlannerAgent()
plan = await planner.create_plan(
    title="Feature Development",
    description="...",
    tasks=[...]
)

# Generate report with diagrams
report = await planner.generate_report(plan.id)
```

### Forecast Agent

```python
from forecast.forecaster import ForecastAgent

forecaster = ForecastAgent()
forecast = forecaster.forecast_issues(recent_issues)
forecast = forecaster.forecast_timeline(estimates)
forecast = forecaster.forecast_quality(metrics)
```

## 🔧 Configuration

### Mermaid Configuration

In `mermaid-system/SYSTEM_PROMPT.md`:

- Diagram types and syntax
- Best practices
- Integration patterns
- Examples

### Agent Configuration

Each agent has a `config.yaml`:

```yaml
# task-planner/config.yaml
planner:
  model: claude-3-5-sonnet-20241022
  max_tokens: 2048
  temperature: 0.7
  
  priorities:
    high: 1.5x
    medium: 1.0x
    low: 0.5x
  
  estimates:
    small: "1-2h"
    medium: "3-8h"
    large: "8-40h"
```

## 📊 Mermaid Diagram Support

Agents can generate all Mermaid diagram types:

```
graph TD          # Flowchart
graph LR          # Left-to-right
flowchart         # Flowchart
sequence          # Sequence diagram
class             # Class diagram
state             # State diagram
ER                # Entity-relationship
gantt             # Gantt chart
pie               # Pie chart
```

## 🔗 Integration Points

### GitHub

- Webhook handlers
- PR analysis
- Issue creation
- Comment posting

### Claude API

- LLM analysis
- Plan generation
- Report creation
- Task suggestions

### Cursor IDE

- Skill execution
- Code generation
- Real-time feedback
- Inline suggestions

## 📈 Metrics & Reporting

All agents support reporting with Mermaid visualizations:

- Task hierarchy diagrams
- Timeline Gantt charts
- Quality metrics charts
- Issue forecasts
- Code flow diagrams

## 🚀 Deployment

### Docker

```bash
docker build -t github-ai-agents .
docker run -e ANTHROPIC_API_KEY=$KEY github-ai-agents
```

### Direct Python

```bash
pip install -r requirements.txt
python -m agents.main
```

## 📖 Documentation

## 🆘 Troubleshooting

### Mermaid Diagrams Not Rendering

1. Verify Claude has Mermaid system prompt
2. Check diagram syntax is valid
3. Ensure markdown rendering supports Mermaid
4. Review `mermaid-system/SYSTEM_PROMPT.md`

### Agent Errors

1. Check agent-specific `config.yaml`
2. Review error logs in agent directory
3. Verify API credentials
4. Check async execution

## 🎯 Next Steps

1. **Read Mermaid System Prompt**: `mermaid-system/SYSTEM_PROMPT.md`
2. **Choose Agent**: Pick the agent you need
3. **Configure**: Update `config.yaml`
4. **Integrate**: Add to your workflow
5. **Monitor**: Track results with reports

## 📞 Support

- Check individual agent `README.md` files
- Review `SYSTEM_PROMPT.md` for Mermaid help
- Check integration guide
- Review error messages and logs

---

**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Last Updated**: 2024-12-17  

Happy automating! 🚀
