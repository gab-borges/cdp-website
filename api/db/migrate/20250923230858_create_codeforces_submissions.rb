class CreateCodeforcesSubmissions < ActiveRecord::Migration[8.0]
  def change
    create_table :codeforces_submissions do |t|
      t.references :user, null: false, foreign_key: true
      t.references :codeforces_problem, null: false, foreign_key: true
      t.datetime :submitted_at

      t.timestamps
    end
  end
end
