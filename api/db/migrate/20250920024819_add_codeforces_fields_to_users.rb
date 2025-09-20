class AddCodeforcesFieldsToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :codeforces_handle, :string
    add_column :users, :codeforces_rating, :integer
    add_column :users, :codeforces_rank, :string
    add_column :users, :codeforces_avatar, :string
    add_column :users, :codeforces_title_photo, :string
    add_column :users, :codeforces_last_synced_at, :datetime
  end
end
