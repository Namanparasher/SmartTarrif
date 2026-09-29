from pydantic import BaseModel, Field
from typing import Optional, Union


class SubmitFeedbackRequest(BaseModel):
    recommendationId: Union[str, int]
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = ""

