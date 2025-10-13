class AddVerdictToCodeforcesSubmissions < ActiveRecord::Migration[8.0]
  def change
    add_column :codeforces_submissions, :verdict, :string
  end
end
