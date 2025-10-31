# Model-Driven Architecture with Smithy

This document outlines the architectural principles of `code-audit-ts`. Our philosophy has evolved from being MCP-inspired to a formal **Model-Driven Architecture (MDA)**, with **Smithy** as its cornerstone.

Our goal is to create a robust and reliable tool by ensuring that all functionality is governed by a strict, unambiguous, and formally defined model. This approach serves as a critical safeguard, particularly when working with AI, to prevent "hallucinations" or deviations from the intended behavior.

## The Core Principle: The Model is the Law

The central tenet of our architecture is that the **Smithy model is the ultimate source of truth**. Our codebase (`the core`) exists to implement the contract defined in this model (`the shell`).

-   **`models/code-audit.smithy`**: This file is our formal contract. It defines the `CodeAuditTs` service, its operations (our "Tools"), and the precise structure of their inputs and outputs. It is the law.
-   **TypeScript Implementation**: Our source code in `src/` is the "good faith" implementation of the contract defined in the Smithy model.

This strict separation of concerns ensures that the tool's capabilities are not defined by its implementation, but by its model.

## Why Smithy?

We chose Smithy as the language for our model for several reasons:

1.  **Formal and Unambiguous:** Smithy provides a strict, protocol-agnostic language for defining services and data structures. This eliminates ambiguity.
2.  **Reliability and Trust:** By defining our service in a formal model, we create a strong foundation of trust. Users (and AI agents) can rely on the model as a guarantee of the tool's behavior.
3.  **Tooling Ecosystem:** Although we do not currently use Smithy for code generation, adopting it positions us to leverage the rich ecosystem of Smithy tools in the future, including validation, documentation generation, and SDK creation.
4.  **A Guardrail for Development:** It enforces a disciplined development process. Any new feature must begin with an update to the `.smithy` model, ensuring that we always think about the formal contract before writing any implementation code.

## The Build System: A Declaration of Intent

We have integrated the **Smithy Gradle Plugin** into our project by adding `build.gradle.kts` and `smithy-build.json`. While we do not run a Gradle build in our CI/CD pipeline, the presence of these files serves as a powerful **declaration of intent**. They signal to any developer that this is a Smithy-driven project and that the model is a first-class citizen.

## How to Add or Modify a Tool

All changes must be model-first.

1.  **Update the Model:** Propose a change to `models/code-audit.smithy`. This could be adding a new operation, adding a field to an existing structure, etc.
2.  **Implement the Change:** Once the model change is approved, update the TypeScript source code in `src/` to implement the new contract.
3.  **Update Tests:** Add or modify tests to validate the new implementation.
4.  **Update `smithy-build.json` (if necessary):** If the package version or other metadata changes, update the configuration.

By enforcing this workflow, we ensure that **our core remains true to its shell**, creating a complete and trustworthy tool.
