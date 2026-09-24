from app.db import get_session
from app.models import Lead
from sqlmodel import select, Session, create_engine
from app.config import settings

engine = create_engine(settings.database_url)
with Session(engine) as session:
    try:
        leads = session.exec(select(Lead)).all()
        print(f"Successfully fetched {len(leads)} leads")
        for l in leads:
            print(f"- {l.name} ({l.place_id})")
    except Exception as e:
        print(f"DATABASE ERROR: {e}")
        import traceback
        traceback.print_exc()
