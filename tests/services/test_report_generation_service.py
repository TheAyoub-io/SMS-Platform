import pytest
import io
import pandas as pd
from sqlalchemy.orm import Session
from app.services.report_generation_service import ReportGenerationService

@pytest.fixture(scope="function")
def report_service(db_session: Session) -> ReportGenerationService:
    return ReportGenerationService(db_session)

def test_export_to_pdf(report_service: ReportGenerationService):
    # --- Setup ---
    campaign_id = 1

    # --- Execute ---
    pdf_buffer = report_service.export_to_pdf(campaign_id=campaign_id)

    # --- Assert ---
    assert isinstance(pdf_buffer, io.BytesIO)
    # Check for PDF magic number (%PDF)
    pdf_buffer.seek(0)
    assert pdf_buffer.read(4) == b'%PDF'

def test_export_to_excel(report_service: ReportGenerationService):
    # --- Setup ---
    campaign_id = 1

    # --- Execute ---
    excel_buffer = report_service.export_to_excel(campaign_id=campaign_id)

    # --- Assert ---
    assert isinstance(excel_buffer, io.BytesIO)
    excel_buffer.seek(0)
    # Try to read the Excel file back using pandas
    try:
        df = pd.read_excel(excel_buffer)
        assert not df.empty
        # Check for placeholder data
        assert 'Metric' in df.columns
        assert df['Value'].sum() == 200 # 100 + 95 + 5
    except Exception as e:
        pytest.fail(f"Pandas could not read the Excel buffer: {e}")
