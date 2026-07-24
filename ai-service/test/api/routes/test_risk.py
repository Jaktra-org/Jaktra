import pytest
from unittest.mock import MagicMock, patch
from src.risk.scorer import RiskScorer, RiskFeatures, RiskResult

def test_risk_scorer_rule_based_calculations():
    # Force rule-based scoring
    scorer = RiskScorer()
    scorer._use_ml_model = False
    
    # 1. No historical payment rate
    features = RiskFeatures(
        days_overdue=30,      # factor: 30/60 = 0.5 * 0.4 = 0.2
        invoice_amount=50000,  # factor: 50000/100000 = 0.5 * 0.2 = 0.1
        followup_count=2,     # factor: 2/5 = 0.4 * 0.2 = 0.08
        client_historical_payment_rate=None
    )
    result = scorer.score(features)
    assert result.model_version == "rule-based-v1"
    # Expected score: 0.2 + 0.1 + 0.08 = 0.38 => "low"
    assert result.risk_score == 0.38
    assert result.risk_level == "low"
    
    # 2. With historical payment rate
    features.client_historical_payment_rate = 0.8 # hist_factor: 0.8 => (1 - 0.8) * 0.2 = 0.04
    result = scorer.score(features)
    # Expected score: 0.38 + 0.04 = 0.42 => "medium"
    assert result.risk_score == 0.42
    assert result.risk_level == "medium"

    # 3. Maximum bounds/clamping in rule-based
    features_max = RiskFeatures(
        days_overdue=100,      # factor capped at 1.0 * 0.4 = 0.4
        invoice_amount=200000, # factor capped at 1.0 * 0.2 = 0.2
        followup_count=10,     # factor capped at 1.0 * 0.2 = 0.2
        client_historical_payment_rate=0.0 # hist_factor: 0.0 => (1 - 0) * 0.2 = 0.2
    )
    result_max = scorer.score(features_max)
    # Expected score: 0.4 + 0.2 + 0.2 + 0.2 = 1.0 => "high"
    assert result_max.risk_score == 1.0
    assert result_max.risk_level == "high"

    # 4. Negative values / underflow clamping
    features_neg = RiskFeatures(
        days_overdue=-10,      # clamped to 0 => factor 0.0
        invoice_amount=-100.0,  # clamped to 0.0 => factor 0.0
        followup_count=-5,     # clamped to 0 => factor 0.0
        client_historical_payment_rate=-0.5 # clamped to 0.0 => hist_factor: 0.0 => (1-0)*0.2 = 0.2
    )
    result_neg = scorer.score(features_neg)
    # Expected score: 0.0 + 0.0 + 0.0 + 0.2 = 0.2 => "low"
    assert result_neg.risk_score == 0.2
    assert result_neg.risk_level == "low"

def test_risk_scorer_ml_success_and_clamping():
    scorer = RiskScorer()
    scorer._use_ml_model = True
    
    # Mock ML model predict_proba
    import numpy as np
    mock_model = MagicMock()
    # predict_proba returns a 2D array, e.g. [[prob_class_0, prob_class_1]]
    mock_model.predict_proba.return_value = np.array([[0.2, 0.8]])
    scorer._ml_model = mock_model
    
    features = RiskFeatures(
        days_overdue=400,     # should be clamped to max? Wait, clamping in ML model clamps days_overdue to max(-30, days_overdue). So 400 remains 400.
        invoice_amount=-50.0,  # should be clamped to 0.0
        followup_count=25,    # should be clamped to 20
        client_historical_payment_rate=1.5 # should be clamped to 1.0
    )
    result = scorer.score(features)
    assert result.model_version == "ml-gbm-v1"
    assert result.risk_score == 0.8
    assert result.risk_level == "high"
    
    # Verify values passed to predict_proba
    df_passed = mock_model.predict_proba.call_args[0][0]
    assert df_passed.loc[0, 'days_overdue'] == 400
    assert df_passed.loc[0, 'invoice_amount'] == 0.0
    assert df_passed.loc[0, 'followup_count'] == 20
    assert df_passed.loc[0, 'client_historical_payment_rate'] == 1.0

