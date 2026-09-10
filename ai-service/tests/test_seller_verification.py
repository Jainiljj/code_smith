from app.engines.seller_verification import SellerVerificationEngine, SellerVerificationRequest

def test_clean_seller_verification():
    req = SellerVerificationRequest(
        seller_id="SLR-001",
        organization_name="XYZ Infrastructure Pvt Ltd",
        cin_or_pan="U45201DL2015PTC284910",
        gstin="07AAACX1234A1Z8",
        registered_address="102 Barakhamba Road, New Delhi"
    )
    res = SellerVerificationEngine.verify_seller_ai(req)
    assert res.entity_resolution_score >= 90.0
    assert res.shell_risk_flag is False
    assert len(res.risk_flags) == 0

def test_shell_company_detection():
    req = SellerVerificationRequest(
        seller_id="SLR-002",
        organization_name="Apex Global Holdings",
        registered_address="Co-working Box #4, Virtual Hub, Lucknow"
    )
    res = SellerVerificationEngine.verify_seller_ai(req)
    assert res.shell_risk_flag is True
    assert "REGISTERED_AT_VIRTUAL_OR_SHARED_OFFICE" in res.risk_flags
