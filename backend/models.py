from pydantic import BaseModel


class Card(BaseModel):
    id: str
    title: str
    details: str


class Column(BaseModel):
    id: str
    title: str
    cardIds: list[str]


class BoardData(BaseModel):
    columns: list[Column]
    cards: dict[str, Card]


class BoardInfo(BaseModel):
    id: int
    name: str
    created_at: str


class AIResponse(BaseModel):
    message: str
    board_update: BoardData | None = None
