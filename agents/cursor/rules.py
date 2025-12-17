"""Cursor-like Rules System"""

from __future__ import annotations
from typing import Any
from dataclasses import dataclass

@dataclass
class Rule:
    """Single rule"""
    name: str
    description: str
    condition: str  # Pattern or condition
    action: str  # What to do when matched
    priority: int = 0
    enabled: bool = True

class CursorRulesEngine:
    """Rule engine for code patterns"""
    
    DEFAULT_RULES = [
        Rule(
            name="snake_case_functions",
            description="Function names should be snake_case",
            condition=r"def [A-Z]",
            action="suggest_rename",
            priority=1
        ),
        Rule(
            name="docstring_required",
            description="Public functions need docstrings",
            condition=r"^def [^_].*:",
            action="suggest_docstring",
            priority=2
        ),
        Rule(
            name="max_line_length",
            description="Lines should be <= 88 characters",
            condition=r".{89,}",
            action="suggest_break_line",
            priority=1
        ),
        Rule(
            name="no_print_debug",
            description="Avoid print statements, use logging",
            condition=r"print\(",
            action="suggest_logging",
            priority=2
        ),
    ]
    
    def __init__(self):
        self.rules: dict[str, Rule] = {}
        for rule in self.DEFAULT_RULES:
            self.rules[rule.name] = rule
    
    def add_rule(self, rule: Rule) -> None:
        """Add new rule"""
        self.rules[rule.name] = rule
    
    def check_code(self, code: str) -> list[dict]:
        """Check code against all rules"""
        violations = []
        
        import re
        for rule_name, rule in self.rules.items():
            if not rule.enabled:
                continue
            
            try:
                if re.search(rule.condition, code, re.MULTILINE):
                    violations.append({
                        "rule": rule_name,
                        "description": rule.description,
                        "action": rule.action,
                        "priority": rule.priority
                    })
            except re.error:
                pass
        
        return sorted(violations, key=lambda x: x["priority"], reverse=True)

