from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session, select, delete
from typing import List
from ...models import Lead, LeadAnalysis
from ...db import get_session
from ...services.email_service import email_service
from ...tasks import analyze_lead_task

router = APIRouter()

@router.post("/{lead_id}/analyze")
async def trigger_manual_analysis(
    lead_id: int, 
    background_tasks: BackgroundTasks, 
    session: Session = Depends(get_session)
):
    lead = session.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if not lead.website:
        raise HTTPException(status_code=400, detail="Lead has no website to analyze")
    
    # Reset status
    lead.ai_status = "pending"
    session.add(lead)
    session.commit()
    
    background_tasks.add_task(analyze_lead_task, lead.id)
    return {"status": "success", "message": "Analysis triggered"}



@router.get("", response_model=List[Lead])
def get_leads(session: Session = Depends(get_session)):
    leads = session.exec(select(Lead)).all()
    return leads

@router.get("/{lead_id}", response_model=Lead)
def get_lead(lead_id: int, session: Session = Depends(get_session)):
    lead = session.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.post("/{lead_id}/send-email")
async def send_lead_email(lead_id: int, session: Session = Depends(get_session)):
    lead = session.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if not lead.contact_email:
        raise HTTPException(status_code=400, detail="Lead has no contact email")
        
    analysis = session.exec(select(LeadAnalysis).where(LeadAnalysis.lead_id == lead_id)).first()
    if not analysis or not analysis.generated_email:
        raise HTTPException(status_code=400, detail="No generated email found for this lead")
    
    subject = analysis.email_subjects[0] if analysis.email_subjects else "Business Inquiry"
    success = await email_service.send_email(lead.contact_email, subject, analysis.generated_email)
    
    if success:
        lead.status = "contacted"
        lead.contact_attempts += 1
        session.add(lead)
        session.commit()
        return {"status": "success", "message": "Email sent"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send email")

@router.patch("/{lead_id}/analysis")
def update_lead_analysis(lead_id: int, analysis_update: dict, session: Session = Depends(get_session)):
    analysis = session.exec(select(LeadAnalysis).where(LeadAnalysis.lead_id == lead_id)).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    if "generated_email" in analysis_update:
        analysis.generated_email = analysis_update["generated_email"]
    
    session.add(analysis)
    session.commit()
    return {"status": "success"}

@router.post("/{lead_id}/refine-email")
async def refine_lead_email(lead_id: int, request: dict, session: Session = Depends(get_session)):
    analysis = session.exec(select(LeadAnalysis).where(LeadAnalysis.lead_id == lead_id)).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    instruction = request.get("instruction")
    if not instruction:
        raise HTTPException(status_code=400, detail="Instruction is required")
        
    from ...services.ai_service import AIService
    ai_service = AIService()
    
    refined_content = await ai_service.refine_email_content(analysis.generated_email, instruction)
    analysis.generated_email = refined_content
    session.add(analysis)
    session.commit()
    
    return {"status": "success", "refined_email": refined_content}

@router.get("/{lead_id}/poster-data")
def get_poster_data(lead_id: int, session: Session = Depends(get_session)):
    analysis = session.exec(select(LeadAnalysis).where(LeadAnalysis.lead_id == lead_id)).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    import json
    try:
        data = json.loads(analysis.poster_description) if analysis.poster_description else {}
        return data
    except:
        return {}

@router.delete("")
def delete_all_leads(session: Session = Depends(get_session)):
    print("Clearing all leads and analyses...")
    try:
        # Delete using batch operations for better performance and reliability
        session.exec(delete(LeadAnalysis))
        session.exec(delete(Lead))
        session.commit()
        
        # Verify
        count = session.exec(select(Lead)).first()
        if count:
            print(f"Warning: Leads still exist after deletion check!")
        
        print("Database cleared successfully.")
        return {"status": "success", "message": "All leads and analyses cleared"}
    except Exception as e:
        print(f"Error clearing database: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
