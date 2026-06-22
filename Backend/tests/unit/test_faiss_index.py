"""Unit tests for the FAISS ID-mapped index (stable ids + real deletion)."""
import pytest
import numpy as np

pytestmark = pytest.mark.unit

import ml.inference as inf


def _unit(seed):
    r = np.random.default_rng(seed)
    v = r.standard_normal(512).astype("float32")
    return v / np.linalg.norm(v)


@pytest.fixture
def fresh_index():
    inf._faiss_index = inf.new_index()
    inf._next_faiss_id = 0
    yield
    inf._faiss_index = None
    inf._next_faiss_id = 0


def test_add_returns_monotonic_ids(fresh_index):
    assert inf.faiss_add(_unit(1)) == 0
    assert inf.faiss_add(_unit(2)) == 1
    assert inf._faiss_index.ntotal == 2


def test_search_returns_stable_id(fresh_index):
    a = inf.faiss_add(_unit(1))
    inf.faiss_add(_unit(2))
    dist, ids = inf.faiss_search(_unit(1), k=1)
    assert int(ids[0]) == a
    assert float(dist[0]) == pytest.approx(1.0, abs=1e-3)


def test_remove_deletes_vector(fresh_index):
    a = inf.faiss_add(_unit(1))
    b = inf.faiss_add(_unit(2))
    removed = inf.faiss_remove(a)
    assert removed == 1
    assert inf._faiss_index.ntotal == 1
    # querying a's vector should no longer return a
    _, ids = inf.faiss_search(_unit(1), k=1)
    assert int(ids[0]) != a


def test_explicit_id_assignment(fresh_index):
    assert inf.faiss_add(_unit(5), faiss_id=42) == 42
    # next auto id must advance past the explicit one
    assert inf.faiss_add(_unit(6)) == 43
