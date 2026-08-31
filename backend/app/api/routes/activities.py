from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models.activity import Activity
from app.schemas.profile import ActivityRead

router = APIRouter(prefix="/api", tags=["activities"])


@router.get("/activities", response_model=list[ActivityRead])
def list_activities(db: Session = Depends(get_db)) -> list[Activity]:
    return db.query(Activity).order_by(Activity.name).all()
