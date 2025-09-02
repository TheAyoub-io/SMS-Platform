import pytest
from app.utils.phone_validator import validate_and_format_phone_number, InvalidPhoneNumberError

def test_valid_international_number():
    """Tests a valid number already in international E.164 format."""
    assert validate_and_format_phone_number("+14155552671") == "+14155552671"

def test_valid_national_number_with_country_code():
    """Tests a valid national number with a country hint."""
    # Using a known valid French number format
    assert validate_and_format_phone_number("0612345678", "FR") == "+33612345678"
    assert validate_and_format_phone_number("(415) 555-2671", "US") == "+14155552671"

def test_invalid_number_string():
    """Tests an unparsable string."""
    with pytest.raises(InvalidPhoneNumberError):
        validate_and_format_phone_number("not a number")

def test_invalid_number_too_short():
    """Tests a number that is too short to be valid."""
    with pytest.raises(InvalidPhoneNumberError):
        validate_and_format_phone_number("+123")

def test_no_country_code_for_national_number():
    """Tests that a national number fails without a country hint."""
    with pytest.raises(InvalidPhoneNumberError):
        validate_and_format_phone_number("0612345678")
