from .db import engine
from .models import Lead, LeadAnalysis
from .services.ai_service import AIService
from .services.scraper_service import WebScraperService
from .services.email_service import email_service
from .config import settings
from sqlmodel import Session
import json
import logging
import datetime as dt
import re

# Create service instances for task use
ai_service = AIService()
scraper_service = WebScraperService()

async def analyze_lead_task(lead_id: int):
    """
    Background task to analyze a lead's website.
    Coordinates scraping and AI analysis.
    """
    print(f"Starting AI analysis task for lead {lead_id}")
    
    with Session(engine) as session:
        lead = session.get(Lead, lead_id)
        if not lead or not lead.website:
            print(f"Skipping analysis for lead {lead_id}: No website URL.")
            return

        # Update status to analyzing
        lead.ai_status = "analyzing"
        lead.updated_at = dt.datetime.utcnow()
        session.add(lead)
        session.commit()
        session.refresh(lead)

        try:
            # 1. Fetch content
            print(f"Scraping website: {lead.website}")
            content = await scraper_service.fetch_page_content(lead.website)
            
            if not content or content.startswith("Error"):
                print(f"Scrape failed for {lead.name}: {content}")
                lead.ai_status = "failed"
                session.add(lead)
                session.commit()
                return

            # 2. AI Analysis
            print(f"Analyzing content for {lead.name} (length: {len(content)} characters)...")
            
            # --- SCRAPER DISCOVERY (Direct Extraction) ---
            scraper_emails = []
            if "[Deep Email Discovery:" in content:
                match = re.search(r'\[Deep Email Discovery: (.*?)\]', content)
                if match:
                    scraper_emails = [e.strip() for e in match.group(1).split(",") if "@" in e]
                    print(f"Scraper found emails: {scraper_emails}")
            
            # Save any found emails immediately as fallback
            if scraper_emails and not lead.contact_email:
                lead.contact_email = scraper_emails[0]
                session.add(lead)
                session.commit()
                print(f"Direct Save (Scraper): {lead.contact_email}")

            analysis_data = await ai_service.analyze_website(lead.name, content)
            print(f"Raw AI Result for {lead.name}: {json.dumps(analysis_data, indent=2)}")

            if "error" not in analysis_data:
                # Create Analysis record
                analysis = LeadAnalysis(
                    lead_id=lead.id,
                    tech_stack=analysis_data.get("tech_stack", []),
                    ux_assessment=analysis_data.get("ux_assessment"),
                    mobile_friendly=analysis_data.get("mobile_friendly"),
                    business_insight=analysis_data.get("business_insight"),
                    detailed_analysis=analysis_data.get("ux_assessment"), # Temporary mapping
                    ai_confidence=0.85 # Placeholder
                )
                session.add(analysis)

                # Update Lead record with AI findings (AI might find more specific ones)
                lead.ai_score = analysis_data.get("score")
                lead.ai_grade = analysis_data.get("grade")
                
                # Robust email extraction with fallback
                raw_email = analysis_data.get("contact_email") or analysis_data.get("email")
                
                if raw_email and "@" in str(raw_email):
                    lead.contact_email = str(raw_email).strip().lower()
                    print(f"AI discovered email: {lead.contact_email}")
                elif scraper_emails and not lead.contact_email:
                    lead.contact_email = scraper_emails[0]
                    print(f"Fallback to scraper email: {lead.contact_email}")

                lead.ai_tags = analysis_data.get("tech_stack", [])[:5]
                lead.ai_status = "completed"
                lead.status = "analyzed"
                print(f"Analysis successfully completed for {lead.name}")

                # 3. Generate Email
                print(f"Generating personalized email for {lead.name}...")
                lead_dict = lead.model_dump()
                email_content = await ai_service.generate_outreach_email(lead_dict, analysis_data)
                
                analysis.generated_email = email_content
                analysis.email_subjects = [f"Inquiry regarding {lead.name}'s Digital Presence"]
                
                # 4. Generate Poster Data
                print(f"Generating marketing poster for {lead.name}...")
                poster_data = await ai_service.generate_poster_data(lead_dict, analysis_data)
                analysis.poster_description = json.dumps(poster_data)
                
                session.add(analysis)
                print(f"Marketing content generation completed for {lead.name}")
            else:
                print(f"AI error for {lead.name}: {analysis_data.get('error')}")
                lead.ai_status = "failed"

            lead.updated_at = dt.datetime.utcnow()
            session.add(lead)
            session.commit()

        except Exception as e:
            print(f"Unexpected error in analysis task for lead {lead_id}: {e}")
            lead.ai_status = "failed"
            lead.updated_at = dt.datetime.utcnow()
            session.add(lead)
            session.commit()
