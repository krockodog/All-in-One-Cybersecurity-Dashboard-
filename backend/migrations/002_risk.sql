CREATE TABLE IF NOT EXISTS risk_matrices (
  id BIGSERIAL PRIMARY KEY,
  pentest_id UUID NOT NULL,
  finding_id UUID NOT NULL,
  likelihood INT NOT NULL,
  impact INT NOT NULL,
  score DOUBLE PRECISION NOT NULL,
  nist_function TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS epss_scores (
  cve TEXT PRIMARY KEY,
  score DOUBLE PRECISION NOT NULL,
  percentile DOUBLE PRECISION,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nist_categories (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  function TEXT NOT NULL,
  description TEXT NOT NULL,
  weight DOUBLE PRECISION NOT NULL DEFAULT 1.0
);

INSERT INTO nist_categories (code, function, description, weight)
VALUES
  ('GV', 'Govern', 'Organizational governance controls', 1.0),
  ('ID', 'Identify', 'Asset and risk identification', 1.0),
  ('PR', 'Protect', 'Preventive protection controls', 1.2),
  ('DE', 'Detect', 'Detection controls and telemetry', 1.2),
  ('RS', 'Respond', 'Incident response controls', 1.4),
  ('RC', 'Recover', 'Recovery and resilience controls', 1.4)
ON CONFLICT (code) DO NOTHING;
