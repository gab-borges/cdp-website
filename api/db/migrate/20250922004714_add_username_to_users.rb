# frozen_string_literal: true

require 'set'

class AddUsernameToUsers < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def up
    rename_column :users, :name, :username

    MigrationUser.reset_column_information

    say_with_time 'Normalizing usernames' do
      taken = Set.new(MigrationUser.where.not(username: nil).pluck(Arel.sql('lower(username)')))

      MigrationUser.find_each do |user|
        base = normalize(user.username)
        base = "user_#{user.id}" if base.blank?

        candidate = base
        suffix = 1
        while taken.include?(candidate.downcase)
          suffix += 1
          candidate = "#{base}_#{suffix}"
        end

        taken.add(candidate.downcase)
        user.update_columns(username: candidate)
      end
    end

    change_column_null :users, :username, false
    add_index :users, 'lower(username)', unique: true, name: 'index_users_on_lower_username', algorithm: :concurrently
  end

  def down
    remove_index :users, name: 'index_users_on_lower_username'
    rename_column :users, :username, :name
  end

  class MigrationUser < ApplicationRecord
    self.table_name = 'users'
  end

  private

  def normalize(value)
    normalized = value.to_s.strip.downcase
    normalized = normalized.gsub(/\s+/, '_')
    normalized = normalized.gsub(/[^a-z0-9_]/, '_')
    normalized = normalized.gsub(/_{2,}/, '_')
    normalized.gsub(/\A_+|_+\z/, '')
  end
end
