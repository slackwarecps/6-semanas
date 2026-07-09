"""
Testes do endpoint POST /classifica-cenario (classificação semântica de cenário do exame).

O LLM é mockado via monkeypatch em main.criar_llm — nenhuma chamada externa é feita.

Rodar com: pytest test_classifica_cenario.py -v
"""

import pytest
from fastapi.testclient import TestClient

import main
from main import CenarioEstruturado, app


class _FakeStructuredLlm:
    def __init__(self, resultado: CenarioEstruturado):
        self._resultado = resultado

    async def ainvoke(self, _messages):
        return self._resultado


class _FakeLlm:
    def __init__(self, resultado: CenarioEstruturado):
        self._resultado = resultado

    def with_structured_output(self, _schema):
        return _FakeStructuredLlm(self._resultado)


@pytest.fixture(name="client")
def client_fixture():
    return TestClient(app)


def _mock_llm(
    monkeypatch,
    cenario: str,
    dominios: list[str] | None = None,
    justificativa: str = "Justificativa de teste.",
):
    resultado = CenarioEstruturado(
        cenario=cenario,
        dominios=dominios or ["Domain_3::Claude_Code_Configuration_Workflows"],
        justificativa=justificativa,
    )

    def fake_criar_llm(provedor: str):
        return _FakeLlm(resultado), "modelo-fake"

    monkeypatch.setattr(main, "criar_llm", fake_criar_llm)


def test_classifica_cenario_retorna_cenario_e_dominios_do_llm(client, monkeypatch):
    _mock_llm(
        monkeypatch,
        "Scenario_5::Claude_Code_CI_CD",
        dominios=[
            "Domain_3::Claude_Code_Configuration_Workflows",
            "Domain_4::Prompt_Engineering_Structured_Output",
        ],
    )

    response = client.post(
        "/classifica-cenario",
        json={"titulo": "Code review no pipeline", "pergunta": "Your CI pipeline runs Claude..."},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["cenario"] == "Scenario_5::Claude_Code_CI_CD"
    assert body["dominios"] == [
        "Domain_3::Claude_Code_Configuration_Workflows",
        "Domain_4::Prompt_Engineering_Structured_Output",
    ]
    assert body["justificativa"] == "Justificativa de teste."
    assert body["provedor"] == "claude"
    assert body["modelo"] == "modelo-fake"


def test_classifica_cenario_aceita_fora_do_cenario_e_fora_dos_dominios(client, monkeypatch):
    _mock_llm(monkeypatch, "ForaDoCenario", dominios=["ForaDosDominios"])

    response = client.post(
        "/classifica-cenario",
        json={"titulo": "Pergunta genérica", "pergunta": "O que é uma API REST?"},
    )

    assert response.status_code == 200
    assert response.json()["cenario"] == "ForaDoCenario"
    assert response.json()["dominios"] == ["ForaDosDominios"]


def test_classifica_cenario_rejeita_pergunta_vazia(client):
    response = client.post(
        "/classifica-cenario",
        json={"titulo": "Sem enunciado", "pergunta": "   "},
    )

    assert response.status_code == 400


def test_schema_estruturado_rejeita_cenario_desconhecido():
    with pytest.raises(Exception):
        CenarioEstruturado(
            cenario="Scenario_7::Inexistente",
            dominios=["Domain_1::Agentic_Architecture_Orchestration"],
        )


def test_schema_estruturado_rejeita_dominio_desconhecido_e_lista_vazia():
    with pytest.raises(Exception):
        CenarioEstruturado(cenario="ForaDoCenario", dominios=["Domain_9::Inexistente"])
    with pytest.raises(Exception):
        CenarioEstruturado(cenario="ForaDoCenario", dominios=[])
