from datetime import datetime
from typing import Optional, List, Dict
from sqlmodel import SQLModel, Field, Relationship, JSON, Column, Text
import datetime as dt

class LeadBase(SQLModel):
    name: str = Field(index=True)
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    contact_email: Optional[str] = None
    rating: Optional[float] = None
    place_id: str = Field(unique=True, index=True)
    
    # Search Context
    search_query: Optional[str] = None
    search_location: Optional[str] = None
    
    # Business Profile
    industry: Optional[str] = None
    status: str = Field(default="pending") # pending, analyzed, contacted, ignored
    
    # AI Scoring & Analysis Summary
    ai_score: Optional[int] = None # 0-100
    ai_grade: Optional[str] = None # A, B, C
    ai_status: str = Field(default="pending") # pending, analyzing, completed, failed
    ai_tags: List[str] = Field(default=[], sa_column=Column(JSON))

class Lead(LeadBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=dt.datetime.utcnow)
    updated_at: datetime = Field(default_factory=dt.datetime.utcnow)
    
    # Tracking
    contact_attempts: int = Field(default=0)
    last_contacted: Optional[datetime] = None
    
    # Raw Data for backup/debug
    raw_data: Optional[Dict] = Field(default={}, sa_column=Column(JSON))
    
    # Relationships
    analysis: Optional["LeadAnalysis"] = Relationship(back_populates="lead")

class LeadAnalysis(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    lead_id: int = Field(foreign_key="lead.id")
    
    # Analysis Details
    tech_stack: List[str] = Field(default=[], sa_column=Column(JSON))
    ux_assessment: Optional[str] = None
    mobile_friendly: Optional[bool] = None
    business_insight: Optional[str] = None
    detailed_analysis: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # AI Confidence
    ai_confidence: Optional[float] = None
    
    # Personalized Email
    generated_email: Optional[str] = Field(default=None, sa_column=Column(Text))
    email_subjects: List[str] = Field(default=[], sa_column=Column(JSON))
    
    # Marketing Assets
    poster_description: Optional[str] = Field(default=None, sa_column=Column(Text))
    poster_url: Optional[str] = None
    
    lead: Lead = Relationship(back_populates="analysis")