def test_risk_scorer_ml_exception_fallback():
    scorer = RiskScorer()
    scorer._use_ml_model = True
    
    # Mock model raises an exception
    mock_model = MagicMock()
    mock_model.predict_proba.side_effect = RuntimeError("Prediction failed")
    scorer._ml_model = mock_model
    
    features = RiskFeatures(
        days_overdue=10,
        invoice_amount=5000.0,
        followup_count=1,
        client_historical_payment_rate=0.9
    )
    result = scorer.score(features)
    # ML model predict_proba fails, defaults to risk_score = 0.0
    assert result.risk_score == 0.0
    assert result.risk_level == "low"


@pytest.mark.anyio
async def test_route_score_risk_happy_path(async_client):
    headers = {"X-Service-Key": "test-service-key"}
    payload = {
        "invoice_id": "inv_99",
        "features": {
            "days_overdue": 15,
            "invoice_amount": 1000.0,
            "followup_count": 0,
            "client_historical_payment_rate": 0.95
        }
    }
    # Mock scorer.score to return static response
    mock_result = RiskResult(
        risk_score=0.15,
        risk_level="low",
        model_version="rule-based-v1",
        features_used=payload["features"]
    )
    with patch("src.api.routes.risk.scorer.score", return_value=mock_result):
        response = await async_client.post("/risk/score", json=payload, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["invoice_id"] == "inv_99"
        assert data["risk_score"] == 0.15
        assert data["risk_level"] == "low"

@pytest.mark.anyio
async def test_route_score_risk_error(async_client):
    headers = {"X-Service-Key": "test-service-key"}
    payload = {
        "invoice_id": "inv_99",
        "features": {
            "days_overdue": 15,
            "invoice_amount": 1000.0,
            "followup_count": 0
        }
    }
    with patch("src.api.routes.risk.scorer.score", side_effect=ValueError("Invalid features")):
        response = await async_client.post("/risk/score", json=payload, headers=headers)
        assert response.status_code == 400
        assert response.json() == {"detail": "Failed to compute risk score"}

@pytest.mark.anyio
async def test_route_score_risk_batch_happy_path(async_client):
    headers = {"X-Service-Key": "test-service-key"}
    payload = {
        "invoices": [
            {
                "invoice_id": "inv_1",
                "features": {"days_overdue": 5, "invoice_amount": 100.0, "followup_count": 0}
            },
            {
                "invoice_id": "inv_2",
                "features": {"days_overdue": 20, "invoice_amount": 250.0, "followup_count": 2}
            }
        ]
    }
    
    # Mock scorer score results
    res1 = RiskResult(risk_score=0.1, risk_level="low", model_version="rule-based-v1", features_used={})
    res2 = RiskResult(risk_score=0.5, risk_level="medium", model_version="rule-based-v1", features_used={})
    
    def mock_score(features):
        if features.days_overdue == 5:
            return res1
        return res2
        
    with patch("src.api.routes.risk.scorer.score", side_effect=mock_score):
        response = await async_client.post("/risk/score/batch", json=payload, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["results"]) == 2
        assert data["results"][0]["invoice_id"] == "inv_1"
        assert data["results"][0]["risk_level"] == "low"
        assert data["results"][1]["invoice_id"] == "inv_2"
        assert data["results"][1]["risk_level"] == "medium"

@pytest.mark.anyio
async def test_route_score_risk_batch_item_failure(async_client):
    headers = {"X-Service-Key": "test-service-key"}
    payload = {
        "invoices": [
            {
                "invoice_id": "inv_1",
                "features": {"days_overdue": 5, "invoice_amount": 100.0, "followup_count": 0}
            }
        ]
    }
    with patch("src.api.routes.risk.scorer.score", side_effect=Exception("Database down")):
        response = await async_client.post("/risk/score/batch", json=payload, headers=headers)
        assert response.status_code == 400
        assert response.json() == {"detail": "Error scoring inv_1"}
