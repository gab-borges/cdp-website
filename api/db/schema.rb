# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_09_22_004715) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "problems", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.integer "points"
    t.string "difficulty"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "judge"
    t.string "judge_identifier"
    t.integer "solvers_count", default: 0, null: false
  end

  create_table "submissions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "problem_id", null: false
    t.string "language"
    t.text "code"
    t.string "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "kattis_submission_id"
    t.string "kattis_submission_url"
    t.decimal "execution_time", precision: 10, scale: 3
    t.index ["problem_id"], name: "index_submissions_on_problem_id"
    t.index ["user_id"], name: "index_submissions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.integer "score", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "password_digest"
    t.integer "role", default: 0, null: false
    t.text "bio"
    t.string "codeforces_handle"
    t.integer "codeforces_rating"
    t.string "codeforces_rank"
    t.string "codeforces_avatar"
    t.string "codeforces_title_photo"
    t.datetime "codeforces_last_synced_at"
    t.string "username", null: false
    t.index "lower((email)::text)", name: "index_users_on_lower_email", unique: true
    t.index "lower((username)::text)", name: "index_users_on_lower_username", unique: true
    t.check_constraint "score >= 0", name: "users_score_nonnegative"
  end

  add_foreign_key "submissions", "problems"
  add_foreign_key "submissions", "users"
end
