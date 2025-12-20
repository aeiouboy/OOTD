"""
Centralized JSON Logging System for Product Scraping
"""
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List
import logging

from config import LOG_DIR, JSON_INDENT, OUTPUT_ENCODING

logger = logging.getLogger(__name__)


class ScrapingLogger:
    """JSON-based logging system for scraping sessions"""

    def __init__(self, session_id: str = None):
        """
        Initialize scraping logger

        Args:
            session_id: Optional session ID, will be generated if not provided
        """
        self.session_id = session_id or str(uuid.uuid4())
        self.log_dir = Path(LOG_DIR)
        self.log_dir.mkdir(parents=True, exist_ok=True)

        self.session_data = {
            "scraping_session_id": self.session_id,
            "start_time": None,
            "end_time": None,
            "total_duration_seconds": 0,
            "configuration": {},
            "summary": {
                "total_skus_scraped": 0,
                "successful_categories": 0,
                "failed_categories": 0,
                "validation_pass_rate": 0.0
            },
            "category_details": [],
            "worker_stats": [],
            "errors": []
        }

    def start_session(self, config: Dict):
        """
        Mark session start and log configuration

        Args:
            config: Configuration dictionary
        """
        self.session_data["start_time"] = datetime.utcnow().isoformat()
        self.session_data["configuration"] = config
        logger.info(f"Started scraping session: {self.session_id}")

    def end_session(self):
        """Mark session end and calculate duration"""
        self.session_data["end_time"] = datetime.utcnow().isoformat()

        # Calculate duration
        if self.session_data["start_time"] and self.session_data["end_time"]:
            start = datetime.fromisoformat(self.session_data["start_time"])
            end = datetime.fromisoformat(self.session_data["end_time"])
            self.session_data["total_duration_seconds"] = (end - start).total_seconds()

        logger.info(f"Ended scraping session: {self.session_id}")

    def add_category_result(self, category_data: Dict, validation_report: Dict = None):
        """
        Add category scraping result

        Args:
            category_data: Category data from scraper
            validation_report: Optional validation report
        """
        category_detail = {
            "category": category_data.get("category_name"),
            "skus_scraped": category_data.get("total_products", 0),
            "duration_seconds": category_data.get("scraping_duration_seconds", 0),
            "worker_id": category_data.get("worker_id"),
            "status": "completed"
        }

        if validation_report:
            category_detail["validation"] = {
                "pass_rate": validation_report.get("pass_rate", 0.0),
                "passed": validation_report.get("passed", 0),
                "failed": validation_report.get("failed", 0),
                "duplicates": validation_report.get("duplicate_skus", 0)
            }

        self.session_data["category_details"].append(category_detail)

        # Update summary
        self.session_data["summary"]["total_skus_scraped"] += category_detail["skus_scraped"]
        self.session_data["summary"]["successful_categories"] += 1

    def add_category_failure(self, category_name: str, error: str):
        """
        Add failed category

        Args:
            category_name: Name of category
            error: Error message
        """
        category_detail = {
            "category": category_name,
            "skus_scraped": 0,
            "duration_seconds": 0,
            "status": "failed",
            "error": error
        }

        self.session_data["category_details"].append(category_detail)
        self.session_data["summary"]["failed_categories"] += 1

        # Add to errors list
        self.add_error(category_name, error)

    def add_worker_stats(self, worker_stats: Dict):
        """
        Add worker statistics

        Args:
            worker_stats: Worker stats dictionary
        """
        self.session_data["worker_stats"].append(worker_stats)

    def add_error(self, context: str, error: str):
        """
        Add error to log

        Args:
            context: Error context (e.g., category name, worker ID)
            error: Error message
        """
        self.session_data["errors"].append({
            "context": context,
            "error": error,
            "timestamp": datetime.utcnow().isoformat()
        })

    def calculate_metrics(self):
        """Calculate final metrics"""
        # Calculate average validation pass rate
        validations = [
            cat.get("validation", {}).get("pass_rate", 0)
            for cat in self.session_data["category_details"]
            if "validation" in cat
        ]

        if validations:
            avg_pass_rate = sum(validations) / len(validations)
            self.session_data["summary"]["validation_pass_rate"] = avg_pass_rate

        # Calculate worker utilization
        worker_stats = self.session_data["worker_stats"]
        if worker_stats:
            total_duration = sum(w.get("duration_seconds", 0) for w in worker_stats)
            session_duration = self.session_data["total_duration_seconds"]

            if session_duration > 0:
                num_workers = len(worker_stats)
                max_possible_duration = session_duration * num_workers
                utilization = total_duration / max_possible_duration if max_possible_duration > 0 else 0

                self.session_data["summary"]["worker_utilization"] = utilization
                self.session_data["summary"]["worker_utilization_percent"] = f"{utilization:.1%}"

    def save(self) -> str:
        """
        Save log file to disk

        Returns:
            Path to saved log file
        """
        # Calculate final metrics
        self.calculate_metrics()

        # Generate filename with timestamp
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"scraping_session_{timestamp}.json"
        filepath = self.log_dir / filename

        try:
            with open(filepath, 'w', encoding=OUTPUT_ENCODING) as f:
                json.dump(self.session_data, f, ensure_ascii=False, indent=JSON_INDENT)

            logger.info(f"Saved session log: {filepath}")
            return str(filepath)

        except Exception as e:
            logger.error(f"Failed to save log file: {e}")
            return ""

    def get_session_data(self) -> Dict:
        """Get current session data"""
        return self.session_data

    def print_summary(self):
        """Print human-readable summary"""
        print("\n" + "="*60)
        print("SCRAPING SESSION SUMMARY")
        print("="*60)
        print(f"Session ID: {self.session_id}")
        print(f"Duration: {self.session_data['total_duration_seconds']:.2f}s")
        print(f"\nResults:")
        print(f"  Total SKUs: {self.session_data['summary']['total_skus_scraped']}")
        print(f"  Successful Categories: {self.session_data['summary']['successful_categories']}")
        print(f"  Failed Categories: {self.session_data['summary']['failed_categories']}")
        print(f"  Validation Pass Rate: {self.session_data['summary'].get('validation_pass_rate', 0):.2%}")

        if "worker_utilization_percent" in self.session_data['summary']:
            print(f"  Worker Utilization: {self.session_data['summary']['worker_utilization_percent']}")

        print(f"\nErrors: {len(self.session_data['errors'])}")

        if self.session_data['errors']:
            print("\nError Details:")
            for err in self.session_data['errors'][:5]:  # Show first 5 errors
                print(f"  - [{err['context']}] {err['error']}")

        print("="*60)
