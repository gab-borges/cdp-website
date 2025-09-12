class HardenUsers < ActiveRecord::Migration[8.0]
  def up
    # Defaults and nullability
    change_column_default :users, :score, 0

    # Backfill NULL scores
    execute "UPDATE users SET score = 0 WHERE score IS NULL"

    # Ensure email is present: replace NULL/blank emails with unique placeholders before NOT NULL
    execute <<~SQL
      UPDATE users
      SET email = 'user-' || id || '@placeholder.local'
      WHERE email IS NULL OR btrim(email) = '';
    SQL

    # Deduplicate case-insensitive emails, keep the lowest id per email
    execute <<~SQL
      WITH ranked AS (
        SELECT id,
               lower(email) AS le,
               ROW_NUMBER() OVER (PARTITION BY lower(email) ORDER BY id) AS rn
        FROM users
        WHERE email IS NOT NULL
      )
      DELETE FROM users u
      USING ranked r
      WHERE u.id = r.id AND r.rn > 1;
    SQL

    # Enforce NOT NULL after cleanup
    change_column_null :users, :email, false

    # Case-insensitive unique constraint on email (PostgreSQL)
    add_index :users, "lower(email)", unique: true, name: "index_users_on_lower_email"

    # Non-negative score guard
    add_check_constraint :users, "score >= 0", name: "users_score_nonnegative"
  end

  def down
    remove_check_constraint :users, name: "users_score_nonnegative"
    remove_index :users, name: "index_users_on_lower_email"
    change_column_null :users, :email, true
    change_column_default :users, :score, nil
  end
end
