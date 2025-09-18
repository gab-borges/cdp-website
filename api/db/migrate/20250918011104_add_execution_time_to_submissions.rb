class AddExecutionTimeToSubmissions < ActiveRecord::Migration[8.0]
  def change
    add_column :submissions, :execution_time, :decimal, precision: 10, scale: 3
  end
end
