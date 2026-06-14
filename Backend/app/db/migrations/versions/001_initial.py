"""Initial schema migration.

Revision ID: 001_initial
Revises:
Create Date: 2026-06-14

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create all tables from models
    op.execute("""
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    """)
    
    # Enums
    op.execute("""
    CREATE TYPE voter_status AS ENUM ('registered','voted','flagged','blocked','archived');
    CREATE TYPE sex_enum AS ENUM ('male','female');
    CREATE TYPE modality_enum AS ENUM ('face','fingerprint');
    CREATE TYPE verify_result AS ENUM ('approved','manual_review','rejected');
    CREATE TYPE liveness_enum AS ENUM ('live','spoof','failed');
    CREATE TYPE station_status AS ENUM ('online','syncing','not_open','offline');
    CREATE TYPE fraud_type AS ENUM ('Impersonation','Duplicate','Forgery','Anomaly');
    CREATE TYPE risk_level AS ENUM ('critical','review');
    CREATE TYPE case_resolution AS ENUM ('dismissed','escalated','merged','blocked');
    CREATE TYPE duplicate_status AS ENUM ('pending','merged','dismissed');
    CREATE TYPE actor_type AS ENUM ('user','officer','system','service');
    CREATE TYPE anomaly_severity AS ENUM ('critical','warning','info');
    CREATE TYPE user_status AS ENUM ('active','suspended','invitation_pending');
    CREATE TYPE province_enum AS ENUM ('Kigali City','Northern','Southern','Eastern','Western');
    CREATE TYPE audit_action AS ENUM (
      'VOTER_VERIFIED','VOTER_VOTED','TEMPLATE_ACCESSED','PERMISSION_CHANGED',
      'LOGIN','DATA_EXPORTED','RECORD_BLOCKED','RECORD_CREATED','BIOMETRIC_LINKED',
      'ADDRESS_UPDATED','STATUS_SYNCED','RECORD_MERGED','RECORD_ARCHIVED',
      'KEY_ROTATED','HSM_HEALTHCHECK'
    );
    """)
    
    # Roles
    op.create_table(
        'roles',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('permissions', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Districts
    op.create_table(
        'districts',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.func.gen_random_uuid()),
        sa.Column('code', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('province', sa.Enum('Kigali City', 'Northern', 'Southern', 'Eastern', 'Western', name='province_enum'), nullable=False),
        sa.Column('boundary_ref', sa.String()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code')
    )
    
    # Polling Stations
    op.create_table(
        'polling_stations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.func.gen_random_uuid()),
        sa.Column('code', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('district_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('lat', sa.Float()),
        sa.Column('lon', sa.Float()),
        sa.Column('opens_at', sa.Time()),
        sa.Column('closes_at', sa.Time()),
        sa.Column('status', sa.Enum('online', 'syncing', 'not_open', 'offline', name='station_status'), nullable=False, server_default='not_open'),
        sa.Column('registered_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('verified_today', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['district_id'], ['districts.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code')
    )
    op.create_index('idx_stations_district', 'polling_stations', ['district_id'])
    
    # Field Officers
    op.create_table(
        'field_officers',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.func.gen_random_uuid()),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('team', sa.String()),
        sa.Column('assigned_district_id', postgresql.UUID(as_uuid=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['assigned_district_id'], ['districts.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Admin Users
    op.create_table(
        'admin_users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.func.gen_random_uuid()),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('role_id', sa.String(), nullable=False),
        sa.Column('district_scope', sa.String(), nullable=False, server_default='National'),
        sa.Column('status', sa.Enum('active', 'suspended', 'invitation_pending', name='user_status'), nullable=False, server_default='invitation_pending'),
        sa.Column('mfa_enabled', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('totp_secret', sa.String()),
        sa.Column('last_active_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index('idx_admin_users_role', 'admin_users', ['role_id'])
    
    # Sessions
    op.create_table(
        'sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.func.gen_random_uuid()),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('device', sa.String()),
        sa.Column('ip_address', sa.String()),
        sa.Column('location', sa.String()),
        sa.Column('last_active_at', sa.DateTime(timezone=True)),
        sa.Column('revoked_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['admin_users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_sessions_user', 'sessions', ['user_id'])
    
    # Voters
    op.create_table(
        'voters',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.func.gen_random_uuid()),
        sa.Column('voter_token', sa.String(), nullable=False),
        sa.Column('registration_ref', sa.String(), nullable=False),
        sa.Column('national_id', sa.String(16), nullable=False),
        sa.Column('first_name', sa.String(), nullable=False),
        sa.Column('last_name', sa.String(), nullable=False),
        sa.Column('sex', sa.Enum('male', 'female', name='sex_enum'), nullable=False),
        sa.Column('date_of_birth', sa.Date(), nullable=False),
        sa.Column('phone', sa.String()),
        sa.Column('district_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('polling_station_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('roll_position', sa.Integer()),
        sa.Column('status', sa.Enum('registered', 'voted', 'flagged', 'blocked', 'archived', name='voter_status'), nullable=False, server_default='registered'),
        sa.Column('enrolled_at', sa.DateTime(timezone=True)),
        sa.Column('enrolled_by_officer_id', postgresql.UUID(as_uuid=True)),
        sa.Column('enroll_lat', sa.Float()),
        sa.Column('enroll_lon', sa.Float()),
        sa.Column('data_quality_score', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_activity_at', sa.DateTime(timezone=True)),
        sa.Column('last_verified_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['district_id'], ['districts.id'], ),
        sa.ForeignKeyConstraint(['enrolled_by_officer_id'], ['field_officers.id'], ),
        sa.ForeignKeyConstraint(['polling_station_id'], ['polling_stations.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('national_id'),
        sa.UniqueConstraint('registration_ref'),
        sa.UniqueConstraint('voter_token')
    )
    op.create_index('idx_voters_district', 'voters', ['district_id'])
    op.create_index('idx_voters_name', 'voters', ['last_name', 'first_name'])
    op.create_index('idx_voters_station', 'voters', ['polling_station_id'])
    op.create_index('idx_voters_status', 'voters', ['status'])
    
    # Encryption Keys
    op.create_table(
        'encryption_keys',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.func.gen_random_uuid()),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('algorithm', sa.String(), nullable=False, server_default='AES-256-GCM'),
        sa.Column('scope', sa.String()),
        sa.Column('current_version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Biometric Templates
    op.create_table(
        'biometric_templates',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.func.gen_random_uuid()),
        sa.Column('voter_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('modality', sa.Enum('face', 'fingerprint', name='modality_enum'), nullable=False),
        sa.Column('template_blob', sa.LargeBinary(), nullable=False),
        sa.Column('quality_score', sa.Float(), nullable=False),
        sa.Column('liveness_passed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('captured_at', sa.DateTime(timezone=True)),
        sa.Column('device_id', sa.String()),
        sa.Column('key_id', postgresql.UUID(as_uuid=True)),
        sa.Column('faiss_id', sa.Integer()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['key_id'], ['encryption_keys.id'], ),
        sa.ForeignKeyConstraint(['voter_id'], ['voters.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_templates_faiss', 'biometric_templates', ['faiss_id'])
    op.create_index('idx_templates_voter', 'biometric_templates', ['voter_id'])
    
    # Verification Attempts
    op.create_table(
        'verification_attempts',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.func.gen_random_uuid()),
        sa.Column('voter_id', postgresql.UUID(as_uuid=True)),
        sa.Column('polling_station_id', postgresql.UUID(as_uuid=True)),
        sa.Column('officer_id', postgresql.UUID(as_uuid=True)),
        sa.Column('device_id', sa.String()),
        sa.Column('result', sa.Enum('approved', 'manual_review', 'rejected', name='verify_result'), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('face_score', sa.Float()),
        sa.Column('fingerprint_score', sa.Float()),
        sa.Column('liveness', sa.Enum('live', 'spoof', 'failed', name='liveness_enum'), nullable=False),
        sa.Column('review_required', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('explanation', sa.String()),
        sa.Column('flags', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['officer_id'], ['field_officers.id'], ),
        sa.ForeignKeyConstraint(['polling_station_id'], ['polling_stations.id'], ),
        sa.ForeignKeyConstraint(['voter_id'], ['voters.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_attempts_created', 'verification_attempts', ['created_at'])
    op.create_index('idx_attempts_station', 'verification_attempts', ['polling_station_id'])
    op.create_index('idx_attempts_voter', 'verification_attempts', ['voter_id'])
    
    # Fraud Cases
    op.create_table(
        'fraud_cases',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('type', sa.Enum('Impersonation', 'Duplicate', 'Forgery', 'Anomaly', name='fraud_type'), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('risk_level', sa.Enum('critical', 'review', name='risk_level'), nullable=False),
        sa.Column('score', sa.String()),
        sa.Column('verdict', sa.String()),
        sa.Column('voter_id', postgresql.UUID(as_uuid=True)),
        sa.Column('registration_ref', sa.String()),
        sa.Column('polling_station_id', postgresql.UUID(as_uuid=True)),
        sa.Column('detected_by', sa.String()),
        sa.Column('face_score', sa.Float()),
        sa.Column('opened_at', sa.DateTime(timezone=True)),
        sa.Column('resolved_at', sa.DateTime(timezone=True)),
        sa.Column('resolution', sa.Enum('dismissed', 'escalated', 'merged', 'blocked', name='case_resolution')),
        sa.Column('breakdown', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('timeline', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('assessment', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('duplicate_of_registration_ref', sa.String()),
        sa.Column('similarity', sa.Float()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['polling_station_id'], ['polling_stations.id'], ),
        sa.ForeignKeyConstraint(['voter_id'], ['voters.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_fraud_type', 'fraud_cases', ['type'])
    op.create_index('idx_fraud_voter', 'fraud_cases', ['voter_id'])
    
    # Duplicate Matches
    op.create_table(
        'duplicate_matches',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.func.gen_random_uuid()),
        sa.Column('record_a_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('record_b_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('similarity', sa.Float(), nullable=False),
        sa.Column('status', sa.Enum('pending', 'merged', 'dismissed', name='duplicate_status'), nullable=False, server_default='pending'),
        sa.Column('merged_into_id', postgresql.UUID(as_uuid=True)),
        sa.Column('resolved_by_user_id', postgresql.UUID(as_uuid=True)),
        sa.Column('resolved_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['merged_into_id'], ['voters.id'], ),
        sa.ForeignKeyConstraint(['record_a_id'], ['voters.id'], ),
        sa.ForeignKeyConstraint(['record_b_id'], ['voters.id'], ),
        sa.ForeignKeyConstraint(['resolved_by_user_id'], ['admin_users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_dupe_status', 'duplicate_matches', ['status'])
    
    # Anomaly Signals
    op.create_table(
        'anomaly_signals',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.func.gen_random_uuid()),
        sa.Column('public_ref', sa.String()),
        sa.Column('severity', sa.Enum('critical', 'warning', 'info', name='anomaly_severity'), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.String()),
        sa.Column('is_live', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('signal_name', sa.String()),
        sa.Column('baseline', sa.Float()),
        sa.Column('observed', sa.Float()),
        sa.Column('unit', sa.String()),
        sa.Column('affected_entities', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('recommendation', sa.String()),
        sa.Column('related_case_id', sa.String()),
        sa.Column('status', sa.String(), nullable=False, server_default='active'),
        sa.Column('detected_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['related_case_id'], ['fraud_cases.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('public_ref')
    )
    
    # Audit Entries
    op.create_table(
        'audit_entries',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.func.gen_random_uuid()),
        sa.Column('sequence', sa.BigInteger(), nullable=False, autoincrement=True),
        sa.Column('occurred_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('action', sa.Enum('VOTER_VERIFIED','VOTER_VOTED','TEMPLATE_ACCESSED','PERMISSION_CHANGED','LOGIN','DATA_EXPORTED','RECORD_BLOCKED','RECORD_CREATED','BIOMETRIC_LINKED','ADDRESS_UPDATED','STATUS_SYNCED','RECORD_MERGED','RECORD_ARCHIVED','KEY_ROTATED','HSM_HEALTHCHECK', name='audit_action'), nullable=False),
        sa.Column('actor_type', sa.Enum('user', 'officer', 'system', 'service', name='actor_type'), nullable=False),
        sa.Column('actor_id', sa.String()),
        sa.Column('actor_role', sa.String()),
        sa.Column('service', sa.String()),
        sa.Column('polling_station_id', postgresql.UUID(as_uuid=True)),
        sa.Column('ip_address', sa.String()),
        sa.Column('geo', sa.String()),
        sa.Column('detail', sa.String()),
        sa.Column('change_diff', sa.JSON()),
        sa.Column('entry_hash', sa.String(), nullable=False),
        sa.Column('prev_hash', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['polling_station_id'], ['polling_stations.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('sequence')
    )
    op.create_index('idx_audit_hash', 'audit_entries', ['entry_hash'])
    op.create_index('idx_audit_id', 'audit_entries', ['id'], unique=True)
    op.create_index('idx_audit_when', 'audit_entries', ['occurred_at'])


def downgrade() -> None:
    # Drop all tables
    op.execute("DROP TABLE IF EXISTS audit_entries CASCADE")
    op.execute("DROP TABLE IF EXISTS anomaly_signals CASCADE")
    op.execute("DROP TABLE IF EXISTS duplicate_matches CASCADE")
    op.execute("DROP TABLE IF EXISTS fraud_cases CASCADE")
    op.execute("DROP TABLE IF EXISTS verification_attempts CASCADE")
    op.execute("DROP TABLE IF EXISTS biometric_templates CASCADE")
    op.execute("DROP TABLE IF EXISTS encryption_keys CASCADE")
    op.execute("DROP TABLE IF EXISTS voters CASCADE")
    op.execute("DROP TABLE IF EXISTS sessions CASCADE")
    op.execute("DROP TABLE IF EXISTS admin_users CASCADE")
    op.execute("DROP TABLE IF EXISTS field_officers CASCADE")
    op.execute("DROP TABLE IF EXISTS polling_stations CASCADE")
    op.execute("DROP TABLE IF EXISTS districts CASCADE")
    op.execute("DROP TABLE IF EXISTS roles CASCADE")
    
    # Drop enums
    op.execute("DROP TYPE IF EXISTS voter_status CASCADE")
    op.execute("DROP TYPE IF EXISTS sex_enum CASCADE")
    op.execute("DROP TYPE IF EXISTS modality_enum CASCADE")
    op.execute("DROP TYPE IF EXISTS verify_result CASCADE")
    op.execute("DROP TYPE IF EXISTS liveness_enum CASCADE")
    op.execute("DROP TYPE IF EXISTS station_status CASCADE")
    op.execute("DROP TYPE IF EXISTS fraud_type CASCADE")
    op.execute("DROP TYPE IF EXISTS risk_level CASCADE")
    op.execute("DROP TYPE IF EXISTS case_resolution CASCADE")
    op.execute("DROP TYPE IF EXISTS duplicate_status CASCADE")
    op.execute("DROP TYPE IF EXISTS actor_type CASCADE")
    op.execute("DROP TYPE IF EXISTS anomaly_severity CASCADE")
    op.execute("DROP TYPE IF EXISTS user_status CASCADE")
    op.execute("DROP TYPE IF EXISTS province_enum CASCADE")
    op.execute("DROP TYPE IF EXISTS audit_action CASCADE")
