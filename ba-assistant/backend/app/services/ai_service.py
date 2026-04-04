import json
import logging
import re
from pathlib import Path
from typing import Optional

from jinja2 import Environment, FileSystemLoader, TemplateNotFound, select_autoescape

from app.core.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

_PROMPT_INJECTION_PATTERNS = [
    r"(?i)ignore\s+(previous|all|above)\s+(instructions|rules|prompts)",
    r"(?i)you\s+are\s+now\s+(a|an|no\s+longer)",
    r"(?i)system\s*:\s*",
    r"(?i)<\|.*?\|>",
    r"(?i)\[.*?system.*?\]",
    r"(?i)disregard\s+(all|previous|earlier)\s+(instructions|rules)",
    r"(?i)forget\s+(all|your)\s+(previous|earlier)\s+(instructions|rules)",
]

settings = get_settings()

# Absolute path so templates are found regardless of the process working directory
_PROMPTS_DIR = Path(__file__).parent.parent.parent / "prompts"

env = Environment(
    loader=FileSystemLoader(str(_PROMPTS_DIR)),
    autoescape=select_autoescape(["html", "xml"]),
)

_llm = None  # Lazily initialised on first AI call


def _get_llm():
    global _llm
    if _llm is None:
        from langchain_google_genai import ChatGoogleGenerativeAI

        _llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=settings.gemini_api_key,
            temperature=0.7,
            max_tokens=4000,
        )
    return _llm


