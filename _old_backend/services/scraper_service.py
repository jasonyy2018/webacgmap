import httpx
from bs4 import BeautifulSoup
import re
from typing import Dict, List, Optional
import urllib3

# Suppress insecure request warnings for self-signed certificates
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class WebScraperService:
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }

    def _extract_emails(self, html: str, text: str) -> List[str]:
        """Extracts emails from both HTML (mailto) and raw text."""
        # mailto links
        mailto_emails = re.findall(r'mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', html, re.I)
        # generic regex for text
        text_emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
        return list(set(mailto_emails + text_emails))

    async def fetch_page_content(self, url: str, timeout: float = 15.0) -> str:
        """Fetches content from homepage and relevant contact pages."""
        if not url: return ""
        if not url.startswith(('http://', 'https://')): url = f"https://{url}"

        all_text = []
        all_emails = []
        visited_urls = {url}

        try:
            async with httpx.AsyncClient(timeout=timeout, follow_redirects=True, headers=self.headers, verify=False) as client:
                # 1. Fetch Homepage
                response = await client.get(url)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Extract from homepage
                home_text = self._clean_soup(soup)
                all_text.append(f"--- Homepage ---\n{home_text}")
                all_emails.extend(self._extract_emails(response.text, home_text))

                # 2. Find Contact/About links
                discovery_links = []
                for link in soup.find_all('a', href=True):
                    href = link['href'].lower()
                    link_text = link.get_text().lower()
                    if any(k in href or k in link_text for k in ['contact', 'about', 'reach', 'get-in-touch', 'support']):
                        full_url = str(response.url.join(link['href']))
                        if full_url.startswith(str(response.url)) and full_url not in visited_urls:
                            discovery_links.append(full_url)
                            visited_urls.add(full_url)
                
                # 3. Fetch up to 2 discovery links
                for d_url in discovery_links[:2]:
                    try:
                        d_res = await client.get(d_url, timeout=10.0)
                        if d_res.status_code == 200:
                            d_soup = BeautifulSoup(d_res.text, 'html.parser')
                            d_text = self._clean_soup(d_soup)
                            all_text.append(f"--- {d_url} ---\n{d_text}")
                            all_emails.extend(self._extract_emails(d_res.text, d_text))
                    except: continue

                # Aggregate
                unique_emails = list(set(all_emails))
                contact_info = f"[Deep Email Discovery: {', '.join(unique_emails)}]\n\n" if unique_emails else ""
                combined_text = "\n".join(all_text)
                
                return (contact_info + combined_text)[:15000]
        except Exception as e:
            print(f"Deep scraper error for {url}: {e}")
            return f"Error fetching content: {str(e)}"

    def _clean_soup(self, soup: BeautifulSoup) -> str:
        """Helper to clean soup and extract readable text."""
        for element in soup(["script", "style", "aside", "nav", "footer"]):
            element.extract()
        return re.sub(r'\s+', ' ', soup.get_text(separator=' ', strip=True))

    async def extract_metadata(self, url: str) -> Dict:
        """Extracts basic metadata from the page."""
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True, headers=self.headers, verify=False) as client:
                response = await client.get(url)
                soup = BeautifulSoup(response.text, 'html.parser')
                
                return {
                    "title": soup.title.string if soup.title else None,
                    "description": soup.find("meta", attrs={"name": "description"}).get("content") if soup.find("meta", attrs={"name": "description"}) else None,
                    "keywords": soup.find("meta", attrs={"name": "keywords"}).get("content") if soup.find("meta", attrs={"name": "keywords"}) else None
                }
        except:
            return {}
