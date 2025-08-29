from pydantic import BaseModel

class NavRead(BaseModel):
    id: int
    route:str
    name:str
