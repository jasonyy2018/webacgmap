import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from ..config import settings

class EmailService:
    def __init__(self):
        self.smtp_server = settings.smtp_server
        self.smtp_port = settings.smtp_port
        self.smtp_username = settings.smtp_username
        self.smtp_password = settings.smtp_password
        self.sender_email = settings.sender_email

    async def send_email(self, to_email: str, subject: str, body: str) -> bool:
        """
        Sends an email using configured SMTP settings.
        In development mode or if credentials are missing, it logs the email instead.
        """
        print(f"--- Sending Email ---")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(f"Body: {body[:100]}...")
        
        if not all([self.smtp_server, self.smtp_port, self.smtp_username, self.smtp_password]):
            print("SMTP configuration missing. Email logged but not actually sent.")
            return True

        try:
            msg = MIMEMultipart()
            msg['From'] = self.sender_email
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))

            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            server.send_message(msg)
            server.quit()
            
            print(f"Email successfully sent to {to_email}")
            return True
        except Exception as e:
            print(f"Failed to send email to {to_email}: {e}")
            return False

email_service = EmailService()
