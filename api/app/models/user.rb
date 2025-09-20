class User < ApplicationRecord
  has_secure_password
  has_many :submissions, dependent: :destroy

  before_validation :normalize_email

  # Validations
  validates :name, presence: true, length: { maximum: 128 }
  validates :email, presence: true, uniqueness: { case_sensitive: false, message: 'already registered' },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :score, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :bio, length: { maximum: 1200 }, allow_blank: true
  validates :codeforces_handle, length: { maximum: 60 }, allow_blank: true

  def solved_problems_count
    submissions.accepted.select(:problem_id).distinct.count
  end

  private

  def normalize_email
    self.email = email.to_s.strip.downcase if email.present?
  end
end
