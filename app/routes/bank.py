from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlmodel import Session, select

from app.models.contribution import Contribution
from app.models.ledger import LedgerEntry
from app.schemas.bank import BankConfirmIn, LedgerOut
from app.schemas.contributions import ContributionOut
from app.services.db import engine, get_session
from app.services.dependency import require_bank_robot

router = APIRouter(prefix="/bank", tags=["Bank"])


def write_ledger_line(
    contribution_id: int,
    circle_id: int,
    user_id: int,
    amount: int,
    week: int,
) -> None:
    """Runs after the response is already gone. Needs its own session
    because the request session has closed."""
    with Session(engine) as session:
        session.add(
            LedgerEntry(
                contribution_id=contribution_id,
                circle_id=circle_id,
                user_id=user_id,
                amount=amount,
                week=week,
            )
        )
        session.commit()


@router.post(
    "/confirm",
    response_model=ContributionOut,
    status_code=status.HTTP_200_OK,
)
def confirm_transfer(
    body: BankConfirmIn,
    background_tasks: BackgroundTasks,
    session: Annotated[Session, Depends(get_session)],
    api_key: Annotated[str, Depends(require_bank_robot)],
) -> Contribution:
    """A member's JWT cannot get in here. Only the key."""
    contribution = session.get(Contribution, body.contribution_id)
    if contribution is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribution not found",
        )

    if contribution.confirmed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This contribution is already confirmed",
        )

    contribution.confirmed = True
    session.add(contribution)
    session.commit()
    session.refresh(contribution)

    background_tasks.add_task(
        write_ledger_line,
        contribution.id,
        contribution.circle_id,
        contribution.user_id,
        contribution.amount,
        contribution.week,
    )
    return contribution


@router.get(
    "/ledger",
    response_model=list[LedgerOut],
    status_code=status.HTTP_200_OK,
)
def read_ledger(
    session: Annotated[Session, Depends(get_session)],
    api_key: Annotated[str, Depends(require_bank_robot)],
) -> list[LedgerEntry]:
    return session.exec(select(LedgerEntry).order_by(LedgerEntry.id)).all()
