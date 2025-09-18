class AddKattisFieldsToSubmissions < ActiveRecord::Migration[8.0]
  def change
    add_column :submissions, :kattis_submission_id, :integer
    add_column :submissions, :kattis_submission_url, :string
  end
end
