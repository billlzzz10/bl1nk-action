"""Default Model Configuration"""

from __future__ import annotations
from dataclasses import dataclass
from enum import Enum

class LLMProvider(str, Enum):
    AWS_BEDROCK = "aws_bedrock"
    OPENAI = "openai"

class EmbeddingProvider(str, Enum):
    COHERE = "cohere"
    VOYAGE = "voyage"
    HUGGINGFACE = "huggingface"

@dataclass
class LLMConfig:
    provider: LLMProvider = LLMProvider.AWS_BEDROCK
    model_id: str = "anthropic.claude-3-5-haiku-20241022-v1:0"
    region: str = "ap-southeast-1"
    temperature: float = 0.7
    max_tokens: int = 2000

@dataclass
class EmbeddingConfig:
    provider: EmbeddingProvider = EmbeddingProvider.COHERE
    model_id: str = "cohere.embed-multilingual-v3"
    dimension: int = 1024

@dataclass
class LocalModelConfig:
    model_name: str = "microsoft/minilm-l2-v2"
    device: str = "cuda"

class ModelConfig:
    def __init__(self):
        self.llm = LLMConfig()
        self.embedding = EmbeddingConfig()
        self.local_model = LocalModelConfig()
    
    def to_dict(self) -> dict:
        return {
            "llm": {
                "provider": self.llm.provider.value,
                "model_id": self.llm.model_id,
                "region": self.llm.region
            },
            "embedding": {
                "provider": self.embedding.provider.value,
                "model_id": self.embedding.model_id
            },
            "local_model": {
                "model_name": self.local_model.model_name,
                "device": self.local_model.device
            }
        }

DEFAULT_CONFIG = ModelConfig()