class AIService:
    def load_prompt(self, template_name: str, **kwargs) -> str:
        sanitized = {k: self._sanitize_input(v) if isinstance(v, str) else v for k, v in kwargs.items()}
        try:
            template = env.get_template(f"{template_name}.j2")
            return template.render(**sanitized)
        except TemplateNotFound:
            logger.warning("Prompt template '%s.j2' not found in %s, using built-in fallback", template_name, _PROMPTS_DIR)
            return self._get_default_prompt(template_name, **sanitized)
        except Exception as exc:
            logger.error("Error rendering template '%s.j2': %s", template_name, exc, exc_info=True)
            return self._get_default_prompt(template_name, **sanitized)

    def _sanitize_input(self, text: str) -> str:
        text = text.strip()
        for pattern in _PROMPT_INJECTION_PATTERNS:
            text = re.sub(pattern, "[FILTERED]", text)
        return text

    def _get_default_prompt(self, template_name: str, **kwargs) -> str:
        defaults = {
            "elicitation_questions": self._elicitation_questions_prompt(**kwargs),
            "brd_generator": self._brd_generator_prompt(**kwargs),
            "user_stories": self._user_stories_prompt(**kwargs),
            "process_map_analyze": self._process_map_prompt(**kwargs),
            "uat_checklist": self._uat_checklist_prompt(**kwargs),
            "scope_wizard": self._scope_wizard_prompt(**kwargs),
            "ambiguity_check": self._ambiguity_check_prompt(**kwargs),
            "acceptance_criteria": self._acceptance_criteria_prompt(**kwargs),
        }
        return defaults.get(template_name, "Generate content based on: " + str(kwargs))

    async def generate(self, prompt: str, format_json: bool = False) -> str:
        llm = _get_llm()
        if format_json:
            from langchain.output_parsers import JsonOutputParser

            parser = JsonOutputParser()
            chain = llm | parser
            response = await chain.ainvoke(prompt)
            return json.dumps(response, indent=2)
        else:
            response = await llm.ainvoke(prompt)
            return response.content

    async def generate_elicitation_questions(
        self,
        project_name: str,
        project_description: str,
        stakeholders: Optional[str] = None,
    ) -> str:
        prompt = self.load_prompt(
            "elicitation_questions",
            project_name=project_name,
            project_description=project_description,
            stakeholders=stakeholders or "Not specified",
        )
        return await self.generate(prompt, format_json=True)

    async def generate_brd(
        self,
        project_name: str,
        project_description: str,
        requirements: str,
        scope_in: Optional[str] = None,
        scope_out: Optional[str] = None,
    ) -> str:
        prompt = self.load_prompt(
            "brd_generator",
            project_name=project_name,
            project_description=project_description,
            requirements=requirements,
            scope_in=scope_in or "Not specified",
            scope_out=scope_out or "Not specified",
        )
        return await self.generate(prompt)

    async def generate_user_stories(
        self,
        project_name: str,
        requirements: str,
        user_personas: Optional[str] = None,
    ) -> str:
        prompt = self.load_prompt(
            "user_stories",
            project_name=project_name,
            requirements=requirements,
            user_personas=user_personas or "Not specified",
        )
        return await self.generate(prompt, format_json=True)

    async def generate_acceptance_criteria(
        self,
        user_stories: str,
    ) -> str:
        prompt = self.load_prompt(
            "acceptance_criteria",
            user_stories=user_stories,
        )
        return await self.generate(prompt, format_json=True)

    async def analyze_process_map(
        self,
        process_name: str,
        process_steps: str,
    ) -> str:
        prompt = self.load_prompt(
            "process_map_analyze",
            process_name=process_name,
            process_steps=process_steps,
        )
        return await self.generate(prompt)

    async def generate_uat_checklist(
        self,
        requirements: str,
        user_stories: str,
    ) -> str:
        prompt = self.load_prompt(
            "uat_checklist",
            requirements=requirements,
            user_stories=user_stories,
        )
        return await self.generate(prompt, format_json=True)

    async def generate_scope_wizard(
        self,
        project_name: str,
        project_description: str,
        initial_scope: str,
    ) -> str:
        prompt = self.load_prompt(
            "scope_wizard",
            project_name=project_name,
            project_description=project_description,
            initial_scope=initial_scope,
        )
        return await self.generate(prompt)

    async def check_ambiguity(
        self,
        requirements: str,
    ) -> str:
        prompt = self.load_prompt(
            "ambiguity_check",
            requirements=requirements,
        )
        return await self.generate(prompt, format_json=True)

    def _elicitation_questions_prompt(self, **kwargs) -> str:
        return f"""You are a Business Analysis expert helping to conduct stakeholder interviews.
Generate 10-15 structured interview questions for a new project.

Project Name: {kwargs.get('project_name')}
Project Description: {kwargs.get('project_description')}
Stakeholders: {kwargs.get('stakeholders')}

Generate questions organized by these categories:
1. Business Context & Goals
2. User Needs & Expectations
3. Current Pain Points
4. Success Criteria
5. Constraints & Dependencies

Return as JSON array with format:
[{{"category": "string", "question": "string", "rationale": "string"}}]"""

    def _brd_generator_prompt(self, **kwargs) -> str:
        return f"""Generate a comprehensive Business Requirements Document (BRD) for the following project:

Project Name: {kwargs.get('project_name')}
Project Description: {kwargs.get('project_description')}
Requirements: {kwargs.get('requirements')}
Scope In: {kwargs.get('scope_in')}
Scope Out: {kwargs.get('scope_out')}

Include these sections:
1. Executive Summary
2. Business Objectives
3. Stakeholder Requirements
4. Functional Requirements
5. Non-Functional Requirements
6. Business Rules
7. Assumptions & Dependencies
8. Risks & Mitigation

Format as professional Markdown document."""

    def _user_stories_prompt(self, **kwargs) -> str:
        return f"""Generate user stories for the following project:

Project Name: {kwargs.get('project_name')}
Requirements: {kwargs.get('requirements')}
User Personas: {kwargs.get('user_personas')}

Generate 8-12 user stories following the format:
"As a [user], I want [goal], so that [benefit]"

Include acceptance criteria for each story.

Return as JSON array:
[{{"title": "string", "story": "string", "acceptance_criteria": ["string"]}}]"""

    def _acceptance_criteria_prompt(self, **kwargs) -> str:
        return f"""Generate detailed acceptance criteria for the following user stories:

User Stories:
{kwargs.get('user_stories')}

For each story, provide:
1. Pre-conditions
2. Happy path scenarios
3. Edge cases
4. Error scenarios

Return as JSON."""

    def _process_map_prompt(self, **kwargs) -> str:
        return f"""Analyze the following process for inefficiencies and improvements:

Process Name: {kwargs.get('process_name')}
Process Steps:
{kwargs.get('process_steps')}

Provide:
1. Identified inefficiencies
2. Bottlenecks
3. Recommended improvements
4. Suggested To-Be process flow

Format as Markdown."""

    def _uat_checklist_prompt(self, **kwargs) -> str:
        return f"""Generate a comprehensive UAT (User Acceptance Testing) checklist based on:

Requirements:
{kwargs.get('requirements')}

User Stories:
{kwargs.get('user_stories')}

Generate test cases covering:
1. Functional testing
2. Integration testing
3. Edge cases
4. Negative scenarios
5. Performance considerations

Return as JSON array:
[{{"test_case": "string", "scenario": "string", "expected_result": "string", "category": "string"}}]"""

    def _scope_wizard_prompt(self, **kwargs) -> str:
        return f"""Help define and refine the project scope for:

Project Name: {kwargs.get('project_name')}
Project Description: {kwargs.get('project_description')}
Initial Scope Notes: {kwargs.get('initial_scope')}

Provide:
1. Clear scope statement
2. In-scope items (detailed list)
3. Out-of-scope items (detailed list)
4. Key assumptions
5. Potential scope creep risks

Format as Markdown."""

    def _ambiguity_check_prompt(self, **kwargs) -> str:
        return f"""Analyze the following requirements for ambiguity, gaps, conflicts, and testability:

Requirements:
{kwargs.get('requirements')}

Provide analysis as a single JSON object with this exact structure:
{{
  "overall_quality_score": <integer 0-100>,
  "summary": "string — one paragraph executive summary of requirements quality",
  "ambiguous_terms": [{{"term": "string", "issue": "string", "suggestion": "string"}}],
  "gaps": [{{"area": "string", "missing_info": "string"}}],
  "conflicts": [{{"requirement_a": "string", "requirement_b": "string", "conflict_description": "string"}}],
  "testability_issues": [{{"requirement": "string", "issue": "string", "suggestion": "string"}}]
}}

Return only the JSON object, no markdown fences."""


ai_service = AIService()
