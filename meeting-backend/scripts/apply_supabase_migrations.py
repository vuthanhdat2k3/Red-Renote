from pathlib import Path
from urllib.parse import urlparse

import psycopg2


ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = ROOT / "meeting-backend" / ".env"
MIGRATIONS_DIR = ROOT / "supabase" / "migrations"


def read_database_url() -> str:
    for line in ENV_PATH.read_text().splitlines():
        if line.startswith("DATABASE_URL="):
            return line.split("=", 1)[1].strip().strip('"')
    raise RuntimeError(f"DATABASE_URL is missing in {ENV_PATH}")


def main() -> None:
    database_url = read_database_url()
    parsed = urlparse(database_url)
    print(f"Applying migrations to {parsed.hostname}/{parsed.path.lstrip('/')}")

    migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    if not migration_files:
        raise RuntimeError(f"No SQL migrations found in {MIGRATIONS_DIR}")

    with psycopg2.connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                select exists (
                  select 1
                  from information_schema.columns
                  where table_schema = 'public'
                    and table_name = 'meetings'
                    and column_name = 'owner_user_id'
                )
                """
            )
            has_owner_schema = cursor.fetchone()[0]

            for migration in migration_files:
                if has_owner_schema and migration.name in {
                    "202604250001_initial_schema.sql",
                    "202604250002_seed_sample_data.sql",
                }:
                    print(f"Skipping {migration.name} because ownership schema already exists")
                    continue
                print(f"Applying {migration.name}")
                cursor.execute(migration.read_text())
                connection.commit()

    print("Migrations applied successfully")


if __name__ == "__main__":
    main()
