from ..config import settings
import googlemaps
import os
from typing import List, Dict

class MapsService:
    def __init__(self):
        self.api_key = settings.google_api_key
        try:
            self.gmaps = googlemaps.Client(key=self.api_key) if self.api_key else None
        except Exception as e:
            print(f"Warning: Maps Service failed to initialize: {e}")
            self.gmaps = None

    async def search_places(self, query: str, location: str = None) -> List[Dict]:
        if not self.gmaps:
            print("Maps Service not available - returning empty results.")
            return []
        
        try:
            # Simplified search logic
            print(f"Searching for: {query} in {location}")
            results = self.gmaps.places(query=f"{query} in {location}" if location else query)
            print(f"Found {len(results.get('results', []))} results")
            
            leads = []
            for place in results.get('results', []):
                place_id = place.get('place_id')
                details = self._get_place_details(place_id)
                print(f"Details for {place.get('name')}: {details.keys()}")
                leads.append({
                    "name": place.get('name'),
                    "address": place.get('formatted_address'),
                    "place_id": place_id,
                    "rating": place.get('rating'),
                    "website": details.get('website'),
                    "phone": details.get('formatted_phone_number') or details.get('international_phone_number')
                })
            return leads
        except Exception as e:
            print(f"Error searching places: {e}")
            import traceback
            traceback.print_exc()
            return []

    def _get_place_details(self, place_id: str) -> Dict:
        if not self.gmaps:
            return {}
        try:
            # Requesting basic and contact fields
            fields = ['name', 'website', 'formatted_phone_number', 'international_phone_number']
            details = self.gmaps.place(place_id=place_id, fields=fields)
            return details.get('result', {})
        except Exception as e:
            print(f"Error getting place details {place_id}: {e}")
            return {}
