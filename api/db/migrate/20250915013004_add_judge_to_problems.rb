class AddJudgeToProblems < ActiveRecord::Migration[8.0]
  def change
    add_column :problems, :judge, :string
  end
end
