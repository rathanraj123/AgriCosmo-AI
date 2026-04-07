import httpx
import logging
import asyncio
from typing import List, Dict, Any, Tuple
from app.core.config import settings
from app.core.exceptions import AIServiceError
from app.schemas.chatbot import ChatMessage, ChatResponse
import groq

logger = logging.getLogger(__name__)

class CircuitBreaker:
    """A simplistic circuit breaker to guard failing downstream dependencies."""
    def __init__(self, failure_threshold: int = 3, recovery_timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        
        self.failure_count = 0
        self.last_failure_time = 0
        self.state = "CLOSED" # CLOSED, OPEN, HALF-OPEN

    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = asyncio.get_event_loop().time()
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"
            logger.error("Circuit Breaker OPEN - Routing traffic away from downstream service.")

    def record_success(self):
        self.failure_count = 0
        self.state = "CLOSED"

    def can_execute(self) -> bool:
        if self.state == "CLOSED":
            return True
        if self.state == "OPEN":
            # Check if recovery timeout has elapsed
            if asyncio.get_event_loop().time() - self.last_failure_time > self.recovery_timeout:
                self.state = "HALF-OPEN"
                return True
            return False
        # HALF-OPEN allows 1 request to pass to test stability
        return True

class ChatbotService:
    def __init__(self):
        self.groq_api_key = settings.GROQ_API_KEY
        self.hf_api_key = settings.HUGGINGFACE_API_KEY
        self.groq_client = groq.Groq(api_key=self.groq_api_key, max_retries=1) if self.groq_api_key else None
        
        # Guard Groq with a circuit breaker since it's the primary target
        self.groq_breaker = CircuitBreaker(failure_threshold=3, recovery_timeout=120)

    async def get_response(self, messages: List[ChatMessage], context: Dict[str, Any] = None) -> ChatResponse:
        system_prompt = {
            "role": "system",
            "content": "You are AgriCosmo AI, an expert agricultural and cosmetic intelligence assistant. You help users with plant diseases, crop recommendations, and plant-based skincare advice."
        }
        
        formatted_messages = [system_prompt] + [{"role": m.role, "content": m.content} for m in messages]
        
        # 1. Try Groq API exclusively if Breaker is not OPEN
        if self.groq_client and self.groq_breaker.can_execute():
            try:
                # Wrap sync call in executor to avert blocking
                chat_completion = await asyncio.to_thread(
                    self.groq_client.chat.completions.create,
                    messages=formatted_messages,
                    model="llama-3.3-70b-versatile",
                    temperature=0.7,
                    max_tokens=1024,
                    timeout=5.0 # Strict timeout 5 seconds
                )
                self.groq_breaker.record_success()
                return ChatResponse(message=chat_completion.choices[0].message.content, provider="groq")
            except Exception as e:
                self.groq_breaker.record_failure()
                logger.warning(f"Groq API failed: {e}. Falling back to HuggingFace. Circuit breaches: {self.groq_breaker.failure_count}")

        # 2. Fallback to Hugging Face
        if self.hf_api_key:
            try:
                API_URL = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1"
                headers = {"Authorization": f"Bearer {self.hf_api_key}"}
                prompt_text = "\n".join([f"{m['role']}: {m['content']}" for m in formatted_messages]) + "\nassistant: "
                
                async with httpx.AsyncClient() as client:
                    # Retry logic internal (1 retry max)
                    for attempt in range(2):
                        try:
                            response = await client.post(
                                API_URL, 
                                headers=headers, 
                                json={"inputs": prompt_text, "parameters": {"max_new_tokens": 250}}, 
                                timeout=8.0 # Generous timeout for fallback
                            )
                            if response.status_code == 200:
                                result = response.json()
                                reply = result[0].get("generated_text", "").split("assistant: ")[-1].strip()
                                return ChatResponse(message=reply, provider="huggingface")
                            else:
                                raise AIServiceError(f"Status: {response.status_code}")
                        except httpx.TimeoutException:
                            if attempt == 1:
                                raise AIServiceError("HuggingFace timeout.")
            except Exception as e:
                logger.error(f"HuggingFace fallback failed: {e}. Triggering Final Rule-Based Fallback.")

        # 3. Final Fallback (Rule-based)
        return self._get_rule_based_response(messages)

    def _get_rule_based_response(self, messages: List[ChatMessage]) -> ChatResponse:
        last_message = messages[-1].content.lower()
        reply = "I'm sorry, my AI engines are currently offline. However, I am still AgriCosmo! "
        if "disease" in last_message or "sick" in last_message:
            reply += "Please use the 'Detect Disease' feature in the app to upload an image of your plant."
        elif "fertilizer" in last_message:
            reply += "For general crops, using a balanced NPK fertilizer is a good start. Make sure your soil pH is optimal."
        else:
            reply += "How can I help you with agriculture or cosmetic intelligence today?"
            
        return ChatResponse(message=reply, provider="rule-based")

chatbot_service = ChatbotService()
