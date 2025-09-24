class AddCodeforcesScoreToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :codeforces_score, :integer
  end
end
