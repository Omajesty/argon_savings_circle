import os
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.bank import router as bank_router
from app.routes.circles import router as circles_router
from app.routes.contributions import router as contributions_router
from app.routes.payouts import router as payouts_router
from app.services.db import create_db_and_tables, seed_demo_users

app = FastAPI(
    title="Ajo — The Savings Circle",
    description=(
        "Weekly contributions, a pot that goes to whoever's turn it is, "
        "and a bank robot that confirms transfers with a key, not a password."
    ),
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]
if extra := os.getenv("FRONTEND_ORIGIN"):
    origins.extend(origin.strip() for origin in extra.split(",") if origin.strip())

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    seed_demo_users()


app.include_router(auth_router)
app.include_router(circles_router)
app.include_router(contributions_router)
app.include_router(payouts_router)
app.include_router(bank_router)
