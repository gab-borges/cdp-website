# frozen_string_literal: true

class FeedPost < ApplicationRecord
  belongs_to :user

  validates :title, presence: true, length: { maximum: 160 }
  validates :body, presence: true, length: { maximum: 5000 }
  validates :published_at, presence: true

  scope :recent_first, -> { order(published_at: :desc, created_at: :desc) }
end
