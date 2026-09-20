"""Email delivery for verification / password-reset links.

Development (SMTP_HOST empty): the message is written to data/outbox/<ts>.eml
and the action link is logged - no external service needed, Mailpit can also
be attached by setting SMTP_HOST=mailpit SMTP_PORT=1025 in compose.

Production: set SMTP_HOST/PORT/USER/PASSWORD/TLS in the environment.
Credentials are never hardcoded.
"""

import logging
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formatdate
from pathlib import Path

from ..config import settings

logger = logging.getLogger("fantom.email")

OUTBOX_DIR = Path(settings.DATASET_RAW_DIR).parent / "outbox"


def _render_html(action: str, link: str, minutes: int) -> str:
    return f"""\
<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto">
  <h2 style="color:#11141B">FANTOM &middot; {action}</h2>
  <p>Use the button below within <strong>{minutes} minutes</strong>.
     If you did not request this, you can ignore this email.</p>
  <p style="margin:24px 0">
    <a href="{link}" style="background:#159A62;color:#fff;padding:12px 22px;
       border-radius:8px;text-decoration:none;font-weight:bold">{action}</a>
  </p>
  <p style="color:#64748b;font-size:12px">Or paste this link into your browser:<br>
     <a href="{link}">{link}</a></p>
  <hr style="border:none;border-top:1px solid #e2e8f0">
  <p style="color:#94a3b8;font-size:11px">FANTOM Industrial Decision Support -
     advisory only; never controls machinery.</p>
</div>"""


def send_email(to: str, subject: str, html: str) -> None:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to
    msg["Date"] = formatdate(localtime=False)
    msg.set_content("Enable HTML view to see this message.")
    msg.add_alternative(html, subtype="html")

    if not settings.SMTP_HOST:
        # Development outbox: inspectable .eml files, no network needed.
        OUTBOX_DIR.mkdir(parents=True, exist_ok=True)
        out = OUTBOX_DIR / f"{__import__('datetime').datetime.now().strftime('%Y%m%dT%H%M%S%f')}.eml"
        out.write_bytes(bytes(msg))
        logger.info("[dev-outbox] wrote %s (to=%s subject=%r)", out, to, subject)
        return

    try:
        if settings.SMTP_TLS:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
            try:
                server.starttls(context=ssl.create_default_context())
            except smtplib.SMTPException:
                logger.warning("STARTTLS not offered by %s; continuing without TLS", settings.SMTP_HOST)
        if settings.SMTP_USER:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        logger.info("email sent to %s via %s:%s", to, settings.SMTP_HOST, settings.SMTP_PORT)
    except Exception:
        # Never leak SMTP errors to the API caller; log for operators.
        logger.exception("SMTP delivery failed (to=%s). Dev fallback: writing to outbox.", to)
        OUTBOX_DIR.mkdir(parents=True, exist_ok=True)
        out = OUTBOX_DIR / f"failed_{__import__('datetime').datetime.now().strftime('%Y%m%dT%H%M%S%f')}.eml"
        out.write_bytes(bytes(msg))


def send_verification_email(to: str, link: str, minutes: int = 60 * 24) -> None:
    send_email(to, "Verify your FANTOM account", _render_html("Verify email", link, minutes))


def send_password_reset_email(to: str, link: str, minutes: int = 60) -> None:
    send_email(to, "Reset your FANTOM password", _render_html("Reset password", link, minutes))
