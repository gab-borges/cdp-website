class AddTestCasesToProblems < ActiveRecord::Migration[8.0]
  def change
    add_column :problems, :test_cases, :jsonb, default: [], null: false
  end
end
