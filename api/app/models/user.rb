class User < ApplicationRecord
  has_secure_password

  before_validation :normalize_email

  # Validations
  validates :name, presence: true, length: { maximum: 128 }
  validates :email, presence: true, uniqueness: { case_sensitive: false, message: 'already registered' },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :score, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true

  private

  def normalize_email
    self.email = email.to_s.strip.downcase if email.present?
  end
end
