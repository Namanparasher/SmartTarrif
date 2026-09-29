from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
import bcrypt
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    phone = Column(String(20), default="")
    role = Column(String(20), default="customer")  # 'customer' | 'admin'
    avatar = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_password(self, raw_password: str):
        salt = bcrypt.gensalt()
        self.password = bcrypt.hashpw(raw_password.encode("utf-8"), salt).decode("utf-8")

    def verify_password(self, raw_password: str) -> bool:
        return bcrypt.checkpw(raw_password.encode("utf-8"), self.password.encode("utf-8"))

    def to_dict(self):
        return {
            "_id": str(self.id),
            "name": self.name,
            "email": self.email,
            "phone": self.phone or "",
            "role": self.role,
            "avatar": self.avatar,
            "isActive": self.is_active,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
