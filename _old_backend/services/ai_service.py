from ..config import settings
import google.generativeai as genai
import os
import json
from typing import Dict, List

class AIService:
    def __init__(self):
        api_key = settings.google_api_key
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-pro')
        else:
            self.model = None

    async def fetch_website_content(self, url: str) -> str:
        import httpx
        from bs4 import BeautifulSoup
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True, headers=headers, verify=False) as client:
                response = await client.get(url)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                # Remove script and style elements
                for script in soup(["script", "style"]):
                    script.extract()
                return soup.get_text(separator=' ', strip=True)[:10000] # Limit content size
        except Exception as e:
            print(f"Error fetching website {url}: {e}")
            return f"Error fetching content: {str(e)}"

    async def analyze_website(self, company_name: str, website_content: str) -> Dict:
        if not self.model:
            return {"error": "AI Service not configured"}

        prompt = f"""
        Analyze the following website content for a company named '{company_name}'.
        Goal: Determine if they need website development services and extract contact info.
        
        Content:
        {website_content[:10000]} 
        
        Provide a JSON response with:
        - tech_stack: list of detected technologies (CMS, JS frameworks, etc)
        - ux_assessment: brief assessment of design and user experience
        - mobile_friendly: boolean if it looks mobile friendly
        - business_insight: key business focus
        - contact_email: any professional contact email addresses found (Look closely at [Direct Email Discovery] if present)
        - score: 0-100 rating based on need for website services (100 = urgent need)
        - grade: A (Priority), B (Scale), C (Low)
        """
        
        response = self.model.generate_content(prompt)
        try:
            # Clean response if it contains markdown formatting
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            return {"error": f"Failed to parse AI response: {str(e)}", "raw": response.text}

    async def generate_outreach_email(self, lead_info: Dict, analysis_info: Dict) -> str:
        if not self.model:
            return "AI Service not configured"

        prompt = f"""
        Write a professional, personalized outreach email for a website development service.
        Client: {lead_info['name']}
        Website: {lead_info['website']}
        AI Insights: {json.dumps(analysis_info, indent=2)}
        
        The tone should be helpful and consultative, not salesy. Mention specific details from the insights.
        Return the email body text.
        """
        
        response = self.model.generate_content(prompt)
        return response.text.strip()

    async def refine_email_content(self, current_email: str, instruction: str) -> str:
        if not self.model:
            return current_email

        prompt = f"""
        Refine the following outreach email based on the instruction provided.
        Current Email:
        {current_email}

        Instruction: {instruction}
        
        Return only the refined email body text.
        """
        
        response = self.model.generate_content(prompt)
        return response.text.strip()

    async def generate_poster_data(self, lead_info: Dict, analysis_info: Dict) -> Dict:
        if not self.model:
            return {}

        prompt = f"""
        Create marketing poster data for a website development pitch to {lead_info['name']}.
        Analyze their status: {json.dumps(analysis_info, indent=2)}
        
        Provide a JSON response with:
        - title: A powerful marketing headline (e.g., "Elevate {lead_info['name']}'s Digital Presence")
        - subtitle: A compelling sub-headline
        - key_points: List of 3-4 specific technical or business improvements needed (short phrases)
        - call_to_action: A strong closing statement
        - theme_colors: {{"primary": "hex_color", "secondary": "hex_color"}}
        - style_vibe: (e.g., "Professional", "Boutique", "Modern", "Dynamic")
        """
        
        response = self.model.generate_content(prompt)
        try:
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            return {"error": f"Failed to parse poster data: {str(e)}", "raw": response.text}
