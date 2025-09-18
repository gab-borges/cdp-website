class AddJudgeIdentifierToProblems < ActiveRecord::Migration[8.0]
  def change
    add_column :problems, :judge_identifier, :string
  end
end
