# frozen_string_literal: true

class Material < ApplicationRecord
  belongs_to :uploader, class_name: 'User', foreign_key: :user_id

  has_one_attached :file
  has_one_attached :thumbnail

  validates :title, presence: true, length: { maximum: 160 }
  validate :file_presence
  validate :thumbnail_presence

  scope :recent_first, -> { order(created_at: :desc) }

  private

  def file_presence
    errors.add(:file, 'must be attached') unless file.attached?
  end

  def thumbnail_presence
    errors.add(:thumbnail, 'must be attached') unless thumbnail.attached?
  end
end
