# frozen_string_literal: true

class CreateFeedPosts < ActiveRecord::Migration[8.0]
  def change
    create_table :feed_posts do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.text :body, null: false
      t.datetime :published_at, null: false

      t.timestamps
    end

    add_index :feed_posts, :published_at
  end
end
