# frozen_string_literal: true

class RemoveDisplayNameFromUsers < ActiveRecord::Migration[8.0]
  def change
    remove_column :users, :display_name, :string
  end
end
