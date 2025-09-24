class CreateCodeforcesProblems < ActiveRecord::Migration[8.0]
  def change
    create_table :codeforces_problems do |t|
      t.integer :contest_id
      t.string :problem_index
      t.string :name
      t.integer :rating
      t.text :tags, array: true, default: []

      t.timestamps
    end
  end
end
