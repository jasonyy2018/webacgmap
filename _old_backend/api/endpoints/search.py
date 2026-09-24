from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
import os
from ...models import Lead
from ...config import settings
from ...services.maps_service import MapsService
from ...db import get_session
from ...tasks import analyze_lead_task

# Service instance for the router
maps_service = MapsService()

router = APIRouter()

@router.post("")
async def search_leads(
    query: str, 
    location: Optional[str] = None, 
    background_tasks: BackgroundTasks = None, 
    session: Session = Depends(get_session)
):
    try:
        print(f"Executing search: query='{query}', location='{location}'")
        results = await maps_service.search_places(query, location)
        print(f"Search results received: {len(results)} leads")
    except Exception as e:
        print(f"Error in maps_service.search_places: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Maps search failed: {str(e)}")
    
    saved_leads = []
    for r in results:
        try:
            # Check if lead already exists
            existing = session.exec(select(Lead).where(Lead.place_id == r['place_id'])).first()
            if not existing:
                # Ensure required fields have defaults if missing from API
                lead = Lead(
                    name=r.get('name') or "Unknown Business",
                    address=r.get('address'),
                    website=r.get('website'),
                    phone=r.get('phone'),
                    rating=r.get('rating'),
                    place_id=r.get('place_id') or f"temp_{os.urandom(8).hex()}",
                    search_query=query,
                    search_location=location,
                    raw_data=r
                )
                session.add(lead)
                session.commit()
                session.refresh(lead)
                saved_leads.append(lead)
                
                # Trigger AI analysis if website exists
                if lead.website and background_tasks:
                    background_tasks.add_task(analyze_lead_task, lead.id)
            else:
                saved_leads.append(existing)
        except Exception as e:
            print(f"Error saving lead {r.get('name')}: {e}")
            session.rollback()
            continue # Skip this lead and continue with others
            
    return saved_leads
