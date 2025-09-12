class CreateProblems < ActiveRecord::Migration[8.0]
  def change
    create_table :problems do |t|
      t.string :title
      t.text :description
      t.integer :points
      t.string :difficulty

      t.timestamps
    end
  end
end
