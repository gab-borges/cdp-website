class AddSolversCountToProblems < ActiveRecord::Migration[8.0]
  def change
    add_column :problems, :solvers_count, :integer, default: 0, null: false

    reversible do |dir|
      dir.up do
        say_with_time 'Backfilling problem solver counts' do
          execute <<~SQL.squish
            UPDATE problems
            SET solvers_count = stats.unique_solvers
            FROM (
              SELECT problem_id, COUNT(DISTINCT user_id) AS unique_solvers
              FROM submissions
              WHERE LOWER(status) = 'accepted'
              GROUP BY problem_id
            ) AS stats
            WHERE problems.id = stats.problem_id
          SQL
        end
      end
    end
  end
end
